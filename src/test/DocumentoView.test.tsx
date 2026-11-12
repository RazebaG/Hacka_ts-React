import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentoView } from '../components/DocumentoView';

describe('DocumentoView', () => {
  it('renderiza o cabeçalho e seções do documento vigente com destaque na seção citada', async () => {
    // Mock do scrollIntoView que não existe no jsdom
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    const onVoltar = vi.fn();
    const onMudarVersao = vi.fn();

    render(
      <DocumentoView
        codigo="NG_111"
        versao="3.0.0"
        secaoDestacada="4.3"
        onVoltar={onVoltar}
        onMudarVersao={onMudarVersao}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('doc-codigo-display')).toHaveTextContent('NG_111');
    });

    expect(screen.getByTestId('doc-versao-display')).toHaveTextContent('v3.0.0');
    expect(screen.getByTestId('badge-status-vigente')).toBeInTheDocument();

    // Banner de seção destacada
    expect(screen.getByTestId('banner-secao-destacada')).toBeInTheDocument();
    expect(screen.getByTestId('secao-4.3')).toHaveClass('secao-destacada');
    expect(screen.getByText('Trecho Citado')).toBeInTheDocument();

    // Voltar
    fireEvent.click(screen.getByTestId('btn-voltar-catalogo'));
    expect(onVoltar).toHaveBeenCalled();
  });

  it('exibe alerta destacado quando o documento é uma versão substituída', async () => {
    const onVoltar = vi.fn();
    const onMudarVersao = vi.fn();

    render(
      <DocumentoView
        codigo="NG_111"
        versao="2.0.0"
        onVoltar={onVoltar}
        onMudarVersao={onMudarVersao}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('alerta-doc-substituido')).toBeInTheDocument();
    });

    expect(screen.getByTestId('badge-status-substituido')).toHaveTextContent('Substituído');
    expect(
      screen.getByText(/Este documento é uma versão substituída ou revogada/i)
    ).toBeInTheDocument();
  });
});
