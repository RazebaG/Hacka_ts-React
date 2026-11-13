import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ApresentacaoView, ritmo } from '../components/ApresentacaoView';
import { FichaView } from '../components/FichaView';
import { RadarView } from '../components/RadarView';
import { DURACAO_ALVO_S, distribuirTempo, fraseExtrativa, montarCartoes } from '../ficha/cartoes';
import { cortarPalavras, limitePalavras } from '../ficha/notasApresentador';
import { mockFicha } from '../mocks/ficha';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { navegar } from '../app/rotas';

const soma = (xs: { tempo_s: number }[]) => xs.reduce((s, k) => s + k.tempo_s, 0);
const tecla = (key: string) => fireEvent.keyDown(window, { key });

beforeEach(() => navegar('/', true));

/** MODO-APRESENTACAO-v1 §7 (aceite) e FLUXO-DE-TELAS-FICHA §2.2, §2.5, §2.6 e §6. */
describe('Montagem dos cartões (aceite 1, 3, 5 e 8)', () => {
  it('1: o CTR_2026-012 tem 8 cartões e o tempo soma 300 s', () => {
    const c = montarCartoes(mockFicha('CTR_2026-012')!);
    expect(c.map((k) => k.tipo)).toEqual(['capa', 'frase', 'decidir', 'numeros', 'prazos', 'riscos', 'quem', 'fontes']);
    expect(soma(c)).toBe(DURACAO_ALVO_S);
  });

  it('3 e 5: a NG_111 funciona sem IA; o cartão 2 usa a frase do documento e o 3 mostra "O que muda para você" (45, antes 30)', () => {
    const f = mockFicha('NG_111')!;
    expect(f.bluf).toBeNull();
    const c = montarCartoes(f);
    const frase = c.find((k) => k.tipo === 'frase')!;
    expect(frase.linhas[0].origem).toBe('literal');
    expect(frase.linhas[0].fontes.length).toBeGreaterThan(0);
    const muda = c.find((k) => k.tipo === 'decidir')!;
    expect(muda.titulo).toBe('O que muda para você');
    expect(muda.linhas[0].texto).toMatch(/30 dias.*45/);
    expect(c.find((k) => k.tipo === 'riscos')!.linhas.some((l) => /versão 2\.0\.0/.test(l.texto))).toBe(true);
    expect(c.find((k) => k.tipo === 'fontes')!.linhas.some((l) => l.texto.includes('Resumo sem IA'))).toBe(true);
    expect(soma(c)).toBe(DURACAO_ALVO_S);
  });

  it('8: em todos os documentos em vigor, nenhum cartão fica vazio e o tempo soma 300 s (múltiplos de 5)', () => {
    for (const d of MOCK_DOCUMENTOS.filter((x) => !x.substituido)) {
      const c = montarCartoes(mockFicha(d.codigo)!);
      expect(soma(c), d.codigo).toBe(DURACAO_ALVO_S);
      c.forEach((k) => {
        expect(k.linhas.length, `${d.codigo} ${k.tipo}`).toBeGreaterThan(0);
        expect(k.tempo_s % 5).toBe(0);
      });
    }
  });

  it('redistribui o tempo dos cartões pulados, proporcionalmente', () => {
    expect(distribuirTempo(['capa', 'frase', 'fontes'])).toEqual([75, 150, 75]);
    expect(distribuirTempo(['capa', 'frase', 'decidir', 'numeros', 'prazos', 'riscos', 'quem', 'fontes'])).toEqual([15, 30, 60, 45, 45, 45, 45, 15]);
  });

  it('2 (RNF20): a frase extrativa é literal e o trecho dela consta na seção', () => {
    for (const d of MOCK_DOCUMENTOS.filter((x) => !x.substituido && x.codigo !== 'CTR_2026-012')) {
      const item = fraseExtrativa(mockFicha(d.codigo)!);
      if (!item) continue;
      for (const x of item.fontes) expect(d.secoes.find((s) => s.id === x.secao)!.texto).toContain(x.trecho);
    }
  });
});

describe('Notas do apresentador (§4)', () => {
  it('respeitam o limite de palavras (tempo × 2,5) e dizem quando o valor é calculado', () => {
    const c = montarCartoes(mockFicha('CTR_2026-012')!);
    c.forEach((k) => expect(k.notas.split(/\s+/).length).toBeLessThanOrEqual(limitePalavras(k.tempo_s) + 1));
    expect(c.find((k) => k.tipo === 'decidir')!.notas).toMatch(/^Três coisas: Fazer a vistoria/);
    expect(c.find((k) => k.tipo === 'numeros')!.notas).toContain('valor calculado');
    expect(cortarPalavras('um dois três quatro', 2)).toBe('um dois…');
  });
});

describe('Tela da apresentação (§5)', () => {
  it('teclado: 1–8 vai ao cartão, N mostra as notas, T liga e pausa o cronômetro, S abre a fonte, Esc fecha a gaveta e depois sai', async () => {
    navegar('/documento/CTR_2026-012/apresentar?versao=1.0.0&de=ficha', true);
    render(<ApresentacaoView codigo="CTR_2026-012" versao="1.0.0" />);
    await screen.findByTestId('apresentacao-cartao');
    tecla('3');
    expect(screen.getByTestId('apresentacao-cartao')).toHaveTextContent('O que decidir');
    expect(screen.getByTestId('apresentacao-anuncio')).toHaveTextContent('Cartão 3 de 8: O que decidir');
    expect(window.location.search).toContain('de=ficha');
    tecla('n');
    expect(screen.getByTestId('apresentacao-notas')).toHaveTextContent('Três coisas');
    tecla('t');
    expect(screen.getByTestId('apresentacao-relogio')).toHaveTextContent('5:00');
    tecla('t');
    expect(screen.getByTestId('apresentacao-relogio')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('apresentacao-ritmo')).toHaveTextContent('adiantado');
    tecla('s');
    expect(screen.getByTestId('apresentacao-fonte')).toHaveTextContent('CTR_2026-012');
    tecla('Escape');
    expect(screen.queryByTestId('apresentacao-fonte')).not.toBeInTheDocument();
    tecla('Escape');
    expect(window.location.pathname).toBe('/documento/CTR_2026-012/ficha');
  });

  it('deslizar troca de cartão', async () => {
    render(<ApresentacaoView codigo="CTR_2026-012" />);
    const raiz = await screen.findByTestId('apresentacao');
    fireEvent.touchStart(raiz, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(raiz, { changedTouches: [{ clientX: 100 }] });
    expect(screen.getByTestId('apresentacao-indicador')).toHaveTextContent('2 de 8');
  });

  it('ritmo: adiantado, no ritmo ou atrasado com folga de 10 s', () => {
    expect(ritmo(0, 45, 105)).toBe('adiantado');
    expect(ritmo(60, 45, 105)).toBe('no ritmo');
    expect(ritmo(130, 45, 105)).toBe('atrasado');
  });
});

describe('Ficha: atalhos, alertas, celular e texto completo', () => {
  it('P apresenta e ? pergunta só neste documento (§2.6)', async () => {
    render(<FichaView codigo="CTR_2026-012" />);
    await screen.findByTestId('ficha-view');
    tecla('?');
    expect(window.location.pathname + window.location.search).toBe('/perguntar?doc=CTR_2026-012');
    tecla('p');
    expect(window.location.pathname).toBe('/documento/CTR_2026-012/apresentar');
    expect(window.location.search).toContain('de=ficha');
  });

  it('alerta sem item do radar abre o radar filtrado pelo documento (§2.2); o radar respeita ?codigo=', async () => {
    render(<FichaView codigo="CTR_2026-012" />);
    await screen.findByTestId('ficha-view');
    const alerta = screen.getByText('NG_012 é citada e não está no acervo').closest('a')!;
    expect(alerta).toHaveAttribute('href', '/radar?codigo=CTR_2026-012');
    render(<RadarView codigo="NT_2026-021" />);
    expect(await screen.findByTestId('radar-filtro-codigo')).toHaveTextContent('Documento: NT_2026-021');
  });

  it('celular: barra fixa com Perguntar e Apresentar (§2.5)', async () => {
    render(<FichaView codigo="CTR_2026-012" />);
    const barra = await screen.findByTestId('ficha-barra-celular');
    expect(within(barra).getByText('Perguntar')).toBeInTheDocument();
    expect(within(barra).getByTestId('ficha-apresentar-celular')).toHaveTextContent('Apresentar em 5 min');
  });
});
