import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { ApresentacaoView, montarCartoes } from '../components/ApresentacaoView';
import { FilaAtencaoView } from '../components/FilaAtencaoView';
import { FichaView } from '../components/FichaView';
import { RadarView } from '../components/RadarView';
import { mockFicha, mockTriagem } from '../mocks/ficha';
import { acoes } from '../app/store';
import { lerRota } from '../app/rotas';

// O ambiente de teste não tem localStorage: um armazenamento em memória basta
const memoria = new Map<string, string>();
if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => memoria.get(k) ?? null,
      setItem: (k: string, v: string) => void memoria.set(k, String(v)),
      removeItem: (k: string) => void memoria.delete(k),
      clear: () => memoria.clear()
    }
  });
}

afterEach(() => {
  acoes.definirPerfil(null);
  localStorage.clear();
});

describe('T16 · Modo apresentação (RF58)', () => {
  it('monta até 8 cartões da ficha: capa primeiro, fontes por último, "hoje" na linha do tempo', () => {
    const cartoes = montarCartoes(mockFicha('CTR_2026-012')!);
    expect(cartoes.length).toBeLessThanOrEqual(8);
    expect(cartoes[0].tipo).toBe('capa');
    expect(cartoes[cartoes.length - 1].tipo).toBe('fontes');
    const prazos = cartoes.find((c) => c.tipo === 'prazos')!;
    expect(prazos.linhas.some((l) => l.hoje)).toBe(true);
    expect(cartoes.reduce((t, c) => t + c.tempo_s, 0)).toBeLessThanOrEqual(300);
  });

  it('navega por botão e teclado, mostra "n de N" e o cronômetro de 5:00', async () => {
    expect(lerRota({ pathname: '/documento/CTR_2026-012/apresentar', search: '', hash: '' }).tela).toBe('apresentar');
    render(<ApresentacaoView codigo="CTR_2026-012" />);
    const indicador = await screen.findByTestId('apresentacao-indicador');
    expect(indicador).toHaveTextContent(/^1 de \d$/);
    fireEvent.click(screen.getByTestId('apresentacao-proximo'));
    expect(indicador).toHaveTextContent(/^2 de/);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(indicador).toHaveTextContent(/^1 de/);
    fireEvent.click(screen.getByText('Cronômetro 5:00'));
    expect(screen.getByTestId('apresentacao-relogio')).toHaveTextContent('5:00');
  });

  it('a fonte de um cartão abre o trecho sem sair da apresentação', async () => {
    render(<ApresentacaoView codigo="CTR_2026-012" cartaoInicial={2} />);
    const cartao = await screen.findByTestId('apresentacao-cartao');
    fireEvent.click(within(cartao).getAllByRole('button', { name: /Ver o trecho/ })[0]);
    expect(screen.getByTestId('apresentacao-fonte')).toHaveTextContent('CTR_2026-012');
  });
});

describe('T17 · Fila de atenção (RF69/RF70)', () => {
  it('ordena por urgência e filtra por sinal sem gerar ficha', () => {
    const todos = mockTriagem();
    expect(todos.itens.length).toBe(todos.total);
    const pesos = { critico: 0, atencao: 1, ok: 2 };
    for (let i = 1; i < todos.itens.length; i++) expect(pesos[todos.itens[i - 1].semaforo.nivel]).toBeLessThanOrEqual(pesos[todos.itens[i].semaforo.nivel]);
    const prazo30 = mockTriagem({ sinal: 'prazo_30d' });
    expect(prazo30.itens.map((i) => i.codigo)).toContain('CTR_2026-012');
    expect(mockTriagem({ sinal: 'multa' }).itens.map((i) => i.codigo)).toContain('CTR_2026-012');
    expect(mockTriagem({ tema: 'ferias' }).itens.every((i) => i.tema === 'ferias')).toBe(true);
  });

  it('mostra os cartões com "Abrir ficha" e o estado vazio', async () => {
    const { unmount } = render(<FilaAtencaoView filtros={{}} />);
    expect(await screen.findByTestId('triagem-CTR_2026-012')).toHaveTextContent('Abrir ficha');
    unmount();
    render(<FilaAtencaoView filtros={{ tema: 'ferias', tipo: 'CTR' }} />);
    expect(await screen.findByTestId('fila-vazia')).toHaveTextContent('Nada pede sua atenção');
  });
});

describe('Ficha · perfil, linguagem e delta (RF59–RF61)', () => {
  it('perfil muda a ordem e o título, não os dados', async () => {
    acoes.definirPerfil('empregado');
    const { unmount } = render(<FichaView codigo="CTR_2026-012" />);
    expect(await screen.findByTestId('ficha-acoes')).toHaveTextContent('O que muda para você');
    unmount();
    acoes.definirPerfil('financeiro');
    render(<FichaView codigo="CTR_2026-012" />);
    await screen.findByTestId('ficha-acoes');
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Valores');
  });

  it('delta só com comparação real: NG_111 mostra o que mudou desde a v2; CTR não', async () => {
    const { unmount } = render(<FichaView codigo="NG_111" />);
    expect(await screen.findByTestId('ficha-delta')).toHaveTextContent('O que mudou desde a v2.0.0');
    unmount();
    render(<FichaView codigo="CTR_2026-012" />);
    await screen.findByTestId('ficha-relance');
    expect(screen.queryByTestId('ficha-delta')).not.toBeInTheDocument();
  });

  it('novidade desde a última visita e "palavras simples" indisponível sem IA', async () => {
    localStorage.setItem('ac.visita.NG_111', JSON.stringify({ versao: '2.0.0', data: '2026-10-01' }));
    render(<FichaView codigo="NG_111" />);
    expect(await screen.findByTestId('ficha-novidade')).toHaveTextContent('você tinha visto a versão 2.0.0; esta é a 3.0.0');
    expect(screen.getByTestId('ficha-simples')).toBeDisabled();
  });
});

describe('"Baseado em" (RF67)', () => {
  it('o Radar mostra os documentos que sustentam a tela', async () => {
    render(<RadarView />);
    const base = await screen.findByTestId('fontes-base');
    expect(base).toHaveTextContent('Baseado em');
    expect(base).toHaveTextContent('NG_111 v3.0.0');
  });
});
