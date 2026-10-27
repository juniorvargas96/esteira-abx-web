import {NextResponse} from 'next/server';
import {currentUser} from '@/lib/auth';
import {db} from '@/lib/db';

const ETAPAS=['BASE','FOTO','DIMENSÕES','PREÇOS','CRIAR ANÚNCIO','PROMOÇÃO','ADS','VÍDEO'];
const CANAIS=['MERCADO LIVRE — ABX','MERCADO LIVRE — RWX','MERCADO LIVRE — DANFERX','SHOPEE — ABX','SHOPEE — RWX','SHOPEE — DANFERX','TIKTOK SHOP — ABX'];
const now=()=>new Date().toISOString().slice(0,19);

export async function POST(req:Request){
 const u=await currentUser();
 if(!u||u.perfil!=='ADMINISTRADOR')return NextResponse.json({error:'Sem permissão.'},{status:403});
 try{
  const b=await req.json();
  const sku=String(b.sku||'').trim().toUpperCase();
  const etapa=String(b.etapa||'');
  const canais:string[]=b.canais||[];
  const obs=String(b.observacao||'').trim();
  if(!sku)return NextResponse.json({error:'Informe o SKU.'},{status:400});
  if(!ETAPAS.includes(etapa))return NextResponse.json({error:'Selecione uma etapa válida.'},{status:400});
  if(!canais.length||canais.some(x=>!CANAIS.includes(x)))return NextResponse.json({error:'Selecione pelo menos uma plataforma.'},{status:400});

  const desc=String(b.descricao||'').trim();
  const ml=(b.titulosML||[]).map((x:any)=>String(x).trim());
  const sh=String(b.tituloShopee||'').trim();
  const tk=String(b.tituloTiktok||'').trim();
  if(etapa==='BASE'){
   if(!desc)return NextResponse.json({error:'Para atualizar a BASE, informe a descrição.'},{status:400});
   if(canais.some(x=>x.startsWith('MERCADO LIVRE'))&&(!ml.length||ml.some((x:string)=>!x)))return NextResponse.json({error:'Preencha os títulos do Mercado Livre.'},{status:400});
   if(canais.some(x=>x.startsWith('SHOPEE'))&&!sh)return NextResponse.json({error:'Preencha o título da Shopee.'},{status:400});
   if(canais.some(x=>x.startsWith('TIKTOK'))&&!tk)return NextResponse.json({error:'Preencha o título do TikTok Shop.'},{status:400});
  }

  const q=db(),t=now(),c=await q.connect();
  try{
   await c.query('BEGIN');
   await c.query(`ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS tipo_origem TEXT DEFAULT 'NOVO'`);
   await c.query(`ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS observacao_atualizacao TEXT`);
   // Atualização pode vir de anúncios do mundo real que nunca passaram pela esteira.
   // Garante apenas um cadastro mínimo do SKU para permitir que ele entre em qualquer etapa.
   await c.query(`INSERT INTO produtos(sku,criado_em,descricao) VALUES($1,$2,$3)
                  ON CONFLICT (sku) DO NOTHING`,[sku,t,etapa==='BASE'?desc:'']);
   if(etapa==='BASE')await c.query('UPDATE produtos SET descricao=$1 WHERE sku=$2',[desc,sku]);

   // Serializa solicitações concorrentes do mesmo SKU para evitar duplicatas e números repetidos.
   await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[sku]);
   const nr=await c.query('SELECT COALESCE(MAX(numero),0)::int n FROM anuncios WHERE sku=$1',[sku]);
   let numero=nr.rows[0].n;
   let criados=0;

   // Não sobrescreve a etapa de anúncios existentes: cada solicitação recebe um ID próprio.
   for(const canal of canais){
    const duplicado=await c.query(`SELECT id FROM anuncios
      WHERE sku=$1 AND canal=$2 AND etapa=$3 AND tipo_origem='ATUALIZAÇÃO'
        AND status<>'OK' LIMIT 1`,[sku,canal,etapa]);
    if(duplicado.rowCount){
     throw new Error(`DUPLICADO:Já existe uma atualização de ${etapa} em aberto para ${sku} na plataforma ${canal}.`);
    }

    const anterior=await c.query(`SELECT * FROM anuncios WHERE sku=$1 AND canal=$2
      ORDER BY CASE WHEN tipo_origem='NOVO' THEN 0 ELSE 1 END, id DESC LIMIT 1`,[sku,canal]);
    const base=anterior.rows[0];
    numero++;
    const tits=etapa==='BASE'?(canal.startsWith('MERCADO LIVRE')?ml:canal.startsWith('SHOPEE')?[sh]:[tk]):[];
    const tituloInicial=tits[0]||base?.titulo||'';
    const descricaoInicial=etapa==='BASE'?desc:base?.descricao||'';
    const r=await c.query(`INSERT INTO anuncios
      (sku,numero,titulo,descricao,canal,etapa,status,criado_em,atualizado_em,
       entrada_etapa_em,prioridade,prazo,tipo_origem,observacao_atualizacao,
       preco,preco_premium,preco_classico,preco_shopee,preco_tiktok,
       link_anuncio,link_video)
      VALUES($1,$2,$3,$4,$5,$6,'AGUARDANDO',$7,$7,$7,$8,$9,'ATUALIZAÇÃO',$10,
       $11,$12,$13,$14,$15,$16,$17) RETURNING id`,
      [sku,numero,tituloInicial,descricaoInicial,canal,etapa,t,
       b.prioridade||'NORMAL',b.prazo||null,obs||null,
       base?.preco??null,base?.preco_premium??null,base?.preco_classico??null,
       base?.preco_shopee??null,base?.preco_tiktok??null,
       base?.link_anuncio??null,base?.link_video??null]);
    const id=r.rows[0].id;
    if(etapa==='BASE'){
     for(let i=0;i<tits.length;i++)await c.query(
      'INSERT INTO anuncio_titulos(anuncio_id,ordem,titulo) VALUES($1,$2,$3)',
      [id,i+1,tits[i]]);
    }else if(base){
     await c.query(`INSERT INTO anuncio_titulos(anuncio_id,ordem,titulo)
       SELECT $1,ordem,titulo FROM anuncio_titulos WHERE anuncio_id=$2`,[id,base.id]);
    }
    await c.query('INSERT INTO historico(anuncio_id,data_hora,etapa,acao,observacao) VALUES($1,$2,$3,$4,$5)',
      [id,t,etapa,'ATUALIZAÇÃO SOLICITADA',`${u.nome} | ${canal}${obs?`: ${obs}`:''}`]);
    criados++;
   }

   await c.query('COMMIT');
   return NextResponse.json({ok:true,atualizados:criados,existentes:0,novos:criados});
  }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
 }catch(e:any){if(String(e?.message||'').startsWith('DUPLICADO:'))return NextResponse.json({error:String(e.message).slice(10)},{status:409});console.error(e);return NextResponse.json({error:'Falha ao enviar anúncio para atualização.'},{status:500})}
}
