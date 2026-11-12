# Esteira ON V0.6.35

## Alteração
- Cartão Concluídos hoje: detalhamento recolhível por funcionário executor real.
- Cada linha mostra conclusões e códigos únicos do funcionário na etapa e no dia (horário de Brasília).
- SKU PAI: usa a quantidade de filhos gravada na conclusão; não duplica entre plataformas para o mesmo executor.
- Total da etapa continua deduplicado por SKU, mesmo entre funcionários.
- Histórico original, movimentações e demais funcionalidades preservados.

## Validação recomendada
- PAI com 10 filhos em duas plataformas pelo mesmo executor: 2 conclusões e 10 códigos.
- Dois executores na mesma etapa: mostrar cada um separadamente.
- Mesmo SKU por executores distintos: a soma dos créditos individuais pode superar o total de SKUs distintos da etapa.
- Conferir fuso horário de Brasília, filtros e relatório Gestão.
