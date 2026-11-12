import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DecodificadorView } from '../components/DecodificadorView';
import * as client from '../api/client';

describe('DecodificadorView', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza o decodificador com título, exemplos e decodifica PX_1111-001 por padrão', async () => {
    const onNavegar = vi.fn();
    render(<DecodificadorView onNavegarDocumento={onNavegar} codigoInicial="PX_1111-001" />);

    expect(screen.getByText('Decodificador de Código de Documento')).toBeInTheDocument();
    expect(screen.getByTestId('input-codigo')).toHaveValue('PX_1111-001');

    await waitFor(() => {
      expect(screen.getByTestId('card-decodificacao')).toBeInTheDocument();
    });

    expect(screen.getByTestId('decod-codigo')).toHaveTextContent('PX_1111-001');
    expect(screen.getByTestId('decod-tipo')).toHaveTextContent(/PX.*Procedimento/i);
    expect(screen.getByTestId('decod-vinculado')).toHaveTextContent('NG_111');
    expect(screen.getByTestId('decod-serie')).toHaveTextContent(/Série 1.*Gente e Cultura/i);
    expect(screen.getByTestId('decod-vigencia')).toHaveTextContent(/18 meses/i);
    expect(screen.getByTestId('decod-acervo')).toHaveTextContent(/Presente no Acervo/i);

    // Botão para navegar até o documento vinculado
    const btnVinculado = screen.getByTestId('btn-navegar-vinculado');
    expect(btnVinculado).toBeInTheDocument();
    fireEvent.click(btnVinculado);
    expect(onNavegar).toHaveBeenCalledWith('NG_111');
  });

  it('permite alternar para outro código via atalhos de exemplo (NG_012 citada ausente)', async () => {
    render(<DecodificadorView codigoInicial="PX_1111-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('btn-exemplo-NG_012')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-exemplo-NG_012'));

    await waitFor(() => {
      expect(screen.getByTestId('decod-codigo')).toHaveTextContent('NG_012');
    });

    expect(screen.getByTestId('decod-acervo')).toHaveTextContent(/Citada, Não Arquivada/i);
    expect(screen.getByTestId('decod-observacao')).toHaveTextContent(/NT_2026-018/i);
  });

  it('permite digitar um novo código no campo de busca e submeter', async () => {
    render(<DecodificadorView codigoInicial="" />);

    const input = screen.getByTestId('input-codigo');
    fireEvent.change(input, { target: { value: 'RG_1100' } });
    expect(input).toHaveValue('RG_1100');

    fireEvent.click(screen.getByTestId('btn-decodificar'));

    await waitFor(() => {
      expect(screen.getByTestId('decod-codigo')).toHaveTextContent('RG_1100');
    });

    expect(screen.getByTestId('decod-tipo')).toHaveTextContent(/Regulamento/i);
    expect(screen.getByTestId('decod-serie')).toHaveTextContent(/Série 11.*Programas Institucionais/i);
  });

  it('exibe alerta claro de endpoint ausente sem quebrar a tela quando o backend retornar erro de rota não implementada (aguardando BE #3)', async () => {
    // Simula backend conectado onde GET /api/codigo ainda não foi implementado
    vi.spyOn(client, 'isMockMode').mockReturnValue(false);
    vi.spyOn(client, 'getApiBaseUrl').mockReturnValue('http://localhost:8000');
    vi.spyOn(client, 'fetchCodigo').mockRejectedValue(
      new client.ApiEndpointError(
        'Endpoint GET /api/codigo/{codigo} ausente no backend (404 Not Found - aguardando issue BE #3)',
        404,
        true // isEndpointAusente
      )
    );

    render(<DecodificadorView codigoInicial="PX_1111-001" />);

    // Deve exibir o aviso explícito de rota ausente no backend
    await waitFor(() => {
      expect(screen.getByTestId('alerta-endpoint-ausente')).toBeInTheDocument();
    });

    const alerta = screen.getByTestId('alerta-endpoint-ausente');
    expect(alerta).toHaveTextContent(/Endpoint GET \/api\/codigo\/\{codigo\} ausente no backend/i);
    expect(alerta).toHaveTextContent(/aguardando aprovação da issue BE #3/i);

    // Deve continuar exibindo a decodificação de contingência sem quebrar a UI
    expect(screen.getByTestId('card-decodificacao')).toBeInTheDocument();
    expect(screen.getByTestId('badge-fallback-mock')).toHaveTextContent('Mock de Contingência');
    expect(screen.getByTestId('decod-codigo')).toHaveTextContent('PX_1111-001');
  });

  it('exibe mensagem de erro quando ocorre falha genérica', async () => {
    vi.spyOn(client, 'fetchCodigo').mockRejectedValue(new Error('Erro de teste'));

    render(<DecodificadorView codigoInicial="INVALIDO" />);

    await waitFor(() => {
      expect(screen.getByTestId('msg-erro')).toBeInTheDocument();
    });

    expect(screen.getByTestId('msg-erro')).toHaveTextContent('Erro de teste');
  });
});
