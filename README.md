# Esteira ABX-ON Web V0.6.3

Atualizações principais:
- ATUALIZAÇÃO encerra na própria etapa escolhida.
- Observação da atualização destacada no trabalho.
- DIMENSÕES mantém preenchimento obrigatório antes de finalizar.
- Gestão mostra responsáveis configurados por etapa.
- Relatório de produtividade por usuário com filtro de período e impressão/PDF.
- Fluxo NOVO: BASE → FOTO → DIMENSÕES → CRIAR ANÚNCIO → PROMOÇÃO → ADS → VÍDEO → FINALIZADO.

# Esteira ABX-ON Web V0.3

Next.js + PostgreSQL/Supabase. Migração paralela da V7_2 Streamlit.

## Vercel
Configure `DATABASE_URL` como Secret em Production.

## V0.3
- login real com os usuários da V7_2;
- sessão persistente usando `login_sessions`;
- Gestão lendo anúncios reais e métricas do PostgreSQL;
- Gestor/Administrador podem devolver anúncio a etapa anterior e excluir, com confirmação;
- Administração lista usuários reais;
- Administrador pode criar usuário e atribuir etapas;
- V7_2 Streamlit permanece compatível e usa o mesmo banco.


## V0.6.1
- Importação Excel: após conferir, use ENVIAR PARA AS ESTEIRAS.
- Ordem: BASE > FOTO > DIMENSÕES > CRIAR ANÚNCIO > PROMOÇÃO > ADS > VÍDEO.
- CRIAR ANÚNCIO mostra resumo completo: títulos, descrição, foto OK e dimensões.


## V0.6.10
- Novo Produto manual já conclui a BASE no cadastro e entra diretamente em FOTO.
- Trabalhos NOVO que ainda estiverem na BASE voltam a ter ação SALVAR E FINALIZAR BASE, avançando para FOTO.
- Atualizações na BASE continuam encerrando na própria etapa.


## V0.6.10
- Correção devolvida para BASE agora permite revisar e editar também os preços do canal, além de títulos e descrição.
- Mercado Livre mantém a regra: Premium ou Clássico, podendo preencher apenas um ou ambos.
