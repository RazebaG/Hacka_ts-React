import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CompararView } from '../components/CompararView';

describe('CompararView', () => {
  it('renderiza o comparativo da Cena 3 (NG_111 v2.0.0 → v3.0.0) com resumo executivo', async () => {
    const onNavegar = vi.fn();
    render(
      <CompararView
        onNavegarDocumento={onNavegar}
        codigoInicial="NG_111"
        deInicial="2.0.0"
        paraInicial="3.0.0"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('O Que Mudou entre Versões')).toBeInTheDocument();
      expect(screen.getByText(/Resumo Executivo das Alterações \(NG_111\)/i)).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Antecedência mínima para solicitação de férias passou de 30 para 45 dias corridos/i)
    ).toBeInTheDocument();

    // Detalhe das seções lado a lado
    expect(screen.getByText('Seção 4.3.1')).toBeInTheDocument();
    expect(screen.getByText(/A solicitação formal de férias devia ser efetuada com antecedência mínima de 30/i)).toBeInTheDocument();
    expect(screen.getByText(/A antecedência mínima para solicitação de férias é de 45/i)).toBeInTheDocument();

    // Botão para abrir seção no leitor
    const btnAbrirSeção = screen.getByTestId('btn-abrir-secao-4.3.1');
    expect(btnAbrirSeção).toBeInTheDocument();

    fireEvent.click(btnAbrirSeção);
    expect(onNavegar).toHaveBeenCalledWith('NG_111', '3.0.0', '4.3.1');
  });

  it('permite alternar para outro par de comparação pré-definido', async () => {
    const onNavegar = vi.fn();
    render(<CompararView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('btn-comparar-FM_1111-001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-comparar-FM_1111-001'));

    await waitFor(() => {
      expect(screen.getByText(/Resumo Executivo das Alterações \(FM_1111-001\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Inclusão do campo obrigatório de autorização da diretoria/i)).toBeInTheDocument();
  });
});
