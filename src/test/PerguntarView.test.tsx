import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PerguntarView } from '../components/PerguntarView';

describe('PerguntarView', () => {
  it('renderiza o formulário de perguntas e os botões de atalho da demo', () => {
    const onNavegar = vi.fn();
    render(<PerguntarView onNavegarDocumento={onNavegar} />);

    expect(screen.getByText('Tire sua dúvida')).toBeInTheDocument();
    expect(screen.getByTestId('input-pergunta')).toBeInTheDocument();
    expect(screen.getByTestId('select-perfil')).toBeInTheDocument();
    expect(screen.getByTestId('btn-enviar-pergunta')).toBeInTheDocument();
    expect(
      screen.getByText('Uma mesma pessoa pode elaborar, revisar e aprovar um documento?')
    ).toBeInTheDocument();
  });

  it('exibe estado de abstenção "não consta nas fontes" quando consta=false', async () => {
    const onNavegar = vi.fn();
    render(<PerguntarView onNavegarDocumento={onNavegar} />);

    const input = screen.getByTestId('input-pergunta');
    fireEvent.change(input, {
      target: { value: 'Uma mesma pessoa pode elaborar, revisar e aprovar?' }
    });

    const btn = screen.getByTestId('btn-enviar-pergunta');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId('alerta-nao-consta')).toBeInTheDocument();
    });

    expect(screen.getByText('Os documentos não tratam deste assunto')).toBeInTheDocument();
    expect(screen.getByText('Sem resposta inventada')).toBeInTheDocument();
    expect(
      screen.getByText(/Não consta nas fontes do acervo que uma mesma pessoa/i)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('secao-citacoes')).not.toBeInTheDocument();
  });

  it('renderiza citações clicáveis e avisos de versão substituída', async () => {
    const onNavegar = vi.fn();
    render(<PerguntarView onNavegarDocumento={onNavegar} />);

    const input = screen.getByTestId('input-pergunta');
    fireEvent.change(input, {
      target: { value: 'Qual a antecedência mínima para solicitar férias?' }
    });

    const btn = screen.getByTestId('btn-enviar-pergunta');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId('secao-citacoes')).toBeInTheDocument();
    });

    // Citações renderizadas com código·versão·seção
    const citacaoCard = screen.getByTestId('citacao-NG_111-4.3');
    expect(citacaoCard).toBeInTheDocument();
    expect(citacaoCard).toHaveTextContent('NG_111');
    expect(citacaoCard).toHaveTextContent('v3.0.0');
    expect(citacaoCard).toHaveTextContent('Seção 4.3');
    expect(citacaoCard).toHaveTextContent(/A solicitação formal é feita via Portal Raiz/);

    // Avisos de substituição
    expect(screen.getByTestId('box-avisos')).toBeInTheDocument();
    expect(
      screen.getByText(/NG_111 v2.0.0 foi substituída pela v3.0.0/i)
    ).toBeInTheDocument();

    // Ao clicar na citação, navega para o documento com a seção
    fireEvent.click(citacaoCard);
    expect(onNavegar).toHaveBeenCalledWith('NG_111', '3.0.0', '4.3');
  });
});
