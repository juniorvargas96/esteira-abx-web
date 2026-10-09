# ESTEIRA ON V0.6.19 — Teste local

Base: projeto V0.6.16 enviado pelo usuário. Visual: prévia local aprovada.

1. Extraia este ZIP numa pasta nova.
2. Abra o PowerShell nessa pasta.
3. Execute `npm.cmd install` e depois `npm.cmd run dev`.
4. Acesse http://localhost:3000/login.
5. Entre com o mesmo usuário e senha do sistema original.

O layout de login usa o mesmo degradê, logo e proporções da prévia local. O aviso de demonstração foi retirado e o formulário continua chamando `/api/auth/login`.

**Atenção:** o login real requer as mesmas variáveis de ambiente e acesso ao banco configurados no projeto original. Este pacote não inclui credenciais nem arquivo `.env`.

Não foi publicado na Vercel. Validar login, menu e rotas antes de publicar.
