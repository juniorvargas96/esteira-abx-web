import {NextResponse} from 'next/server'; import {currentUser,canManage} from '@/lib/auth'; import {db} from '@/lib/db';
const ETAPAS=['BASE','FOTO','DIMENSÕES','CRIAR ANÚNCIO','PROMOÇÃO','ADS','VÍDEO'];
export async function GET(req:Request){try{const u=await currentUser();if(!canManage(u))return NextResponse.json({error:'Sem permissão'},{status:403});const q=db();await q.query(`CREATE TABLE IF NOT EXISTS usuario_responsabilidades (usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, etapa TEXT NOT NULL, PRIMARY KEY(usuario_id,etapa))`);const url=new URL(req.url);const hoje=new Date().toISOString().slice(0,10);const inicio=url.searchParams.get('inicio')||hoje;const fim=url.searchParams.get('fim')||inicio;
 const [ativos,entraram,finais,corrs,resp,prod]=await Promise.all([
 q.query(`SELECT id,sku,canal,etapa,status,responsavel,entrada_etapa_em,inicio_etapa_em,prioridade,prazo,correcao_motivo,tipo_origem,observacao_atualizacao FROM anuncios WHERE status!='OK' ORDER BY entrada_etapa_em`),
 q.query(`SELECT COUNT(*)::int n FROM anuncios WHERE substr(criado_em,1,10)=$1`,[hoje]),
 q.query(`SELECT COUNT(*)::int n FROM historico WHERE acao IN ('ANÚNCIO FINALIZADO','ATUALIZAÇÃO FINALIZADA') AND substr(data_hora,1,10)=$1`,[hoje]),
 q.query(`SELECT COUNT(*)::int n FROM anuncios WHERE status='CORRIGIR'`),
 q.query(`SELECT ur.etapa,u.nome FROM usuario_responsabilidades ur JOIN usuarios u ON u.id=ur.usuario_id WHERE u.ativo=1 ORDER BY ur.etapa,u.nome`),
 q.query(`SELECT u.id,u.nome,u.perfil,COALESCE(string_agg(DISTINCT ur.etapa, ', ' ORDER BY ur.etapa),'') etapas,
   COUNT(DISTINCT h.id) FILTER (WHERE h.acao='ETAPA CONCLUÍDA')::int concluidos,
   COUNT(DISTINCT hc.id) FILTER (WHERE hc.acao='CORREÇÃO CONCLUÍDA / RETORNO DIRETO')::int correcoes
   FROM usuarios u LEFT JOIN usuario_responsabilidades ur ON ur.usuario_id=u.id
   LEFT JOIN historico h ON h.observacao=u.nome AND substr(h.data_hora,1,10) BETWEEN $1 AND $2
   LEFT JOIN historico hc ON hc.observacao=u.nome AND substr(hc.data_hora,1,10) BETWEEN $1 AND $2
   WHERE u.ativo=1 GROUP BY u.id,u.nome,u.perfil ORDER BY u.nome`,[inicio,fim])]);
 const counts=Object.fromEntries(ETAPAS.map(e=>[e,ativos.rows.filter(x=>x.etapa===e).length]));const responsaveis=Object.fromEntries(ETAPAS.map(e=>[e,resp.rows.filter(x=>x.etapa===e).map(x=>x.nome)]));return NextResponse.json({metricas:{entraram:entraram.rows[0].n,finalizados:finais.rows[0].n,correcoes:corrs.rows[0].n},counts,trabalhos:ativos.rows,responsaveis,produtividade:prod.rows,periodo:{inicio,fim}});
 }catch(e){console.error(e);return NextResponse.json({error:'Falha ao carregar gestão.'},{status:500})}}
