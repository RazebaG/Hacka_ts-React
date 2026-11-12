import { describe, it, expect } from 'vitest';
import {
  isMockMode,
  fetchSaude,
  fetchDocumentos,
  fetchDocumentoDetalhe,
  postPerguntar,
  fetchCodigo
} from '../api/client';

describe('API Client e Contrato (Mock)', () => {
  it('opera em modo mock por padrão sem VITE_API_URL configurado', () => {
    expect(isMockMode()).toBe(true);
  });

  it('GET /api/saude retorna status ok e 13 documentos', async () => {
    const saude = await fetchSaude();
    expect(saude.status).toBe('ok');
    expect(saude.documentos).toBe(13);
  });

  it('GET /api/documentos retorna catálogo completo com 13 itens', async () => {
    const docs = await fetchDocumentos();
    expect(docs).toHaveLength(13);

    const ng111v3 = docs.find((d) => d.codigo === 'NG_111' && d.versao === '3.0.0');
    expect(ng111v3).toBeDefined();
    expect(ng111v3?.substituido).toBe(false);

    const ng111v2 = docs.find((d) => d.codigo === 'NG_111' && d.versao === '2.0.0');
    expect(ng111v2).toBeDefined();
    expect(ng111v2?.substituido).toBe(true);
  });

  it('GET /api/documentos/{codigo} retorna seções estruturadas', async () => {
    const doc = await fetchDocumentoDetalhe('NG_111', '3.0.0');
    expect(doc.codigo).toBe('NG_111');
    expect(doc.versao).toBe('3.0.0');
    expect(doc.secoes.length).toBeGreaterThan(0);
    expect(doc.secoes[0]).toHaveProperty('id');
    expect(doc.secoes[0]).toHaveProperty('titulo');
    expect(doc.secoes[0]).toHaveProperty('texto');
  });

  it('POST /api/perguntar com citações e aviso de substituição', async () => {
    const res = await postPerguntar('Qual a antecedência mínima para solicitar férias?');
    expect(res.consta).toBe(true);
    expect(res.citacoes.length).toBeGreaterThan(0);
    expect(res.citacoes[0].codigo).toBe('NG_111');
    expect(res.citacoes[0].versao).toBe('3.0.0');
    expect(res.citacoes[0].secao).toBe('4.3');
    expect(res.avisos.length).toBeGreaterThan(0);
    expect(res.avisos[0]).toContain('NG_111 v2.0.0 foi substituída pela v3.0.0');
  });

  it('POST /api/perguntar quando não consta nas fontes retorna consta=false e citacoes vazias', async () => {
    const res = await postPerguntar('Uma mesma pessoa pode elaborar, revisar e aprovar?');
    expect(res.consta).toBe(false);
    expect(res.citacoes).toEqual([]);
    expect(res.resposta).toContain('Não consta nas fontes');
  });

  it('GET /api/codigo/{codigo} decodifica metadados de numeração', async () => {
    const cod = await fetchCodigo('PX_1111-001');
    expect(cod.codigo).toBe('PX_1111-001');
    expect(cod.tipo).toBe('PX');
    expect(cod.tipo_nome).toBe('Procedimento');
    expect(cod.vinculado_a).toBe('NG_111');
    expect(cod.existe_no_acervo).toBe(true);
  });
});
