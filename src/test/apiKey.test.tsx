import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Issue #26: X-API-Key em toda chamada a /api/... quando VITE_API_KEY existir.
 * Sem rede: fetch é substituído. O cliente lê VITE_API_URL ao carregar, por isso
 * cada teste recarrega o módulo depois de ajustar as variáveis.
 */
const URL_API = 'http://api.teste';
const CHAVE = 'chave-de-teste-sintetica';

const respostaJson = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });

let fetchMock: ReturnType<typeof vi.fn>;

async function carregarCliente(chave?: string) {
  vi.stubEnv('VITE_API_URL', URL_API);
  vi.stubEnv('VITE_API_KEY', chave ?? '');
  vi.resetModules();
  return import('../api/client');
}

const cabecalhoDaChamada = (i = 0): string | null => {
  const init = fetchMock.mock.calls[i][1] as RequestInit | undefined;
  return new Headers(init?.headers).get('X-API-Key');
};

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('apiFetch: cabeçalho X-API-Key', () => {
  it('com VITE_API_KEY, envia X-API-Key em GET', async () => {
    const api = await carregarCliente(CHAVE);
    fetchMock.mockResolvedValue(respostaJson([]));
    await api.fetchDocumentos();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${URL_API}/api/documentos`);
    expect(cabecalhoDaChamada()).toBe(CHAVE);
  });

  it('com VITE_API_KEY, envia X-API-Key em POST JSON sem perder o Content-Type', async () => {
    const api = await carregarCliente(CHAVE);
    fetchMock.mockResolvedValue(respostaJson({ resposta: 'ok', consta: true, citacoes: [], avisos: [] }));
    await api.postPerguntar('Quantos dias de antecedência para férias?');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('POST');
    const h = new Headers(init.headers);
    expect(h.get('X-API-Key')).toBe(CHAVE);
    expect(h.get('Content-Type')).toBe('application/json');
  });

  it('com VITE_API_KEY, envia X-API-Key nas chamadas via obterJson (POST /api/decisoes)', async () => {
    const api = await carregarCliente(CHAVE);
    fetchMock.mockResolvedValue(respostaJson({ id: 'd1', registrado_em: '2026-11-13T00:00:00Z' }));
    await api.postDecisao({ item: 'r1', acao: 'aceitar', responsavel: 'GGC', nota: '' });
    expect(fetchMock.mock.calls[0][0]).toBe(`${URL_API}/api/decisoes`);
    expect(cabecalhoDaChamada()).toBe(CHAVE);
  });

  it('com VITE_API_KEY, envia X-API-Key no upload multipart sem forçar Content-Type', async () => {
    const api = await carregarCliente(CHAVE);
    fetchMock.mockResolvedValue(respostaJson({ arquivos: [] }));
    const arquivo = new File(['# conteúdo'], 'NG_999.md', { type: 'text/markdown' });
    await api.enviarLote([{ nome: 'NG_999.md', tamanho: arquivo.size, arquivo }]);
    const h = new Headers((fetchMock.mock.calls[0][1] as RequestInit).headers);
    expect(h.get('X-API-Key')).toBe(CHAVE);
    expect(h.get('Content-Type')).toBeNull();
  });

  it('sem VITE_API_KEY, não envia o cabeçalho e a chamada funciona', async () => {
    const api = await carregarCliente();
    fetchMock.mockResolvedValue(respostaJson([]));
    await expect(api.fetchDocumentos()).resolves.toEqual([]);
    expect(cabecalhoDaChamada()).toBeNull();
  });

  it('VITE_API_KEY só com espaços conta como ausente', async () => {
    const api = await carregarCliente('   ');
    fetchMock.mockResolvedValue(respostaJson([]));
    await api.fetchDocumentos();
    expect(cabecalhoDaChamada()).toBeNull();
  });

  it('sem VITE_API_URL (modo de exemplo), não chama a rede mesmo com chave', async () => {
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('VITE_API_KEY', CHAVE);
    vi.resetModules();
    const api = await import('../api/client');
    expect(api.isMockMode()).toBe(true);
    await api.fetchDocumentos();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('401/403: mensagem clara', () => {
  it.each([401, 403])('%i vira ErroChaveApi com a mensagem amigável', async (status) => {
    const api = await carregarCliente(CHAVE);
    fetchMock.mockResolvedValue(respostaJson({ detail: 'API_KEY inválida ou ausente no cabeçalho X-API-Key.' }, status));
    const erro = await api.fetchDocumentos().catch((e) => e);
    expect(erro).toBeInstanceOf(api.ErroChaveApi);
    expect(erro.status).toBe(status);
    expect(erro.message).toBe('A chave de acesso não foi aceita. Confira a configuração.');
  });

  it('outros erros mantêm a mensagem técnica de antes', async () => {
    const api = await carregarCliente(CHAVE);
    fetchMock.mockResolvedValue(new Response('x', { status: 500, statusText: 'Internal Server Error' }));
    await expect(api.fetchDocumentos()).rejects.toThrow('Falha ao obter lista de documentos (500');
  });

  it('o Catálogo mostra a mensagem amigável em vez do erro técnico', async () => {
    await carregarCliente(CHAVE);
    fetchMock.mockResolvedValue(respostaJson({ detail: 'API_KEY inválida' }, 401));
    const { CatalogoView } = await import('../components/CatalogoView');
    render(<CatalogoView onNavegarDocumento={vi.fn()} />);
    expect(await screen.findByText('A chave de acesso não foi aceita. Confira a configuração.')).toBeInTheDocument();
    expect(screen.queryByText(/Falha ao/)).not.toBeInTheDocument();
  });

  it('a tela inicial avisa da chave recusada em vez de dizer que nada pede atenção', async () => {
    await carregarCliente(CHAVE);
    fetchMock.mockResolvedValue(respostaJson({ detail: 'API_KEY inválida' }, 401));
    const { VisaoGeralView } = await import('../components/VisaoGeralView');
    render(<VisaoGeralView />);
    expect(await screen.findByText('A chave de acesso não foi aceita. Confira a configuração.')).toBeInTheDocument();
    expect(screen.queryByText('Nada pede sua atenção agora.')).not.toBeInTheDocument();
  });
});
