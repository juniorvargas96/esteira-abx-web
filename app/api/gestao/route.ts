import {hojeBrasil} from '@/lib/brasil';
import {NextResponse} from 'next/server'; import {currentUser} from '@/lib/auth'; import {db} from '@/lib/db';
const ETAPAS=['BASE','FOTO','DIMENSÕES','PREÇOS','CRIAR ANÚNCIO','PROMOÇÃO','ADS','VÍDEO'];
export async function GET(req:Request){try{const u=await currentUser();if(!u)return NextResponse.json({error:'Sem permissão'},{status:401});const q=db();await q.query(`ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS codigo_pai BOOLEAN NOT NULL DEFAULT FALSE`);await q.query(`ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS quantidade_filhos INTEGER NOT NULL DEFAULT 0`);await q.query(`ALTER TABLE historico ADD COLUMN IF NOT EXISTS codigos_contabilizados INTEGER NOT NULL DEFAULT 1`);await q.query(`ALTER TABLE historico ADD COLUMN IF NOT EXISTS codigo_pai_conclusao BOOLEAN NOT NULL DEFAULT FALSE`);await q.query(`CREATE TABLE IF NOT EXISTS usuario_responsabilidades (usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, etapa TEXT NOT NULL, PRIMARY KEY(usuario_id,etapa))`);const url=new URL(req.url);const hoje=hojeBrasil();const inicio=url.searchParams.get('inicio')||hoje;const fim=url.searchParams.get('fim')||inicio;const etapaFiltro=ETAPAS.includes(url.searchParams.get('etapa')||'')?url.searchParams.get('etapa'):'TODAS';
 const [ativos,entraram,finais,corrs,resp,prod,emAndamento]=await Promise.all([
 q.query(`SELECT id,sku,canal,etapa,status,responsavel,entrada_etapa_em,inicio_etapa_em,prioridade,prazo,correcao_motivo,tipo_origem,observacao_atualizacao FROM anuncios WHERE status!='OK' ORDER BY CASE UPPER(COALESCE(prioridade,'NORMAL')) WHEN 'URGENTE' THEN 0 WHEN 'PRIORIDADE' THEN 1 ELSE 2 END, entrada_etapa_em`),
 q.query(`SELECT COUNT(*)::int n FROM anuncios WHERE (criado_em::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date=$1::date`,[hoje]),
 q.query(`SELECT COUNT(*)::int n FROM historico WHERE acao IN ('ANÚNCIO FINALIZADO','ATUALIZAÇÃO FINALIZADA') AND (data_hora::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date=$1::date`,[hoje]),
 q.query(`SELECT COUNT(*)::int n FROM anuncios WHERE status='CORRIGIR'`),
 q.query(`SELECT ur.etapa,u.nome FROM usuario_responsabilidades ur JOIN usuarios u ON u.id=ur.usuario_id WHERE u.ativo=1 ORDER BY ur.etapa,u.nome`),
 q.query(`WITH eventos AS (
 SELECT h.*, a.sku, COALESCE(NULLIF(TRIM(h.observacao),''),'') executor
 FROM historico h JOIN anuncios a ON a.id=h.anuncio_id
 WHERE h.acao='ETAPA CONCLUÍDA'
 AND (h.data_hora::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN $1::date AND $2::date
 AND ($3='TODAS' OR h.etapa=$3)
 ), unicos AS (
 SELECT executor, sku, MAX(GREATEST(1,COALESCE(codigos_contabilizados,1))) codigos,
 BOOL_OR(codigo_pai_conclusao) pai FROM eventos GROUP BY executor,sku
 ), totais AS (SELECT executor,COALESCE(SUM(codigos),0)::int codigos,
 COUNT(*) FILTER(WHERE NOT pai)::int tarefas_unitarias,
 COALESCE(SUM(codigos) FILTER(WHERE pai),0)::int filhos FROM unicos GROUP BY executor),
 conclusoes AS (SELECT executor,COUNT(*)::int concluidos FROM eventos GROUP BY executor),
 correcoes AS (SELECT observacao executor,COUNT(*)::int correcoes FROM historico
 WHERE acao='CORREÇÃO CONCLUÍDA / RETORNO DIRETO'
 AND (data_hora::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN $1::date AND $2::date
 AND ($3='TODAS' OR etapa=$3) GROUP BY observacao)
 SELECT u.id,u.nome,u.perfil,COALESCE((SELECT string_agg(DISTINCT ur.etapa, ', ' ORDER BY ur.etapa) FROM usuario_responsabilidades ur WHERE ur.usuario_id=u.id),'') etapas,
 COALESCE(c.concluidos,0)::int concluidos,COALESCE(t.codigos,0)::int codigos,
 COALESCE(t.tarefas_unitarias,0)::int tarefas_unitarias,COALESCE(t.filhos,0)::int filhos,
 COALESCE(k.correcoes,0)::int correcoes
 FROM usuarios u LEFT JOIN totais t ON t.executor=u.nome
 LEFT JOIN conclusoes c ON c.executor=u.nome LEFT JOIN correcoes k ON k.executor=u.nome
 WHERE u.ativo=1 ORDER BY u.nome`,[inicio,fim,etapaFiltro]),
 q.query(`SELECT responsavel,COUNT(*)::int n FROM anuncios WHERE status!='OK' AND responsavel IS NOT NULL AND TRIM(responsavel)!='' GROUP BY responsavel`) ]);
 const counts=Object.fromEntries(ETAPAS.map(e=>[e,ativos.rows.filter(x=>x.etapa===e).length]));const responsaveis=Object.fromEntries(ETAPAS.map(e=>[e,resp.rows.filter(x=>x.etapa===e).map(x=>x.nome)]));return NextResponse.json({metricas:{entraram:entraram.rows[0].n,finalizados:finais.rows[0].n,correcoes:corrs.rows[0].n},counts,trabalhos:ativos.rows,responsaveis,produtividade:prod.rows.map(p=>({...p,em_andamento:emAndamento.rows.filter(x=>x.responsavel===p.nome).reduce((a,x)=>a+Number(x.n),0)})),periodo:{inicio,fim,etapa:etapaFiltro}});
 }catch(e){console.error(e);return NextResponse.json({error:'Falha ao carregar gestão.'},{status:500})}}
