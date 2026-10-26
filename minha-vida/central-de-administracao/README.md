# Caixa de entrada do Minha Vida — Plataforma de Central de Administração

O Claude grava aqui os resumos diários deste projeto. O ChatGPT (canal da Central) lê esta pasta e registra cada resumo no Minha Vida.
Esta pasta é só passagem: o registro oficial é o do Minha Vida. Ela é separada da caixa de Serviços Gerais (`minha-vida/resumos`), que não deve ser lida por este canal.

## Onde ficam

`minha-vida/central-de-administracao/resumos/AAAA-MM-DD.md`, um arquivo por dia.

## Criação do projeto no Minha Vida

Se o projeto ainda não existir, crie-o uma única vez, antes de importar o primeiro resumo, com:

- **Título:** Plataforma de Central de Administração
- **Descrição:** Central única para a administração global, exclusiva do Weslley, dos produtos que têm clientes, começando pela Plataforma de Gestão de Serviços Gerais e pelo Gerenciador de Clans. Cada produto continua autorizando e executando suas próprias regras no servidor; a Central tem login próprio com segundo fator, sessões curtas e registro de todas as ações. Depois que cada integração for validada, o acesso administrativo antigo daquele produto é desativado, e os clientes continuam usando seus produtos normalmente. Prioridade acima do projeto TikTok.

Se já existir um projeto com esse nome, use-o e não altere título, objetivo nem descrição. Se houver projetos com nomes parecidos e não for possível saber qual é o certo, não crie nem grave: pergunte ao Weslley.

## Formato de cada arquivo

```
---
projeto: Plataforma de Central de Administração
data: 2026-10-25
titulo: Resumo do projeto — 25/10/2026
kind: note
noteType: note
---
# Resumo do projeto — 25/10/2026
## Situação atual
## Avanços do dia
## Decisões tomadas
## Pendências e bloqueios
## Próximos passos
## Validações
```

Seções sem informação são omitidas. Em dias sem avanço, o texto começa com "Mesma situação do dia anterior." e informa a data do registro de referência.

## Regras para quem importa (ChatGPT)

1. Localize o projeto pelo nome em `projeto` e use o `projectId` dele (veja a criação acima).
2. Antes de gravar, consulte o histórico do projeto (`journal=project`), percorrendo as páginas necessárias. Se já existir registro com o mesmo `titulo` na mesma `data`, não grave de novo.
3. Grave com `kind=note`, `noteType=note`, `projectId`, `date` = `data`, título = `titulo` e conteúdo = corpo do arquivo (sem o cabeçalho entre `---`). Confira o retorno da gravação antes de considerar salvo.
4. Não grave no diário pessoal, não altere objetivo nem descrição do projeto e preserve os registros manuais e outros relatos do dia. Financeiro, VA e Vendinha são só consulta. Tarefas são alinhadas em outro chat: não crie nem altere tarefas.
5. Não apague nem altere arquivos desta pasta.
