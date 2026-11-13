import { FichaDocumento, ItemFicha } from '../api/types';

const itensDoBloco = (f: FichaDocumento, ids: string[]) => {
  const todos = [...f.numeros, ...Object.values(f.pontos).flat()];
  return ids.map((id) => todos.find((i) => i.id === id)).filter((i): i is ItemFicha => !!i);
};

/**
 * Frase extrativa da Mesa quando não há resumo da IA:
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
