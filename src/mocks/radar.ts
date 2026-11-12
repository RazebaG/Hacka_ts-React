import { RadarItem, RadarResponse } from '../api/types';

export const MOCK_RADAR_ITENS: RadarItem[] = [
  {
    id: 'versao-NG_111-antecedencia',
    tipo: 'versao_substituida',
    status: 'divergente',
    severidade: 'alta',
    titulo: 'Antecedência de férias: v2 dizia 30 dias, v3 exige 45',
    explicacao: 'A versão vigente prevalece; a 2.0.0 foi substituída.',
    perspectivas: ['pessoas'],
    codigo_ausente: null,
    fontes: [
      {
        codigo: 'NG_111',
        versao: '3.0.0',
        secao: '4.3.1',
        trecho:
          'A antecedência mínima para solicitação de férias é de 45 (quarenta e cinco) dias corridos do início de gozo no Portal Raiz (FM_1111-001).'
      },
      {
        codigo: 'NG_111',
        versao: '2.0.0',
        secao: '2.3',
        trecho:
          'A solicitação formal de férias devia ser efetuada com antecedência mínima de 30 (trinta) dias corridos.'
      }
    ]
  },
  {
    id: 'versao-FM_1111-001-fluxo',
    tipo: 'versao_substituida',
    status: 'divergente',
    severidade: 'media',
    titulo:
      'Formulário de férias: v1 previa 30 dias e envio físico ao gerente, v2 exige 45 dias no Portal Raiz',
    explicacao:
      'A versão 2.0.0 substituiu a v1.0.0 com novo prazo de antecedência e fluxo digital via Portal Raiz.',
    perspectivas: ['pessoas', 'gestao'],
    codigo_ausente: null,
    fontes: [
      {
        codigo: 'FM_1111-001',
        versao: '2.0.0',
        secao: '1',
        trecho:
          'Preenchimento exclusivamente eletrônico via Portal Raiz com antecedência mínima de 45 dias corridos.'
      },
      {
        codigo: 'FM_1111-001',
        versao: '1.0.0',
        secao: '1',
        trecho:
          'Preenchimento manual do formulário com antecedência mínima de 30 dias corridos e envio físico ao gerente.'
      }
    ]
  },
  {
    id: 'ausente-NG_012',
    tipo: 'referencia_ausente',
    status: 'atencao',
    severidade: 'alta',
    titulo: 'Norma NG_012 citada como base das alçadas na NT_2026-018 mas ausente do acervo',
    explicacao:
      'Documento citado na Nota Técnica NT_2026-018 que não consta no acervo central de normas da ACME.',
    perspectivas: ['financeiro', 'juridico'],
    codigo_ausente: 'NG_012',
    citado_por: ['NT_2026-018'],
    fontes: [
      {
        codigo: 'NT_2026-018',
        versao: '1.0.0',
        secao: '3',
        trecho:
          'A contratação de R$ 18.250,00 enquadra-se na alçada decisória de Gerente Executivo e Diretor Administrativo e Financeiro conforme limites da NG_012.'
      }
    ]
  }
];

export function getRadarMock(perspectiva?: string): RadarResponse {
  const itensFiltrados = perspectiva && perspectiva !== 'todos'
    ? MOCK_RADAR_ITENS.filter((item) => item.perspectivas.includes(perspectiva))
    : [...MOCK_RADAR_ITENS];

  const divergente = itensFiltrados.filter((i) => i.status === 'divergente').length;
  const atencao = itensFiltrados.filter((i) => i.status === 'atencao').length;

  return {
    gerado_em: '2026-11-12T15:00:00-03:00',
    resumo: {
      divergente,
      atencao
    },
    itens: itensFiltrados
  };
}
