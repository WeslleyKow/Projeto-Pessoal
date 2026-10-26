# Caixa de entrada do Minha Vida

O Claude grava aqui os resumos diários de projeto. O ChatGPT lê esta pasta e registra cada resumo no Minha Vida.
Esta pasta é só passagem: o registro oficial é o do Minha Vida.

## Onde ficam

`minha-vida/resumos/AAAA-MM-DD--<projeto>.md`, um arquivo por projeto e por dia.

## Formato de cada arquivo

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

## Regras para quem importa (ChatGPT)

1. Localize o projeto pelo nome em `projeto` e use o `projectId` dele.
2. Antes de gravar, consulte o histórico do projeto (`journal=project`). Se já existir registro com o mesmo `titulo` na mesma `data`, não grave de novo.
3. Grave com `kind=note`, `noteType=note`, `projectId`, `date` = `data`, título = `titulo` e conteúdo = corpo do arquivo (sem o cabeçalho entre `---`).
4. Não grave no diário pessoal, não altere objetivo nem descrição do projeto e preserve os registros manuais. Financeiro, VA e Vendinha são só consulta.
5. Não apague nem altere arquivos desta pasta.

## Outros projetos

Esta pasta (`minha-vida/resumos`) é só da Plataforma de Gestão de Serviços Gerais. Outros projetos têm pasta própria dentro de `minha-vida/` (por exemplo, `minha-vida/central-de-administracao/`), com regras próprias e importados por outro canal. Ignore essas pastas.
