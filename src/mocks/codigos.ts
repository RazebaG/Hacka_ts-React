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
    observacao: 'Procedimento operacional subordinado à Norma Geral de Férias NG_111 (Cena 1 do Pitch).'
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
  'PX_1130-001': {
    codigo: 'PX_1130-001',
    tipo: 'PX',
    tipo_nome: 'Procedimento',
    vinculado_a: 'NG_1130',
    serie: '1',
    serie_nome: 'Gente e Cultura',
    vigencia_regra: '18 meses a partir da aprovação',
    existe_no_acervo: true,
    observacao: 'Procedimento operacional subordinado à Norma Geral de Governança e Transparência NG_1130.'
  },
  'RG_1100': {
    codigo: 'RG_1100',
    tipo: 'RG',
    tipo_nome: 'Regulamento',
    vinculado_a: null,
    serie: '11',
    serie_nome: 'Programas Institucionais',
    vigencia_regra: 'Vigência indeterminada conforme necessidade institucional',
    existe_no_acervo: true,
    observacao: 'Regulamento do Programa Ideias em Campo (Inovação Tecnológica).'
  },
  'CTR_2026-012': {
    codigo: 'CTR_2026-012',
    tipo: 'CTR',
    tipo_nome: 'Contrato',
    vinculado_a: null,
    serie: '2026',
    serie_nome: 'Contratos 2026',
    vigencia_regra: '12 meses (vigência contratual)',
    existe_no_acervo: true,
    observacao: 'Contrato de locação corporativa de espaço de coworking (Cena 2 do Pitch).'
  },
  'NT_2026-021': {
    codigo: 'NT_2026-021',
    tipo: 'NT',
    tipo_nome: 'Nota Técnica',
    vinculado_a: null,
    serie: '2026',
    serie_nome: 'Notas Técnicas 2026',
    vigencia_regra: 'Vigência associada à vigência do tema técnico de apoio',
    existe_no_acervo: true,
    observacao: 'Nota Técnica de diretrizes e pontuação do programa de inovação.'
  },
  'NT_2026-018': {
    codigo: 'NT_2026-018',
    tipo: 'NT',
    tipo_nome: 'Nota Técnica',
    vinculado_a: null,
    serie: '2026',
    serie_nome: 'Notas Técnicas 2026',
    vigencia_regra: 'Vigência associada à vigência do tema técnico',
    existe_no_acervo: true,
    observacao: 'Nota Técnica de alçadas financeiras; cita a norma NG_012 ausente do acervo.'
  },
  'CT_Dirtec — 2026/003': {
    codigo: 'CT_Dirtec — 2026/003',
    tipo: 'CT',
    tipo_nome: 'Carta',
    vinculado_a: null,
    serie: '2026',
    serie_nome: 'Comunicações 2026',
    vigencia_regra: 'CT ≤ 150 dias (vigência transitória)',
    existe_no_acervo: true,
    observacao: 'Carta da Diretoria Técnica sobre prazos de implantação de pilotos.'
  },
  'CT_DIRTEC-2026-003': {
    codigo: 'CT_DIRTEC-2026-003',
    tipo: 'CT',
    tipo_nome: 'Carta',
    vinculado_a: null,
    serie: '2026',
    serie_nome: 'Comunicações 2026',
    vigencia_regra: 'CT ≤ 150 dias (vigência transitória)',
    existe_no_acervo: true,
    observacao: 'Carta da Diretoria Técnica sobre prazos de implantação de pilotos (formato normalizado).'
  },
  'NG_012': {
    codigo: 'NG_012',
    tipo: 'NG',
    tipo_nome: 'Norma Geral',
    vinculado_a: null,
    serie: '0',
    serie_nome: 'Estrutura e Governança',
    vigencia_regra: '18 meses a partir da aprovação',
    existe_no_acervo: false,
    observacao: 'Documento citado na Nota Técnica NT_2026-018 como base regulatória de alçadas, porém NÃO está arquivado no acervo central (alerta do Radar de Contradições).'
  },
  'FM_1111-001': {
    codigo: 'FM_1111-001',
    tipo: 'FM',
    tipo_nome: 'Formulário',
    vinculado_a: 'NG_111',
    serie: '1',
    serie_nome: 'Gente e Cultura',
    vigencia_regra: 'Vigência vinculada à norma geral NG_111',
    existe_no_acervo: true,
    observacao: 'Formulário padrão de solicitação e agendamento de férias.'
  },
  'TB_1111-001': {
    codigo: 'TB_1111-001',
    tipo: 'TB',
    tipo_nome: 'Tabela',
    vinculado_a: 'NG_111',
    serie: '1',
    serie_nome: 'Gente e Cultura',
    vigencia_regra: 'Vigência vinculada ao procedimento operacional PX_1111-001',
    existe_no_acervo: true,
    observacao: 'Tabela de prazos e marcos de férias (D-45 até D-3).'
  },
  'FL_1111-001': {
    codigo: 'FL_1111-001',
    tipo: 'FL',
    tipo_nome: 'Fluxograma',
    vinculado_a: 'PX_1111-001',
    serie: '1',
    serie_nome: 'Gente e Cultura',
    vigencia_regra: 'Vigência vinculada ao procedimento operacional PX_1111-001',
    existe_no_acervo: true,
    observacao: 'Fluxograma de tramitação do pedido de férias via Portal Raiz.'
  }
};

const SIGLAS_CATALOGO: Record<string, { nome: string; vigencia: string }> = {
  NG: { nome: 'Norma Geral', vigencia: '18 meses a partir da aprovação' },
  PX: { nome: 'Procedimento', vigencia: '18 meses a partir da aprovação' },
  GU: { nome: 'Guia', vigencia: '18 meses a partir da aprovação' },
  MT: { nome: 'Manual Técnico', vigencia: '18 meses a partir da aprovação' },
  FM: { nome: 'Formulário', vigencia: 'Vigência vinculada ao documento pai' },
  TB: { nome: 'Tabela', vigencia: 'Vigência vinculada ao documento pai' },
  FL: { nome: 'Fluxograma', vigencia: 'Vigência vinculada ao documento pai' },
  RG: { nome: 'Regulamento', vigencia: 'Vigência indeterminada conforme necessidade' },
  CTR: { nome: 'Contrato', vigencia: 'Vigência contratual conforme termo assinado' },
  NT: { nome: 'Nota Técnica', vigencia: 'Vigência técnica associada à matéria' },
  CT: { nome: 'Carta', vigencia: 'CT ≤ 150 dias (vigência transitória)' }
};

export function getCodigoInfoMock(codigo: string): CodigoInfo {
  const limpo = codigo.trim();
  if (MOCK_CODIGOS[limpo]) {
    return MOCK_CODIGOS[limpo];
  }

  // Tenta busca insensível a maiúsculas/espaços
  const matchKey = Object.keys(MOCK_CODIGOS).find(
    (k) => k.toLowerCase() === limpo.toLowerCase()
  );
  if (matchKey) {
    return MOCK_CODIGOS[matchKey];
  }

  // Extrai prefixo para dedução taxonômica conforme CATÁLOGO seções 2, 3 e 5
  const partes = limpo.split(/[_-]/);
  const sigla = (partes[0] || '').toUpperCase();
  const infoSigla = SIGLAS_CATALOGO[sigla];

  if (infoSigla) {
    return {
      codigo: limpo,
      tipo: sigla,
      tipo_nome: infoSigla.nome,
      vinculado_a: sigla === 'PX' || sigla === 'FM' || sigla === 'TB' || sigla === 'FL' ? 'NG_111' : null,
      serie: partes[1]?.charAt(0) || '1',
      serie_nome: 'Série Regular',
      vigencia_regra: infoSigla.vigencia,
      existe_no_acervo: false,
      observacao: `Código decodificado com base nas regras taxonômicas do CATÁLOGO v1.0 (§2, §3 e §5). Não consta no acervo arquivado.`
    };
  }

  return {
    codigo: limpo,
    tipo: sigla || 'DESCONHECIDO',
    tipo_nome: 'Documento Não Classificado',
    vinculado_a: null,
    serie: '—',
    serie_nome: 'Não Definida',
    vigencia_regra: 'Conforme termo ou ato específico',
    existe_no_acervo: false,
    observacao: 'Código não encontrado no índice direto nem reconhecido no padrão taxonômico do acervo ACME.'
  };
}
