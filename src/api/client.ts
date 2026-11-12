import {
  CodigoInfo,
  DocumentoDetalhe,
  DocumentoResumo,
  PerfilUsuario,
  RespostaPerguntar,
  SaudeResponse
} from './types';
import { getDocumentoByCodigo, getResumoDocumentos } from '../mocks/documentos';
import { mockPerguntar } from '../mocks/perguntas';
import { MOCK_SAUDE } from '../mocks/saude';
import { getCodigoInfoMock } from '../mocks/codigos';

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
