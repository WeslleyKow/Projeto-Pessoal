// Ponte entre o Claude (conector personalizado) e o MCP do Minha Vida.
// Confere a chave do Claude, deixa passar só as ferramentas liberadas e
// repassa a chamada ao Minha Vida com o cabeçalho de acesso de serviço.
import { createHash, timingSafeEqual } from 'node:crypto';

const FERRAMENTAS_PADRAO = ['listar_projetos', 'consultar_historico_projeto', 'criar_registro_projeto'];
const CABECALHOS_IDA = ['content-type', 'accept', 'mcp-session-id', 'mcp-protocol-version', 'last-event-id'];
const CABECALHOS_VOLTA = ['content-type', 'mcp-session-id', 'cache-control'];

const json = (status, obj, extra = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra } });

function config(env) {
  const lista = (env.PONTE_FERRAMENTAS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return {
    chave: env.PONTE_CHAVE || '',
    destino: env.MINHA_VIDA_MCP_URL || '',
    cabecalho: env.MINHA_VIDA_AUTH_HEADER || 'OAI-Sites-Authorization',
    valor: env.MINHA_VIDA_AUTH_VALUE || '',
    ferramentas: new Set(lista.length ? lista : FERRAMENTAS_PADRAO),
  };
}

const resumo = (s) => createHash('sha256').update(s).digest();
export function chaveConfere(recebida, esperada) {
  if (!esperada || esperada.length < 24 || !recebida) return false;
  return timingSafeEqual(resumo(recebida), resumo(esperada));
}

function chaveDoPedido(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : '';
}

// Devolve um erro JSON-RPC se o pedido tentar usar uma ferramenta não liberada.
export function bloqueio(mensagens, ferramentas) {
  const lista = Array.isArray(mensagens) ? mensagens : [mensagens];
  for (const m of lista) {
    if (!m || typeof m !== 'object' || m.method !== 'tools/call') continue;
    const nome = m.params?.name;
    if (typeof nome !== 'string' || !ferramentas.has(nome)) {
      return { jsonrpc: '2.0', id: m.id ?? null, error: { code: -32601, message: `Ferramenta não liberada pela ponte: ${nome}` } };
    }
  }
  return null;
}

export async function atender(req, env = process.env, fetcher = fetch) {
  const c = config(env);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (!c.chave || !c.destino || !c.valor) return json(503, { error: 'Ponte ainda não configurada na Vercel.' });
  // 401 simples, sem WWW-Authenticate: assim o Claude não tenta OAuth.
  if (!chaveConfere(chaveDoPedido(req), c.chave)) return json(401, { error: 'Chave inválida.' });
  if (!['POST', 'GET', 'DELETE'].includes(req.method)) return json(405, { error: 'Método não suportado.' });

  let corpo;
  if (req.method === 'POST') {
    corpo = await req.text();
    if (corpo.length > 1_000_000) return json(413, { error: 'Pedido grande demais.' });
    let mensagens;
    try { mensagens = JSON.parse(corpo); } catch { return json(400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON inválido.' } }); }
    const erro = bloqueio(mensagens, c.ferramentas);
    if (erro) return json(200, erro);
  }

  const headers = new Headers();
  for (const h of CABECALHOS_IDA) { const v = req.headers.get(h); if (v) headers.set(h, v); }
  headers.set(c.cabecalho, c.valor);

  let resp;
  try {
    resp = await fetcher(c.destino, { method: req.method, headers, body: corpo, redirect: 'manual' });
  } catch {
    return json(502, { error: 'Minha Vida não respondeu.' });
  }
  if (resp.status === 401 || resp.status === 403) {
    // Não repassa o desafio OAuth da OpenAI ao Claude.
    return json(502, { error: 'Minha Vida recusou o acesso de serviço. Confira MINHA_VIDA_AUTH_VALUE na Vercel.' });
  }
  if (resp.status >= 300 && resp.status < 400) return json(502, { error: 'Minha Vida pediu login (redirecionamento). Confira o acesso de serviço.' });

  const volta = new Headers();
  for (const h of CABECALHOS_VOLTA) { const v = resp.headers.get(h); if (v) volta.set(h, v); }
  return new Response(resp.body, { status: resp.status, headers: volta });
}
