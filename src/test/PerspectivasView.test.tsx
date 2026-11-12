import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PerspectivasView } from '../components/PerspectivasView';

describe('PerspectivasView', () => {
  it('renderiza os destaques da perspectiva Pessoas com gancho da versão anterior (Cena 1)', async () => {
    const onNavegar = vi.fn();
    render(<PerspectivasView onNavegarDocumento={onNavegar} perspectivaInicial="pessoas" />);

    // Aguarda carregar
    await waitFor(() => {
      expect(screen.getByText('O que cada área precisa saber')).toBeInTheDocument();
    });

    // Hook da Cena 1: Antecedência mínima 45 dias
    expect(screen.getByText('Antecedência mínima para marcação de férias')).toBeInTheDocument();
    expect(screen.getByText('45 dias')).toBeInTheDocument();

    // Alerta de versão substituída
    expect(screen.getByText(/v2 \(substituída\) dizia 30 dias/i)).toBeInTheDocument();

    // Botões de fonte
    const btnFonteVigente = screen.getByTestId('btn-fonte-NG_111-4.3.1');
    expect(btnFonteVigente).toBeInTheDocument();

    fireEvent.click(btnFonteVigente);
    expect(onNavegar).toHaveBeenCalledWith('NG_111', '3.0.0', '4.3.1');

    // Botão de fonte anterior revogada
    const btnFonteAnterior = screen.getByTestId('btn-fonte-NG_111-2.3');
    expect(btnFonteAnterior).toBeInTheDocument();

    fireEvent.click(btnFonteAnterior);
    expect(onNavegar).toHaveBeenCalledWith('NG_111', '2.0.0', '2.3');
  });

  it('renderiza a linha do tempo (timeline) com marcos D-45 até D-3', async () => {
    const onNavegar = vi.fn();
    render(<PerspectivasView onNavegarDocumento={onNavegar} perspectivaInicial="pessoas" />);

    await waitFor(() => {
      expect(screen.getByTestId('timeline-prazos')).toBeInTheDocument();
    });

    // Marcos temporais
    expect(screen.getByText('D-45')).toBeInTheDocument();
    expect(screen.getByText('D-35')).toBeInTheDocument();
    expect(screen.getByText('D-30')).toBeInTheDocument();
    expect(screen.getByText('D-20')).toBeInTheDocument();
    expect(screen.getByText('D-3')).toBeInTheDocument();

    // Fonte de prazo clicável
    const btnsFontePrazo = screen.getAllByTestId('btn-fonte-PX_1111-001-Anexo D');
    expect(btnsFontePrazo.length).toBeGreaterThan(0);

    fireEvent.click(btnsFontePrazo[0]);
    expect(onNavegar).toHaveBeenCalledWith('PX_1111-001', '1.0.0', 'Anexo D');
  });

  it('permite alternar para o painel Financeiro com valores e multa no Apêndice B (Cena 2)', async () => {
    const onNavegar = vi.fn();
    render(<PerspectivasView onNavegarDocumento={onNavegar} perspectivaInicial="pessoas" />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-perspectiva-financeiro')).toBeInTheDocument();
    });

    // Clica na aba Financeiro
    fireEvent.click(screen.getByTestId('tab-perspectiva-financeiro'));

    await waitFor(() => {
      expect(screen.getByText('Valor global do coworking')).toBeInTheDocument();
    });

    // Cena 2: R$ 18.250,00 e Multa R$ 912,50
    expect(screen.getAllByText('R$ 18.250,00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('R$ 912,50').length).toBeGreaterThan(0);

    // Multa no Apêndice B do CTR_2026-012
    const btnsFonteMulta = screen.getAllByTestId('btn-fonte-CTR_2026-012-Apêndice B');
    expect(btnsFonteMulta.length).toBeGreaterThan(0);

    fireEvent.click(btnsFonteMulta[0]);
    expect(onNavegar).toHaveBeenCalledWith('CTR_2026-012', '1.0.0', 'Apêndice B');
  });

  it('renderiza matriz de responsáveis e riscos normativos', async () => {
    const onNavegar = vi.fn();
    render(<PerspectivasView onNavegarDocumento={onNavegar} perspectivaInicial="financeiro" />);

    await waitFor(() => {
      expect(screen.getByText('Quem faz o quê')).toBeInTheDocument();
    });

    expect(screen.getByText('GOC')).toBeInTheDocument();
    expect(screen.getByText(/Fiscal técnico do contrato/i)).toBeInTheDocument();

    expect(screen.getByText('Cuidados e riscos')).toBeInTheDocument();
    expect(screen.getByText(/Inexecução contratual acarreta multa compensatória/i)).toBeInTheDocument();
  });
});
