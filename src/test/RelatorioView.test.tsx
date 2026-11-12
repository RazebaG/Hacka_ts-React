import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RelatorioView } from '../components/RelatorioView';

describe('RelatorioView', () => {
  it('renderiza o relatório executivo da perspectiva Jurídico/Contratos (Cena 5) com fontes', async () => {
    const onNavegar = vi.fn();
    render(<RelatorioView onNavegarDocumento={onNavegar} perspectivaInicial="juridico" />);

    await waitFor(() => {
      expect(
        screen.getByText('Relatório Executivo — Perspectiva Jurídico e Contratos')
      ).toBeInTheDocument();
    });

    // Seção e itens
    expect(
      screen.getByText('Síntese de Conformidade e Vigência Contratual')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/O contrato CTR_2026-012 rege a locação corporativa/i)
    ).toBeInTheDocument();

    // Fonte clicável no item
    const btnFonte = screen.getByTestId('btn-fonte-relatorio-CTR_2026-012-Cláusula Primeira');
    expect(btnFonte).toBeInTheDocument();

    fireEvent.click(btnFonte);
    expect(onNavegar).toHaveBeenCalledWith('CTR_2026-012', '1.0.0', 'Cláusula Primeira');
  });

  it('aciona window.print ao clicar em Imprimir / Salvar PDF', async () => {
    const onNavegar = vi.fn();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<RelatorioView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('btn-imprimir-relatorio')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-imprimir-relatorio'));
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });
});
