import { CelulaMapa, DocumentoDetalhe, FichaDocumento, SecaoDocumento } from '../api/types';

/**
 * Pop-up de resumo explicado da seção (POPUP-RESUMO-DA-SECAO-v1 §3 e §7).
 * Função pura, sem IA: tudo sai do texto da seção e da célula do mapa de calor, e cada trecho é literal.
 * A "explicação em palavras simples" (IA, P1) entra quando existir o endpoint C28.
 */
export type Sinal = 'prazo' | 'valor' | 'risco' | 'regra';

export interface Ponto {
  rotulo: string;
  texto: string;
  sinal: Sinal;
}
export interface Segmento {
  texto: string;
  sinal: Sinal | null;
}
export interface Relacionada {
  id: string;
  titulo: string;
  motivo: string;
}
export interface ResumoSecao {
  secao: SecaoDocumento;
  posicao: number;
  total: number;
  sinais: CelulaMapa['sinais'] | null;
  semSinais: boolean;
  principais: string[];
  pontos: Ponto[];
  relacionadas: Relacionada[];
  segmentos: Segmento[];
  anterior: string | null;
  proxima: string | null;
}

export const ROTULO_SINAL: Record<Sinal, string> = { prazo: 'Prazo', valor: 'Valor', risco: 'Risco', regra: 'Obrigação' };

const RE: Record<Sinal, RegExp> = {
  valor: /R\$\s?[\d.]+(?:,\d{2})?|\b\d+(?:,\d+)?\s?%/g,
  prazo: /\b\d{2}\/\d{2}\/\d{4}\b|\b\d+\s*(?:\([^)]*\)\s*)?(?:dias?|meses|mês|anos?|horas?)(?:\s+(?:corridos|úteis))?\b|\b\d+º\s+dia\b|\bprazo\b/gi,
  risco: /\b(?:multa|rescis[a-zà-ÿ]*|penalidade|vedad[oa]s?|proibid[oa]s?|inexecu[a-zà-ÿ]*|inadimpl[a-zà-ÿ]*|descumpr[a-zà-ÿ]*|juros|sanç[a-zà-ÿ]*)/gi,
  regra: /\b(?:deve|devem|deverá|deverão|obriga-se|compete|cabe a|atesta|paga|emite|responsável)\b/gi
};
const PRIORIDADE: Record<Sinal, number> = { risco: 0, valor: 1, prazo: 2, regra: 3 };
const SINAIS = Object.keys(RE) as Sinal[];

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const frases = (t: string) =>
  t
    .split(/(?<=[.;:])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9(])/)
    .map((f) => f.replace(/\s+/g, ' ').trim())
    .filter((f) => f.length > 12);

interface Achado {
  ini: number;
  fim: number;
  sinal: Sinal;
  texto: string;
}
function achados(texto: string): Achado[] {
  const lista: Achado[] = [];
  for (const s of SINAIS) {
    const re = new RegExp(RE[s].source, RE[s].flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(texto))) {
      if (!m[0]) {
        re.lastIndex++;
        continue;
      }
      lista.push({ ini: m.index, fim: m.index + m[0].length, sinal: s, texto: m[0] });
    }
  }
  return lista.sort((a, b) => a.ini - b.ini || PRIORIDADE[a.sinal] - PRIORIDADE[b.sinal] || b.fim - b.ini - (a.fim - a.ini));
}

/** Texto original com os termos de prazo, valor, risco e obrigação marcados (sem sobrepor). */
export function marcar(texto: string): Segmento[] {
  const saida: Segmento[] = [];
  let pos = 0;
  for (const a of achados(texto)) {
    if (a.ini < pos) continue;
    if (a.ini > pos) saida.push({ texto: texto.slice(pos, a.ini), sinal: null });
    saida.push({ texto: texto.slice(a.ini, a.fim), sinal: a.sinal });
    pos = a.fim;
  }
  if (pos < texto.length) saida.push({ texto: texto.slice(pos), sinal: null });
  return saida;
}

const curto = (t: string, n = 150) => (t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t);
const somaSinais = (c: CelulaMapa) => c.sinais.prazo + c.sinais.valor + c.sinais.obrigacao + c.sinais.risco;

export function montarResumoSecao(ficha: FichaDocumento, doc: DocumentoDetalhe, secaoId: string): ResumoSecao | null {
  const secao = doc.secoes.find((s) => s.id === secaoId);
  if (!secao) return null;
  const celulas = [...ficha.mapa_calor].sort((a, b) => a.ordem - b.ordem);
  const celula = celulas.find((c) => c.secao_id === secaoId) ?? null;

  // Pontos: cada frase com sinal vira um ponto, com o termo mais forte como selo (tudo literal)
  const comSinal = frases(secao.texto)
    .map((f, ordem) => {
      const a = achados(f);
      return { f, ordem, a, nota: a.length };
    })
    .filter((x) => x.a.length);
  const pontos: Ponto[] = [];
  for (const x of [...comSinal].sort((a, b) => b.nota - a.nota || a.ordem - b.ordem)) {
    if (pontos.length >= 5) break;
    const dominante = [...x.a].sort((a, b) => PRIORIDADE[a.sinal] - PRIORIDADE[b.sinal] || a.ini - b.ini)[0];
    const rotulo = dominante.sinal === 'regra' ? ROTULO_SINAL.regra : dominante.texto.replace(/\s+/g, ' ').trim();
    if (!pontos.some((p) => p.texto === curto(x.f))) pontos.push({ rotulo: curto(rotulo, 26), texto: curto(x.f), sinal: dominante.sinal });
  }

  const principais = (comSinal.length ? [...comSinal].sort((a, b) => b.nota - a.nota || a.ordem - b.ordem).slice(0, 3).sort((a, b) => a.ordem - b.ordem).map((x) => x.f) : frases(secao.texto).slice(0, 2)).map((f) => curto(f, 260));

  // Ligada a: seções que esta cita e seções que citam esta (por nome, sem acento)
  const relacionadas: Relacionada[] = [];
  const textoNorm = norm(secao.texto);
  for (const o of doc.secoes) {
    if (o.id === secaoId || relacionadas.length >= 4 || !/[A-Za-zÀ-ÿ]/.test(o.id) || o.id.length < 6) continue;
    if (textoNorm.includes(norm(o.id))) relacionadas.push({ id: o.id, titulo: o.titulo, motivo: 'citada nesta seção' });
    else if (norm(o.texto).includes(norm(secaoId))) relacionadas.push({ id: o.id, titulo: o.titulo, motivo: 'cita esta seção' });
  }

  // Navegação: seções vizinhas com sinal
  const comSinais = celulas.filter((c) => somaSinais(c) > 0);
  const ordemAtual = celula?.ordem ?? doc.secoes.findIndex((s) => s.id === secaoId) + 1;
  const anterior = [...comSinais].reverse().find((c) => c.ordem < ordemAtual)?.secao_id ?? null;
  const proxima = comSinais.find((c) => c.ordem > ordemAtual)?.secao_id ?? null;

  return {
    secao,
    posicao: ordemAtual,
    total: Math.max(ficha.identidade.metricas.secoes, doc.secoes.length),
    sinais: celula?.sinais ?? null,
    semSinais: celula ? somaSinais(celula) === 0 : comSinal.length === 0,
    principais,
    pontos,
    relacionadas,
    segmentos: marcar(secao.texto),
    anterior,
    proxima
  };
}
