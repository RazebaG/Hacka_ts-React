import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CatalogoView } from '../components/CatalogoView';

describe('CatalogoView', () => {
  it('renderiza o catálogo agrupado por assunto com selos Vigente e Substituído', async () => {
    const onNavegar = vi.fn();
    render(<CatalogoView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('grupo-assunto-ferias')).toBeInTheDocument();
    });

    expect(screen.getByTestId('grupo-assunto-inovacao')).toBeInTheDocument();
    expect(screen.getByTestId('grupo-assunto-locacao')).toBeInTheDocument();

    // Selos
    const selosVigentes = screen.getAllByTestId('badge-status-vigente');
    expect(selosVigentes.length).toBeGreaterThan(0);

    const selosSubstituidos = screen.getAllByTestId('badge-status-substituido');
    expect(selosSubstituidos.length).toBeGreaterThan(0);
    expect(selosSubstituidos[0]).toHaveTextContent('Versão antiga');

    // Linha do documento substituído
    expect(screen.getByTestId('linha-doc-NG_111-2.0.0')).toHaveClass('linha-substituido');
  });

  it('permite filtrar documentos por status de vigência', async () => {
    const onNavegar = vi.fn();
    render(<CatalogoView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('filtro-status')).toBeInTheDocument();
    });

    const selectStatus = screen.getByTestId('filtro-status');

    // Filtra apenas substituídos
    fireEvent.change(selectStatus, { target: { value: 'substituido' } });

    expect(screen.getByTestId('linha-doc-NG_111-2.0.0')).toBeInTheDocument();
    expect(screen.queryByTestId('linha-doc-NG_111-3.0.0')).not.toBeInTheDocument();

    // Filtra apenas vigentes
    fireEvent.change(selectStatus, { target: { value: 'vigente' } });

    expect(screen.getByTestId('linha-doc-NG_111-3.0.0')).toBeInTheDocument();
    expect(screen.queryByTestId('linha-doc-NG_111-2.0.0')).not.toBeInTheDocument();
  });

  it('aciona navegação ao clicar em Ler Documento', async () => {
    const onNavegar = vi.fn();
    render(<CatalogoView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByTestId('btn-abrir-NG_111-3.0.0')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-abrir-NG_111-3.0.0'));
    expect(onNavegar).toHaveBeenCalledWith('NG_111', '3.0.0');
  });
});
