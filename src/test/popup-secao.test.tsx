import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { MesaDocumento } from '../components/MesaDocumento';
import { montarResumoSecao, marcar } from '../ficha/resumoSecao';
import { mockFicha } from '../mocks/ficha';
import { getDocumentoByCodigo } from '../mocks/documentos';

afterEach(() => window.history.replaceState(null, '', '/'));

const ficha = () => mockFicha('CTR_2026-012')!;
const doc = () => getDocumentoByCodigo('CTR_2026-012', '1.0.0')!;

describe('Resumo da seção (função pura, sem IA)', () => {
  it('o contrato tem as 43 seções reais e o mapa tem uma célula por seção', () => {
    expect(doc().secoes).toHaveLength(43);
    expect(ficha().mapa_calor).toHaveLength(43);
  });

  it('Cláusula Décima Terceira: aviso de 30 dias, multa de um aluguel, sem multa depois do 90º dia', () => {
    const r = montarResumoSecao(ficha(), doc(), 'Cláusula Décima Terceira')!;
    expect(r.semSinais).toBe(false);
    expect(r.sinais!.prazo).toBeGreaterThan(0);
    expect(r.sinais!.risco).toBeGreaterThan(0);
    const texto = r.principais.join(' ');
    expect(texto).toContain('30 dias corridos');
    expect(texto).toMatch(/multa/i);
    expect(r.pontos.length).toBeGreaterThan(0);
    // todo ponto é uma frase literal da seção
    for (const p of r.pontos) expect(r.secao.texto.replace(/\s+/g, ' ')).toContain(p.texto.replace(/…$/, ''));
  });

  it('marca valor, prazo e risco no texto original sem perder nenhuma letra', () => {
    const t = 'Multa de 5% do valor global, R$ 912,50, em até 30 dias corridos.';
    const seg = marcar(t);
    expect(seg.map((s) => s.texto).join('')).toBe(t);
    const sinais = seg.filter((s) => s.sinal).map((s) => s.sinal);
    expect(sinais).toEqual(expect.arrayContaining(['risco', 'valor', 'prazo']));
  });

  it('seção sem sinais é aceita; vizinhas puladas só entre seções com sinal', () => {
    const f = ficha();
    const neutra = f.mapa_calor.find((c) => c.sinais.prazo + c.sinais.valor + c.sinais.obrigacao + c.sinais.risco === 0);
    if (neutra) expect(montarResumoSecao(f, doc(), neutra.secao_id)!.semSinais).toBe(true);
    const r = montarResumoSecao(f, doc(), 'Cláusula Décima Terceira')!;
    expect(r.anterior).not.toBeNull();
    expect(r.proxima).not.toBeNull();
  });

  it('seção inexistente devolve null (nunca inventa)', () => {
    expect(montarResumoSecao(ficha(), doc(), 'Cláusula Inexistente')).toBeNull();
  });
});

describe('Pop-up da seção aberto pelo mapa de calor', () => {
  it('o mapa abre cinza; clicar numa célula abre o pop-up daquela seção, com foco contido e Esc que fecha', async () => {
    render(<MesaDocumento ficha={ficha()} variante="compacta" />);
    const faixa = screen.getByRole('list', { name: /Seções do documento/ });
    expect(faixa.querySelectorAll('.mesa-celula.acesa')).toHaveLength(0);
    const celula = within(faixa).getByRole('listitem', { name: /Cláusula Décima Terceira/ });
    celula.focus();
    fireEvent.click(celula);
    const popup = await screen.findByRole('dialog');
    expect(popup).toHaveAttribute('aria-modal', 'true');
    expect(await within(popup).findByText(/Principais trechos/)).toBeInTheDocument();
    expect(popup).toHaveTextContent('Cláusula Décima Terceira');
    expect(popup).toHaveTextContent('Sinais nesta seção');
    expect(popup).toHaveTextContent('Sem IA');
    expect(window.location.search).toContain('secao=');
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(window.location.search).not.toContain('secao=');
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('clicar no fundo fecha; navegar entre seções com sinal troca o título', async () => {
    render(<MesaDocumento ficha={ficha()} variante="compacta" />);
    fireEvent.click(within(screen.getByRole('list', { name: /Seções do documento/ })).getByRole('listitem', { name: /Cláusula Décima Terceira/ }));
    const popup = await screen.findByRole('dialog');
    await within(popup).findByText(/Principais trechos/);
    fireEvent.click(screen.getByTestId('popup-proxima'));
    await waitFor(() => expect(screen.getByRole('dialog')).not.toHaveTextContent('Cláusula Décima Terceira ·'));
    fireEvent.mouseDown(screen.getByTestId('popup-fundo'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('?secao= abre o pop-up direto e o mapa continua cinza atrás', async () => {
    window.history.replaceState(null, '', '/?secao=' + encodeURIComponent('Cláusula Sétima'));
    render(<MesaDocumento ficha={ficha()} variante="compacta" />);
    expect(await screen.findByRole('dialog')).toHaveTextContent('Cláusula Sétima');
    expect(document.querySelectorAll('.mesa-celula.acesa')).toHaveLength(0);
  });
});
