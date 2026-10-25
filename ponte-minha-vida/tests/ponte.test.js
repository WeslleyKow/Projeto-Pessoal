import assert from 'node:assert/strict';
import { atender, chaveConfere } from '../lib/ponte.js';

const CHAVE = 'chave-de-teste-com-mais-de-24-caracteres';
const env = { PONTE_CHAVE: CHAVE, MINHA_VIDA_MCP_URL: 'https://minhavida.test/mcp-claude', MINHA_VIDA_AUTH_VALUE: 'token-servico' };
const pedido = (body, auth = 'Bearer ' + CHAVE, method = 'POST') =>
  new Request('https://ponte.test/mcp', { method, headers: { authorization: auth, 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-session-id': 's1' }, body: body === undefined ? undefined : JSON.stringify(body) });

let ultimo;
const fakeFetch = async (url, init) => {
  ultimo = { url, init };
  return new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: { ok: true } }), { status: 200, headers: { 'content-type': 'application/json', 'mcp-session-id': 's1', 'set-cookie': 'x=1' } });
};

// Chave
assert.equal(chaveConfere(CHAVE, CHAVE), true);
assert.equal(chaveConfere('outra', CHAVE), false);
assert.equal(chaveConfere(CHAVE, 'curta'), false);

// Sem configuração
let r = await atender(pedido({}), {}, fakeFetch);
assert.equal(r.status, 503);

// Chave errada: 401 sem desafio OAuth
r = await atender(pedido({ jsonrpc: '2.0', id: 1, method: 'initialize' }, 'Bearer errada'), env, fakeFetch);
assert.equal(r.status, 401);
assert.equal(r.headers.get('www-authenticate'), null);
r = await atender(pedido({ jsonrpc: '2.0', id: 1, method: 'initialize' }, ''), env, fakeFetch);
assert.equal(r.status, 401);

// Repasse com o cabeçalho de serviço, sem vazar a chave do Claude
ultimo = null;
r = await atender(pedido({ jsonrpc: '2.0', id: 1, method: 'tools/list' }), env, fakeFetch);
assert.equal(r.status, 200);
assert.equal(ultimo.url, env.MINHA_VIDA_MCP_URL);
assert.equal(ultimo.init.headers.get('OAI-Sites-Authorization'), 'token-servico');
assert.equal(ultimo.init.headers.get('authorization'), null);
assert.equal(ultimo.init.headers.get('mcp-session-id'), 's1');
assert.equal(r.headers.get('mcp-session-id'), 's1');
assert.equal(r.headers.get('set-cookie'), null);
assert.deepEqual(await r.json(), { jsonrpc: '2.0', id: 1, result: { ok: true } });

// Ferramenta liberada passa; não liberada é barrada sem chegar ao Minha Vida
r = await atender(pedido({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'criar_registro_projeto', arguments: {} } }), env, fakeFetch);
assert.equal(r.status, 200);
ultimo = null;
r = await atender(pedido({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'apagar_registro', arguments: {} } }), env, fakeFetch);
assert.equal(ultimo, null);
assert.equal((await r.json()).error.code, -32601);
r = await atender(pedido([{ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'listar_projetos' } }, { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'diario_pessoal' } }]), env, fakeFetch);
assert.equal(ultimo, null);
assert.equal((await r.json()).id, 5);

// JSON inválido
r = await atender(new Request('https://ponte.test/mcp', { method: 'POST', headers: { authorization: 'Bearer ' + CHAVE }, body: '{x' }), env, fakeFetch);
assert.equal(r.status, 400);

// Minha Vida recusa o serviço: não repassa o 401/WWW-Authenticate da OpenAI
r = await atender(pedido({ jsonrpc: '2.0', id: 1, method: 'initialize' }), env, async () => new Response('login', { status: 401, headers: { 'www-authenticate': 'Bearer resource_metadata="x"' } }));
assert.equal(r.status, 502);
assert.equal(r.headers.get('www-authenticate'), null);

// Minha Vida fora do ar
r = await atender(pedido({ jsonrpc: '2.0', id: 1, method: 'initialize' }), env, async () => { throw new Error('rede'); });
assert.equal(r.status, 502);

console.log('Ponte Minha Vida: todos os testes passaram.');
