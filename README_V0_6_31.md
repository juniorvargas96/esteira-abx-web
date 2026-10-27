# ESTEIRA ON v0.6.31 — Atualizações simultâneas

- Cada solicitação de atualização cria uma tarefa própria por SKU e plataforma.
- FOTO e VÍDEO podem coexistir e ser finalizadas independentemente.
- Bloqueia uma segunda atualização aberta na mesma etapa, SKU e plataforma (HTTP 409).
- Preserva os anúncios e históricos existentes.
- Utiliza lock transacional por SKU para evitar solicitações simultâneas duplicadas.

Arquivos modificados: `app/api/updates/route.ts` e `package.json`.

**Observação:** testar primeiro em ambiente de homologação com cópia do banco de dados.
