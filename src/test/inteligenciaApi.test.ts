import { describe, it, expect } from 'vitest';
import {
  fetchComparar,
  fetchGrafo,
  fetchPerspectivaDetalhe,
  fetchPerspectivas,
  fetchRelatorio
} from '../api/client';

describe('API de Inteligência (v0.1 / Issue #3)', () => {
  it('fetchPerspectivas retorna as 4 perspectivas da especificação', async () => {
    const perspectivas = await fetchPerspectivas();
    expect(perspectivas).toHaveLength(4);
    const ids = perspectivas.map((p) => p.id);
    expect(ids).toContain('pessoas');
    expect(ids).toContain('financeiro');
    expect(ids).toContain('juridico');
    expect(ids).toContain('gestao');
  });

  it('fetchPerspectivaDetalhe("pessoas") atende ao Adendo v0.1 F (Cena 1)', async () => {
    const detalhe = await fetchPerspectivaDetalhe('pessoas');
    expect(detalhe.id).toBe('pessoas');

    // Destaque de 45 dias com fonte_anterior e aviso
    const destaque45 = detalhe.destaques.find((d) => d.valor === '45 dias');
    expect(destaque45).toBeDefined();
    expect(destaque45?.fonte.codigo).toBe('NG_111');
    expect(destaque45?.fonte.versao).toBe('3.0.0');
    expect(destaque45?.fonte.secao).toBe('4.3.1');

    expect(destaque45?.fonte_anterior?.codigo).toBe('NG_111');
    expect(destaque45?.fonte_anterior?.versao).toBe('2.0.0');
    expect(destaque45?.fonte_anterior?.secao).toBe('2.3');
    expect(destaque45?.aviso).toMatch(/v2 \(substituída\) dizia 30 dias/i);

    // Linha do tempo contém marcos D-45 até D-3
    const marcos = detalhe.prazos.map((p) => p.marco).filter(Boolean);
    expect(marcos).toContain('D-45');
    expect(marcos).toContain('D-35');
    expect(marcos).toContain('D-30');
    expect(marcos).toContain('D-20');
    expect(marcos).toContain('D-3');
  });

  it('fetchPerspectivaDetalhe("financeiro") contém R$ 18.250,00 e multa no Apêndice B (Cena 2)', async () => {
    const detalhe = await fetchPerspectivaDetalhe('financeiro');
    expect(detalhe.id).toBe('financeiro');

    // Valor global R$ 18.250,00
    const valorGlobal = detalhe.destaques.find((d) => d.valor === 'R$ 18.250,00');
    expect(valorGlobal).toBeDefined();
    expect(valorGlobal?.fonte.codigo).toBe('CTR_2026-012');
    expect(valorGlobal?.fonte.secao).toBe('Cláusula Sétima');

    // Multa R$ 912,50 no Apêndice B (Adendo v0.1 E)
    const multa = detalhe.valores.find((v) => v.numero === 912.5);
    expect(multa).toBeDefined();
    expect(multa?.fonte.codigo).toBe('CTR_2026-012');
    expect(multa?.fonte.secao).toBe('Apêndice B');
  });

  it('fetchGrafo contém nós e arestas com documento ausente como externo', async () => {
    const grafo = await fetchGrafo();
    expect(grafo.nos.length).toBeGreaterThan(10);
    expect(grafo.arestas.length).toBeGreaterThan(8);

    // Documento ausente NG_012 (Adendo v0.1 C)
    const ng012 = grafo.nos.find((n) => n.codigo === 'NG_012');
    expect(ng012).toBeDefined();
    expect(ng012?.existe_no_acervo).toBe(false);

    // Documento substituído NG_111@2.0.0
    const ng111v2 = grafo.nos.find((n) => n.id === 'NG_111@2.0.0');
    expect(ng111v2).toBeDefined();
    expect(ng111v2?.substituido).toBe(true);
  });

  it('fetchComparar retorna resumo e diff de seções entre NG_111 v2 e v3', async () => {
    const diff = await fetchComparar('NG_111', '2.0.0', '3.0.0');
    expect(diff.codigo).toBe('NG_111');
    expect(diff.resumo.length).toBeGreaterThan(0);
    expect(diff.mudancas.some((m) => m.secao === '4.3.1')).toBe(true);
  });

  it('fetchRelatorio retorna estrutura compilada com fontes', async () => {
    const rel = await fetchRelatorio({ perspectiva: 'juridico' });
    expect(rel.titulo).toContain('Jurídico');
    expect(rel.secoes.length).toBeGreaterThan(0);
    expect(rel.secoes[0].itens[0].fonte.codigo).toBeDefined();
  });
});
