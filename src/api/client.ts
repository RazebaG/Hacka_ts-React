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
  RadarItem,
  RegraSimulavel,
  SimulacaoResultado,
  ArquivoLote,
  FonteCita
} from './types';
import { MOCK_RADAR, MOCK_REGRAS, simularFerias, classificarArquivo, temaDe } from '../mocks/v2';
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
      perfil: perfilParaContrato(perfil)
    })
  });
  if (!res.ok) {
    throw new Error(`Falha ao enviar pergunta (${res.status} ${res.statusText})`);
  }
  return res.json();
}

/**
 * O contrato v0 aceita só empregado|gestor|ggc|gfi|gco|null. Os perfis novos do fluxo v2
 * (proposta C1, ainda não aprovada) são traduzidos para os equivalentes da v0.
 */
export function perfilParaContrato(perfil?: PerfilUsuario): PerfilUsuario {
  const mapa: Record<string, PerfilUsuario> = { rh: 'ggc', financeiro: 'gfi', juridico: 'gco', diretoria: null };
  if (!perfil) return null;
  return perfil in mapa ? mapa[perfil] : perfil;
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


// ==========================================
// Fluxo de telas v2: radar, E se?, avaliações, decisões e lote
// ==========================================

async function obterJson<T>(caminho: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${caminho}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
  });
  if (!res.ok) {
    throw new Error(`Não conseguimos falar com o servidor agora (${res.status}). Tente de novo em alguns segundos.`);
  }
  return res.json();
}

/* ---------- Formatos do adendo v0.2 (como a API responde) ---------- */
interface RadarItemApi {
  id: string;
  tipo: RadarItem['tipo'];
  status: 'divergente' | 'atencao';
  severidade?: string;
  titulo: string;
  explicacao: string;
  perspectivas?: string[];
  codigo_ausente?: string | null;
  fontes: FonteCita[];
  // Campos propostos na v0.3 (C2, C3, C17): usados se a API já os enviar
  citado_por?: FonteCita[];
  proxima_acao?: string;
  tema?: string[];
}
interface RegraApi {
  id: string;
  rotulo: string;
  valor: number;
  unidade: string;
  fonte: FonteCita;
}
interface SimulacaoApi {
  regra: string;
  valor_atual: number;
  novo_valor: number;
  unidade: string;
  linha_do_tempo: { marco: string; antes: string; depois: string; muda: boolean; fonte: FonteCita }[];
  impactos: { tipo: string; descricao: string; codigo?: string; versao?: string; fontes: FonteCita[] }[];
  resumo: string[];
  aviso: string;
  proxima_acao?: string;
}

const dataBR = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : iso);
const comparaVersao = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

/** Adendo v0.2 → formato das telas (T4/T5). */
export function radarDoContrato(i: RadarItemApi): RadarItem {
  const ausente = i.tipo === 'referencia_ausente';
  const ordenadas = [...i.fontes].sort((a, b) => comparaVersao(a.versao, b.versao));
  const ferias = i.fontes.some((f) => /^(NG_111|FM_1111-001)$/.test(f.codigo));
  return {
    id: i.id,
    tipo: i.tipo,
    severidade: i.status,
    tema: i.tema ?? [...new Set(i.fontes.map((f) => temaDe(f.codigo)).filter(Boolean))],
    titulo: i.titulo,
    explicacao: i.explicacao,
    fontes: ausente
      ? []
      : ordenadas.map((f, k) => ({ ...f, situacao: k === ordenadas.length - 1 ? 'vigente' : 'substituida' })),
    codigo_ausente: i.codigo_ausente ?? undefined,
    citado_por: ausente ? i.citado_por ?? i.fontes : undefined,
    proxima_acao: i.proxima_acao ?? (ausente ? 'Encaminhar à GCO.' : 'Encaminhar à GGC.'),
    responsavel: ausente ? 'GCO' : 'GGC',
    regra_simulavel: !ausente && ferias ? 'ferias_antecedencia_dias' : undefined
  };
}

/** Adendo v0.2 → formato das telas (T6). */
export function simulacaoDoContrato(s: SimulacaoApi): SimulacaoResultado {
  const conflitos = s.impactos.filter((i) => i.tipo !== 'revisar_documento');
  const secoesEmConflito = new Set(conflitos.flatMap((c) => c.fontes.map((f) => f.secao)));
  return {
    regra: s.regra,
    valor: s.novo_valor,
    exemplo: 'Férias a partir de 05/05/2027',
    linha_do_tempo: s.linha_do_tempo.map((l) => ({
      etapa: l.marco,
      atual: dataBR(l.antes),
      simulado: dataBR(l.depois),
      muda: l.muda,
      conflito: secoesEmConflito.has(l.fonte.secao)
    })),
    impactos: s.impactos.map((i) => ({
      tipo: (i.tipo as SimulacaoResultado['impactos'][number]['tipo']) ?? 'conflito_interno',
      descricao: i.descricao,
      fonte: i.fontes[0] ?? { codigo: i.codigo ?? '', versao: i.versao ?? '', secao: '', trecho: '' }
    })),
    resumo: s.resumo.join(' '),
    aviso: [s.aviso],
    proxima_acao: s.proxima_acao ?? (s.novo_valor === s.valor_atual ? '' : 'Encaminhar à GGC.')
  };
}

export async function fetchRadar(): Promise<RadarItem[]> {
  if (isMockMode()) return Promise.resolve(MOCK_RADAR);
  return obterJson<{ itens: RadarItemApi[] }>('/api/radar').then((r) => r.itens.map(radarDoContrato));
}

export async function fetchRegras(): Promise<RegraSimulavel[]> {
  if (isMockMode()) return Promise.resolve(MOCK_REGRAS);
  return obterJson<RegraApi[]>('/api/regras').then((rs) =>
    rs.map((r) => ({ id: r.id, nome: r.rotulo, unidade: r.unidade, valor_atual: r.valor, minimo: 1, maximo: 90, fonte: r.fonte }))
  );
}

export async function postSimular(regra: string, valor: number): Promise<SimulacaoResultado> {
  if (isMockMode()) return Promise.resolve(simularFerias(valor));
  return obterJson<SimulacaoApi>('/api/simular', {
    method: 'POST',
    body: JSON.stringify({ regra, novo_valor: valor, cenario: 'Exemplo NG_111 Anexo C: férias a partir de 05/05/2027' })
  }).then(simulacaoDoContrato);
}

export async function postAvaliacao(a: {
  resposta_id: string;
  util: boolean;
  motivo?: string;
  comentario?: string;
  canal: 'web' | 'slack' | 'teams';
  perfil?: PerfilUsuario;
}): Promise<{ id: string; registrado_em: string }> {
  if (isMockMode()) return Promise.resolve({ id: `aval-${Date.now()}`, registrado_em: new Date().toISOString() });
  return obterJson('/api/avaliacoes', { method: 'POST', body: JSON.stringify(a) });
}

export async function postDecisao(d: {
  item: string;
  acao: string;
  responsavel: string;
  nota: string;
}): Promise<{ id: string; registrado_em: string }> {
  if (isMockMode()) return Promise.resolve({ id: `dec-${Date.now()}`, registrado_em: new Date().toISOString() });
  // Adendo v0.2: item_radar, acao encaminhar_revisao|aceitar|descartar, origem
  const acao = d.acao === 'encaminhar' ? 'encaminhar_revisao' : d.acao;
  return obterJson('/api/decisoes', {
    method: 'POST',
    body: JSON.stringify({ item_radar: d.item, acao, responsavel: d.responsavel, nota: d.nota, origem: 'web' })
  });
}

/**
 * Envio em lote (proposta C18, multipart). Sem o arquivo de verdade (lote de exemplo),
 * ou no modo de exemplo, a classificação é feita aqui com as regras 1 e 2 do RF36.
 */
export async function enviarLote(arquivos: { nome: string; tamanho: number; arquivo?: File }[]): Promise<ArquivoLote[]> {
  const local = () =>
    new Promise<ArquivoLote[]>((resolver) =>
      setTimeout(() => resolver(arquivos.map((a, i) => classificarArquivo(a.nome, a.tamanho, `arq-${i + 1}`))), 700)
    );
  if (isMockMode() || arquivos.some((a) => !a.arquivo)) return local();
  const corpo = new FormData();
  arquivos.forEach((a) => corpo.append('arquivos', a.arquivo as File, a.nome));
  const res = await fetch(`${API_BASE_URL}/api/lotes`, { method: 'POST', body: corpo });
  if (!res.ok) {
    throw new Error(`Não conseguimos enviar o lote agora (${res.status}). Tente de novo em alguns segundos.`);
  }
  return (await res.json()).arquivos;
}
