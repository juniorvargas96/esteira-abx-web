# Esteira ON Web V0.6.33

Base: V0.6.32.

## Alterações
- Ordenação por URGENTE, PRIORIDADE, NORMAL, depois entrada mais antiga na etapa.
- Novo Produto e Atualizar Anúncio: identificação de SKU PAI e quantidade de FILHOS.
- PAI permanece uma tarefa; cada conclusão de etapa contabiliza apenas a quantidade de FILHOS informada.
- Quantidade é gravada no registro histórico da conclusão; históricos anteriores continuam com 1.
- Gestão: filtro de etapa e período, colunas de tarefas, códigos normais, filhos e total de códigos.
- Meus Trabalhos: quantidade de códigos concluídos hoje, indicação de PAI no detalhe.
- Meu Histórico: agrupa conclusões de novos e atualizações sob Etapas concluídas e mostra quantidade de códigos.

## Banco de dados
As novas colunas são criadas com `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` pelas rotas.
Nenhum registro histórico existente é recalculado.

## Publicação
1. Faça backup do banco Supabase e do repositório.
2. Substitua o conteúdo do projeto pelos arquivos desta pasta, mantendo as variáveis de ambiente no Vercel.
3. Faça commit e push; acompanhe o build no Vercel.
4. Teste em ambiente de homologação antes de usar em produção.

## Validação
Arquivos TS/TSX passaram por verificação sintática local. Build completo e testes com PostgreSQL real não foram executados neste ambiente.
