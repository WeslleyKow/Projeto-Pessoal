# Ponte Minha Vida

Liga o Claude (conector personalizado) ao MCP do Minha Vida, hospedado no ChatGPT Sites.

```
Claude ──Authorization: Bearer <PONTE_CHAVE>──▶ Ponte (Vercel) ──OAI-Sites-Authorization──▶ Minha Vida /mcp-claude
```

- Confere a chave do Claude (comparação em tempo constante). Sem chave válida responde 401 simples, sem desafio OAuth.
- Só deixa passar as ferramentas liberadas (`PONTE_FERRAMENTAS`; padrão: `listar_projetos`, `consultar_historico_projeto`, `criar_registro_projeto`).
- Não guarda dados, não grava logs do conteúdo e não repassa a chave do Claude ao Minha Vida.
- Independente do planejador do quarto: é um projeto Vercel à parte, com Root Directory `ponte-minha-vida`.

## Variáveis na Vercel

| Nome | Valor |
| - | - |
| `PONTE_CHAVE` | Chave longa e aleatória (mínimo 24 caracteres). A mesma vai no conector do Claude. |
| `MINHA_VIDA_MCP_URL` | URL completa do endpoint de serviço do Minha Vida (ex.: `https://…chatgpt.site/mcp-claude`). |
| `MINHA_VIDA_AUTH_VALUE` | Valor do acesso de serviço do Sites, exatamente como deve ir no cabeçalho. |
| `MINHA_VIDA_AUTH_HEADER` | Opcional. Padrão `OAI-Sites-Authorization`. |
| `PONTE_FERRAMENTAS` | Opcional. Lista separada por vírgulas. |

## Conector no Claude

- URL: `https://<projeto>.vercel.app/mcp`
- Autenticação: sem login
- Cabeçalho: `authorization` = `Bearer <PONTE_CHAVE>`

## Testes

```sh
cd ponte-minha-vida && npm test
```
