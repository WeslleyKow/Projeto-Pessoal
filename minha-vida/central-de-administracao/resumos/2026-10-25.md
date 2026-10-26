---
projeto: Plataforma de Central de Administração
data: 2026-10-25
titulo: Resumo do projeto — 25/10/2026
kind: note
noteType: note
---
# Resumo do projeto — 25/10/2026

## Situação atual
Projeto iniciado em 25/10. Etapa 2 (diagnóstico e planejamento) concluída e aceita pelo Gestor, com quatro ajustes já aplicados ao documento. Nada foi construído: ainda não existe código, repositório, infraestrutura, banco nem credencial da Central. A implementação aguarda as decisões do Weslley, a conferência de produção e o teste de recuperação dos bancos.

## Avanços do dia
- Início do projeto: pedido de diagnóstico dos produtos com clientes e proposta de implementação, sem construir nem migrar nada.
- Diagnóstico feito só com leitura:
  - Serviços Gerais: repositório `WeslleyKow/APP-Servicos-Gerais`, branch `main`, commit `43393da`.
  - Gerenciador de Clans: repositório `WeslleyKow/gerenciador-de-clans`, branch confirmada `master` (única existente), commit `c56903b`.
  - Banco de produção dos Clans (Supabase): consulta de estrutura, migrações e alertas, sem ler dados de clientes.
- Entregue no Claude o documento "Central Administrativa — Etapa 2: diagnóstico e proposta". Ele contém: diagnóstico dos dois produtos; mapa das funções administrativas, separando o que é exclusivo do Weslley do que pertence ao cliente; quatro alternativas de integração; escopo mínimo da primeira versão; mudanças em cada produto; oito fases de implementação; critérios de aceitação; riscos; e decisões pendentes.
- Revisão do Gestor: Etapa 2 considerada concluída como diagnóstico e planejamento, com quatro ajustes. Os quatro foram aplicados ao documento no mesmo dia:
  1. Não recriar a senha inicial de administrador de Serviços Gerais; conferir só que o administrador atual entra e que a recuperação está documentada.
  2. Exigir recuperação testada dos dois bancos antes de qualquer alteração em produção, inclusive em Serviços Gerais.
  3. Separar verificações imediatas de permissões no Gerenciador de Clans, só com leitura, sem esperar a Central. Nada indica até agora exploração ou acesso indevido.
  4. Corrigir o texto sobre invasão: se a Central inteira for comprometida, os dois produtos são alcançados, dentro da lista de ações permitidas.

## Decisões tomadas
- Definições recebidas do Weslley: a Central centraliza a administração global, começando por Serviços Gerais e depois Clans; os acessos administrativos antigos são desativados só depois de validar cada integração; os clientes não são afetados; prioridade acima do TikTok; o Minha Vida continua sendo a fonte de documentação e planejamento.
- Recomendação do Gestor, ainda não confirmada pelo Weslley: alternativa B. A Central envia pedidos assinados e de curta validade a uma API administrativa própria de cada produto, e cada produto continua autorizando, executando e registrando as ações. A Central não guarda senha de banco nem segredos de pagamento.
- Orientação do Gestor: não autorizar a construção de toda a Central de uma vez. A primeira entrega comprova só login, segundo fator, recuperação, sessões e registro de ações, sem nenhum produto conectado.

## Pendências e bloqueios
Decisões do Weslley. Para cada uma, o Gestor deixou uma recomendação; nenhuma está decidida:
- Arquitetura (recomendação: alternativa B).
- Administradores (recomendação: só o Weslley na primeira versão).
- Hospedagem e banco da Central (recomendação: ambiente separado, confirmando custo antes de criar).
- Método do segundo fator (recomendação: obrigatório e com recuperação testada).
- Exclusão definitiva de clientes (recomendação: adiar e usar suspensão).
- Redefinição de acesso (recomendação: preferir link de uso único, avaliando o esforço).
- Leitura de dados de outros clãs (recomendação: não levar para a Central sem necessidade concreta).
- Permissões de líder, colíder e ancião (recomendação: preservar).
- Painel antigo do Black Sheep (recomendação: investigar dependências antes de mexer).
- Período de uso em paralelo (recomendação: encerrar por critérios de validação e uso real, sem prazo fixo).
- Visibilidade do repositório de Serviços Gerais.

Bloqueios para implementar:
- Testar a restauração dos bancos de Serviços Gerais e dos Clans em cópia.
- Conferir a versão publicada dos dois produtos. Não houve acesso à Vercel, ao Neon nem ao Worker publicado.
- Clans: comparar as funções do banco de produção com o repositório e confirmar como a conta de proprietário entra hoje.
- Preparar ambientes de teste, com custo confirmado antes de criar.

## Próximos passos
Sequência recomendada pelo Gestor:
1. Fechar as decisões da primeira versão.
2. Conferir produção, recuperação e ambientes de teste.
3. Construir a base da Central sem produtos conectados.
4. Integrar Serviços Gerais, primeiro por leitura e depois por escrita.
5. Validar e só então desativar o administrador antigo de Serviços Gerais.
6. Repetir o processo nos Clans.
7. Avançar para o TikTok.

Em paralelo, sugerido e ainda não executado: verificações de permissões nos Clans, só com leitura. Qualquer correção depende de autorização do Weslley.

## Validações
- Nenhum teste de implementação, porque nada foi construído.
- Nenhuma alteração foi feita em código, banco, segredos, produção ou administradores.
- Conferido no código: o commit de segurança `43393da` de Serviços Gerais é o último da `main`, não há senhas fixas no código e as rotas de administração exigem administrador no servidor. Continuam como informação recebida, sem verificação: a aprovação dos testes automáticos no CI e as ações manuais feitas pelo Weslley.
- Pendente: tudo o que depende de produção (versões publicadas, recuperação dos bancos e estado das permissões nos Clans).
