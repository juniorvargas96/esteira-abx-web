# Esteira ON V0.6.37 — edição administrativa

Em Meus Trabalhos > Abrir > EDITAR / ATUALIZAR (ADMINISTRADOR), edite somente o anúncio selecionado. Salvar não conclui nem muda etapa, prioridade, responsável ou status. O formulário fecha e a fila é recarregada. Campos liberados por etapa: BASE (SKU, títulos, ficha ML, descrição), DIMENSÕES (medidas e peso), PREÇOS (preços do canal), CRIAR ANÚNCIO (link), VÍDEO (link). FOTO, PROMOÇÃO e ADS não possuem campos próprios editáveis no fluxo original. BASE importada ainda A DEFINIR usa seu formulário de configuração existente.

A API valida perfil e etapa, atualiza por ID e registra EDIÇÃO ADMINISTRATIVA. A coluna JSONB dados_individuais é criada automaticamente em anuncios, sem apagar dados existentes. Medidas antigas continuam disponíveis pelo cadastro do produto quando não há valores individuais. Novas medidas e edições de BASE/vídeo são individuais. Alterar SKU cria cadastro de destino somente se necessário e mantém o cadastro anterior; numeração é atribuída no destino. Nenhum anúncio externo é atualizado automaticamente.

Antes de publicar: backup do banco, teste em ambiente separado. Validar dois trabalhos com mesmo SKU em canais/etapas diferentes, edição de cada campo, mudança de SKU para existente e novo, bloqueio para gestor/operador, edição após mudança de etapa, finalização normal e histórico. Não foi executado contra o Supabase real nem feito build Next completo neste ambiente.

Preservado o filtro DE/ATÉ do Meu Histórico da versão enviada em 25/11.
