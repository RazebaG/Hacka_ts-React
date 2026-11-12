import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setApiBaseUrl,
  getApiBaseUrl,
  isMockMode,
  fetchSaude,
  fetchDocumentos,
  fetchDocumentoDetalhe,
  postPerguntar,
  fetchCodigo,
  fetchPerspectivas,
  fetchRadar,
  fetchRegras,
  postSimular,
  ApiEndpointError
} from '../api/client';

describe('Cliente HTTP com VITE_API_URL / Integração com API Real', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    setApiBaseUrl('http://localhost:8000');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    setApiBaseUrl('');
    vi.restoreAllMocks();
  });

  it('detecta URL da API configurada e modo real ativo', () => {
    expect(getApiBaseUrl()).toBe('http://localhost:8000');
    expect(isMockMode()).toBe(false);
  });

  it('GET /api/saude realiza requisição real e retorna status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', documentos: 13 })
    } as Response);

    const saude = await fetchSaude();
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8000/api/saude');
    expect(saude.status).toBe('ok');
    expect(saude.documentos).toBe(13);
  });

  it('GET /api/documentos obtém lista real de documentos', async () => {
    const mockDocs = [
      {
        codigo: 'NG_111',
        titulo: 'Férias',
        tipo: 'NG',
        tipo_nome: 'Norma Geral',
        versao: '3.0.0',
        fase: 'Vigente',
        vigencia: '18 meses',
        vinculado_a: null,
        referencia: null,
        assunto: 'ferias',
        substituido: false
      }
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDocs
    } as Response);

    const docs = await fetchDocumentos();
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8000/api/documentos');
    expect(docs).toHaveLength(1);
    expect(docs[0].codigo).toBe('NG_111');
  });

  it('GET /api/documentos/{codigo}?versao={versao} carrega detalhe do documento', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        codigo: 'NG_111',
        titulo: 'Férias',
        versao: '3.0.0',
        secoes: [{ id: '4.3.1', titulo: 'Antecedência', texto: 'Texto da norma' }]
      })
    } as Response);

    const doc = await fetchDocumentoDetalhe('NG_111', '3.0.0');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/documentos/NG_111?versao=3.0.0'
    );
    expect(doc.codigo).toBe('NG_111');
    expect(doc.secoes).toHaveLength(1);
  });

  it('POST /api/perguntar envia pergunta e perfil com resposta estruturada da BE PR #23', async () => {
    const respostaBE = {
      resposta_id: 'resp-uuid-1234',
      resposta: 'Conforme a norma NG_111 v3.0.0...',
      consta: true,
      citacoes: [
        {
          codigo: 'PX_1111-001',
          versao: '1.0.0',
          secao: 'Anexo D',
          trecho: 'D-45: Início do agendamento',
          camada: {
            sigla: 'PX',
            tipo_nome: 'Procedimento',
            grupo: 'Normativo',
            subordinado_a: 'NG_111'
          }
        }
      ],
      avisos: ['NG_111 v2.0.0 foi substituída pela v3.0.0'],
      proxima_acao: 'Acessar o Portal Raiz para protocolar o pedido'
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => respostaBE
    } as Response);

    const res = await postPerguntar('Qual a antecedência mínima?', 'empregado');
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8000/api/perguntar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pergunta: 'Qual a antecedência mínima?',
        perfil: 'empregado'
      })
    });
    expect(res.resposta_id).toBe('resp-uuid-1234');
    expect(res.consta).toBe(true);
    expect(res.citacoes[0].camada?.subordinado_a).toBe('NG_111');
  });

  it('GET /api/codigo/{codigo} quando implementado retorna 200 com dados', async () => {
    const codigoBE = {
      codigo: 'PX_1111-001',
      tipo: 'PX',
      tipo_nome: 'Procedimento',
      vinculado_a: 'NG_111',
      serie: '1',
      serie_nome: 'Gente e Cultura',
      vigencia_regra: '18 meses',
      existe_no_acervo: true,
      observacao: 'Procedimento de Férias'
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => codigoBE
    } as Response);

    const info = await fetchCodigo('PX_1111-001');
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8000/api/codigo/PX_1111-001');
    expect(info.codigo).toBe('PX_1111-001');
    expect(info.tipo_nome).toBe('Procedimento');
  });

  it('GET /api/codigo/{codigo} detecta endpoint ausente (FastAPI 404 Not Found) e sinaliza isEndpointAusente=true', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ detail: 'Not Found' })
    } as Response);

    await expect(fetchCodigo('PX_1111-001')).rejects.toThrow(ApiEndpointError);

    try {
      await fetchCodigo('PX_1111-001');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ApiEndpointError);
      const apiErr = e as ApiEndpointError;
      expect(apiErr.isEndpointAusente).toBe(true);
      expect(apiErr.status).toBe(404);
      expect(apiErr.message).toContain('Endpoint GET /api/codigo/{codigo} ausente');
    }
  });

  it('GET /api/codigo/{codigo} diferencia código não encontrado de endpoint ausente', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ detail: 'Código não encontrado' })
    } as Response);

    try {
      await fetchCodigo('CODIGO_INEXISTENTE');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ApiEndpointError);
      const apiErr = e as ApiEndpointError;
      expect(apiErr.isEndpointAusente).toBe(false);
      expect(apiErr.message).toContain('Código não encontrado');
    }
  });

  it('endpoints de inteligência e radar recorrem ao mock com aviso quando o backend retornar 404 (aguardando BE #4/#7/#8)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ detail: 'Not Found' })
    } as Response);

    const perspectivas = await fetchPerspectivas();
    expect(perspectivas.length).toBeGreaterThan(0);

    const radar = await fetchRadar();
    expect(radar.itens.length).toBeGreaterThan(0);

    const regras = await fetchRegras();
    expect(regras.length).toBeGreaterThan(0);

    const sim = await postSimular({ regra: 'ferias_antecedencia_dias', novo_valor: 30 });
    expect(sim.novo_valor).toBe(30);
  });
});
