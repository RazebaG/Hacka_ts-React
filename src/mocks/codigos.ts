import { CodigoInfo } from '../api/types';

export const MOCK_CODIGOS: Record<string, CodigoInfo> = {
  'PX_1111-001': {
    codigo: 'PX_1111-001',
    tipo: 'PX',
    tipo_nome: 'Procedimento',
    vinculado_a: 'NG_111',
    serie: '1',
    serie_nome: 'Gente e Cultura',
    vigencia_regra: '18 meses a partir da aprovação',
    existe_no_acervo: true,
    observacao: 'Procedimento operacional subordinado à Norma Geral de Férias NG_111.'
  },
  'NG_111': {
    codigo: 'NG_111',
    tipo: 'NG',
    tipo_nome: 'Norma Geral',
    vinculado_a: null,
    serie: '1',
    serie_nome: 'Gente e Cultura',
    vigencia_regra: '18 meses a partir da aprovação',
    existe_no_acervo: true,
    observacao: 'Norma Geral de Férias da ACME. Dá número aos procedimentos e formulários vinculados.'
  },
  'CTR_2026-012': {
    codigo: 'CTR_2026-012',
    tipo: 'CTR',
    tipo_nome: 'Contrato',
    vinculado_a: null,
    serie: '2026',
    serie_nome: 'Contratos 2026',
    vigencia_regra: '12 meses',
    existe_no_acervo: true,
    observacao: 'Contrato de locação de espaço de coworking corporativo.'
  }
};

export function getCodigoInfoMock(codigo: string): CodigoInfo {
  if (MOCK_CODIGOS[codigo]) {
    return MOCK_CODIGOS[codigo];
  }
  return {
    codigo,
    tipo: codigo.split('_')[0] || 'DESCONHECIDO',
    tipo_nome: 'Documento Técnico',
    vinculado_a: null,
    serie: '1',
    serie_nome: 'Geral',
    vigencia_regra: '18 meses',
    existe_no_acervo: false,
    observacao: 'Código não encontrado no índice direto do acervo sintético.'
  };
}
