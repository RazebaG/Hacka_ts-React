/**
 * Ficha do Documento (adendo v0.4, C22) no modo mock.
 *
 * - CTR_2026-012: usa o exemplo oficial da equipe (`ficha-CTR_2026-012.json`).
 * - Demais documentos: ficha em MODO EXTRATIVO (RNF21/RNF23), montada por regra a partir do
 *   texto das seções do acervo. Cada item é uma frase copiada da seção, então a fonte é
 *   verificada por construção. Nada é gerado: sem IA, BLUF e ações ficam vazios e a tela avisa.
 */
import { AlertaFicha, CampoGov, CelulaMapa, DocumentoDetalhe, FichaDocumento, FiltrosTriagem, FonteFicha, ItemFicha, TriagemItem, TriagemResposta } from '../api/types';
import { MOCK_DOCUMENTOS } from './documentos';
import { EXEMPLOS_PERGUNTAS } from './perguntas';
import { DATA_REFERENCIA, MOCK_RADAR, cadeiaDe, camadaDe } from './v2';
import fichaCtr from './ficha-CTR_2026-012.json';
import { MOCK_COMPARATIVOS } from './inteligencia';

const DIA = 864e5;
const REF = Date.parse(DATA_REFERENCIA);

/** Sinais por regra (mesmo resultado a cada leitura). */
const RE_PRAZO = /\b\d{2}\/\d{2}\/\d{4}\b|\b\d+\s*(?:\([^)]*\)\s*)?dias?\b|\bprazo\b|\bD-\d+\b/gi;
const RE_VALOR = /R\$\s?[\d.]+,\d{2}|\b\d+(?:,\d+)?\s?%/g;
const RE_OBRIGACAO = /\b(?:deve|devem|deverá|deverão|obrigatóri[oa]s?|compete|cabe a|é responsável)\b/gi;
const RE_RISCO = /\b(?:multa|vedad[oa]s?|proibid[oa]s?|penalidade|sanç(?:ão|ões)|rescis(?:ão|ória)|descumprimento|conflito)\b/gi;

const contar = (re: RegExp, t: string) => (t.match(re) || []).length;
const frases = (t: string) =>
  t
    .split(/(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9])/)
    .map((f) => f.trim())
    .filter((f) => f.length > 12);

const dataIso = (br: string) => {
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(br);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

const fonte = (d: DocumentoDetalhe, secao: string, trecho: string): FonteFicha => ({
  codigo: d.codigo,
  versao: d.versao,
  secao,
  trecho,
  camada: null
});

const vazio: CampoGov = { valor: null, fonte: null };

/** Lê um campo de governança do texto ("Aprovado por: X"). Ausente = "não consta". */
const campoGov = (d: DocumentoDetalhe, rotulo: RegExp, nome: string): CampoGov => {
  for (const s of d.secoes) {
    const m = rotulo.exec(s.texto);
    if (m) return { valor: m[1].trim().replace(/[.;]$/, ''), fonte: { campo: nome, trecho: m[0].trim() } };
  }
  return vazio;
};

/** Itens literais de um tema: a frase da seção que tem o sinal vira o item (fonte = a própria frase). */
const itensPorSinal = (d: DocumentoDetalhe, re: RegExp, prefixo: string, max = 4): ItemFicha[] => {
  const itens: ItemFicha[] = [];
  for (const s of d.secoes) {
    for (const f of frases(s.texto)) {
      re.lastIndex = 0;
      if (re.test(f) && itens.length < max && !itens.some((i) => i.titulo === f)) {
        re.lastIndex = 0;
        const valor = (f.match(RE_VALOR) || f.match(/\b\d{2}\/\d{2}\/\d{4}\b/) || [null])[0];
        itens.push({ id: `${prefixo}-${itens.length + 1}`, titulo: f, valor, texto: null, origem: 'literal', fontes: [fonte(d, s.id, f)] });
      }
    }
  }
  return itens;
};

function fichaExtrativa(d: DocumentoDetalhe): FichaDocumento {
  const vigente = MOCK_DOCUMENTOS.find((x) => x.codigo === d.codigo && !x.substituido);
  const textoTodo = d.secoes.map((s) => s.texto).join(' ');
  const palavras = textoTodo.split(/\s+/).filter(Boolean).length;
  const leituraIntegral = Math.max(1, Math.round(palavras / 200));
  const totalChars = d.secoes.reduce((t, s) => t + s.texto.length, 0) || 1;

  const [ini, fim] = d.vigencia.split(/\s+a\s+/).map(dataIso);
  const diasRestantes = fim ? Math.round((Date.parse(fim) - REF) / DIA) : null;

  // Mapa de calor: uma célula por seção, largura pelo tamanho do texto, cor pelos sinais
  const brutos = d.secoes.map((s, i) => {
    const sinais = {
      prazo: contar(RE_PRAZO, s.texto),
      valor: contar(RE_VALOR, s.texto),
      obrigacao: contar(RE_OBRIGACAO, s.texto),
      risco: contar(RE_RISCO, s.texto)
    };
    return { s, i, sinais, soma: sinais.prazo + sinais.valor + sinais.obrigacao + sinais.risco * 2 };
  });
  const maior = Math.max(1, ...brutos.map((b) => b.soma));
  const mapa: CelulaMapa[] = brutos.map(({ s, i, sinais, soma }) => ({
    secao_id: s.id,
    titulo: s.titulo,
    ordem: i + 1,
    peso: s.texto.length / totalChars,
    sinais,
    intensidade: soma / maior
  }));

  const prazos = itensPorSinal(d, /\b\d{2}\/\d{2}\/\d{4}\b|\b\d+\s*(?:\([^)]*\)\s*)?dias?\b/i, 'p');
  const valores = itensPorSinal(d, /R\$\s?[\d.]+,\d{2}/, 'v');
  const riscos = itensPorSinal(d, RE_RISCO, 'r');
  const obrigacoes = itensPorSinal(d, RE_OBRIGACAO, 'o');

  // Três números: primeiro valor, primeiro prazo e primeiro risco com número (todos literais)
  const numeros: ItemFicha[] = [];
  const comNumero = (i?: ItemFicha) => i && i.valor;
  const v = valores.find(comNumero);
  if (v) numeros.push({ ...v, id: 'n-valor', titulo: 'Valor citado' });
  const p = prazos.find(comNumero) ?? prazos[0];
  if (p) numeros.push({ ...p, id: 'n-prazo', titulo: 'Prazo citado', valor: p.valor ?? (p.titulo.match(/\b\d+\s*(?:\([^)]*\)\s*)?dias?\b/i) || [null])[0] });
  const r = riscos.find(comNumero);
  if (r) numeros.push({ ...r, id: 'n-risco', titulo: 'Risco ou multa' });

  // Alertas: itens do Radar que citam este documento (RF56) + versão substituída
  const alertas: AlertaFicha[] = MOCK_RADAR.filter(
    (it) => it.fontes.some((f) => f.codigo === d.codigo) || (it.citado_por ?? []).some((f) => f.codigo === d.codigo)
  ).map((it) => ({
    tipo: it.tipo === 'referencia_ausente' ? 'referencia_ausente' : 'versao_substituida',
    titulo: it.titulo,
    explicacao: it.explicacao,
    radar_id: it.id,
    fontes: (it.fontes.length ? it.fontes : it.citado_por ?? [])
      .filter((f) => f.codigo === d.codigo)
      .map((f) => ({ codigo: f.codigo, versao: f.versao, secao: f.secao, trecho: f.trecho, camada: null }))
  }));

  const motivos: string[] = [];
  let nivel: FichaDocumento['semaforo']['nivel'] = 'ok';
  if (d.substituido) {
    nivel = 'critico';
    motivos.push(`Versão ${d.versao} substituída${vigente ? ` pela ${vigente.versao}` : ''}`);
  }
  if (diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 30) {
    if (nivel === 'ok') nivel = 'atencao';
    motivos.push(`Vigência termina em ${diasRestantes} dias`);
  }
  if (alertas.length) {
    if (nivel === 'ok') nivel = 'atencao';
    motivos.push(`${alertas.length} ${alertas.length === 1 ? 'alerta' : 'alertas'} no Radar`);
  }

  const perguntas = EXEMPLOS_PERGUNTAS.filter((e) => e.resposta.citacoes.some((c) => c.codigo === d.codigo)).map((e) => e.pergunta);
  const pontos = { obrigacoes, prazos, valores, riscos, responsaveis: [], condicoes: [] };
  const verificados = numeros.length + Object.values(pontos).reduce((t, l) => t + l.length, 0);

  return {
    codigo: d.codigo,
    versao: d.versao,
    gerada_em: new Date(REF).toISOString(),
    perfil: null,
    linguagem: 'original',
    estado: 'pronta',
    modo: { ia: 'extrativo', modelo: null },
    identidade: {
      titulo: d.titulo,
      tipo: d.tipo,
      tipo_nome: d.tipo_nome,
      camada: camadaDe(d.codigo),
      tema: { assunto: d.assunto },
      fase: d.fase,
      substituido: d.substituido,
      vigente_em: d.substituido && vigente ? { codigo: vigente.codigo, versao: vigente.versao } : null,
      vigencia: { texto: d.vigencia, inicio: ini ?? null, fim: fim ?? null, dias_restantes: diasRestantes },
      origem: 'acervo',
      classificacao: null,
      metricas: {
        secoes: d.secoes.length,
        palavras,
        paginas_estimadas: Math.max(1, Math.round(palavras / 400)),
        leitura_integral_min: leituraIntegral,
        leitura_ficha_min: Math.max(1, Math.round(leituraIntegral / 4))
      }
    },
    semaforo: { nivel, motivos },
    governanca: {
      elaborado_por: campoGov(d, /Elaborad[oa] por:?\s*([^.;\n]+)/i, 'Elaborado por'),
      aprovado_por: campoGov(d, /Aprovad[oa] por:?\s*([^.;\n]+)/i, 'Aprovado por'),
      aprovado_em: campoGov(d, /Aprovad[oa] em:?\s*(\d{2}\/\d{2}\/\d{4})/i, 'Aprovado em'),
      assinada_em: campoGov(d, /Assinad[oa] em:?\s*(\d{2}\/\d{2}\/\d{4})/i, 'Assinada em'),
      vinculado_a: d.vinculado_a ? { valor: d.vinculado_a, fonte: { campo: 'Vinculado a', trecho: `Vinculado a: ${d.vinculado_a}` } } : vazio,
      referencias: d.referencia ? d.referencia.split(/,\s*/) : [],
      cadeia: cadeiaDe(d.codigo)
    },
    bluf: null,
    numeros: numeros.slice(0, 3),
    acoes: [],
    pontos,
    mapa_calor: mapa,
    alertas,
    perguntas_sugeridas: perguntas.slice(0, 4),
    cobertura: { secoes_lidas: d.secoes.length, secoes_total: d.secoes.length, itens_verificados: verificados, itens_descartados: 0, motivos_descarte: [] }
  };
}

/** Ficha no modo mock: oficial para o CTR_2026-012, extrativa para os demais. */
export function mockFicha(codigo: string, versao?: string): FichaDocumento | null {
  const doc =
    MOCK_DOCUMENTOS.find((d) => d.codigo === codigo && (versao ? d.versao === versao : !d.substituido)) ??
    MOCK_DOCUMENTOS.find((d) => d.codigo === codigo);
  if (!doc) return null;
  const ficha = codigo === 'CTR_2026-012' && doc.versao === (fichaCtr as FichaDocumento).versao ? (fichaCtr as unknown as FichaDocumento) : fichaExtrativa(doc);
  return { ...ficha, delta: deltaReal(doc) };
}

/** C26: delta só quando existe a comparação de verdade (nada de diferença inventada). */
function deltaReal(doc: DocumentoDetalhe): FichaDocumento['delta'] {
  if (doc.substituido) return null;
  const anteriores = MOCK_DOCUMENTOS.filter((d) => d.codigo === doc.codigo && d.versao !== doc.versao).map((d) => d.versao);
  for (const de of anteriores) {
    const c = MOCK_COMPARATIVOS[`${doc.codigo}:${de}:${doc.versao}`];
    if (c) return { de, para: doc.versao, resumo: c.resumo, mudancas: c.mudancas.length };
  }
  return null;
}

/** Semáforo de cada documento para o Catálogo (RF44), sem abrir a ficha inteira. */
export const semaforoDe = (codigo: string, versao: string) => mockFicha(codigo, versao)?.semaforo ?? null;

/* ---------- C25 · Fila de atenção (triagem) no modo mock ---------- */

const PESO_NIVEL = { critico: 0, atencao: 1, ok: 2 } as const;

/** Próximo prazo futuro da ficha (ações, números e prazos com data). */
function proximoPrazo(f: FichaDocumento): TriagemItem['proximo_prazo'] {
  const datas: { data: string; evento: string }[] = [];
  f.acoes.forEach((a) => a.prazo?.data && datas.push({ data: a.prazo.data, evento: a.acao }));
  [...f.numeros, ...f.pontos.prazos].forEach((p) => {
    const iso = dataIso(p.valor ?? '') ?? dataIso(p.titulo);
    if (iso) datas.push({ data: iso, evento: p.titulo.length > 70 ? p.titulo.slice(0, 67) + '…' : p.titulo });
  });
  if (f.identidade.vigencia.fim) datas.push({ data: f.identidade.vigencia.fim, evento: 'Fim da vigência' });
  return datas.filter((d) => d.data >= DATA_REFERENCIA).sort((a, b) => a.data.localeCompare(b.data))[0] ?? null;
}

export function mockTriagem(filtros: FiltrosTriagem = {}): TriagemResposta {
  const itens: TriagemItem[] = MOCK_DOCUMENTOS.filter((d) => !d.substituido).map((d) => {
    const f = mockFicha(d.codigo, d.versao)!;
    const textoRiscos = [...f.pontos.riscos, ...f.pontos.valores, ...f.numeros].map((i) => `${i.titulo} ${i.texto ?? ''}`).join(' ');
    return {
      codigo: d.codigo,
      versao: d.versao,
      titulo: d.titulo,
      tipo: d.tipo,
      tema: d.assunto,
      semaforo: f.semaforo,
      bluf_curto: f.bluf?.texto ? (f.bluf.texto.length > 140 ? f.bluf.texto.slice(0, 137) + '…' : f.bluf.texto) : null,
      proximo_prazo: proximoPrazo(f),
      alertas: f.alertas.length,
      leitura_integral_min: f.identidade.metricas.leitura_integral_min,
      leitura_ficha_min: f.identidade.metricas.leitura_ficha_min,
      ficha: 'pronta',
      sinais: { multa: /multa/i.test(textoRiscos), divergencia: f.alertas.some((a) => a.tipo !== 'referencia_ausente') }
    };
  });

  const dias = (iso: string) => Math.round((Date.parse(iso) - REF) / DIA);
  const filtrados = itens.filter(
    (i) =>
      (!filtros.tema || i.tema === filtros.tema) &&
      (!filtros.tipo || i.tipo === filtros.tipo) &&
      (!filtros.situacao || i.semaforo.nivel === filtros.situacao) &&
      (!filtros.sinal ||
        (filtros.sinal === 'prazo_30d' && i.proximo_prazo !== null && dias(i.proximo_prazo.data) <= 30) ||
        (filtros.sinal === 'multa' && i.sinais?.multa) ||
        (filtros.sinal === 'divergencia' && i.sinais?.divergencia))
  );

  const ordem = filtros.ordenar ?? 'urgencia';
  filtrados.sort((a, b) => {
    if (ordem === 'tema') return a.tema.localeCompare(b.tema) || a.codigo.localeCompare(b.codigo);
    if (ordem === 'tipo') return a.tipo.localeCompare(b.tipo) || a.codigo.localeCompare(b.codigo);
    const pa = a.proximo_prazo?.data ?? '9999', pb = b.proximo_prazo?.data ?? '9999';
    if (ordem === 'vigencia') return pa.localeCompare(pb);
    return PESO_NIVEL[a.semaforo.nivel] - PESO_NIVEL[b.semaforo.nivel] || b.alertas - a.alertas || pa.localeCompare(pb);
  });

  const pedem = itens.filter((i) => i.semaforo.nivel === 'critico' || (i.proximo_prazo && dias(i.proximo_prazo.data) <= 7)).length;
  return { total: filtrados.length, pagina: 1, tamanho: 50, pedem_acao: pedem, itens: filtrados.slice(0, 50) };
}
