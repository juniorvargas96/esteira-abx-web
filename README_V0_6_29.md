# ESTEIRA ON WEB V0.6.29 — Correção BASE sem preços

- Remove campos de preços da edição da BASE e da configuração da BASE de produtos importados via Excel.
- Remove exigência de preços das ações `saveBase` e `configureExcelBase` na API.
- `saveBase` preserva os preços já registrados, atualizando apenas título, ficha técnica e descrição.
- Mantém a etapa PREÇOS e suas validações após DIMENSÕES.
- Permite que correções devolvidas à BASE sejam finalizadas e sigam o fluxo existente sem informar preços.
- Preserva o fluxo de ATUALIZAÇÃO e demais etapas.

Testes sugeridos: NOVO FOTO→correção BASE→FOTO; Excel BASE sem preço; PREÇOS com Premium ou Clássico; preços existentes preservados após correção BASE.
