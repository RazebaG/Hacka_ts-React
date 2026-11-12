import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GrafoView } from '../components/GrafoView';

describe('GrafoView', () => {
  it('renderiza o mapa do acervo com nós vigentes, substituídos e externos', async () => {
    const onNavegar = vi.fn();
    render(<GrafoView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByText('Ligações entre Documentos')).toBeInTheDocument();
    });

    expect(screen.getByTestId('grafo-canvas')).toBeInTheDocument();

    // Nós presentes
    expect(screen.getByTestId('grafo-no-NG_111@3.0.0')).toBeInTheDocument();
    expect(screen.getByTestId('grafo-no-NG_111@2.0.0')).toBeInTheDocument();
    expect(screen.getByTestId('grafo-no-CTR_2026-012@1.0.0')).toBeInTheDocument();
    expect(screen.getByTestId('grafo-no-NG_012')).toBeInTheDocument(); // Externo
  });

  it('exibe detalhes e conexões do nó selecionado e permite abrir no leitor', async () => {
    const onNavegar = vi.fn();
    render(<GrafoView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('grafo-painel-detalhes')).toBeInTheDocument();
    });

    // Clica no nó CTR_2026-012@1.0.0
    fireEvent.click(screen.getByTestId('grafo-no-CTR_2026-012@1.0.0'));

    const painelDetalhes = screen.getByTestId('grafo-painel-detalhes');
    expect(painelDetalhes).toHaveTextContent('CTR_2026-012');
    expect(painelDetalhes).toHaveTextContent('v1.0.0');

    const btnLeitor = screen.getByTestId('btn-abrir-no-leitor');
    expect(btnLeitor).toBeInTheDocument();

    fireEvent.click(btnLeitor);
    expect(onNavegar).toHaveBeenCalledWith('CTR_2026-012', '1.0.0');
  });

  it('permite alternar para a tabela acessível do acervo', async () => {
    const onNavegar = vi.fn();
    render(<GrafoView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('btn-toggle-modo-acessivel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-toggle-modo-acessivel'));

    const tabela = screen.getByTestId('grafo-tabela-acessivel');
    expect(tabela).toBeInTheDocument();
    expect(tabela).toHaveTextContent('NG_111');
    expect(tabela).toHaveTextContent('CTR_2026-012');
  });
});
