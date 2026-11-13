import { DocumentoDetalhe, DocumentoResumo } from '../api/types';
import secoesReais from './secoes-reais.json';

export const MOCK_DOCUMENTOS: DocumentoDetalhe[] = [
  {
    codigo: 'NG_111',
    titulo: 'Férias',
    tipo: 'NG',
    tipo_nome: 'Norma Geral',
    versao: '3.0.0',
    fase: 'Vigente',
    vigencia: '03/08/2026 a 03/02/2028',
    vinculado_a: null,
    referencia: null,
    assunto: 'ferias',
    substituido: false,
    secoes: [
      {
        id: '1',
        titulo: 'Objetivo',
        texto: 'Estabelecer as diretrizes para programação, solicitação, aprovação, aviso, pagamento, alteração e cancelamento de férias dos empregados da ACME.'
      },
      {
        id: '2.2',
        titulo: 'Substituição',
        texto: 'Esta norma substitui a NG_111 versão 2.0.0.'
      },
      {
        id: '2.3',
        titulo: 'Documentos Vinculados',
        texto: 'Os procedimentos operacionais constam do PX_1111-001; o formulário, do FM_1111-001; tabelas de prazos em TB_1111-001 e fluxo em FL_1111-001.'
      },
      {
        id: '4.1',
        titulo: 'Direito e Período',
        texto: 'Cada 12 meses de período aquisitivo geram 30 dias corridos de férias. As férias devem ser gozadas dentro do período concessivo.'
      },
      {
        id: '4.2',
        titulo: 'Programação Anual',
        texto: 'Entre 1º e 31 de outubro de cada ano, o empregado registra no Portal Raiz a programação de férias para o ano seguinte. O gestor consolida até 30 de novembro e a GGC publica o calendário até 15 de dezembro.'
      },
      {
        id: '4.3',
        titulo: 'Solicitação e Prazos',
        texto: 'A solicitação formal é feita via Portal Raiz (FM_1111-001) com antecedência mínima de 45 dias corridos em relação à data de início do gozo. Solicitação com menos de 45 dias só é aceita por decisão expressa do diretor da área.'
      },
      {
        id: '4.3.1',
        titulo: 'Solicitação Formal (Antecedência 45 dias)',
        texto: 'A antecedência mínima para solicitação de férias é de 45 (quarenta e cinco) dias corridos do início de gozo no Portal Raiz (FM_1111-001). Solicitações com prazo inferior exigem aprovação expressa do diretor da área.'
      },
      {
        id: '4.4',
        titulo: 'Fracionamento',
        texto: 'As férias podem ser divididas em até 3 períodos. Um dos períodos deve ter no mínimo 14 dias corridos; os demais, no mínimo 5 dias corridos cada.'
      },
      {
        id: '4.5',
        titulo: 'Prazos em Camadas',
        texto: 'Solicitação: até 45 dias antes. Decisão do gestor: até 7 dias corridos. Emissão do aviso pela GGC: até 35 dias antes. Assinatura do aviso pelo empregado: até 5 dias úteis após emissão. Pagamento pela GFI: até 3 dias corridos antes do início.'
      },
      {
        id: '4.6',
        titulo: 'Decisão do Gestor',
        texto: 'O gestor imediato aprova, recusa com justificativa ou propõe nova data em até 7 dias corridos. No máximo 30% da equipe pode estar em férias simultaneamente.'
      },
      {
        id: '4.7',
        titulo: 'Abono Pecuniário',
        texto: 'O empregado pode converter até 10 dias em abono pecuniário (venda de férias), solicitado junto ao pedido principal e nunca com menos de 15 dias de antecedência.'
      }
    ]
  },
  {
    codigo: 'NG_111',
    titulo: 'Férias (Versão Anterior)',
    tipo: 'NG',
    tipo_nome: 'Norma Geral',
    versao: '2.0.0',
    fase: 'Substituída',
    vigencia: '10/12/2025 a 02/08/2026',
    vinculado_a: null,
    referencia: null,
    assunto: 'ferias',
    substituido: true,
    secoes: [
      {
        id: '1',
        titulo: 'Objetivo',
        texto: 'Regulamentar o processo de concessão e gozo de férias dos empregados.'
      },
      {
        id: '2.3',
        titulo: 'Antecedência Anterior',
        texto: 'A solicitação formal de férias devia ser efetuada com antecedência mínima de 30 (trinta) dias corridos.'
      },
      {
        id: '4.1',
        titulo: 'Aviso',
        texto: 'O aviso de férias era emitido com 30 dias de antecedência.'
      }
    ]
  },
  {
    codigo: 'PX_1111-001',
    titulo: 'Procedimento de Férias',
    tipo: 'PX',
    tipo_nome: 'Procedimento',
    versao: '1.0.0',
    fase: 'Vigente',
    vigencia: '03/08/2026 a 03/02/2028',
    vinculado_a: 'NG_111',
    referencia: 'FM_1111-001, TB_1111-001',
    assunto: 'ferias',
    substituido: false,
    secoes: [
      {
        id: '1',
        titulo: 'Finalidade',
        texto: 'Instruir passo a passo o processo de programação, solicitação, aprovação e homologação de férias no Portal Raiz.'
      },
      {
        id: '2.2',
        titulo: 'Subordinação',
        texto: 'O procedimento herda a numeração da NG_111 e a ela se subordina. Em divergência, prevalece a NG_111.'
      },
      {
        id: '3.1',
        titulo: 'Passo a Passo da Solicitação',
        texto: 'O empregado acessa o Portal Raiz > Módulo Férias > Solicitar Férias, preenchendo as datas e eventual opção por abono ou adiantamento de 13º.'
      },
      {
        id: 'Anexo D',
        titulo: 'Checklist de Validação pelo RH',
        texto: 'A Gerência de Gente e Cultura (GGC) confere saldo do período aquisitivo, antecedência de 45 dias e limite de 30% da equipe antes de expedir o aviso formal.'
      }
    ]
  },
  {
    codigo: 'FM_1111-001',
    titulo: 'Solicitação de Férias',
    tipo: 'FM',
    tipo_nome: 'Formulário',
    versao: '2.0.0',
    fase: 'Vigente',
    vigencia: '03/08/2026 a 03/02/2028',
    vinculado_a: 'NG_111',
    referencia: null,
    assunto: 'ferias',
    substituido: false,
    secoes: [
      {
        id: '1',
        titulo: 'Campos Obrigatórios',
        texto: 'Matrícula, nome, período aquisitivo, data de início, quantidade de dias (fracionamento 1, 2 ou 3), opção de abono pecuniário (sim/não e dias).'
      },
      {
        id: '2',
        titulo: 'Termo de Ciência',
        texto: 'Declaro ciência dos prazos previstos na NG_111 v3.0.0 e comprometo-me a assinar o aviso em até 5 dias úteis após sua emissão.'
      }
    ]
  },
  {
    codigo: 'FM_1111-001',
    titulo: 'Solicitação de Férias (Versão Anterior)',
    tipo: 'FM',
    tipo_nome: 'Formulário',
    versao: '1.0.0',
    fase: 'Substituída',
    vigencia: '10/12/2025 a 02/08/2026',
    vinculado_a: 'NG_111',
    referencia: null,
    assunto: 'ferias',
    substituido: true,
    secoes: [
      {
        id: '1',
        titulo: 'Campos Anteriores',
        texto: 'Formulário físico em papel para solicitação com 30 dias de antecedência.'
      }
    ]
  },
  {
    codigo: 'TB_1111-001',
    titulo: 'Tabelas de Férias',
    tipo: 'TB',
    tipo_nome: 'Tabela',
    versao: '1.0.0',
    fase: 'Vigente',
    vigencia: '03/08/2026 a 03/02/2028',
    vinculado_a: 'NG_111',
    referencia: null,
    assunto: 'ferias',
    substituido: false,
    secoes: [
      {
        id: 'Tabela 1',
        titulo: 'Prazos Críticos por Marco',
        texto: 'D-45: Solicitação formal; D-38: Decisão gestor; D-35: Emissão do aviso pela GGC; D-30: Assinatura do aviso; D-3: Pagamento pela GFI.'
      },
      {
        id: 'Tabela 2',
        titulo: 'Exemplo Calendário Gozo em 05/05/2027',
        texto: 'Solicitação: 21/03/2027; Decisão gestor: 31/03/2027; Aviso GGC: 05/04/2027; Assinatura: 15/04/2027; Pagamento: 30/04/2027 (antecipado de 02/05 que cai em domingo).'
      }
    ]
  },
  {
    codigo: 'FL_1111-001',
    titulo: 'Fluxograma de Férias',
    tipo: 'FL',
    tipo_nome: 'Fluxo',
    versao: '1.0.0',
    fase: 'Vigente',
    vigencia: '03/08/2026 a 03/02/2028',
    vinculado_a: 'PX_1111-001',
    referencia: null,
    assunto: 'ferias',
    substituido: false,
    secoes: [
      {
        id: 'Etapas',
        titulo: 'Fluxo Operacional',
        texto: 'Empregado solicita no Portal Raiz -> Gestor avalia em até 7 dias -> GGC emite aviso em D-35 -> Empregado assina em 5 dias úteis -> GFI executa crédito em D-3 -> Início do gozo.'
      }
    ]
  },
  {
    codigo: 'NG_1130',
    titulo: 'Gestão da Inovação',
    tipo: 'NG',
    tipo_nome: 'Norma Geral',
    versao: '1.0.0',
    fase: 'Vigente',
    vigencia: '15/01/2026 a 15/07/2027',
    vinculado_a: null,
    referencia: null,
    assunto: 'inovacao',
    substituido: false,
    secoes: [
      {
        id: '1',
        titulo: 'Objetivo',
        texto: 'Diretrizes corporativas para incentivo, submissão, avaliação e implementação de inovações e melhorias de processos.'
      },
      {
        id: '3',
        titulo: 'Governança da Inovação',
        texto: 'O Comitê de Inovação coordena as rodadas temáticas e aprova a transição de ideias pelo funil de inovação.'
      },
      {
        id: '4.9',
        titulo: 'Alçadas e Orçamento',
        texto: 'Gastos com inovação respeitam as alçadas da NG_012 e o orçamento anual descrito em nota técnica.'
      }
    ]
  },
  {
    codigo: 'PX_1130-001',
    titulo: 'Funil de Inovação',
    tipo: 'PX',
    tipo_nome: 'Procedimento',
    versao: '1.0.0',
    fase: 'Vigente',
    vigencia: '15/01/2026 a 15/07/2027',
    vinculado_a: 'NG_1130',
    referencia: null,
    assunto: 'inovacao',
    substituido: false,
    secoes: [
      {
        id: '1',
        titulo: 'Fases do Funil',
        texto: 'Fase 1: Triagem e Elegibilidade; Fase 2: Avaliação Técnica; Fase 3: Prova de Conceito (PoC); Fase 4: Homologação e Premiação.'
      },
      {
        id: '8.3.2',
        titulo: 'Gasto de Prototipagem',
        texto: 'O gasto de prototipagem observa as alçadas da NG_012 e o orçamento da NT vigente.'
      }
    ]
  },
  {
    codigo: 'RG_1100',
    titulo: 'Regulamento do Programa Ideias em Campo',
    tipo: 'RG',
    tipo_nome: 'Regulamento de Programa',
    versao: '2.0.0',
    fase: 'Vigente',
    vigencia: '01/02/2026 a 01/08/2027',
    vinculado_a: 'NG_1130',
    referencia: null,
    assunto: 'inovacao',
    substituido: false,
    secoes: [
      {
        id: '1',
        titulo: 'Objetivo do Programa',
        texto: 'Reconhecer e premiar ideias inovadoras propostas pelos colaboradores para melhoria de produtividade e redução de custos.'
      },
      {
        id: '5.2',
        titulo: 'Premiação e Reconhecimento',
        texto: 'Ideias da Categoria A farão jus a prêmio financeiro de reconhecimento de até R$ 15.000,00, concedido após a validação dos ganhos no período de homologação.'
      }
    ]
  },
  {
    codigo: 'NT_2026-021',
    titulo: 'Orçamento, Competências e Elegibilidade — Ideias em Campo 2027',
    tipo: 'NT',
    tipo_nome: 'Nota Técnica',
    versao: '1.0.0',
    fase: 'Vigente',
    vigencia: '10/06/2026 a 10/12/2027',
    vinculado_a: 'RG_1100',
    referencia: null,
    assunto: 'inovacao',
    substituido: false,
    secoes: [
      {
        id: '2',
        titulo: 'Dotação Orçamentária',
        texto: 'O orçamento anual alocado para desenvolvimento de PoCs e premiações do ciclo 2027 é de R$ 180.000,00.'
      },
      {
        id: 'Anexo G',
        titulo: 'Documentos Relacionados',
        texto: 'NG_012 — Norma das alçadas de aprovação.'
      }
    ]
  },
  {
    codigo: 'CTR_2026-012',
    titulo: 'Locação de Espaço de Coworking',
    tipo: 'CTR',
    tipo_nome: 'Contrato',
    versao: '1.0.0',
    fase: 'Vigente',
    vigencia: '30/11/2026 a 29/04/2027',
    vinculado_a: null,
    referencia: 'NT_2026-018',
    assunto: 'locacao',
    substituido: false,
    secoes: [
      {
        id: 'Cláusula Primeira',
        titulo: 'Objeto',
        texto: 'Contratação de postos de trabalho e salas de reunião em regime de coworking corporativo para atender equipes de inovação e suporte regional.'
      },
      {
        id: 'Cláusula Sétima',
        titulo: 'Do Preço e Valor Global',
        texto: 'O aluguel mensal é de R$ 3.650,00, perfazendo o valor global de R$ 18.250,00 para os 5 meses de vigência.'
      },
      {
        id: 'Cláusula Décima Primeira',
        titulo: 'Das Penalidades e Multas',
        texto: 'Multa compensatória de 5% (cinco por cento) sobre o valor total do contrato, perfazendo R$ 912,50, em caso de descumprimento total ou rescisão injustificada.'
      },
      {
        id: 'Apêndice B',
        titulo: 'Tabela de Encargos, Alçadas e Penalidades',
        texto: 'Multa por inexecução contratual: 5% × R$ 18.250,00 = R$ 912,50. Multa por rescisão até 90º dia: R$ 3.650,00. Fiscal técnico: GOC, com prazo de 5 dias úteis para ateste. Vistoria final agendada para 25/11/2026.'
      },
      {
        id: 'Apêndice J',
        titulo: 'Documentos Relacionados',
        texto: 'NG_012 — Estabelece as alçadas de aprovação aplicáveis à contratação.'
      }
    ]
  },
  {
    codigo: 'NT_2026-018',
    titulo: 'Nota Técnica de Contratação — Espaço de Coworking',
    tipo: 'NT',
    tipo_nome: 'Nota Técnica',
    versao: '1.0.0',
    fase: 'Vigente',
    vigencia: '15/02/2026 a 15/02/2027',
    vinculado_a: null,
    referencia: 'CTR_2026-012',
    assunto: 'locacao',
    substituido: false,
    secoes: [
      {
        id: '3',
        titulo: 'Justificativa de Preço e Alçadas',
        texto: 'O valor global de R$ 18.250,00 supera a alçada de gerente (R$ 18.000,00) e fica na alçada de diretor (até R$ 120.000,00), conforme a NG_012; por isso a DIRAF aprova.'
      }
    ]
  }
];

/**
 * O contrato do acervo tem 43 seções; o mock abreviado tinha só 5. As 43 vêm do acervo real do backend
 * (data/acervo/locacao/CTR_2026-012), para o mapa de calor e o pop-up da seção terem o texto de verdade.
 */
const REAIS = secoesReais as Record<string, { versao: string; secoes: { id: string; titulo: string; texto: string }[] }>;
for (const d of MOCK_DOCUMENTOS) {
  const r = REAIS[d.codigo];
  if (r && r.versao === d.versao) d.secoes = r.secoes;
}

export function getDocumentoByCodigo(codigo: string, versao?: string): DocumentoDetalhe | undefined {
  if (versao) {
    return MOCK_DOCUMENTOS.find(d => d.codigo === codigo && d.versao === versao);
  }
  // Se não passou versão, retorna a vigente prioritariamente
  const vigentes = MOCK_DOCUMENTOS.filter(d => d.codigo === codigo && !d.substituido);
  if (vigentes.length > 0) return vigentes[0];
  return MOCK_DOCUMENTOS.find(d => d.codigo === codigo);
}

export function getResumoDocumentos(): DocumentoResumo[] {
  return MOCK_DOCUMENTOS.map(({ secoes, ...resumo }) => resumo);
}
