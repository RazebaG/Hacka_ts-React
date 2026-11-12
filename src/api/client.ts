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

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const isMockMode = (): boolean => !API_BASE_URL;
export const getApiBaseUrl = (): string => API_BASE_URL;

export async function fetchSaude(): Promise<SaudeResponse> {
  if (isMockMode()) {
    return Promise.resolve(MOCK_SAUDE);
  }
  const res = await fetch(`${API_BASE_URL}/api/saude`);
  if (!res.ok) {
    throw new Error(`Falha ao consultar saúde da API (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchDocumentos(): Promise<DocumentoResumo[]> {
  if (isMockMode()) {
    return Promise.resolve(getResumoDocumentos());
  }
  const res = await fetch(`${API_BASE_URL}/api/documentos`);
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
  const url = versao
    ? `${API_BASE_URL}/api/documentos/${encodeURIComponent(codigo)}?versao=${encodeURIComponent(versao)}`
    : `${API_BASE_URL}/api/documentos/${encodeURIComponent(codigo)}`;
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
  const res = await fetch(`${API_BASE_URL}/api/perguntar`, {
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
  const res = await fetch(`${API_BASE_URL}/api/codigo/${encodeURIComponent(codigo)}`);
  if (!res.ok) {
    throw new Error(`Falha ao decodificar código ${codigo} (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchPerspectivas(): Promise<PerspectivaResumo[]> {
  if (isMockMode()) {
    return Promise.resolve(MOCK_PERSPECTIVAS);
  }
  const res = await fetch(`${API_BASE_URL}/api/perspectivas`);
  if (!res.ok) {
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
  const res = await fetch(`${API_BASE_URL}/api/perspectivas/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Falha ao carregar detalhes da perspectiva ${id} (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchGrafo(): Promise<GrafoAcervo> {
  if (isMockMode()) {
    return Promise.resolve(MOCK_GRAFO);
  }
  const res = await fetch(`${API_BASE_URL}/api/grafo`);
  if (!res.ok) {
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
      // Fallback genérico sintético consistente
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
  const res = await fetch(
    `${API_BASE_URL}/api/comparar?codigo=${encodeURIComponent(codigo)}&de=${encodeURIComponent(de)}&para=${encodeURIComponent(para)}`
  );
  if (!res.ok) {
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
      // Fallback
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

  const res = await fetch(`${API_BASE_URL}/api/relatorio?${query}`);
  if (!res.ok) {
    throw new Error(`Falha ao carregar relatório (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchRadar(perspectiva?: string): Promise<RadarResponse> {
  if (isMockMode()) {
    return Promise.resolve(getRadarMock(perspectiva));
  }
  const query =
    perspectiva && perspectiva !== 'todos'
      ? `?perspectiva=${encodeURIComponent(perspectiva)}`
      : '';
  const res = await fetch(`${API_BASE_URL}/api/radar${query}`);
  if (!res.ok) {
    throw new Error(`Falha ao consultar radar de contradições (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function fetchRegras(): Promise<RegraItem[]> {
  if (isMockMode()) {
    return Promise.resolve(MOCK_REGRAS);
  }
  const res = await fetch(`${API_BASE_URL}/api/regras`);
  if (!res.ok) {
    throw new Error(`Falha ao carregar regras (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function postSimular(dados: SimularRequest): Promise<SimularResponse> {
  if (isMockMode()) {
    return Promise.resolve(mockSimular(dados));
  }
  const res = await fetch(`${API_BASE_URL}/api/simular`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    throw new Error(`Falha ao simular regra (${res.status} ${res.statusText})`);
  }
  return res.json();
}


