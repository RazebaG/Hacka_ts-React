import { AcaoFicha, FichaDocumento, FonteFicha, ItemFicha } from '../api/types';
import { DATA_REFERENCIA } from '../mocks/v2';
import { notaDoCartao } from './notasApresentador';

/**
 * T16 · Montagem dos cartões da apresentação a partir da ficha (MODO-APRESENTACAO-v1 §3 e §6).
 * Função pura: não cria informação nova; todo item vem da ficha e leva as fontes dela.
 */
export type TipoCartao = 'capa' | 'frase' | 'decidir' | 'numeros' | 'prazos' | 'riscos' | 'quem' | 'fontes';

export interface LinhaCartao {
  texto: string;
  valor?: string | null;
  detalhe?: string | null;
  origem?: ItemFicha['origem'];
  fontes: FonteFicha[];
  hoje?: boolean;
}

export interface Cartao {
  tipo: TipoCartao;
  titulo: string;
  tempo_s: number;
  linhas: LinhaCartao[];
  /** Roteiro falado (notas do apresentador), montado por modelo de texto, sem IA (§4). */
  notas: string;
}

/** Tempo previsto de cada cartão (§3); soma 300 s com os 8 cartões. */
export const TEMPO_BASE: Record<TipoCartao, number> = { capa: 15, frase: 30, decidir: 60, numeros: 45, prazos: 45, riscos: 45, quem: 45, fontes: 15 };
export const DURACAO_ALVO_S = 300;
export const TOTAL_CARTOES = 8;

const dataBR = (iso: string) => iso.split('-').reverse().join('/');
const deItem = (i: ItemFicha): LinhaCartao => ({ texto: i.titulo, valor: i.valor, detalhe: i.calculo ?? i.texto, origem: i.origem, fontes: i.fontes });
const deAcao = (a: AcaoFicha): LinhaCartao => ({
  texto: a.acao,
  valor: a.prazo?.data ? `até ${dataBR(a.prazo.data)}` : a.prazo?.regra ?? null,
  detalhe: a.quem,
  origem: a.origem,
  fontes: a.fontes
});

const todosItens = (f: FichaDocumento) => [...f.numeros, ...Object.values(f.pontos).flat()];
const itensDoBloco = (f: FichaDocumento, ids: string[]) => {
  const todos = todosItens(f);
  return ids.map((id) => todos.find((i) => i.id === id)).filter((i): i is ItemFicha => !!i);
};

/**
 * Frase extrativa para o cartão 2 quando não há resumo da IA (§5.4, aceite 3):
 * o primeiro item literal, com fonte, do bloco mais relevante que tenha itens.
 */
export function fraseExtrativa(f: FichaDocumento): ItemFicha | null {
  const blocos = [...(f.blocos ?? [])].sort((a, b) => a.relevancia.posicao - b.relevancia.posicao);
  for (const b of blocos) {
    const item = itensDoBloco(f, b.itens).find((i) => i.origem === 'literal' && i.fontes.length);
    if (item) return item;
  }
  return [...f.pontos.obrigacoes, ...f.pontos.prazos, ...f.numeros].find((i) => i.origem === 'literal' && i.fontes.length) ?? null;
}

/** Mínimo para existir apresentação: capa, frase e "De onde vem" (§3). A capa e a cobertura sempre existem. */
export const podeApresentar = (f: FichaDocumento) => !!f.bluf || !!fraseExtrativa(f);

/** Redistribui o tempo dos cartões pulados, proporcionalmente, em múltiplos de 5 s; a soma fica em 300 s (§3). */
export function distribuirTempo(tipos: TipoCartao[]): number[] {
  const base = tipos.map((t) => TEMPO_BASE[t]);
  const soma = base.reduce((a, b) => a + b, 0);
  const tempos = base.map((t) => Math.max(5, Math.round((t * DURACAO_ALVO_S) / soma / 5) * 5));
  const resto = DURACAO_ALVO_S - tempos.reduce((a, b) => a + b, 0);
  if (resto !== 0) {
    const maior = tempos.indexOf(Math.max(...tempos));
    tempos[maior] += resto;
  }
  return tempos;
}

/** Monta os cartões a partir da ficha. Cartões sem conteúdo são pulados (exceto capa e fontes). */
export function montarCartoes(f: FichaDocumento): Cartao[] {
  const id = f.identidade;
  const cartoes: Omit<Cartao, 'notas'>[] = [];
  const novo = (tipo: TipoCartao, titulo: string, linhas: LinhaCartao[]) => cartoes.push({ tipo, titulo, linhas, tempo_s: TEMPO_BASE[tipo] });

  novo('capa', id.titulo, [
    { texto: `${f.codigo} · v${f.versao} · ${id.camada.tipo_nome}`, fontes: [] },
    { texto: id.substituido ? `Versão substituída${id.vigente_em ? ` pela ${id.vigente_em.versao}` : ''}` : `Vigência: ${id.vigencia.texto}`, fontes: [] },
    ...(['elaborado_por', 'aprovado_por'] as const)
      .filter((k) => f.governanca[k].valor)
      .map((k) => ({ texto: `${k === 'elaborado_por' ? 'Elaborado por' : 'Aprovado por'}: ${f.governanca[k].valor}`, fontes: [] }))
  ]);

  // 2 · Em uma frase: resumo da IA ou, sem IA, a frase copiada do documento
  if (f.bluf) novo('frase', 'Em uma frase', [deItem({ ...f.bluf, titulo: f.bluf.texto ?? f.bluf.titulo })]);
  else {
    const frase = fraseExtrativa(f);
    if (frase) novo('frase', 'Em uma frase', [{ ...deItem(frase), detalhe: 'Frase copiada do documento (sem resumo da IA).' }]);
  }

  // 3 · O que decidir; sem ações, o bloco de regra "O que muda para você" (+ a mudança de versão, se houver)
  if (f.acoes.length) novo('decidir', 'O que decidir', f.acoes.slice(0, 3).map(deAcao));
  else {
    const regra = [...(f.blocos ?? [])].sort((a, b) => a.relevancia.posicao - b.relevancia.posicao).find((b) => b.sinal === 'regra' && b.itens.length);
    const mudanca = f.alertas.filter((a) => a.tipo === 'versao_substituida').map((a) => ({ texto: a.titulo, detalhe: a.explicacao, fontes: a.fontes }));
    const linhas = [...mudanca, ...(regra ? itensDoBloco(f, regra.itens) : f.pontos.obrigacoes).map(deItem)].slice(0, 3);
    if (linhas.length) novo('decidir', regra || mudanca.length ? 'O que muda para você' : 'O que o documento exige', linhas);
  }

  const numeros = [...f.numeros, ...f.pontos.valores.filter((v) => !f.numeros.some((n) => n.valor === v.valor))].slice(0, 4);
  if (numeros.length) novo('numeros', 'Números que importam', numeros.map(deItem));

  // 5 · Linha do tempo: datas das ações e dos prazos, em ordem, com "hoje" marcado
  const comData: { iso: string; linha: LinhaCartao }[] = [];
  f.acoes.forEach((a) => a.prazo?.data && comData.push({ iso: a.prazo.data, linha: { ...deAcao(a), valor: dataBR(a.prazo.data) } }));
  [...f.numeros, ...f.pontos.prazos].forEach((p) => {
    const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(p.valor ?? '');
    if (m && !comData.some((c) => c.iso === `${m[3]}-${m[2]}-${m[1]}`)) comData.push({ iso: `${m[3]}-${m[2]}-${m[1]}`, linha: deItem(p) });
  });
  if (comData.length) {
    const linhas = [...comData.sort((a, b) => a.iso.localeCompare(b.iso)).map((c) => c.linha)];
    const posHoje = comData.findIndex((c) => c.iso > DATA_REFERENCIA);
    linhas.splice(posHoje < 0 ? linhas.length : posHoje, 0, { texto: 'Hoje', valor: dataBR(DATA_REFERENCIA), fontes: [], hoje: true });
    novo('prazos', 'Linha do tempo', linhas);
  } else if (f.pontos.prazos.length) novo('prazos', 'Prazos', f.pontos.prazos.slice(0, 4).map(deItem));

  const riscos = [...f.pontos.riscos.slice(0, 3).map(deItem), ...f.alertas.slice(0, 2).map((a) => ({ texto: a.titulo, detalhe: a.explicacao, fontes: a.fontes }))];
  if (riscos.length) novo('riscos', 'Riscos e alertas', riscos.slice(0, 4));

  const quem = [...f.pontos.responsaveis.map(deItem), ...f.acoes.filter((a) => a.quem).map((a) => ({ texto: a.quem!, detalhe: a.acao, origem: a.origem, fontes: a.fontes }))].slice(0, 4);
  if (quem.length) novo('quem', 'Quem faz o quê', quem);

  const usadas = new Map<string, FonteFicha>();
  cartoes.forEach((c) => c.linhas.forEach((l) => l.fontes.forEach((x) => usadas.set(`${x.codigo}|${x.secao}`, x))));
  novo('fontes', 'De onde vem', [
    { texto: `${usadas.size} ${usadas.size === 1 ? 'trecho citado' : 'trechos citados'} nesta apresentação`, fontes: [...usadas.values()] },
    {
      texto: `Cobertura: ${f.cobertura.secoes_lidas}/${f.cobertura.secoes_total} seções · ${f.cobertura.itens_verificados} itens verificados · ${f.cobertura.itens_descartados} descartados`,
      fontes: []
    },
    { texto: f.modo.ia === 'extrativo' ? 'Resumo sem IA: só o que se extrai por regra.' : `Modo: IA${f.modo.modelo ? ` (${f.modo.modelo})` : ''}`, fontes: [] }
  ]);

  const tempos = distribuirTempo(cartoes.map((c) => c.tipo));
  return cartoes.map((c, i) => {
    const comTempo = { ...c, tempo_s: tempos[i] };
    return { ...comTempo, notas: notaDoCartao(comTempo, f) };
  });
}
