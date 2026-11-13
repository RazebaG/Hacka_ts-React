import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { MesaDocumento } from '../components/MesaDocumento';
import { VisaoGeralView } from '../components/VisaoGeralView';
import { mockFicha, mockTriagem, familiaDe } from '../mocks/ficha';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { acoes } from '../app/store';
import { lerRota, navegar, url } from '../app/rotas';
import { ApresentacaoView } from '../components/ApresentacaoView';

afterEach(() => acoes.definirPerfil(null));

/** Revisão 13/11 (REQUISITOS-FICHA §0 e §5.4): Mesa de decisão na tela inicial e blocos por família. */
describe('Mesa de decisão (RF71–RF76)', () => {
  it('RF71: tela inicial mantém o topo e mostra até 5 documentos com motivo curto; abre a Mesa no primeiro', async () => {
    render(<VisaoGeralView />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Arquivo Central de Normas');
    expect(screen.getByRole('navigation', { name: 'Atalhos' })).toBeInTheDocument();
    const chips = await screen.findAllByRole('tab');
    expect(chips.length).toBeGreaterThanOrEqual(3);
    expect(chips.length).toBeLessThanOrEqual(5);
    expect(screen.getByTestId('chip-CTR_2026-012')).toHaveTextContent('vistoria em 13 dias');
    expect(await screen.findByTestId('mesa')).toHaveTextContent('Contrato de Locação de Espaço');
  });

  it('RF71: o perfil muda a ordem da lista (urgência primeiro) e ?doc= escolhe o documento', async () => {
    expect(mockTriagem({ limite: 5, perfil: 'juridico' }).itens[0].codigo).toBe('CTR_2026-012');
    expect(mockTriagem({ limite: 5, perfil: 'gestor' }).itens.length).toBe(5);
    expect(url.inicio('NG_111')).toBe('/?doc=NG_111');
    expect(lerRota({ pathname: '/', search: '?doc=NG_111', hash: '' }).query.get('doc')).toBe('NG_111');
    render(<VisaoGeralView docSelecionado="NG_111" />);
    expect(await screen.findByTestId('mesa')).toHaveTextContent('Férias');
  });

  it('RF73: blocos por família, de 4 a 6 no contrato oficial; contrato e norma trazem blocos diferentes', () => {
    const ctr = mockFicha('CTR_2026-012')!;
    const ng = mockFicha('NG_111')!;
    expect(ctr.familia).toBe('contrato');
    expect(ng.familia).toBe('norma');
    expect(ctr.blocos!.length).toBeGreaterThanOrEqual(4);
    expect(ctr.blocos!.length).toBeLessThanOrEqual(6);
    expect(ctr.blocos!.map((b) => b.titulo)).toContain('Quanto custa');
    expect(ng.blocos!.map((b) => b.titulo)).toContain('Prazos que valem');
    expect(ng.blocos!.map((b) => b.titulo)).not.toContain('Quanto custa');
    expect(familiaDe('PX_1111-001')).toBe('procedimento');
    expect(familiaDe('NT_2026-021')).toBe('nota_tecnica');
  });

  it('RF74: relevância por regra, com posição e motivo que cita o fato', () => {
    const ng = mockFicha('NG_111')!;
    ng.blocos!.forEach((b, i) => expect(b.relevancia.posicao).toBe(i + 1));
    const prazos = ng.blocos!.find((b) => b.titulo === 'Prazos que valem')!;
    expect(prazos.destaque).toBe('45 dias');
    expect(prazos.relevancia.motivo).toContain('45 dias');
    const ctr = mockFicha('CTR_2026-012')!;
    expect(ctr.blocos![1].relevancia.motivo).toBe('vence em 13 dias');
  });

  it('RF73 + RNF20: todo item citado num bloco por regra existe e tem trecho que consta na seção', () => {
    for (const d of MOCK_DOCUMENTOS.filter((x) => !x.substituido && x.codigo !== 'CTR_2026-012')) {
      const f = mockFicha(d.codigo)!;
      const todos = [...f.numeros, ...Object.values(f.pontos).flat()];
      for (const b of f.blocos!) {
        for (const id of b.itens) {
          const item = todos.find((i) => i.id === id)!;
          expect(item, `${d.codigo} ${b.titulo} ${id}`).toBeTruthy();
          for (const x of item.fontes) expect(d.secoes.find((s) => s.id === x.secao)!.texto).toContain(x.trecho);
        }
      }
    }
  });

  it('RF75/RF76: escolher um bloco acende as seções no mapa e abre o detalhe com o trecho; de novo fecha', () => {
    const f = mockFicha('CTR_2026-012')!;
    render(<MesaDocumento ficha={f} variante="compacta" />);
    fireEvent.click(screen.getByTestId('bloco-b-custo'));
    expect(screen.getByTestId('bloco-b-custo')).toHaveAttribute('aria-pressed', 'true');
    const mapa = screen.getByRole('list', { name: /Seções do documento/ });
    expect(within(mapa).getByRole('listitem', { name: /Cláusula Sétima.*usada no bloco escolhido/ })).toBeInTheDocument();
    const detalhe = screen.getByTestId('mesa-detalhe');
    expect(detalhe).toHaveTextContent('perfazendo o valor global de R$ 18.250,00');
    expect(within(detalhe).getAllByText(/Abrir no texto completo/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByTestId('bloco-b-custo'));
    expect(screen.queryByTestId('mesa-detalhe')).not.toBeInTheDocument();
  });

  it('RF72: faixa "Precisa de você", pergunta limitada ao documento e "Abrir ficha completa"', async () => {
    const f = mockFicha('CTR_2026-012')!;
    render(<MesaDocumento ficha={f} variante="compacta" />);
    expect(screen.getByTestId('mesa-precisa')).toHaveTextContent('Fazer a vistoria e assinar o termo de entrega até 25/11/2026');
    expect(screen.getByTestId('mesa-abrir-ficha')).toHaveAttribute('href', '/documento/CTR_2026-012/ficha?versao=1.0.0');
    fireEvent.change(screen.getByTestId('mesa-pergunta'), { target: { value: 'Posso rescindir sem multa?' } });
    fireEvent.submit(screen.getByTestId('mesa-pergunta').closest('form')!);
    await waitFor(() => expect(window.location.search).toContain('doc=CTR_2026-012'));
  });

  it('Teclado: Esc fecha o detalhe', () => {
    render(<MesaDocumento ficha={mockFicha('NG_111')!} variante="completa" />);
    const primeiro = screen.getByTestId('mesa-blocos').querySelector('button')!;
    fireEvent.click(primeiro);
    expect(screen.getByTestId('mesa-detalhe')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('mesa-detalhe')).not.toBeInTheDocument();
  });

  it('RF08/RF31: próximo prazo calculado pela data de referência, citando o cronograma (Apêndice C)', async () => {
    render(<VisaoGeralView />);
    expect(await screen.findByTestId('inicio-proximo-prazo')).toHaveTextContent('25/11/2026');
    expect(screen.getAllByText(/Apêndice C/).length).toBeGreaterThan(0);
    expect(screen.getByTestId('inicio-atencao')).toHaveTextContent('Perfil: todos');
  });

  it('Apresentar: desativado sem resumo, com o motivo; com resumo leva a origem e o bloco escolhido', () => {
    const { unmount } = render(<MesaDocumento ficha={mockFicha('NG_111')!} variante="compacta" />);
    expect(screen.getByTestId('mesa-apresentar')).toBeDisabled();
    expect(screen.getByText('Este documento ainda não tem resumo pronto.')).toBeInTheDocument();
    unmount();
    render(<MesaDocumento ficha={mockFicha('CTR_2026-012')!} variante="compacta" />);
    fireEvent.click(screen.getByTestId('bloco-b-custo'));
    expect(screen.getByTestId('mesa-apresentar')).toHaveAttribute('href', '/documento/CTR_2026-012/apresentar?versao=1.0.0&de=inicio&bloco=b-custo');
  });

  it('Apresentação: Sair volta à Mesa no mesmo bloco; sem resumo a tela não abre', async () => {
    navegar('/documento/CTR_2026-012/apresentar?versao=1.0.0&de=inicio&bloco=b-custo', true);
    const { unmount } = render(<ApresentacaoView codigo="CTR_2026-012" versao="1.0.0" />);
    fireEvent.click(await screen.findByTestId('apresentacao-sair'));
    expect(window.location.pathname + window.location.search).toBe('/?doc=CTR_2026-012&bloco=b-custo');
    unmount();
    render(<MesaDocumento ficha={mockFicha('CTR_2026-012')!} variante="compacta" />);
    expect(screen.getByTestId('bloco-b-custo')).toHaveAttribute('aria-pressed', 'true');
    navegar('/', true);
    render(<ApresentacaoView codigo="NG_111" />);
    expect(await screen.findByTestId('apresentacao-sem-resumo')).toHaveTextContent('ainda não tem resumo pronto');
  });
});
