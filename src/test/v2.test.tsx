import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { lerRota } from '../app/rotas';
import { acoes, reiniciarEstado } from '../app/store';
import { cadeiaDe, camadaDe, classificarArquivo, simularFerias } from '../mocks/v2';
import { RadarView } from '../components/RadarView';
import { ESeView } from '../components/ESeView';
import { EnviarView, lote } from '../components/EnviarView';
import { RevisarView } from '../components/RevisarView';
import { DecisaoModal } from '../components/DecisaoModal';
import { RelatorioSelecao } from '../components/RelatorioSelecao';
import { VisaoGeralView } from '../components/VisaoGeralView';
import { PerguntarView } from '../components/PerguntarView';
import { DocumentoView } from '../components/DocumentoView';
import { CompararView } from '../components/CompararView';
import { PerspectivasView } from '../components/PerspectivasView';
import { FonteChip } from '../ui/componentes';

beforeEach(() => {
  reiniciarEstado();
  lote.definir([]);
  try {
    localStorage.clear();
  } catch {
    /* sem armazenamento */
  }
});

describe('Rotas profundas (#8)', () => {
  it('lê documento, versão e seção da URL', () => {
    const r = lerRota({ pathname: '/documento/NG_111', search: '?versao=3.0.0', hash: '#secao-4.3' });
    expect(r.tela).toBe('documento');
    expect(r.params.codigo).toBe('NG_111');
    expect(r.query.get('versao')).toBe('3.0.0');
    expect(r.hash).toBe('secao-4.3');
  });
  it('mapeia radar com item, painel com perspectiva e rota desconhecida', () => {
    expect(lerRota({ pathname: '/radar', search: '?item=ng012-ausente', hash: '' }).query.get('item')).toBe('ng012-ausente');
    expect(lerRota({ pathname: '/painel/financeiro', search: '?tema=locacao&prazo=30', hash: '' }).params.perspectiva).toBe('financeiro');
    expect(lerRota({ pathname: '/enviar/arq-1', search: '', hash: '' }).tela).toBe('revisar');
    expect(lerRota({ pathname: '/xyz', search: '', hash: '' }).tela).toBe('nao-encontrada');
  });
});

describe('Camada da norma (#11)', () => {
  it('segue a cadeia FL → PX → NG pelo "Vinculado a"', () => {
    expect(cadeiaDe('FL_1111-001')).toEqual(['FL_1111-001', 'PX_1111-001', 'NG_111']);
    expect(camadaDe('FL_1111-001')).toEqual({ sigla: 'FL', tipo_nome: 'Fluxo', grupo: 'Apoio', subordinado_a: 'PX_1111-001' });
    expect(camadaDe('NG_111').grupo).toBe('Normativo');
  });
  it('mostra a camada no chip de citação', () => {
    const { container } = render(<FonteChip fonte={{ codigo: 'FL_1111-001', versao: '1.0.0', secao: 'Etapas' }} />);
    expect(container.querySelector('.fonte-camada')).toHaveTextContent('Fluxo, segue a PX_1111-001');
  });
  it('mostra a cadeia no cabeçalho do documento', async () => {
    render(<DocumentoView codigo="FL_1111-001" onVoltar={() => undefined} onMudarVersao={() => undefined} />);
    expect(await screen.findByTestId('doc-cadeia')).toHaveTextContent('FL_1111-001 → PX_1111-001 → NG_111');
  });
});

describe('T4 Radar e T5 Lado a lado (#5)', () => {
  it('lista os 3 pontos com contadores e duas fontes clicáveis', async () => {
    render(<RadarView />);
    expect(await screen.findByTestId('contador-substituida')).toHaveTextContent('Regras que mudaram: 2');
    expect(screen.getByTestId('contador-ausente')).toHaveTextContent('Documentos que faltam: 1');
    const item = screen.getByTestId('radar-item-ferias-antecedencia');
    expect(item).toHaveTextContent(/v2\.0\.0, item 2\.3.*v3\.0\.0, item 4\.3/);
    expect(item).toHaveTextContent(/item 4\.3/);
    expect(screen.getByText('NG_012 citada por 5 documentos, não está no acervo.')).toBeInTheDocument();
  });
  it('mostra o estado vazio com filtro de tema', async () => {
    render(<RadarView tema="inexistente" />);
    expect(await screen.findByTestId('radar-vazio')).toHaveTextContent('Nenhum aviso para este assunto');
  });
  it('compara lado a lado com "vale a vigente" e a precedência declarada', async () => {
    render(<RadarView itemId="ferias-antecedencia" />);
    expect(await screen.findByTestId('coluna-substituida')).toHaveTextContent('Versão antiga');
    expect(screen.getByTestId('coluna-vigente')).toHaveTextContent('Em vigor');
    expect(screen.getByText(/Esta regra mudou. Vale a versão vigente 3.0.0./)).toBeInTheDocument();
    expect(screen.getByText(/Em divergência, prevalece a NG_111/)).toBeInTheDocument();
  });
  it('item inexistente avisa e volta ao radar', async () => {
    render(<RadarView itemId="nao-existe" />);
    expect(await screen.findByTestId('lado-inexistente')).toHaveTextContent('Ele pode ter sido resolvido');
  });
});

describe('T6 E se? (#5)', () => {
  it('com 30 dias quebra o aviso D-35: 4 conflitos e 5 documentos a revisar', () => {
    const r = simularFerias(30);
    expect(r.impactos.filter((i) => i.tipo !== 'revisar_documento')).toHaveLength(4);
    expect(r.impactos.filter((i) => i.tipo === 'revisar_documento')).toHaveLength(5);
    expect(r.resumo).toBe('Com 30 dias, o pedido vai até 05/04/2027 (D-30), no mesmo dia do prazo do aviso, 31/03/2027 (D-35).'.replace('no mesmo dia do', 'depois do'));
  });
  it('45 dias é o valor vigente, sem mudança', () => {
    expect(simularFerias(45).resumo).toBe('Nenhuma mudança: este é o valor vigente.');
  });
  it('mostra a faixa de simulação, a linha do tempo e o erro de valor fora da faixa', async () => {
    render(<ESeView valorInicial={30} />);
    expect(screen.getByRole('note')).toHaveTextContent('Simulação: nada muda nos documentos');
    expect(await screen.findByTestId('ese-conflitos')).toHaveTextContent('4 regras ficam em conflito');
    expect(screen.getByTestId('ese-linha-tempo')).toHaveTextContent('Conflito');
    fireEvent.change(screen.getByTestId('input-ese-valor'), { target: { value: '120' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Use um número entre 1 e 90 dias.');
  });
});

describe('T12 Lote e T13 Revisão (#16, #17)', () => {
  it('classifica pelo código, acusa duplicado, tipo inválido e sem tema', () => {
    expect(classificarArquivo('FL_1111-001.jpg', 1e6, 'a').estado).toBe('revisar');
    expect(classificarArquivo('FL_1111-001.jpg', 1e6, 'a').motivo).toContain('se liga à NG_111');
    expect(classificarArquivo('NG_111_v3.0.0.md', 1e3, 'b').erro).toBe('NG_111 v3.0.0 já existe no acervo. Altere a versão ou retire este arquivo.');
    expect(classificarArquivo('planilha.xlsx', 1e3, 'c').erro).toContain('não é aceito');
    expect(classificarArquivo('politica.pdf', 1e3, 'd').estado).toBe('sem-tema');
    expect(classificarArquivo('grande.pdf', 14 * 1048576, 'e').erro).toContain('o limite é 10 MB');
  });
  it('envia o lote de exemplo e bloqueia a publicação do arquivo sem tema', async () => {
    render(<EnviarView />);
    fireEvent.click(screen.getByTestId('btn-lote-exemplo'));
    expect(await screen.findByTestId('lote-resumo')).toHaveTextContent('0 de 4 arquivos prontos.');
    fireEvent.click(screen.getByTestId('btn-publicar-lote'));
    expect(screen.getByText(/Escolha o tema de politica_de_viagens.pdf antes de publicar./)).toBeInTheDocument();
  });
  it('revisão bloqueia sem conferir e sem versão, depois publica', () => {
    lote.definir([classificarArquivo('FL_1111-001.jpg', 1e6, 'arq-1')]);
    render(<RevisarView arquivoId="arq-1" />);
    expect(screen.getByTestId('revisao-falta')).toHaveTextContent('Falta conferir 1 linha e preencher a Versão.');
    expect(screen.getByTestId('btn-publicar-revisao')).toBeDisabled();
    fireEvent.click(screen.getByTestId('conferi-5'));
    fireEvent.change(screen.getByTestId('input-versao'), { target: { value: '1.0.0' } });
    fireEvent.click(screen.getByTestId('btn-publicar-revisao'));
    expect(screen.getByTestId('revisao-publicado')).toHaveTextContent('FL_1111-001 v1.0.0 publicado. Ele já pode ser citado.');
    expect(lote.ler()[0].estado).toBe('publicado');
  });
});

describe('M1 Registrar decisão (#18)', () => {
  it('registra e confirma com responsável', async () => {
    render(<DecisaoModal />);
    acoes.abrirDecisao({ item: 'Antecedência de férias', fontes: [{ codigo: 'NG_111', versao: '3.0.0', secao: '4.3' }], responsavel: 'GGC' });
    fireEvent.click(await screen.findByTestId('btn-registrar-decisao'));
    expect(await screen.findByTestId('decisao-ok')).toHaveTextContent(/Enviado para a GGC em/);
  });
});

describe('Avaliação (#12) e seleção para o relatório (#13)', () => {
  it('avalia a resposta com motivo e confirma', async () => {
    render(<PerguntarView onNavegarDocumento={() => undefined} perguntaInicial="Qual a antecedência mínima para solicitar férias?" />);
    fireEvent.click(await screen.findByTestId('btn-util-nao'));
    fireEvent.click(screen.getByLabelText('Faltou informação'));
    fireEvent.click(screen.getByTestId('btn-enviar-avaliacao'));
    expect(await screen.findByTestId('avaliacao-ok')).toHaveTextContent('Obrigado. Sua avaliação ajuda a melhorar as respostas.');
  });
  it('relatório da seleção: vazio, itens, reordenar e aviso de fonte que mudou', async () => {
    const { rerender } = render(<RelatorioSelecao />);
    expect(screen.getByTestId('selecao-vazia')).toBeInTheDocument();
    acoes.alternarSelecao({ id: 'a', texto: 'Antecedência 45 dias', fonte: { codigo: 'NG_111', versao: '3.0.0', secao: '4.3' } });
    acoes.alternarSelecao({ id: 'b', texto: 'Versão antiga: 30 dias', fonte: { codigo: 'NG_111', versao: '2.0.0', secao: '2.3' } });
    rerender(<RelatorioSelecao />);
    expect(screen.getByTestId('item-selecao-0')).toHaveTextContent('Antecedência 45 dias');
    fireEvent.click(screen.getByLabelText('Descer item 1'));
    expect(screen.getByTestId('item-selecao-0')).toHaveTextContent('Versão antiga: 30 dias');
    expect(await screen.findByTestId('fonte-mudou')).toHaveTextContent('A versão em vigor agora é a 3.0.0.');
  });
});

describe('T8 e T9: estados que faltavam (#15)', () => {
  it('documento inexistente', async () => {
    render(<DocumentoView codigo="FL_9999" onVoltar={() => undefined} onMudarVersao={() => undefined} />);
    expect(await screen.findByText('Não encontramos FL_9999. Confira o código ou volte ao catálogo.')).toBeInTheDocument();
  });
  it('seletor de versão no documento com duas versões', async () => {
    render(<DocumentoView codigo="NG_111" versao="2.0.0" onVoltar={() => undefined} onMudarVersao={() => undefined} />);
    expect(await screen.findByTestId('select-versao')).toBeInTheDocument();
    expect(screen.getByText(/a vigente é a 3.0.0/)).toBeInTheDocument();
  });
  it('O que mudou: versão anterior ausente (RG_1100) e documento com uma versão', async () => {
    const { unmount } = render(<CompararView onNavegarDocumento={() => undefined} codigoInicial="RG_1100" />);
    expect(screen.getByTestId('comparar-anterior-ausente')).toHaveTextContent('A versão 1.0.0 não está no acervo. Diferenças declaradas no Anexo K');
    unmount();
    render(<CompararView onNavegarDocumento={() => undefined} codigoInicial="CTR_2026-012" />);
    await waitFor(() => expect(screen.getByTestId('comparar-unica-versao')).toHaveTextContent('Este documento tem só uma versão no acervo.'));
  });
});

describe('Filtros de tema e prazo (#14)', () => {
  it('prazo dos próximos 30 dias no painel Pessoas não mostra prazos de 2027', async () => {
    render(<PerspectivasView onNavegarDocumento={() => undefined} perspectivaInicial="pessoas" prazo="30" />);
    expect(await screen.findByTestId('painel-filtro-vazio')).toHaveTextContent('Nenhum item neste filtro');
  });
});
