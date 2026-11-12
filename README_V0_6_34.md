# Esteira ON V0.6.34 — produtividade e datas

- Totais de códigos deduplicados por SKU e executor, independentemente de etapa e plataforma, no período filtrado.
- Contagem de conclusões permanece por evento/plataforma.
- Cartão de FOTO e demais etapas soma códigos únicos da etapa; totais entre etapas não devem ser somados.
- Data de hoje, filtros e exibição usam America/Sao_Paulo; registros legados são interpretados como texto UTC.
- Não modifica dados históricos existentes.

## Atenção
Antes de publicar, confirme no banco se `historico.data_hora` armazena UTC como texto sem fuso, conforme o código da V0.6.33. O cálculo de produtividade histórica depende de `historico.observacao` identificar o executor; homônimos exigem uma migração futura para ID do usuário.
