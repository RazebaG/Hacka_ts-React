import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FichaView } from '../components/FichaView';
import { PerguntarView } from '../components/PerguntarView';
import { mockFicha } from '../mocks/ficha';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { postPerguntar } from '../api/client';
import { lerRota, url } from '../app/rotas';

/** Critérios de aceite de REQUISITOS-FICHA-DO-DOCUMENTO-v1 §7 e checklist do FLUXO §9. */
describe('Ficha do Documento (T14)', () => {
  it('rota /documento/:codigo/ficha vem antes de /documento/:codigo', () => {
    expect(lerRota({ pathname: '/documento/CTR_2026-012/ficha', search: '', hash: '' }).tela).toBe('ficha');
    expect(lerRota({ pathname: '/documento/CTR_2026-012', search: '', hash: '' }).tela).toBe('documento');
    expect(url.ficha('NG_111', '2.0.0')).toBe('/documento/NG_111/ficha?versao=2.0.0');
    expect(url.perguntar(undefined, ['CTR_2026-012'])).toBe('/perguntar?doc=CTR_2026-012');
  });

  it('1. relance do CTR_2026-012: tipo, vigência, valor, aprovador, classificação e próximo prazo', async () => {
    render(<FichaView codigo="CTR_2026-012" />);
    const relance = await screen.findByTestId('ficha-relance');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Contrato de Locação de Espaço');
    expect(relance).toHaveTextContent('Em vigor até 29/04/2027');
    expect(relance).toHaveTextContent('R$ 18.250,00');
    expect(relance).toHaveTextContent('25/11/2026');
    const gov = screen.getByTestId('ficha-governanca');
    expect(gov).toHaveTextContent('Diretoria Administrativa e Financeira (DIRAF)');
    expect(gov).toHaveTextContent('interna');
  });

  it('3. governança sem IA: campo ausente mostra "Não consta no documento"', async () => {
    render(<FichaView codigo="CTR_2026-012" />);
    const gov = await screen.findByTestId('ficha-governanca');
    expect(within(gov).getAllByText('Não consta no documento').length).toBeGreaterThanOrEqual(1);
    expect(gov).toHaveTextContent('NG_012');
    expect(gov).toHaveTextContent('ausente no acervo');
  });

  it('2. nada sem fonte: na ficha extrativa, todo item tem trecho que consta na seção citada', () => {
    const f = mockFicha('NG_111')!;
    const doc = MOCK_DOCUMENTOS.find((d) => d.codigo === 'NG_111' && d.versao === f.versao)!;
    const itens = [...f.numeros, ...Object.values(f.pontos).flat()];
    expect(itens.length).toBeGreaterThan(0);
    for (const item of itens) {
      expect(item.fontes.length).toBeGreaterThan(0);
      for (const fonte of item.fontes) {
        const secao = doc.secoes.find((s) => s.id === fonte.secao)!;
        expect(secao.texto).toContain(fonte.trecho);
      }
    }
  });

  it('4. mapa de calor: uma célula por seção', async () => {
    const doc = MOCK_DOCUMENTOS.find((d) => d.codigo === 'NG_111' && !d.substituido)!;
    render(<FichaView codigo="NG_111" />);
    const lista = await screen.findByRole('list', { name: /Seções do documento/ });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(doc.secoes.length);
  });

  it('6. sem IA: modo extrativo com aviso, sem BLUF inventado e cobertura declarada', async () => {
    render(<FichaView codigo="NG_111" />);
    expect(await screen.findByTestId('ficha-extrativo')).toHaveTextContent('IA indisponível');
    expect(screen.queryByTestId('ficha-bluf')).not.toBeInTheDocument();
    expect(screen.getByTestId('ficha-cobertura')).toHaveTextContent('modo: extrativo (sem IA)');
  });

  it('versão substituída avisa e oferece a vigente', async () => {
    render(<FichaView codigo="NG_111" versao="2.0.0" />);
    expect(await screen.findByTestId('ficha-substituida')).toHaveTextContent('Você está lendo a versão 2.0.0. A que vale hoje é a 3.0.0.');
  });

  it('documento inexistente', async () => {
    render(<FichaView codigo="XX_999" />);
    expect(await screen.findByTestId('ficha-erro')).toHaveTextContent('Não encontramos XX_999');
  });

  it('8. "Perguntar sobre este documento" fixa o escopo', async () => {
    render(<FichaView codigo="CTR_2026-012" />);
    expect(await screen.findByTestId('ficha-perguntar')).toHaveAttribute('href', '/perguntar?doc=CTR_2026-012');
  });
});

describe('Fontes em evidência (RF63–RF68)', () => {
  it('7. férias: "Respondido com 2 documentos", NG_111 v3.0.0 citado e v2 substituída em destaque', async () => {
    render(<PerguntarView onNavegarDocumento={() => undefined} />);
    fireEvent.change(screen.getByTestId('input-pergunta'), { target: { value: 'Qual a antecedência mínima para solicitar férias?' } });
    fireEvent.click(screen.getByTestId('btn-enviar-pergunta'));
    expect(await screen.findByTestId('respondido-com')).toHaveTextContent('Respondido com 2 documentos');
    const painel = screen.getByTestId('painel-fontes');
    expect(within(painel).getByTestId('fonte-NG_111-3.0.0')).toHaveTextContent('Citado na resposta');
    const antiga = within(painel).getByTestId('fonte-NG_111-2.0.0');
    expect(antiga).toHaveTextContent('Consultado, não usado');
    expect(antiga).toHaveTextContent('Esta fonte foi substituída pela v3.0.0');
  });

  it('8. escopo: com só NG_111 fixado, a pergunta do coworking não usa o CTR', async () => {
    const r = await postPerguntar('Qual o valor global do contrato de coworking e a multa por inexecução?', null, ['NG_111']);
    expect(r.citacoes.every((c) => c.codigo === 'NG_111')).toBe(true);
    expect(r.escopo).toEqual({ fixado: true, documentos: ['NG_111'] });
    expect(r.documentos_pesquisados).toBe(1);
  });

  it('o escopo vindo da rota aparece como chip removível', () => {
    render(<PerguntarView onNavegarDocumento={() => undefined} documentosIniciais={['CTR_2026-012']} />);
    const chip = screen.getByTestId('escopo-CTR_2026-012');
    fireEvent.click(chip);
    expect(screen.queryByTestId('escopo-CTR_2026-012')).not.toBeInTheDocument();
    expect(screen.getByTestId('escopo')).toHaveTextContent('Todo o acervo');
  });
});
