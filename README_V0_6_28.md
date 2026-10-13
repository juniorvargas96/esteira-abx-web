# ESTEIRA ON WEB V0.6.28

Base: V0.6.27.

- Link publicado obrigatório para finalizar CRIAR ANÚNCIO (validação na interface e API).
- MEU HISTÓRICO: botão ABRIR com ficha do anúncio, títulos, ficha técnica, descrição, FOTO OK, dimensões, peso real/cúbico, preços e link.
- Registros anteriores sem link continuam consultáveis.
- A ficha consulta os dados atuais do anúncio, não um snapshot imutável do momento da conclusão.
- O Preview V0.6.27 não é substituído por um novo deployment Preview; produção permanece na versão anterior até promoção explícita.
- Preview e Production compartilham o banco se DATABASE_URL apontar para o mesmo Supabase.
