# ESTEIRA ON V0.6.21

- Fotos de perfil individuais: clicar no círculo do usuário ou em Alterar foto.
- A foto é recortada e comprimida no navegador e salva na tabela `usuario_fotos` do PostgreSQL online, criada automaticamente no primeiro uso.
- A foto só pode ser alterada/removida pelo próprio usuário autenticado.
- Fotos não são públicas; a rota exige sessão válida.
- Testar na branch Preview antes de publicar em Production.
- A sessão de login permanece com validade de 30 dias; em computadores compartilhados, usar SAIR.
