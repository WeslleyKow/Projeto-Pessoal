---
projeto: Plataforma de Gestão de Serviços Gerais
data: 2026-10-24
titulo: Resumo do projeto — 24/10/2026
kind: note
noteType: note
---
# Resumo do projeto — 24/10/2026

## 1. Resumo do dia
Dia sem alterações no código da plataforma. O trabalho foi de documentação: relatório completo do projeto e definição de como os resumos diários chegam ao Minha Vida.

## 2. O que foi feito
- Relatório atualizado do projeto entregue como documento no Claude ("Painel Geral — Relatório do Projeto"): objetivo, o que foi implementado, o que foi só solicitado, o que ainda precisa de teste e percentual de conclusão estimado.
- Tentativa de ligar o Claude direto ao Minha Vida como conector personalizado. O MCP do Minha Vida (ChatGPT Sites) usa o login da OpenAI, que não aceita o Claude; o acesso de serviço do Sites usa um cabeçalho que o Claude não permite configurar.
- Definido o caminho: o Claude grava os resumos na pasta `minha-vida/resumos` do repositório Projeto-Pessoal e o ChatGPT importa para o Minha Vida.

## 3. Decisões
- Os resumos do projeto ficam no Minha Vida, não no repositório da plataforma.
- Sem servidor intermediário (Vercel): o repositório Projeto-Pessoal funciona como caixa de entrada.
- Resumo automático todo dia de madrugada, cobrindo o dia anterior inteiro; o primeiro automático cobre 25/10.

## 4. Problemas e bloqueios
- Integração direta Claude → Minha Vida inviável com a hospedagem atual do Sites.
- Falta configurar no ChatGPT a leitura da pasta `minha-vida/resumos` e o registro no Minha Vida.

## 5. Pendências e próximos passos
- ChatGPT: importar os resumos desta pasta para o diário do projeto, sem duplicar.
- Adiados pelo Weslley: WhatsApp pela Meta Cloud API (definir controle de custo), aplicativos nas lojas (em espera), domínio próprio.
- Abrir o autocadastro pelo site no painel do administrador quando quiser começar a vender.
- Segurança antes de vender: senha da conta de teste "nathaly" aparece no repositório público; confirmar que a senha do admin foi trocada; tornar o repositório privado.
- Validar em produção as funções ainda não testadas por uso real: link de agendamento dos clientes e autocadastro com Pix.

## 6. Situação atual
- Site no ar (app-servicos-gerais.vercel.app). Último deploy em 18/10 (commit 73ffd36), com testes automáticos passando.
- Banco Neon e Pix do Mercado Pago configurados; pagamento real por Pix já confirmado.
- Funcionalidades prontas: painel multi-cliente com login, Atendimento, personalização, painel do administrador, cobrança por Pix com liberação automática, link de agendamento e autocadastro com indicação.
