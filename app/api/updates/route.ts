import {NextResponse} from 'next/server';
import {currentUser} from '@/lib/auth';
import {db} from '@/lib/db';

const ETAPAS=['BASE','FOTO','DIMENSÕES','CRIAR ANÚNCIO','PROMOÇÃO','ADS','VÍDEO'];
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

   const nr=await c.query('SELECT COALESCE(MAX(numero),0)::int n FROM anuncios WHERE sku=$1',[sku]);
   let numero=nr.rows[0].n;
   let atualizados=0,criados=0;

   for(const canal of canais){
    let anuncio=await c.query('SELECT id FROM anuncios WHERE sku=$1 AND canal=$2 ORDER BY id DESC LIMIT 1',[sku,canal]);
    let id:number;
    if(anuncio.rowCount){
     id=anuncio.rows[0].id;
     atualizados++;
    }else{
     numero++;
     const tituloInicial=etapa==='BASE'?(canal.startsWith('MERCADO LIVRE')?ml[0]:canal.startsWith('SHOPEE')?sh:tk):'';
     const r=await c.query(`INSERT INTO anuncios(sku,numero,titulo,descricao,canal,etapa,status,criado_em,atualizado_em,entrada_etapa_em,prioridade,prazo)
       VALUES($1,$2,$3,$4,$5,$6,'CORRIGIR',$7,$7,$7,$8,$9) RETURNING id`,
       [sku,numero,tituloInicial,etapa==='BASE'?desc:'',canal,etapa,t,b.prioridade||'NORMAL',b.prazo||null]);
     id=r.rows[0].id;
     criados++;
    }

    if(etapa==='BASE'){
     const tits=canal.startsWith('MERCADO LIVRE')?ml:canal.startsWith('SHOPEE')?[sh]:[tk];
     await c.query('DELETE FROM anuncio_titulos WHERE anuncio_id=$1',[id]);
     for(let i=0;i<tits.length;i++)await c.query('INSERT INTO anuncio_titulos(anuncio_id,ordem,titulo) VALUES($1,$2,$3)',[id,i+1,tits[i]]);
     await c.query('UPDATE anuncios SET titulo=$1,descricao=$2 WHERE id=$3',[tits[0],desc,id]);
    }

    await c.query(`UPDATE anuncios SET etapa=$1,status='AGUARDANDO',responsavel=NULL,entrada_etapa_em=$2,inicio_etapa_em=NULL,
      atualizado_em=$2,prioridade=$3,prazo=$4,correcao_origem=NULL,correcao_destino=NULL,
      correcao_retorno=NULL,correcao_motivo=NULL,tipo_origem='ATUALIZAÇÃO',observacao_atualizacao=$5 WHERE id=$6`,
      [etapa,t,b.prioridade||'NORMAL',b.prazo||null,obs||null,id]);
    await c.query('INSERT INTO historico(anuncio_id,data_hora,etapa,acao,observacao) VALUES($1,$2,$3,$4,$5)',
      [id,t,etapa,'ATUALIZAÇÃO SOLICITADA',`${u.nome} | ${canal}${obs?`: ${obs}`:''}`]);
   }

   await c.query('COMMIT');
   return NextResponse.json({ok:true,atualizados:canais.length,existentes:atualizados,novos:criados});
  }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
 }catch(e){console.error(e);return NextResponse.json({error:'Falha ao enviar anúncio para atualização.'},{status:500})}
}
