import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PerguntarView } from '../components/PerguntarView';
import { CatalogoView } from '../components/CatalogoView';
import { EnviarView, lote } from '../components/EnviarView';
import { Topbar } from '../components/Header';
import { lerRota, url } from '../app/rotas';

/** Itens do FLUXO-DE-TELAS-v2 conferidos na verificação do fluxo (rotas, transições e componentes). */
describe('FLUXO-DE-TELAS-v2: lacunas corrigidas', () => {
  it('T2: citação mostra a camada, o aviso de versão leva ao T9 e a resposta termina com a próxima ação', async () => {
    render(<PerguntarView onNavegarDocumento={() => undefined} />);
    fireEvent.change(screen.getByTestId('input-pergunta'), { target: { value: 'Qual a antecedência mínima para solicitar férias?' } });
    fireEvent.click(screen.getByTestId('btn-enviar-pergunta'));
    const citacao = await screen.findByTestId('citacao-NG_111-4.3');
    expect(citacao).toHaveTextContent('NG Norma Geral');
    expect(screen.getByTestId('aviso-comparar-0')).toHaveAttribute('href', '/comparar?codigo=NG_111&de=2.0.0&para=3.0.0');
    expect(within(screen.getByTestId('resultado-pergunta')).getByText('O que fazer agora')).toBeInTheDocument();
  });

  it('T0: pergunta rápida no topo', () => {
    render(<Topbar telaAtiva="inicio" />);
    expect(screen.getByTestId('pergunta-rapida')).toHaveAttribute('placeholder', 'Pergunte ao acervo…');
  });

  it('T7: grupos por assunto com cabeçalho visível', async () => {
    render(<CatalogoView onNavegarDocumento={() => undefined} />);
    const grupo = await screen.findByTestId('grupo-assunto-ferias');
    expect(within(grupo).getByRole('rowheader')).toHaveTextContent(/Férias .*· \d+ documentos/);
  });

  it('T12: rota do lote, "Tentar de novo" no erro e aviso de lote fechado', async () => {
    expect(lerRota({ pathname: '/enviar/lote/lote-1', search: '', hash: '' })).toMatchObject({ tela: 'lote', params: { id: 'lote-1' } });
    expect(lerRota({ pathname: '/enviar/arq-1', search: '', hash: '' }).tela).toBe('revisar');
    expect(url.lote('lote-1')).toBe('/enviar/lote/lote-1');

    lote.definir([], null);
    const { unmount } = render(<EnviarView />);
    fireEvent.click(screen.getByTestId('btn-lote-exemplo'));
    const erro = await screen.findByTestId('lote-planilha_custos.xlsx');
    expect(within(erro).getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    expect(within(erro).getByRole('button', { name: 'Retirar' })).toBeInTheDocument();
    expect(lote.id()).toMatch(/^lote-/);
    unmount();

    render(<EnviarView loteId="lote-antigo" />);
    expect(screen.getByTestId('lote-fechado')).toHaveTextContent('Este lote não está mais aberto neste navegador.');
  });
});
