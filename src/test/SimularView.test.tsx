import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SimularView } from '../components/SimularView';

describe('SimularView (E se? · Simulação Hipotética · Issue #5)', () => {
  it('renderiza o aviso "simulação hipotética" sempre visível e o selo de fixture', async () => {
    const onNavegar = vi.fn();
    render(<SimularView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('aviso-hipotetico-fixo')).toBeInTheDocument();
    });

    expect(screen.getByText(/simulação hipotética: não altera os documentos/i)).toBeInTheDocument();
    expect(screen.getByTestId('selo-dados-fixture')).toHaveTextContent(/dados de fixture/i);
  });

  it('renderiza a regra ferias_antecedencia_dias, valor atual 45d e fonte clicável', async () => {
    const onNavegar = vi.fn();
    render(<SimularView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByText('Antecedência mínima para pedir férias')).toBeInTheDocument();
    });

    expect(screen.getByTestId('valor-regra-atual')).toHaveTextContent('45 dias');

    // Botão de fonte da regra vigente
    const btnFonteRegra = screen.getByTestId('btn-fonte-regra-NG_111');
    expect(btnFonteRegra).toBeInTheDocument();
    fireEvent.click(btnFonteRegra);
    expect(onNavegar).toHaveBeenCalledWith('NG_111', '3.0.0', '4.5.1');
  });

  it('renderiza a timeline com destaque em muda=true quando novo_valor=30', async () => {
    const onNavegar = vi.fn();
    render(<SimularView onNavegarDocumento={onNavegar} />);

    // Por padrão inicial simula 30 dias
    await waitFor(() => {
      expect(screen.getByTestId('resultado-simulacao')).toBeInTheDocument();
    });

    // Marco com muda=true
    const badgeMuda = screen.getByTestId('badge-marco-muda-true');
    expect(badgeMuda).toBeInTheDocument();
    expect(badgeMuda).toHaveTextContent(/muda=true/i);

    // Datas antes e depois
    expect(screen.getByText('21/03/2027')).toBeInTheDocument(); // Antes (D-45)
    expect(screen.getByText('05/04/2027')).toBeInTheDocument(); // Depois (D-30)

    // Fonte do marco na timeline clicável
    const btnFonteMarco = screen.getByTestId('btn-fonte-marco-0');
    expect(btnFonteMarco).toBeInTheDocument();
    fireEvent.click(btnFonteMarco);
    expect(onNavegar).toHaveBeenCalledWith('NG_111', '3.0.0', '4.5.1');
  });

  it('renderiza o conflito com o marco D-35 quando novo_valor=30', async () => {
    const onNavegar = vi.fn();
    render(<SimularView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('impacto-conflito-interno')).toBeInTheDocument();
    });

    const descConflito = screen.getByTestId('conflito-descricao');
    expect(descConflito).toHaveTextContent(
      /O aviso D-35 ficaria antes do fim do prazo de solicitação \(D-30\)/i
    );

    // Fonte do conflito
    const btnFonteConflito = screen.getByTestId('btn-fonte-conflito-NG_111');
    expect(btnFonteConflito).toBeInTheDocument();
    fireEvent.click(btnFonteConflito);
    expect(onNavegar).toHaveBeenCalledWith('NG_111', '3.0.0', '4.5.3');
  });

  it('renderiza a lista de documentos vigentes que exigirão revisão com fontes clicáveis', async () => {
    const onNavegar = vi.fn();
    render(<SimularView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('impacto-revisar-documentos')).toBeInTheDocument();
    });

    expect(screen.getByTestId('item-revisar-PX_1111-001')).toBeInTheDocument();
    expect(screen.getByTestId('item-revisar-NG_111')).toBeInTheDocument();
    expect(screen.getByTestId('item-revisar-FM_1111-001')).toBeInTheDocument();

    // Fonte de revisão clicável
    const btnFonteRevisar = screen.getByTestId('btn-fonte-revisar-PX_1111-001-8.2');
    expect(btnFonteRevisar).toBeInTheDocument();
    fireEvent.click(btnFonteRevisar);
    expect(onNavegar).toHaveBeenCalledWith('PX_1111-001', '1.0.0', '8.2');
  });

  it('permite alternar cenários por atalhos e simular novo valor', async () => {
    const onNavegar = vi.fn();
    render(<SimularView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('btn-cenario-45')).toBeInTheDocument();
    });

    // Clica no atalho para restaurar 45 dias
    fireEvent.click(screen.getByTestId('btn-cenario-45'));

    await waitFor(() => {
      // Quando é 45 dias, não há conflitos
      expect(screen.getByTestId('sem-impactos')).toBeInTheDocument();
    });

    // Clica no atalho para 30 dias
    fireEvent.click(screen.getByTestId('btn-cenario-30'));

    await waitFor(() => {
      expect(screen.getByTestId('impacto-conflito-interno')).toBeInTheDocument();
    });
  });
});
