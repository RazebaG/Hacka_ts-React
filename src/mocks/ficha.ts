/**
 * Ficha do Documento (adendo v0.4, C22) no modo mock.
 *
 * - CTR_2026-012: usa o exemplo oficial da equipe (`ficha-CTR_2026-012.json`).
 * - Demais documentos: ficha em MODO EXTRATIVO (RNF21/RNF23), montada por regra a partir do
 *   texto das seções do acervo. Cada item é uma frase copiada da seção, então a fonte é
 *   verificada por construção. Nada é gerado: sem IA, BLUF e ações ficam vazios e a tela avisa.
 */
import { AlertaFicha, BlocoDecisao, CampoGov, CelulaMapa, DocumentoDetalhe, FamiliaDocumento, FichaDocumento, FiltrosTriagem, FonteFicha, ItemFicha, SinalBloco, TriagemItem, TriagemResposta } from '../api/types';
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
const RE_RESPONSAVEL = /\b(?:GGC|GFI|GCO|GOC|GJU|DIRAF|gestor(?:a|es)?|empregad[oa]s?|diretor(?:ia)?|RH|comit[êe](?: de [A-ZÁÉÍÓÚ][\wçãõáéíóú]+)?|fiscal(?: técnico)?)\b/gi;
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
  const responsaveis = itensPorSinal(d, RE_RESPONSAVEL, 'q', 3);
  const pontos = { obrigacoes, prazos, valores, riscos, responsaveis, condicoes: [] };
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
  const comDelta = { ...ficha, delta: deltaReal(doc) };
  // Mock oficial já traz familia e blocos; os demais saem por regra (RF73/RF74)
  return comDelta.blocos ? comDelta : { ...comDelta, familia: familiaDe(doc.codigo), blocos: blocosPorRegra(comDelta, doc) };
}

/* ---------- Revisão 13/11 · blocos por família (RF73) e relevância por regra (RF74) ---------- */

/** Família pela taxonomia do catálogo (sigla), nunca pela IA. */
export function familiaDe(codigo: string): FamiliaDocumento {
  const sigla = codigo.split('_')[0];
  if (sigla === 'CTR') return 'contrato';
  if (sigla === 'NG' || sigla === 'RG') return 'norma';
  if (sigla === 'NT' || sigla === 'CT') return 'nota_tecnica';
  return 'procedimento';
}

const RE_DATA = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;
const RE_REAIS = /R\$\s?([\d.]+,\d{2})/;
const reais = (t: string) => {
  const m = RE_REAIS.exec(t);
  return m ? Number(m[1].replace(/\./g, '').replace(',', '.')) : 0;
};
const curto = (t: string, n = 140) => (t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t);

interface Candidato {
  id: string;
  titulo: string;
  itens: ItemFicha[];
  sinal: SinalBloco;
  destaque?: string;
  apoio?: string;
  alerta?: number;
  secoesExtra?: string[];
}

/** Pontuação por regra: prazo mais próximo > versão substituída > valor > risco > responsável > regra. */
function pontuar(c: Candidato): { pontuacao: number; motivo: string } {
  const texto = c.itens.map((i) => `${i.valor ?? ''} ${i.titulo}`).join(' ');
  if (c.sinal === 'prazo') {
    const datas = c.itens
      .map((i) => RE_DATA.exec(`${i.valor ?? ''} ${i.titulo}`))
      .filter(Boolean)
      .map((m) => `${m![3]}-${m![2]}-${m![1]}`)
      .filter((iso) => iso >= DATA_REFERENCIA)
      .sort();
    if (datas.length) {
      const dias = Math.round((Date.parse(datas[0]) - REF) / DIA);
      return { pontuacao: 0.5 + 0.5 * (1 - Math.min(dias, 365) / 365), motivo: dias === 0 ? 'vence hoje' : `vence em ${dias} dias` };
    }
    return { pontuacao: 0.45, motivo: c.destaque && /dias/.test(c.destaque) ? `prazo da regra: ${c.destaque}` : 'prazo da regra' };
  }
  if (c.sinal === 'alerta') return c.id === 'b-versao' ? { pontuacao: 0.55, motivo: 'regra mudou nesta versão' } : { pontuacao: 0.2, motivo: 'referência ausente no acervo' };
  if (c.sinal === 'valor') {
    const maior = Math.max(...c.itens.map((i) => reais(`${i.valor ?? ''} ${i.titulo}`)));
    return { pontuacao: maior ? 0.5 : 0.3, motivo: maior ? `maior valor do documento: R$ ${maior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'limites do documento' };
  }
  if (c.sinal === 'risco') return { pontuacao: /multa|R\$/i.test(texto) ? 0.42 : 0.34, motivo: /multa|R\$/i.test(texto) ? 'risco financeiro' : 'penalidade ou proibição' };
  if (c.sinal === 'responsavel') return { pontuacao: 0.3, motivo: 'quem executa cada parte' };
  return { pontuacao: 0.18, motivo: 'consulte quando surgir dúvida' };
}


export function blocosPorRegra(f: FichaDocumento, doc: DocumentoDetalhe): BlocoDecisao[] {
  const fam = familiaDe(doc.codigo);
  const p = f.pontos;
  const comResp = p.responsaveis;
  const nomeResp = (x: string) =>
    /^gestor/i.test(x) ? 'Gestor' : /^empregad/i.test(x) ? 'Empregado' : /^diretor/i.test(x) ? 'Diretoria' : /^comit/i.test(x) ? x.charAt(0).toUpperCase() + x.slice(1) : /^fiscal/i.test(x) ? 'Fiscal técnico' : x.toUpperCase();
  const quem = [...new Set(comResp.flatMap((i) => i.titulo.match(RE_RESPONSAVEL) ?? []).map(nomeResp))];
  const ausente = f.alertas.findIndex((a) => a.tipo === 'referencia_ausente');
  const versoes = MOCK_DOCUMENTOS.filter((d) => d.codigo === doc.codigo).length;
  const ligados = [f.governanca.vinculado_a.valor, ...f.governanca.referencias].filter(Boolean) as string[];
  const primeiro = (l: ItemFicha[]) => l[0];
  const destaqueDe = (l: ItemFicha[]) => primeiro(l)?.valor ?? `${l.length} ${l.length === 1 ? 'item' : 'itens'}`;
  /** Prazo em destaque: a data mais próxima ou, sem data, o prazo em dias mais citado (ex.: NG_111 → 45 dias). */
  const destaquePrazo = (l: ItemFicha[]) => {
    const datas = l.map((i) => RE_DATA.exec(`${i.valor ?? ''} ${i.titulo}`)).filter(Boolean).map((m) => m![0]);
    if (datas.length) return datas.sort((a, b) => a.split('/').reverse().join('').localeCompare(b.split('/').reverse().join('')))[0];
    const conta = new Map<string, number>();
    l.forEach((i) => (i.titulo.match(/\b(\d+)\s*(?:\([^)]*\)\s*)?dias?\b/gi) ?? []).forEach((x) => {
      const n = /\d+/.exec(x)![0];
      conta.set(n, (conta.get(n) ?? 0) + 1);
    }));
    const mais = [...conta.entries()].sort((a, b) => b[1] - a[1])[0];
    return mais ? `${mais[0]} dias` : destaqueDe(l);
  };

  const cand: Candidato[] = [];
  const add = (c: Candidato | null) => c && (c.itens.length || c.alerta !== undefined || c.secoesExtra) && cand.push(c);

  if (fam === 'norma') {
    add({ id: 'b-muda', titulo: 'O que muda para você', itens: p.obrigacoes.slice(0, 3), sinal: 'regra', destaque: `${p.obrigacoes.length} ${p.obrigacoes.length === 1 ? 'regra' : 'regras'}` });
    add({ id: 'b-prazos', titulo: 'Prazos que valem', itens: p.prazos, sinal: 'prazo', destaque: destaquePrazo(p.prazos) });
    if (quem.length) add({ id: 'b-quem', titulo: 'Quem faz o quê', itens: comResp.slice(0, 3), sinal: 'responsavel', destaque: quem.slice(0, 3).join(' · ') });
    add({ id: 'b-limites', titulo: 'Limites e valores', itens: p.valores, sinal: 'valor', destaque: destaqueDe(p.valores) });
    add({ id: 'b-penal', titulo: 'Penalidades e exceções', itens: p.riscos, sinal: 'risco', destaque: destaqueDe(p.riscos) });
    if (versoes > 1 && f.delta) add({ id: 'b-versao', titulo: 'Versão em vigor e o que mudou', itens: [], sinal: 'alerta', destaque: `v${f.delta.para}`, apoio: f.delta.resumo[0], alerta: f.alertas.findIndex((a) => a.tipo === 'versao_substituida'), secoesExtra: [] });
    if (ligados.length || ausente >= 0)
      add({
        id: 'b-ligados',
        titulo: 'Documentos ligados',
        itens: [],
        sinal: ausente >= 0 ? 'alerta' : 'regra',
        destaque: ligados.slice(0, 2).join(' · ') || (ausente >= 0 ? 'NG_012 ausente' : ''),
        apoio: ausente >= 0 ? f.alertas[ausente].titulo : `${ligados.length} ${ligados.length === 1 ? 'documento ligado' : 'documentos ligados'} pelo cabeçalho.`,
        alerta: ausente >= 0 ? ausente : undefined,
        secoesExtra: []
      });
  } else if (fam === 'procedimento') {
    add({ id: 'b-prazos', titulo: 'Prazos por etapa', itens: p.prazos, sinal: 'prazo', destaque: destaquePrazo(p.prazos) });
    if (quem.length) add({ id: 'b-quem', titulo: 'Quem faz cada etapa', itens: comResp.slice(0, 3), sinal: 'responsavel', destaque: quem.slice(0, 3).join(' · ') });
    const formularios = ligados.filter((c) => /^(FM|TB)_/.test(c));
    if (formularios.length) add({ id: 'b-form', titulo: 'Formulários e tabelas usados', itens: [], sinal: 'regra', destaque: formularios.join(' · '), apoio: 'Citados no cabeçalho do documento.', secoesExtra: [] });
    add({ id: 'b-trava', titulo: 'Onde costuma travar', itens: p.riscos, sinal: 'risco', destaque: destaqueDe(p.riscos) });
    if (f.governanca.vinculado_a.valor) add({ id: 'b-origem', titulo: 'Norma de origem', itens: [], sinal: 'regra', destaque: f.governanca.vinculado_a.valor, apoio: `Segue: ${f.governanca.cadeia.join(' → ')}.`, secoesExtra: [] });
  } else {
    add({ id: 'b-valores', titulo: fam === 'contrato' ? 'Quanto custa' : 'Valores e alçada', itens: p.valores, sinal: 'valor', destaque: destaqueDe(p.valores) });
    add({ id: 'b-prazos', titulo: fam === 'contrato' ? 'Até quando' : 'Prazo e vigência', itens: p.prazos, sinal: 'prazo', destaque: destaquePrazo(p.prazos) });
    if (quem.length) add({ id: 'b-quem', titulo: 'Quem faz o quê', itens: comResp.slice(0, 3), sinal: 'responsavel', destaque: quem.slice(0, 3).join(' · ') });
    add({ id: 'b-risco', titulo: fam === 'contrato' ? 'Onde pode doer' : 'Riscos', itens: p.riscos, sinal: 'risco', destaque: destaqueDe(p.riscos) });
    if (ligados.length || ausente >= 0)
      add({ id: 'b-citados', titulo: fam === 'contrato' ? 'Falta no acervo' : 'Documentos citados e ausentes', itens: [], sinal: 'alerta', destaque: ligados.slice(0, 2).join(' · ') || '—', apoio: ausente >= 0 ? f.alertas[ausente].titulo : 'Documentos citados no cabeçalho.', alerta: ausente >= 0 ? ausente : undefined, secoesExtra: [] });
  }

  const blocos = cand.slice(0, 6).map((c) => {
    const r = pontuar(c);
    const secoes = [...new Set(c.itens.flatMap((i) => i.fontes.map((x) => x.secao)))];
    return {
      id: c.id,
      titulo: c.titulo,
      destaque: curto(c.destaque ?? '', 40),
      apoio: c.apoio ? curto(c.apoio) : c.itens[0] ? curto(c.itens[0].titulo) : null,
      relevancia: { posicao: 0, motivo: r.motivo, pontuacao: Math.round(r.pontuacao * 100) / 100 },
      sinal: c.sinal,
      secoes_mapa: secoes,
      itens: c.itens.map((i) => i.id),
      ...(c.alerta !== undefined && c.alerta >= 0 ? { alerta: c.alerta } : {})
    } as BlocoDecisao;
  });
  return blocos
    .sort((a, b) => b.relevancia.pontuacao - a.relevancia.pontuacao)
    .map((b, i) => ({ ...b, relevancia: { ...b.relevancia, posicao: i + 1 } }));
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

/** Motivo curto do chip (RF71): o fato que puxa o documento para a lista. */
function motivoCurto(f: FichaDocumento, prazo: TriagemItem['proximo_prazo']): string {
  if (f.semaforo.nivel === 'critico') return f.semaforo.motivos[0] ?? 'versão antiga';
  const dias = prazo ? Math.round((Date.parse(prazo.data) - REF) / DIA) : null;
  const evento = prazo ? prazo.evento.replace(/^(Fazer|Fim d[ae]|Próximo prazo:?)\s*/i, '').replace(/^(?:a|o|as|os)\s+/i, '').split(/[ ,;]/)[0].toLowerCase() : '';
  if (dias !== null && dias <= 30) return `${evento || 'prazo'} em ${dias} dias`;
  if (f.alertas.some((a) => a.tipo === 'versao_substituida')) return 'regra mudou de versão';
  if (f.alertas.some((a) => a.tipo === 'referencia_ausente')) return 'cita norma fora do acervo';
  return 'em dia';
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
      sinais: { multa: /multa/i.test(textoRiscos), divergencia: f.alertas.some((a) => a.tipo !== 'referencia_ausente') },
      motivo_curto: motivoCurto(f, proximoPrazo(f)),
      familia: f.familia ?? familiaDe(d.codigo)
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

  // Perfil (RF71): Jurídico, Financeiro e Diretoria veem contratos primeiro; Empregado, RH e Gestor, normas
  if (filtros.perfil && (!filtros.ordenar || filtros.ordenar === 'urgencia')) {
    const preferida: FamiliaDocumento = ['juridico', 'financeiro', 'diretoria'].includes(filtros.perfil) ? 'contrato' : 'norma';
    const perto = (i: TriagemItem) => (i.proximo_prazo && dias(i.proximo_prazo.data) <= 30 ? 0 : 1);
    filtrados.sort(
      (a, b) =>
        PESO_NIVEL[a.semaforo.nivel] - PESO_NIVEL[b.semaforo.nivel] ||
        perto(a) - perto(b) ||
        Number(b.familia === preferida) - Number(a.familia === preferida) ||
        (a.proximo_prazo?.data ?? '9999').localeCompare(b.proximo_prazo?.data ?? '9999')
    );
  }
  const pedem = itens.filter((i) => i.semaforo.nivel === 'critico' || (i.proximo_prazo && dias(i.proximo_prazo.data) <= 7)).length;
  const limite = Math.min(Math.max(filtros.limite ?? 50, 1), 50);
  return { total: filtrados.length, pagina: 1, tamanho: limite, pedem_acao: pedem, itens: filtrados.slice(0, limite) };
}
