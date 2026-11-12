import { PerfilUsuario, RespostaPerguntar } from '../api/types';

export interface ExemploPergunta {
  id: string;
  pergunta: string;
  descricao: string;
  resposta: RespostaPerguntar;
}

export const EXEMPLOS_PERGUNTAS: ExemploPergunta[] = [
  {
    id: 'prazo-ferias-substituicao',
    pergunta: 'Qual a antecedência mínima para solicitar férias?',
    descricao: 'Demonstra citação da versão vigente e aviso de norma substituída',
    resposta: {
      resposta: 'Conforme a norma vigente NG_111 versão 3.0.0 (item 4.3.1), a solicitação formal de férias deve ser registrada com antecedência mínima de 45 (quarenta e cinco) dias corridos em relação ao primeiro dia de férias. Solicitações com prazo inferior somente podem ser autorizadas por decisão excepcional do Diretor da área.',
      consta: true,
      citacoes: [
        {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.3',
          trecho: 'A solicitação formal é feita via Portal Raiz (FM_1111-001) com antecedência mínima de 45 dias corridos em relação à data de início do gozo. Solicitação com menos de 45 dias só é aceita por decisão expressa do diretor da área.'
        },
        {
          codigo: 'TB_1111-001',
          versao: '1.0.0',
          secao: 'Tabela 1',
          trecho: 'D-45: Solicitação formal; D-38: Decisão gestor; D-35: Emissão do aviso pela GGC; D-30: Assinatura do aviso; D-3: Pagamento pela GFI.'
        }
      ],
      avisos: [
        'Atenção: A norma NG_111 v2.0.0 foi substituída pela v3.0.0. Na versão anterior, o prazo mínimo de antecedência era de 30 dias corridos.'
      ]
    }
  },
  {
    id: 'nao-consta',
    pergunta: 'Uma mesma pessoa pode elaborar, revisar e aprovar um documento?',
    descricao: 'Caso "não consta nas fontes" (pergunta 4 da demo do PRD)',
    resposta: {
      resposta: 'Não consta nas fontes do acervo que uma mesma pessoa possa acumular os papéis de elaboração, revisão e aprovação simultaneamente. O Catálogo e as normas gerais (NG_010 e NG_012) estabelecem separação estrita de alçadas e responsabilidades entre elaborador, gestor imediato e diretor.',
      consta: false,
      citacoes: [],
      avisos: []
    }
  },
  {
    id: 'coworking-financeiro',
    pergunta: 'Qual o valor global do contrato de coworking e a multa por inexecução?',
    descricao: 'Demonstra extração de valores e multas com múltiplas citações (painel financeiro)',
    resposta: {
      resposta: 'O valor global do contrato de locação de coworking (CTR_2026-012) é de R$ 18.250,00, pago em 5 aluguéis mensais de R$ 3.650,00. A penalidade por descumprimento total ou rescisão injustificada é de 5% sobre o valor global, totalizando R$ 912,50.',
      consta: true,
      citacoes: [
        {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Sétima',
          trecho: 'O aluguel mensal é de R$ 3.650,00, perfazendo o valor global de R$ 18.250,00 para os 5 meses de vigência.'
        },
        {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Décima Primeira',
          trecho: 'Multa compensatória de 5% (cinco por cento) sobre o valor total do contrato, perfazendo R$ 912,50, em caso de descumprimento total ou rescisão injustificada.'
        }
      ],
      avisos: []
    }
  },
  {
    id: 'ideias-em-campo',
    pergunta: 'Qual a premiação máxima prevista para o Programa Ideias em Campo?',
    descricao: 'Demonstra citação do regulamento de inovação e categoria A',
    resposta: {
      resposta: 'De acordo com o Regulamento RG_1100 versão 2.0.0 (item 5.2), as ideias enquadradas na Categoria A fazem jus a um prêmio financeiro de reconhecimento de até R$ 15.000,00, condicionado à validação dos resultados e homologação pelo Comitê.',
      consta: true,
      citacoes: [
        {
          codigo: 'RG_1100',
          versao: '2.0.0',
          secao: '5.2',
          trecho: 'Ideias da Categoria A farão jus a prêmio financeiro de reconhecimento de até R$ 15.000,00, concedido após a validação dos ganhos no período de homologação.'
        }
      ],
      avisos: []
    }
  },
  {
    id: 'fracionamento-ferias',
    pergunta: 'Como funciona o fracionamento de férias?',
    descricao: 'Regras de divisão em até 3 períodos',
    resposta: {
      resposta: 'As férias podem ser fracionadas em até 3 períodos, desde que um deles tenha duração mínima de 14 dias corridos e nenhum dos outros seja inferior a 5 dias corridos cada (NG_111 v3.0.0, item 4.4).',
      consta: true,
      citacoes: [
        {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.4',
          trecho: 'As férias podem ser divididas em até 3 períodos. Um dos períodos deve ter no mínimo 14 dias corridos; os demais, no mínimo 5 dias corridos cada.'
        }
      ],
      avisos: []
    }
  }
];

export function mockPerguntar(pergunta: string, perfil?: PerfilUsuario): RespostaPerguntar {
  const normalizada = pergunta.toLowerCase().trim();

  // Caso especial: abstenção / não consta (demo cena 4)
  if (
    normalizada.includes('mesma pessoa') ||
    normalizada.includes('elaborar, revisar e aprovar') ||
    normalizada.includes('acumular') ||
    normalizada.includes('nao consta') ||
    normalizada.includes('não consta')
  ) {
    return EXEMPLOS_PERGUNTAS.find(e => e.id === 'nao-consta')!.resposta;
  }

  // Antecedência de férias (com aviso de versão substituída)
  if (
    normalizada.includes('antecedência') ||
    normalizada.includes('antecedencia') ||
    (normalizada.includes('prazo') && normalizada.includes('solicitar')) ||
    (normalizada.includes('ferias') && normalizada.includes('quando'))
  ) {
    const base = EXEMPLOS_PERGUNTAS.find(e => e.id === 'prazo-ferias-substituicao')!.resposta;
    if (perfil === 'gestor') {
      return {
        ...base,
        resposta: `[Visão Gestor] O gestor deve decidir sobre a solicitação em até 7 dias corridos. ${base.resposta}`
      };
    }
    return base;
  }

  // Coworking / valores / multa
  if (
    normalizada.includes('coworking') ||
    normalizada.includes('multa') ||
    normalizada.includes('18.250') ||
    normalizada.includes('18250') ||
    normalizada.includes('valor global')
  ) {
    return EXEMPLOS_PERGUNTAS.find(e => e.id === 'coworking-financeiro')!.resposta;
  }

  // Ideias em campo / inovação / premiação
  if (
    normalizada.includes('ideias em campo') ||
    normalizada.includes('premiação') ||
    normalizada.includes('premiacao') ||
    normalizada.includes('inovação') ||
    normalizada.includes('categoria a')
  ) {
    return EXEMPLOS_PERGUNTAS.find(e => e.id === 'ideias-em-campo')!.resposta;
  }

  // Fracionamento
  if (normalizada.includes('fracionamento') || normalizada.includes('dividir') || normalizada.includes('períodos')) {
    return EXEMPLOS_PERGUNTAS.find(e => e.id === 'fracionamento-ferias')!.resposta;
  }

  // Busca genérica nos exemplos
  for (const ex of EXEMPLOS_PERGUNTAS) {
    if (normalizada.includes(ex.pergunta.toLowerCase())) {
      return ex.resposta;
    }
  }

  // Default quando não encontrado: padrão com consta: false
  return {
    resposta: `Não consta nas fontes do acervo informação suficiente para responder com segurança à pergunta "${pergunta}". Para garantir a confiabilidade das decisões, o assistente só responde com base em evidências verificáveis de documentos vigentes.`,
    consta: false,
    citacoes: [],
    avisos: []
  };
}
