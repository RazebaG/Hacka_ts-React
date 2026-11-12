/**
 * Mocks do fluxo de telas v2 (radar, E se?, camada da norma, lote e digitalização),
 * no formato do adendo do contrato. Os trechos vêm do acervo ACME (data/acervo do backend).
 */
import {
  ArquivoLote,
  Camada,
  ImpactoSimulacao,
  RadarItem,
  RegraSimulavel,
  SimulacaoResultado
} from '../api/types';
import { MOCK_DOCUMENTOS } from './documentos';

export const DATA_REFERENCIA = '2026-11-12';

export const TEMAS: Record<string, string> = {
  ferias: 'Férias',
  inovacao: 'Inovação',
  locacao: 'Locação'
};

/* ---------- Camada da norma (RF42 / C15), pelo CATÁLOGO ---------- */
const TIPOS: Record<string, [string, string]> = {
  NG: ['Norma Geral', 'Normativo'],
  PX: ['Procedimento', 'Normativo'],
  PP: ['Padrão Operacional', 'Operacional'],
  GU: ['Guia', 'Apoio'],
  FM: ['Formulário', 'Apoio'],
  TB: ['Tabela', 'Apoio'],
  FL: ['Fluxo', 'Apoio'],
  RG: ['Regulamento de Programa', 'Programa'],
  CT: ['Comunicado Temporário', 'Temporário'],
  CTR: ['Contrato', 'Instrumento'],
  NT: ['Nota Técnica', 'Instrumento']
};

const vigente = (codigo: string) =>
  MOCK_DOCUMENTOS.find((d) => d.codigo === codigo && !d.substituido) ||
  MOCK_DOCUMENTOS.find((d) => d.codigo === codigo);

export function camadaDe(codigo: string): Camada {
  const sigla = codigo.split('_')[0];
  const [tipo_nome, grupo] = TIPOS[sigla] || [sigla, '—'];
  return { sigla, tipo_nome, grupo, subordinado_a: vigente(codigo)?.vinculado_a ?? null };
}

/** Cadeia de subordinação pelo "Vinculado a", até a norma geral (FL → PX → NG). */
export function cadeiaDe(codigo: string): string[] {
  const out = [codigo];
  let atual = vigente(codigo);
  while (atual?.vinculado_a && !out.includes(atual.vinculado_a)) {
    out.push(atual.vinculado_a);
    atual = vigente(atual.vinculado_a);
  }
  return out;
}

export const temaDe = (codigo: string): string => vigente(codigo)?.assunto ?? '';

/* ---------- Radar de contradições (RF17/RF19) ---------- */
export const MOCK_RADAR: RadarItem[] = [
  {
    id: 'ferias-antecedencia',
    tipo: 'versao_substituida',
    severidade: 'divergente',
    tema: ['ferias'],
    titulo: 'Antecedência de férias: a versão 2.0.0 dizia 30 dias, a vigente 3.0.0 exige 45.',
    explicacao: 'Esta regra mudou. Vale a versão vigente 3.0.0.',
    fontes: [
      {
        codigo: 'NG_111',
        versao: '2.0.0',
        secao: '2.3',
        trecho: 'A solicitação formal de férias devia ser efetuada com antecedência mínima de 30 (trinta) dias corridos.',
        situacao: 'substituida'
      },
      {
        codigo: 'NG_111',
        versao: '3.0.0',
        secao: '4.3',
        trecho: 'A solicitação formal é feita via Portal Raiz (FM_1111-001) com antecedência mínima de 45 dias corridos em relação à data de início do gozo.',
        situacao: 'vigente'
      }
    ],
    precedencia: {
      codigo: 'PX_1111-001',
      versao: '1.0.0',
      secao: '2.2',
      trecho: 'O procedimento herda a numeração da NG_111 e a ela se subordina. Em divergência, prevalece a NG_111.'
    },
    proxima_acao: 'Encaminhar à GGC para revisar os documentos que citam 30 dias.',
    responsavel: 'GGC',
    regra_simulavel: 'ferias_antecedencia_dias'
  },
  {
    id: 'formulario-ferias',
    tipo: 'versao_substituida',
    severidade: 'divergente',
    tema: ['ferias'],
    titulo: 'Formulário de férias: a versão 1.0.0 pedia 30 dias e envio em papel; a 2.0.0 segue a NG_111 v3.0.0.',
    explicacao: 'Este formulário mudou. Vale a versão vigente 2.0.0.',
    fontes: [
      {
        codigo: 'FM_1111-001',
        versao: '1.0.0',
        secao: '1',
        trecho: 'Formulário físico em papel para solicitação com 30 dias de antecedência.',
        situacao: 'substituida'
      },
      {
        codigo: 'FM_1111-001',
        versao: '2.0.0',
        secao: '2',
        trecho: 'Declaro ciência dos prazos previstos na NG_111 v3.0.0 e comprometo-me a assinar o aviso em até 5 dias úteis após sua emissão.',
        situacao: 'vigente'
      }
    ],
    proxima_acao: 'Encaminhar à GGC.',
    responsavel: 'GGC',
    regra_simulavel: 'ferias_antecedencia_dias'
  },
  {
    id: 'ng012-ausente',
    tipo: 'referencia_ausente',
    severidade: 'atencao',
    tema: ['locacao', 'inovacao'],
    titulo: 'NG_012 citada por 5 documentos, não está no acervo.',
    explicacao: 'As alçadas de aprovação vêm da NG_012. Sem o texto dela, o acervo só mostra o que os outros documentos citam.',
    codigo_ausente: 'NG_012',
    fontes: [],
    citado_por: [
      { codigo: 'NT_2026-018', versao: '1.0.0', secao: '3', trecho: 'A contratação de R$ 18.250,00 supera a alçada de gerente e fica na alçada de diretor, conforme a NG_012.' },
      { codigo: 'CTR_2026-012', versao: '1.0.0', secao: 'Apêndice J', trecho: 'NG_012 — Estabelece as alçadas de aprovação aplicáveis à contratação.' },
      { codigo: 'NG_1130', versao: '1.0.0', secao: '4.9', trecho: 'Gastos com inovação respeitam as alçadas da NG_012 e o orçamento anual descrito em nota técnica.' },
      { codigo: 'PX_1130-001', versao: '1.0.0', secao: '8.3.2', trecho: 'O gasto de prototipagem observa as alçadas da NG_012 e o orçamento da NT vigente.' },
      { codigo: 'NT_2026-021', versao: '1.0.0', secao: 'Anexo G', trecho: 'NG_012 — Norma das alçadas de aprovação.' }
    ],
    proxima_acao: 'Encaminhar à GCO.',
    responsavel: 'GCO'
  }
];

/* ---------- E se? (RF20/RF21), calculado sem IA ---------- */
export const MOCK_REGRAS: RegraSimulavel[] = [
  {
    id: 'ferias_antecedencia_dias',
    nome: 'Antecedência para pedir férias',
    unidade: 'dias',
    valor_atual: 45,
    minimo: 1,
    maximo: 90,
    fonte: { codigo: 'NG_111', versao: '3.0.0', secao: '4.3', trecho: '' }
  }
];

const DIA = 864e5;
const INICIO_FERIAS = Date.UTC(2027, 4, 5); // 05/05/2027, exemplo do Anexo C da NG_111
const fmt = (t: number) => new Date(t).toISOString().slice(0, 10).split('-').reverse().join('/');
const fonte45 = { codigo: 'NG_111', versao: '3.0.0', secao: '4.5', trecho: '' };

export function simularFerias(n: number): SimulacaoResultado {
  const pedido = INICIO_FERIAS - n * DIA;
  const decisao = pedido + 7 * DIA;
  const aviso = INICIO_FERIAS - 35 * DIA;
  const assinatura = INICIO_FERIAS - 30 * DIA;
  const impactos: ImpactoSimulacao[] = [];
  if (n < 45)
    impactos.push({ tipo: 'conflito_interno', descricao: 'Pedido com menos de 45 dias só é aceito por decisão do diretor da área.', fonte: { codigo: 'NG_111', versao: '3.0.0', secao: '4.3', trecho: '' } });
  if (n < 42)
    impactos.push({ tipo: 'conflito_decisao_gestor', descricao: `O gestor pode decidir até ${fmt(decisao)}, depois do prazo do aviso, ${fmt(aviso)} (D-35).`, fonte: { codigo: 'NG_111', versao: '3.0.0', secao: '4.6', trecho: '' } });
  if (n <= 35)
    impactos.push({ tipo: 'conflito_aviso', descricao: `O aviso da GGC, até ${fmt(aviso)} (D-35), fica ${n === 35 ? 'no mesmo dia do' : 'antes do'} pedido.`, fonte: fonte45 });
  if (n <= 30)
    impactos.push({ tipo: 'conflito_assinatura', descricao: `A assinatura do aviso, até ${fmt(assinatura)} (D-30), fica ${n === 30 ? 'no mesmo dia do' : 'antes do'} pedido.`, fonte: fonte45 });
  const revisar =
    n === 45
      ? []
      : ['NG_111', 'PX_1111-001', 'FM_1111-001', 'TB_1111-001', 'FL_1111-001'].map((codigo) => ({
          tipo: 'revisar_documento' as const,
          descricao: `Revisar ${codigo} antes de publicar a mudança.`,
          fonte: { codigo, versao: vigente(codigo)?.versao ?? '1.0.0', secao: vigente(codigo)?.secoes[0]?.id ?? '1', trecho: '' }
        }));
  let resumo: string;
  if (n === 45) resumo = 'Nenhuma mudança: este é o valor vigente.';
  else if (n <= 35) resumo = `Com ${n} dias, o pedido vai até ${fmt(pedido)} (D-${n}), ${n === 35 ? 'no mesmo dia do' : 'depois do'} prazo do aviso, ${fmt(aviso)} (D-35).`;
  else if (n < 42) resumo = `Com ${n} dias, o gestor pode decidir só em ${fmt(decisao)}, depois do prazo do aviso, ${fmt(aviso)} (D-35).`;
  else if (n < 45) resumo = `Com ${n} dias, os prazos ainda cabem, mas o item 4.3 continua exigindo decisão do diretor para pedidos com menos de 45 dias.`;
  else resumo = `Com ${n} dias, o pedido fica até ${fmt(pedido)} (D-${n}). Os prazos seguintes não mudam.`;
  return {
    regra: 'ferias_antecedencia_dias',
    valor: n,
    exemplo: 'Férias a partir de 05/05/2027',
    linha_do_tempo: [
      { etapa: 'Pedido', atual: `${fmt(INICIO_FERIAS - 45 * DIA)} (D-45)`, simulado: `${fmt(pedido)} (D-${n})`, muda: n !== 45, conflito: false },
      { etapa: 'Decisão do gestor (7 dias)', atual: fmt(INICIO_FERIAS - 38 * DIA), simulado: fmt(decisao), muda: n !== 45, conflito: n < 42 },
      { etapa: 'Aviso da GGC', atual: `${fmt(aviso)} (D-35)`, simulado: `${fmt(aviso)} (D-35)`, muda: false, conflito: n <= 35 },
      { etapa: 'Assinatura do aviso', atual: `até ${fmt(assinatura)} (D-30)`, simulado: `até ${fmt(assinatura)} (D-30)`, muda: false, conflito: n <= 30 },
      { etapa: 'Pagamento', atual: '30/04/2027', simulado: '30/04/2027', muda: false, conflito: false }
    ],
    impactos: [...impactos, ...revisar],
    resumo,
    aviso: ['Simulação: nada muda nos documentos até a norma ser revisada.'],
    proxima_acao: n === 45 ? '' : 'Encaminhar à GGC.'
  };
}

/* ---------- Lote com tema sugerido (RF35/RF36, regras 1 e 2) ---------- */
const SERIE = (codigo: string) => (/^(NG|PX|FM|TB|FL)_1\d\d/.test(codigo) ? 'Série 1 · Gente e Cultura' : codigo.startsWith('RG_11') ? 'Série 11 · Programas Institucionais' : '');

export function classificarArquivo(nome: string, tamanho: number, id: string): ArquivoLote {
  const base: ArquivoLote = { id, nome, tipo: 'digital', estado: 'classificado', tema: '', motivo: '', erro: '' };
  if (/\.(pdf|md)$/i.test(nome)) base.tipo = 'digital';
  else if (/\.(jpe?g|png)$/i.test(nome)) base.tipo = 'foto';
  else return { ...base, tipo: 'desconhecido', estado: 'erro', erro: 'Este tipo de arquivo não é aceito. Envie PDF, Markdown, JPG ou PNG.' };
  if (tamanho > 10 * 1048576)
    return { ...base, estado: 'erro', erro: `O arquivo tem ${Math.round(tamanho / 1048576)} MB e o limite é 10 MB. Reduza o tamanho e envie de novo.` };
  const m = nome.match(/(NG|PX|FM|TB|FL|RG|NT|CTR|CT)_\d+(-\d+)?/i);
  const codigo = m ? m[0].toUpperCase() : null;
  const doc = codigo ? vigente(codigo) : undefined;
  if (codigo && doc) {
    const versao = (nome.match(/v(\d+\.\d+\.\d+)/i) || [])[1];
    if (base.tipo === 'digital' && versao && MOCK_DOCUMENTOS.some((d) => d.codigo === codigo && d.versao === versao))
      return { ...base, estado: 'erro', erro: `${codigo} v${versao} já existe no acervo. Altere a versão ou retire este arquivo.` };
    const raiz = cadeiaDe(codigo).slice(-1)[0];
    const serie = SERIE(codigo);
    base.tema = doc.assunto;
    base.motivo = (doc.vinculado_a ? `o código ${codigo} se liga à ${raiz}` : doc.referencia ? `o ${codigo} tem Referência: ${doc.referencia}` : `o código ${codigo} pertence a ${TEMAS[doc.assunto]}`) + (serie ? ` (${serie})` : '');
  } else {
    base.estado = 'sem-tema';
    base.motivo = 'Sem código no nome ou no cabeçalho.';
  }
  if (base.tipo === 'foto') base.estado = 'revisar';
  return base;
}

export const LOTE_EXEMPLO: [string, number][] = [
  ['FL_1111-001.jpg', 1.8e6],
  ['politica_de_viagens.pdf', 0.4e6],
  ['NG_111_v3.0.0.md', 0.02e6],
  ['planilha_custos.xlsx', 0.1e6]
];

/* ---------- Digitalização: texto lido da foto do FL_1111-001 ---------- */
export const LEITURA_FL = [
  { texto: 'Empregado registra intenção de gozo – outubro', incerta: false },
  { texto: 'Gestor consolida a equipe – até 30/11', incerta: false },
  { texto: 'GGC publica calendário – até 15/12', incerta: false },
  { texto: 'Empregado solicita no Portal Raiz – até D-45', incerta: false },
  { texto: 'Gestor decide em até 7 dias; sem decisão, o diretor decide em até 3 dias úteis', incerta: false },
  { texto: 'GGC emite av?so – até D-35', incerta: true },
  { texto: 'Empregado assina – até 5 dias úteis e D-30', incerta: false },
  { texto: 'GFI paga – até D-3', incerta: false }
];
