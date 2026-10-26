# Caixa de entrada do Minha Vida

O Claude grava aqui os resumos diários de projeto. O ChatGPT lê esta pasta e registra cada resumo no Minha Vida.
Esta pasta é só passagem: o registro oficial é o do Minha Vida.

## Onde ficam

`minha-vida/resumos/AAAA-MM-DD--<projeto>.md`, um arquivo por projeto e por dia.

## Formato de cada arquivo

O cabeçalho entre `---` é igual para todos os projetos. As seções do corpo podem variar por projeto (veja a tabela abaixo); importe o corpo como está.

```
---
projeto: Plataforma de Gestão de Serviços Gerais
data: 2026-10-24
titulo: Resumo do projeto — 24/10/2026
kind: note
noteType: note
---
# Resumo do projeto — 24/10/2026
## 1. Resumo do dia
## 2. O que foi feito
## 3. Decisões
## 4. Problemas e bloqueios
## 5. Pendências e próximos passos
## 6. Situação atual
```

## Projetos que usam esta pasta

| Nome no campo `projeto` | Seções do resumo |
| --- | --- |
| Plataforma de Gestão de Serviços Gerais | 1. Resumo do dia · 2. O que foi feito · 3. Decisões · 4. Problemas e bloqueios · 5. Pendências e próximos passos · 6. Situação atual |
| Plataforma de Central de Administração | Situação atual · Avanços do dia · Decisões tomadas · Pendências e bloqueios · Próximos passos · Validações (seções sem informação são omitidas) |

### Criação do projeto Plataforma de Central de Administração

Se este projeto ainda não existir no Minha Vida, crie-o uma única vez, antes de importar o primeiro resumo dele, com:

- **Título:** Plataforma de Central de Administração
- **Descrição:** Central única para a administração global, exclusiva do Weslley, dos produtos que têm clientes, começando pela Plataforma de Gestão de Serviços Gerais e pelo Gerenciador de Clans. Cada produto continua autorizando e executando suas próprias regras no servidor; a Central tem login próprio com segundo fator, sessões curtas e registro de todas as ações. Depois que cada integração for validada, o acesso administrativo antigo daquele produto é desativado, e os clientes continuam usando seus produtos normalmente. Prioridade acima do projeto TikTok.

Se já existir um projeto com esse nome, use-o e não altere título, objetivo nem descrição. Se houver projetos com nomes parecidos e não for possível saber qual é o certo, não crie nem grave: pergunte ao Weslley.

## Regras para quem importa (ChatGPT)

1. Localize o projeto pelo nome em `projeto` e use o `projectId` dele (para a Central, veja a criação acima).
2. Antes de gravar, consulte o histórico do projeto (`journal=project`). Se já existir registro com o mesmo `titulo` na mesma `data`, não grave de novo.
3. Grave com `kind=note`, `noteType=note`, `projectId`, `date` = `data`, título = `titulo` e conteúdo = corpo do arquivo (sem o cabeçalho entre `---`).
4. Não grave no diário pessoal, não altere objetivo nem descrição do projeto e preserve os registros manuais. Financeiro, VA e Vendinha são só consulta.
5. Não apague nem altere arquivos desta pasta.
