import {
  CodigoInfo,
  CompararResultado,
  DocumentoDetalhe,
  DocumentoResumo,
  GrafoAcervo,
  PerfilUsuario,
  PerspectivaDetalhe,
  PerspectivaResumo,
  RelatorioExecutivo,
  RespostaPerguntar,
  SaudeResponse,
  RadarResponse,
  RegraItem,
  SimularRequest,
  SimularResponse
} from './types';
import { getDocumentoByCodigo, getResumoDocumentos } from '../mocks/documentos';
import { mockPerguntar } from '../mocks/perguntas';
import { MOCK_SAUDE } from '../mocks/saude';
import { getCodigoInfoMock } from '../mocks/codigos';
import {
  MOCK_COMPARATIVOS,
  MOCK_GRAFO,
  MOCK_PERSPECTIVAS,
  MOCK_PERSPECTIVAS_DETALHE,
  MOCK_RELATORIOS
} from '../mocks/inteligencia';
import { getRadarMock } from '../mocks/radar';
import { MOCK_REGRAS, mockSimular } from '../mocks/simular';

export class ApiEndpointError extends Error {
  public status?: number;
  public isEndpointAusente: boolean;

  constructor(message: string, status?: number, isEndpointAusente: boolean = false) {
    super(message);
    this.name = 'ApiEndpointError';
    this.status = status;
    this.isEndpointAusente = isEndpointAusente;
  }
}

let configuredApiBaseUrl: string = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  ''
).replace(/\/+$/, '');

export const setApiBaseUrl = (url: string): void => {
  configuredApiBaseUrl = (url || '').replace(/\/+$/, '');
};

export const getApiBaseUrl = (): string => configuredApiBaseUrl;
export const isMockMode = (): boolean => !configuredApiBaseUrl;

export async function fetchSaude(): Promise<SaudeResponse> {
  if (isMockMode()) {
    return Promise.resolve(MOCK_SAUDE);
  }
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/saude`);
  if (!res.ok) {
    throw new Error(`Falha ao consultar saúde da API (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchDocumentos(): Promise<DocumentoResumo[]> {
  if (isMockMode()) {
    return Promise.resolve(getResumoDocumentos());
  }
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/documentos`);
  if (!res.ok) {
    throw new Error(`Falha ao obter lista de documentos (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchDocumentoDetalhe(
  codigo: string,
  versao?: string
): Promise<DocumentoDetalhe> {
  if (isMockMode()) {
    const doc = getDocumentoByCodigo(codigo, versao);
    if (!doc) {
      throw new Error(`Documento ${codigo} (versão: ${versao || 'vigente'}) não encontrado`);
    }
    return Promise.resolve(doc);
  }
  const baseUrl = getApiBaseUrl();
  const url = versao
    ? `${baseUrl}/api/documentos/${encodeURIComponent(codigo)}?versao=${encodeURIComponent(versao)}`
    : `${baseUrl}/api/documentos/${encodeURIComponent(codigo)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao carregar documento ${codigo} (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function postPerguntar(
  pergunta: string,
  perfil?: PerfilUsuario
): Promise<RespostaPerguntar> {
  if (isMockMode()) {
    return Promise.resolve(mockPerguntar(pergunta, perfil));
  }
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/perguntar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pergunta,
      perfil: perfil || null
    })
  });
  if (!res.ok) {
    throw new Error(`Falha ao enviar pergunta (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchCodigo(codigo: string): Promise<CodigoInfo> {
  if (isMockMode()) {
    return Promise.resolve(getCodigoInfoMock(codigo));
  }
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/codigo/${encodeURIComponent(codigo)}`);
    if (!res.ok) {
      let detail = '';
      try {
        const json = await res.json();
        detail = json.detail || '';
      } catch {
        detail = res.statusText;
      }

      // FastAPI retorna 404 {"detail": "Not Found"} quando a rota não está registrada no app
      const isEndpointAusente =
        (res.status === 404 && (detail === 'Not Found' || detail.toLowerCase().includes('not found'))) ||
        res.status === 501;

      if (isEndpointAusente) {
        throw new ApiEndpointError(
          `Endpoint GET /api/codigo/{codigo} ausente no backend (${res.status} Not Found - aguardando issue BE #3)`,
          res.status,
          true
        );
      }

      throw new ApiEndpointError(
        detail || `Falha ao decodificar código ${codigo} (${res.status} ${res.statusText})`,
        res.status,
        false
      );
    }
    return res.json();
  } catch (err: unknown) {
    if (err instanceof ApiEndpointError) {
      throw err;
    }
    // Falha de rede ou backend indisponível
    throw new ApiEndpointError(
      `Falha de conexão com endpoint /api/codigo/${codigo}: ${err instanceof Error ? err.message : String(err)}`,
      undefined,
      true
    );
  }
}

export async function fetchPerspectivas(): Promise<PerspectivaResumo[]> {
  if (isMockMode()) {
    return Promise.resolve(MOCK_PERSPECTIVAS);
  }
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/perspectivas`);
  if (!res.ok) {
    if (res.status === 404) {
      console.warn('[API Client] GET /api/perspectivas retornou 404 (aguardando BE #4). Usando mock.');
      return MOCK_PERSPECTIVAS;
    }
    throw new Error(`Falha ao carregar perspectivas (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchPerspectivaDetalhe(id: string): Promise<PerspectivaDetalhe> {
  if (isMockMode()) {
    const detalhe = MOCK_PERSPECTIVAS_DETALHE[id];
    if (!detalhe) {
      throw new Error(`Perspectiva '${id}' não encontrada`);
    }
    return Promise.resolve(detalhe);
  }
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/perspectivas/${encodeURIComponent(id)}`);
  if (!res.ok) {
    if (res.status === 404) {
      const detalhe = MOCK_PERSPECTIVAS_DETALHE[id];
      if (detalhe) {
        console.warn(`[API Client] GET /api/perspectivas/${id} retornou 404. Usando mock.`);
        return detalhe;
      }
    }
    throw new Error(`Falha ao carregar detalhes da perspectiva ${id} (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchGrafo(): Promise<GrafoAcervo> {
  if (isMockMode()) {
    return Promise.resolve(MOCK_GRAFO);
  }
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/grafo`);
  if (!res.ok) {
    if (res.status === 404) {
      console.warn('[API Client] GET /api/grafo retornou 404 (aguardando BE #4). Usando mock.');
      return MOCK_GRAFO;
    }
    throw new Error(`Falha ao carregar grafo do acervo (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchComparar(
  codigo: string,
  de: string,
  para: string
): Promise<CompararResultado> {
  if (isMockMode()) {
    const key = `${codigo}:${de}:${para}`;
    const comp = MOCK_COMPARATIVOS[key];
    if (!comp) {
      return Promise.resolve({
        codigo,
        de,
        para,
        resumo: [`Comparação entre versão ${de} e ${para} do documento ${codigo}`],
        mudancas: [
          {
            secao: '1',
            tipo: 'alterado',
            antes: `Redação da versão ${de}`,
            depois: `Redação atualizada na versão ${para}`
          }
        ]
      });
    }
    return Promise.resolve(comp);
  }
  const baseUrl = getApiBaseUrl();
  const res = await fetch(
    `${baseUrl}/api/comparar?codigo=${encodeURIComponent(codigo)}&de=${encodeURIComponent(de)}&para=${encodeURIComponent(para)}`
  );
  if (!res.ok) {
    if (res.status === 404) {
      const key = `${codigo}:${de}:${para}`;
      const comp = MOCK_COMPARATIVOS[key];
      if (comp) {
        console.warn(`[API Client] GET /api/comparar retornou 404 (aguardando BE #4). Usando mock.`);
        return comp;
      }
    }
    throw new Error(`Falha ao comparar versões (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchRelatorio(params: {
  perspectiva?: string;
  codigo?: string;
}): Promise<RelatorioExecutivo> {
  if (isMockMode()) {
    const key = params.perspectiva || params.codigo || 'juridico';
    const rel = MOCK_RELATORIOS[key];
    if (!rel) {
      return Promise.resolve({
        titulo: `Relatório Executivo — ${key}`,
        gerado_em: new Date().toISOString(),
        secoes: [
          {
            titulo: 'Resumo Geral',
            itens: [
              {
                texto: `Síntese estruturada referente a ${key}.`,
                fonte: {
                  codigo: params.codigo || 'NG_111',
                  versao: '3.0.0',
                  secao: '1',
                  trecho: 'Texto consolidado.'
                }
              }
            ]
          }
        ]
      });
    }
    return Promise.resolve(rel);
  }

  const query = params.perspectiva
    ? `perspectiva=${encodeURIComponent(params.perspectiva)}`
    : `codigo=${encodeURIComponent(params.codigo || '')}`;

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/relatorio?${query}`);
  if (!res.ok) {
    if (res.status === 404) {
      const key = params.perspectiva || params.codigo || 'juridico';
      const rel = MOCK_RELATORIOS[key];
      if (rel) {
        console.warn(`[API Client] GET /api/relatorio retornou 404 (aguardando BE #4). Usando mock.`);
        return rel;
      }
    }
    throw new Error(`Falha ao carregar relatório (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchRadar(perspectiva?: string): Promise<RadarResponse> {
  if (isMockMode()) {
    return Promise.resolve(getRadarMock(perspectiva));
  }
  const baseUrl = getApiBaseUrl();
  const query =
    perspectiva && perspectiva !== 'todos'
      ? `?perspectiva=${encodeURIComponent(perspectiva)}`
      : '';
  const res = await fetch(`${baseUrl}/api/radar${query}`);
  if (!res.ok) {
    if (res.status === 404) {
      console.warn('[API Client] GET /api/radar retornou 404 (aguardando BE #7). Usando mock.');
      return getRadarMock(perspectiva);
    }
    throw new Error(`Falha ao consultar radar de contradições (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchRegras(): Promise<RegraItem[]> {
  if (isMockMode()) {
    return Promise.resolve(MOCK_REGRAS);
  }
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/regras`);
  if (!res.ok) {
    if (res.status === 404) {
      console.warn('[API Client] GET /api/regras retornou 404 (aguardando BE #8). Usando mock.');
      return MOCK_REGRAS;
    }
    throw new Error(`Falha ao carregar regras (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function postSimular(dados: SimularRequest): Promise<SimularResponse> {
  if (isMockMode()) {
    return Promise.resolve(mockSimular(dados));
  }
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/simular`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    if (res.status === 404) {
      console.warn('[API Client] POST /api/simular retornou 404 (aguardando BE #8). Usando mock.');
      return mockSimular(dados);
    }
    throw new Error(`Falha ao simular regra (${res.status} ${res.statusText})`);
  }
  return res.json();
}
