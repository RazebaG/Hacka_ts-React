import {
  CompararResultado,
  GrafoAcervo,
  PerspectivaDetalhe,
  PerspectivaResumo,
  RelatorioExecutivo
} from '../api/types';

export const MOCK_PERSPECTIVAS: PerspectivaResumo[] = [
  { id: 'pessoas', nome: 'Pessoas (RH)' },
  { id: 'financeiro', nome: 'Financeiro' },
  { id: 'juridico', nome: 'Jurídico e Contratos' },
  { id: 'gestao', nome: 'Gestão e Inovação' }
];

export const MOCK_PERSPECTIVAS_DETALHE: Record<string, PerspectivaDetalhe> = {
  pessoas: {
    id: 'pessoas',
    nome: 'Pessoas (RH)',
    destaques: [
      {
        titulo: 'Antecedência mínima para marcação de férias',
        valor: '45 dias',
        fonte: {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.3.1',
          trecho:
            'A antecedência mínima para solicitação de férias é de 45 (quarenta e cinco) dias corridos do início de gozo no Portal Raiz (FM_1111-001). Solicitações com prazo inferior exigem aprovação expressa do diretor da área.'
        },
        fonte_anterior: {
          codigo: 'NG_111',
          versao: '2.0.0',
          secao: '2.3',
          trecho:
            'A solicitação formal de férias devia ser efetuada com antecedência mínima de 30 (trinta) dias corridos.'
        },
        aviso: 'v2 (substituída) dizia 30 dias'
      },
      {
        titulo: 'Período concessivo e aquisitivo',
        valor: '12 meses para gozo',
        fonte: {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.1',
          trecho:
            'Cada 12 meses de período aquisitivo geram 30 dias corridos de férias. As férias devem ser gozadas dentro do período concessivo.'
        }
      },
      {
        titulo: 'Fracionamento do gozo',
        valor: 'Até 3 períodos',
        fonte: {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.4',
          trecho:
            'As férias podem ser convertidas em até 3 períodos, mediante concordância entre empregado e gestor.'
        }
      }
    ],
    valores: [
      {
        rotulo: 'Abono pecuniário (conversão máxima)',
        numero: 33.33,
        unidade: '%',
        fonte: {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.7',
          trecho:
            'O empregado pode converter 1/3 do período de férias a que tiver direito em abono pecuniário.'
        }
      },
      {
        rotulo: 'Adicional Constitucional de Férias',
        numero: 33.33,
        unidade: '%',
        fonte: {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.6',
          trecho:
            'Pagamento de um terço a mais da remuneração normal.'
        }
      }
    ],
    prazos: [
      {
        data: '2027-03-21',
        evento: 'Início do processo: solicitação formal no Portal Raiz (FM_1111-001)',
        marco: 'D-45',
        cenario: 'Exemplo do PX_1111-001: férias a partir de 05/05/2027',
        fonte: {
          codigo: 'PX_1111-001',
          versao: '1.0.0',
          secao: 'Anexo D',
          trecho: 'Solicitação no Portal Raiz: Até 45 dias corridos antes do início (21/03/2027).'
        }
      },
      {
        data: '2027-03-31',
        evento: 'Decisão do gestor imediato (prazo limite de 7 dias corridos)',
        marco: 'D-35',
        cenario: 'Exemplo do PX_1111-001: férias a partir de 05/05/2027',
        fonte: {
          codigo: 'PX_1111-001',
          versao: '1.0.0',
          secao: 'Anexo D',
          trecho: 'Decisão do gestor imediato: Até 35 dias corridos antes do início (31/03/2027).'
        }
      },
      {
        data: '2027-04-05',
        evento: 'Emissão formal do aviso de férias pela GGC',
        marco: 'D-30',
        cenario: 'Exemplo do PX_1111-001: férias a partir de 05/05/2027',
        fonte: {
          codigo: 'PX_1111-001',
          versao: '1.0.0',
          secao: 'Anexo D',
          trecho: 'Emissão do aviso pela GGC: Até 30 dias corridos antes do início (05/04/2027).'
        }
      },
      {
        data: '2027-04-15',
        evento: 'Assinatura formal do aviso de férias pelo empregado',
        marco: 'D-20',
        cenario: 'Exemplo do PX_1111-001: férias a partir de 05/05/2027',
        fonte: {
          codigo: 'PX_1111-001',
          versao: '1.0.0',
          secao: 'Anexo D',
          trecho: 'Assinatura do aviso: Até 20 dias corridos antes do início (15/04/2027).'
        }
      },
      {
        data: '2027-04-30',
        evento: 'Pagamento da remuneração e abono pecuniário (até 2 dias antes)',
        marco: 'D-3',
        cenario: 'Exemplo do PX_1111-001: férias a partir de 05/05/2027',
        fonte: {
          codigo: 'PX_1111-001',
          versao: '1.0.0',
          secao: 'Anexo D',
          trecho: 'Pagamento: Até 2 dias antes do início do gozo (30/04/2027).'
        }
      }
    ],
    responsaveis: [
      {
        papel: 'Empregado',
        responsabilidade:
          'Registrar intenção na programação anual (outubro) e solicitar no Portal Raiz com D-45 de antecedência',
        fonte: {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.2',
          trecho: 'O empregado registra no Portal Raiz a programação de férias para o ano seguinte.'
        }
      },
      {
        papel: 'Gestor Imediato',
        responsabilidade:
          'Consolidar programação e decidir solicitações no Portal Raiz em até 7 dias corridos',
        fonte: {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.2',
          trecho: 'O gestor consolida até 30 de novembro.'
        }
      },
      {
        papel: 'GGC (Gente e Cultura)',
        responsabilidade:
          'Publicar calendário institucional até 15/12 e emitir avisos formais de férias até D-30',
        fonte: {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.2',
          trecho: 'A GGC publica o calendário até 15 de dezembro.'
        }
      },
      {
        papel: 'Diretor da Área',
        responsabilidade:
          'Deliberar em caráter exclusivo sobre solicitações de férias com antecedência inferior a 45 dias',
        fonte: {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.3',
          trecho:
            'Solicitação com menos de 45 dias só é aceita por decisão expressa do diretor da área.'
        }
      }
    ],
    riscos: [
      {
        descricao:
          'Solicitação cadastrada com menos de 45 dias sem autorização expressa da diretoria é bloqueada pelo sistema.',
        fonte: {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.3',
          trecho:
            'Solicitação com menos de 45 dias só é aceita por decisão expressa do diretor da área.'
        }
      },
      {
        descricao:
          'Cancelamento ou reprogramação com menos de 20 dias acarreta remanejamento emergencial e bloqueio no Portal Raiz.',
        fonte: {
          codigo: 'PX_1111-001',
          versao: '1.0.0',
          secao: '1',
          trecho: 'Orientações sobre alteração e cancelamento de férias.'
        }
      }
    ]
  },

  financeiro: {
    id: 'financeiro',
    nome: 'Financeiro',
    destaques: [
      {
        titulo: 'Valor global do coworking',
        valor: 'R$ 18.250,00',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Sétima',
          trecho:
            'O valor global estimado do presente instrumento é de R$ 18.250,00 (dezoito mil duzentos e cinquenta reais), correspondendo a 12 parcelas mensais de R$ 1.520,83.'
        }
      },
      {
        titulo: 'Alçada decisória de contratação',
        valor: 'Diretor Administrativo e Financeiro (NG_012 via NT_2026-018)',
        fonte: {
          codigo: 'NT_2026-018',
          versao: '1.0.0',
          secao: '3',
          trecho:
            'A contratação de R$ 18.250,00 enquadra-se na alçada decisória de Gerente Executivo e Diretor Administrativo e Financeiro conforme limites da NG_012.'
        }
      },
      {
        titulo: 'Multa por inexecução',
        valor: 'R$ 912,50',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho:
            'Multa por inexecução contratual: 5% × R$ 18.250,00 = R$ 912,50.'
        }
      }
    ],
    valores: [
      {
        rotulo: 'Valor global contratado (Coworking)',
        numero: 18250.0,
        unidade: 'BRL',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Sétima',
          trecho:
            'O valor global estimado do presente instrumento é de R$ 18.250,00 (dezoito mil duzentos e cinquenta reais).'
        }
      },
      {
        rotulo: 'Limite de acréscimo por aditivo (20%)',
        numero: 3650.0,
        unidade: 'BRL',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho:
            'Limite de acréscimo por aditivo: 20% × 18.250,00 = R$ 3.650,00.'
        }
      },
      {
        rotulo: 'Multa por rescisão até 90º dia',
        numero: 3650.0,
        unidade: 'BRL',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho:
            'Multa por rescisão até o 90º dia: um aluguel mensal de R$ 3.650,00.'
        }
      },
      {
        rotulo: 'Parcela mensal coworking',
        numero: 1520.83,
        unidade: 'BRL',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Sétima',
          trecho:
            'Correspondendo a 12 parcelas mensais de R$ 1.520,83.'
        }
      },
      {
        rotulo: 'Multa por inexecução (5%)',
        numero: 912.5,
        unidade: 'BRL',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho:
            'Multa por inexecução contratual: 5% × R$ 18.250,00 = R$ 912,50.'
        }
      }
    ],
    prazos: [
      {
        data: '2026-11-25',
        evento: 'Último dia para vistoria final e termo de encerramento',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho: 'Vistoria final agendada para 25/11/2026.'
        }
      },
      {
        data: '2026-03-01',
        evento: 'Início da vigência do contrato de locação de coworking',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Primeira',
          trecho: 'Vigência: 01/03/2026 a 28/02/2027.'
        }
      },
      {
        data: '2027-02-28',
        evento: 'Término previsto da vigência contratual do coworking',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Primeira',
          trecho: 'Vigência: 01/03/2026 a 28/02/2027.'
        }
      }
    ],
    responsaveis: [
      {
        papel: 'GOC',
        responsabilidade:
          'Fiscal técnico do contrato; atesta relatórios e notas fiscais em até 5 dias úteis',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho: 'Fiscal técnico: GOC, com prazo de 5 dias úteis para ateste.'
        }
      },
      {
        papel: 'GFI',
        responsabilidade:
          'Gerência Financeira; processamento do cronograma de desembolso e retenções tributárias',
        fonte: {
          codigo: 'NT_2026-018',
          versao: '1.0.0',
          secao: '3',
          trecho: 'A contratação de R$ 18.250,00 enquadra-se na alçada decisória.'
        }
      },
      {
        papel: 'DIRAF',
        responsabilidade:
          'Diretoria Administrativa e Financeira; homologação de aditivos, valores e penalidades',
        fonte: {
          codigo: 'NT_2026-018',
          versao: '1.0.0',
          secao: '3',
          trecho:
            'Enquadra-se na alçada decisória de Gerente Executivo e Diretor Administrativo e Financeiro conforme limites da NG_012.'
        }
      }
    ],
    riscos: [
      {
        descricao:
          'Inexecução contratual acarreta multa compensatória de 5% (R$ 912,50) e rescisão com perda de garantia.',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho: 'Multa por inexecução contratual: 5% × R$ 18.250,00 = R$ 912,50.'
        }
      },
      {
        descricao:
          'Acréscimos que superem o teto legal de aditivos de 20% (R$ 3.650,00) ensejam nulidade da prorrogação.',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho: 'Limite de acréscimo por aditivo: 20% × 18.250,00 = R$ 3.650,00.'
        }
      }
    ]
  },

  juridico: {
    id: 'juridico',
    nome: 'Jurídico e Contratos',
    destaques: [
      {
        titulo: 'Instrumento Contratual',
        valor: 'CTR_2026-012 (Locação de Coworking)',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Primeira',
          trecho:
            'Contratação de postos de trabalho e salas de reunião em regime de coworking corporativo para atender equipes de inovação.'
        }
      },
      {
        titulo: 'Foro Contratual Eleito',
        valor: 'Comarca de Vale Azul',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Primeira',
          trecho:
            'Fica eleito o foro da Comarca de Vale Azul para dirimir dúvidas ou controvérsias oriundas do presente contrato.'
        }
      },
      {
        titulo: 'Fundamentação Técnica e Alçadas',
        valor: 'Nota Técnica NT_2026-018 (NG_012)',
        fonte: {
          codigo: 'NT_2026-018',
          versao: '1.0.0',
          secao: '3',
          trecho:
            'A contratação de R$ 18.250,00 enquadra-se na alçada decisória de Gerente Executivo e Diretor Administrativo e Financeiro conforme limites da NG_012.'
        }
      }
    ],
    valores: [
      {
        rotulo: 'Valor Global Homologado',
        numero: 18250.0,
        unidade: 'BRL',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Sétima',
          trecho:
            'O valor global estimado do presente instrumento é de R$ 18.250,00.'
        }
      },
      {
        rotulo: 'Penalidade Rescisória até 90 dias',
        numero: 3650.0,
        unidade: 'BRL',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho:
            'Multa por rescisão até o 90º dia: um aluguel mensal de R$ 3.650,00.'
        }
      }
    ],
    prazos: [
      {
        data: '2026-02-15',
        evento: 'Emissão da Nota Técnica NT_2026-018 de Justificativa e Alçadas',
        fonte: {
          codigo: 'NT_2026-018',
          versao: '1.0.0',
          secao: '3',
          trecho: 'Justificativa de Preço e Alçadas.'
        }
      },
      {
        data: '2026-03-01',
        evento: 'Assinatura e início da eficácia do instrumento contratual',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Cláusula Primeira',
          trecho: 'Vigência: 01/03/2026 a 28/02/2027.'
        }
      },
      {
        data: '2026-11-25',
        evento: 'Vistoria técnica final do imóvel locado',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho: 'Vistoria final agendada para 25/11/2026.'
        }
      }
    ],
    responsaveis: [
      {
        papel: 'GJU',
        responsabilidade:
          'Gerência Jurídica; análise prévia da minuta contratual e aditivos contratuais',
        fonte: {
          codigo: 'NT_2026-018',
          versao: '1.0.0',
          secao: '3',
          trecho:
            'A contratação enquadra-se na alçada decisória conforme limites da NG_012.'
        }
      },
      {
        papel: 'GOC',
        responsabilidade:
          'Fiscalização contratual e ateste formal das obrigações da contratada',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho: 'Fiscal técnico: GOC, com prazo de 5 dias úteis para ateste.'
        }
      }
    ],
    riscos: [
      {
        descricao:
          'Rescisão imotivada nos primeiros 90 dias acarreta obrigação de indenização equivalente a uma mensalidade cheia.',
        fonte: {
          codigo: 'CTR_2026-012',
          versao: '1.0.0',
          secao: 'Apêndice B',
          trecho: 'Multa por rescisão até o 90º dia: um aluguel mensal de R$ 3.650,00.'
        }
      }
    ]
  },

  gestao: {
    id: 'gestao',
    nome: 'Gestão e Inovação',
    destaques: [
      {
        titulo: 'Programa Corporativo',
        valor: 'Ideias em Campo (NG_1130)',
        fonte: {
          codigo: 'NG_1130',
          versao: '1.0.0',
          secao: '1',
          trecho:
            'Estabelece o regulamento e metodologia do programa corporativo de inovação Ideias em Campo.'
        }
      },
      {
        titulo: 'Comitê Deliberativo',
        valor: 'CIN (Comitê de Inovação)',
        fonte: {
          codigo: 'NG_1130',
          versao: '1.0.0',
          secao: '3',
          trecho:
            'O CIN é o órgão colegiado responsável pelo julgamento, aprovação orçamentária e premiação dos projetos.'
        }
      },
      {
        titulo: 'Procedimento Operacional',
        valor: 'PX_1130-001 (Ciclo de Ideação e Pilotos)',
        fonte: {
          codigo: 'PX_1130-001',
          versao: '1.0.0',
          secao: '1',
          trecho:
            'Define o fluxo operacional de submissão, prototipagem rápida e avaliação de impacto das ideias.'
        }
      }
    ],
    valores: [
      {
        rotulo: 'Fundo Orçamentário de Inovação',
        numero: 50000.0,
        unidade: 'BRL',
        fonte: {
          codigo: 'NG_1130',
          versao: '1.0.0',
          secao: '3',
          trecho:
            'Fundo orçamentário rotativo de R$ 50.000,00 destinado ao financiamento de protótipos e pilotos.'
        }
      },
      {
        rotulo: 'Premiação por Ideia Homologada',
        numero: 2500.0,
        unidade: 'BRL',
        fonte: {
          codigo: 'NG_1130',
          versao: '1.0.0',
          secao: '3',
          trecho:
            'Premiação pecuniária de R$ 2.500,00 para os autores de propostas implantadas com sucesso.'
        }
      }
    ],
    prazos: [
      {
        data: '2026-04-01',
        evento: 'Abertura do Ciclo Anual de Submissão de Ideias no Portal',
        fonte: {
          codigo: 'NG_1130',
          versao: '1.0.0',
          secao: '3',
          trecho: 'Ciclos de submissão iniciam no primeiro dia útil de abril.'
        }
      },
      {
        data: '2026-06-30',
        evento: 'Encerramento da triagem técnica e início do julgamento pelo CIN',
        fonte: {
          codigo: 'NG_1130',
          versao: '1.0.0',
          secao: '3',
          trecho: 'Avaliação consolidada semestralmente.'
        }
      },
      {
        data: '2026-09-01',
        evento: 'Início da implantação dos pilotos nas estações de coworking',
        fonte: {
          codigo: 'PX_1130-001',
          versao: '1.0.0',
          secao: '1',
          trecho: 'Execução de protótipos em ambiente de coworking.'
        }
      }
    ],
    responsaveis: [
      {
        papel: 'CIN',
        responsabilidade:
          'Comitê de Inovação; avaliação técnica, ranqueamento e homologação de projetos vencedores',
        fonte: {
          codigo: 'NG_1130',
          versao: '1.0.0',
          secao: '3',
          trecho:
            'Competência do CIN para aprovar orçamentos e premiar iniciativas.'
        }
      },
      {
        papel: 'NIN',
        responsabilidade:
          'Núcleo de Inovação; suporte metodológico e acompanhamento ágil de protótipos',
        fonte: {
          codigo: 'NG_1130',
          versao: '1.0.0',
          secao: '3',
          trecho: 'Suporte operacional do NIN aos times de projeto.'
        }
      }
    ],
    riscos: [
      {
        descricao:
          'Propostas sem memorial de viabilidade e plano de medição de impacto são rejeitadas na triagem prévia do NIN.',
        fonte: {
          codigo: 'PX_1130-001',
          versao: '1.0.0',
          secao: '1',
          trecho: 'Critérios de acompanhamento e encerramento de pilotos.'
        }
      }
    ]
  }
};

export const MOCK_GRAFO: GrafoAcervo = {
  nos: [
    {
      id: 'NG_111@3.0.0',
      codigo: 'NG_111',
      tipo: 'NG',
      versao: '3.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'NG_111@2.0.0',
      codigo: 'NG_111',
      tipo: 'NG',
      versao: '2.0.0',
      substituido: true,
      existe_no_acervo: true
    },
    {
      id: 'PX_1111-001@1.0.0',
      codigo: 'PX_1111-001',
      tipo: 'PX',
      versao: '1.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'FM_1111-001@2.0.0',
      codigo: 'FM_1111-001',
      tipo: 'FM',
      versao: '2.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'FM_1111-001@1.0.0',
      codigo: 'FM_1111-001',
      tipo: 'FM',
      versao: '1.0.0',
      substituido: true,
      existe_no_acervo: true
    },
    {
      id: 'TB_1111-001@1.0.0',
      codigo: 'TB_1111-001',
      tipo: 'TB',
      versao: '1.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'FL_1111-001@1.0.0',
      codigo: 'FL_1111-001',
      tipo: 'FL',
      versao: '1.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'NG_1130@1.0.0',
      codigo: 'NG_1130',
      tipo: 'NG',
      versao: '1.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'PX_1130-001@1.0.0',
      codigo: 'PX_1130-001',
      tipo: 'PX',
      versao: '1.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'RG_1100@1.0.0',
      codigo: 'RG_1100',
      tipo: 'RG',
      versao: '1.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'NT_2026-021@1.0.0',
      codigo: 'NT_2026-021',
      tipo: 'NT',
      versao: '1.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'CTR_2026-012@1.0.0',
      codigo: 'CTR_2026-012',
      tipo: 'CTR',
      versao: '1.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'NT_2026-018@1.0.0',
      codigo: 'NT_2026-018',
      tipo: 'NT',
      versao: '1.0.0',
      substituido: false,
      existe_no_acervo: true
    },
    {
      id: 'NG_012',
      codigo: 'NG_012',
      tipo: 'NG',
      versao: '',
      substituido: false,
      existe_no_acervo: false
    },
    {
      id: 'NG_010',
      codigo: 'NG_010',
      tipo: 'NG',
      versao: '',
      substituido: false,
      existe_no_acervo: false
    }
  ],
  arestas: [
    {
      de: 'PX_1111-001@1.0.0',
      para: 'NG_111@3.0.0',
      tipo: 'vinculado_a'
    },
    {
      de: 'FM_1111-001@2.0.0',
      para: 'PX_1111-001@1.0.0',
      tipo: 'vinculado_a'
    },
    {
      de: 'FM_1111-001@2.0.0',
      para: 'FM_1111-001@1.0.0',
      tipo: 'substitui'
    },
    {
      de: 'TB_1111-001@1.0.0',
      para: 'PX_1111-001@1.0.0',
      tipo: 'referencia'
    },
    {
      de: 'FL_1111-001@1.0.0',
      para: 'PX_1111-001@1.0.0',
      tipo: 'referencia'
    },
    {
      de: 'NG_111@3.0.0',
      para: 'NG_111@2.0.0',
      tipo: 'substitui'
    },
    {
      de: 'PX_1130-001@1.0.0',
      para: 'NG_1130@1.0.0',
      tipo: 'vinculado_a'
    },
    {
      de: 'NT_2026-021@1.0.0',
      para: 'NG_1130@1.0.0',
      tipo: 'referencia'
    },
    {
      de: 'NT_2026-018@1.0.0',
      para: 'CTR_2026-012@1.0.0',
      tipo: 'referencia'
    },
    {
      de: 'CTR_2026-012@1.0.0',
      para: 'NT_2026-018@1.0.0',
      tipo: 'vinculado_a'
    },
    {
      de: 'NT_2026-018@1.0.0',
      para: 'NG_012',
      tipo: 'referencia'
    },
    {
      de: 'RG_1100@1.0.0',
      para: 'NG_010',
      tipo: 'referencia'
    }
  ]
};

export const MOCK_COMPARATIVOS: Record<string, CompararResultado> = {
  'NG_111:2.0.0:3.0.0': {
    codigo: 'NG_111',
    de: '2.0.0',
    para: '3.0.0',
    resumo: [
      'Antecedência mínima para solicitação de férias passou de 30 para 45 dias corridos',
      'Pedidos com prazo inferior a 45 dias agora exigem expressa autorização do diretor da área',
      'Regra de substituição formal da versão 2.0.0 formalizada na Seção 2.2',
      'Possibilidade de fracionamento de férias ampliada para até 3 períodos'
    ],
    mudancas: [
      {
        secao: '4.3.1',
        tipo: 'alterado',
        antes:
          'A solicitação formal de férias devia ser efetuada com antecedência mínima de 30 (trinta) dias corridos.',
        depois:
          'A antecedência mínima para solicitação de férias é de 45 (quarenta e cinco) dias corridos do início de gozo no Portal Raiz (FM_1111-001). Solicitações com prazo inferior exigem aprovação expressa do diretor da área.'
      },
      {
        secao: '2.2',
        tipo: 'incluido',
        antes: '',
        depois: 'Esta norma substitui a NG_111 versão 2.0.0.'
      },
      {
        secao: '4.4',
        tipo: 'alterado',
        antes:
          'O gozo de férias poderá ser fracionado em até 2 períodos não inferiores a 10 dias corridos.',
        depois:
          'As férias podem ser convertidas em até 3 períodos, mediante concordância entre empregado e gestor.'
      }
    ]
  },
  'FM_1111-001:1.0.0:2.0.0': {
    codigo: 'FM_1111-001',
    de: '1.0.0',
    para: '2.0.0',
    resumo: [
      'Inclusão do campo obrigatório de autorização da diretoria para solicitações com antecedência inferior a 45 dias',
      'Adequação dos campos de fracionamento para comportar até 3 períodos'
    ],
    mudancas: [
      {
        secao: '2',
        tipo: 'alterado',
        antes:
          'Formulário contém campos para dados do empregado, período de gozo (até 2 frações) e assinatura do gestor imediato.',
        depois:
          'Campos atualizados para suportar até 3 períodos de fracionamento e campo obrigatório com token de autorização da diretoria para pedidos com prazo inferior a 45 dias.'
      }
    ]
  }
};

export const MOCK_RELATORIOS: Record<string, RelatorioExecutivo> = {
  juridico: {
    titulo: 'Relatório Executivo — Perspectiva Jurídico e Contratos',
    gerado_em: '2026-11-12T10:00:00Z',
    secoes: [
      {
        titulo: 'Síntese de Conformidade e Vigência Contratual',
        itens: [
          {
            texto:
              'O contrato CTR_2026-012 rege a locação corporativa de espaço de coworking com vigência estipulada de 01/03/2026 a 28/02/2027.',
            fonte: {
              codigo: 'CTR_2026-012',
              versao: '1.0.0',
              secao: 'Cláusula Primeira',
              trecho:
                'Contratação de postos de trabalho e salas de reunião em regime de coworking corporativo.'
            }
          },
          {
            texto:
              'A contratação possui amparo na Nota Técnica NT_2026-018, enquadrando-se nas alçadas de Gerente Executivo e Diretor Administrativo e Financeiro conforme a NG_012.',
            fonte: {
              codigo: 'NT_2026-018',
              versao: '1.0.0',
              secao: '3',
              trecho:
                'A contratação de R$ 18.250,00 enquadra-se na alçada decisória de Gerente Executivo e Diretor Administrativo e Financeiro conforme limites da NG_012.'
            }
          }
        ]
      },
      {
        titulo: 'Cláusulas Críticas, Prazos e Penalidades',
        itens: [
          {
            texto:
              'A vistoria final obrigatória está agendada para 25/11/2026, com ateste do fiscal técnico (GOC) em até 5 dias úteis.',
            fonte: {
              codigo: 'CTR_2026-012',
              versao: '1.0.0',
              secao: 'Apêndice B',
              trecho:
                'Fiscal técnico: GOC, com prazo de 5 dias úteis para ateste. Vistoria final agendada para 25/11/2026.'
            }
          },
          {
            texto:
              'A inexecução total ou rescisão injustificada enseja aplicação de multa compensatória de 5% sobre o valor global (R$ 912,50).',
            fonte: {
              codigo: 'CTR_2026-012',
              versao: '1.0.0',
              secao: 'Apêndice B',
              trecho:
                'Multa por inexecução contratual: 5% × R$ 18.250,00 = R$ 912,50.'
            }
          }
        ]
      }
    ]
  },
  financeiro: {
    titulo: 'Relatório Executivo — Perspectiva Financeira e Orçamentária',
    gerado_em: '2026-11-12T10:00:00Z',
    secoes: [
      {
        titulo: 'Consolidação de Desembolsos e Contratos',
        itens: [
          {
            texto:
              'Valor global contratado de locação de coworking fixado em R$ 18.250,00, diluído em 12 parcelas mensais de R$ 1.520,83.',
            fonte: {
              codigo: 'CTR_2026-012',
              versao: '1.0.0',
              secao: 'Cláusula Sétima',
              trecho:
                'O valor global estimado do presente instrumento é de R$ 18.250,00 (dezoito mil duzentos e cinquenta reais), correspondendo a 12 parcelas mensais de R$ 1.520,83.'
            }
          },
          {
            texto:
              'Teto de acréscimo aditivo previsto em 20% do valor inicial (R$ 3.650,00), sob fiscalização da Gerência Financeira (GFI).',
            fonte: {
              codigo: 'CTR_2026-012',
              versao: '1.0.0',
              secao: 'Apêndice B',
              trecho:
                'Limite de acréscimo por aditivo: 20% × 18.250,00 = R$ 3.650,00.'
            }
          }
        ]
      },
      {
        titulo: 'Exposição a Riscos e Penalidades Contratuais',
        itens: [
          {
            texto:
              'Multa prevista por inexecução contratual no montante de R$ 912,50 calculada à razão de 5% sobre o valor total do instrumento.',
            fonte: {
              codigo: 'CTR_2026-012',
              versao: '1.0.0',
              secao: 'Apêndice B',
              trecho:
                'Multa por inexecução contratual: 5% × R$ 18.250,00 = R$ 912,50.'
            }
          }
        ]
      }
    ]
  },
  pessoas: {
    titulo: 'Relatório Executivo — Perspectiva Pessoas e Gente (RH)',
    gerado_em: '2026-11-12T10:00:00Z',
    secoes: [
      {
        titulo: 'Regramento Geral de Férias e Prazos Críticos',
        itens: [
          {
            texto:
              'A norma vigente NG_111 v3.0.0 fixou a antecedência mínima para solicitação de férias em 45 dias corridos via Portal Raiz (FM_1111-001).',
            fonte: {
              codigo: 'NG_111',
              versao: '3.0.0',
              secao: '4.3.1',
              trecho:
                'A antecedência mínima para solicitação de férias é de 45 (quarenta e cinco) dias corridos do início de gozo no Portal Raiz (FM_1111-001).'
            }
          },
          {
            texto:
              'Solicitações com prazo inferior a 45 dias dependem de autorização expressa do diretor da área, extinguindo a flexibilidade da norma anterior.',
            fonte: {
              codigo: 'NG_111',
              versao: '3.0.0',
              secao: '4.3.1',
              trecho:
                'Solicitações com prazo inferior exigem aprovação expressa do diretor da área.'
            }
          }
        ]
      },
      {
        titulo: 'Cronograma Padrão de Processamento (Anexo D)',
        itens: [
          {
            texto:
              'O fluxo obedece à régua D-45 (solicitação) → D-35 (decisão do gestor) → D-30 (emissão de aviso pela GGC) → D-20 (assinatura) → D-3 (pagamento).',
            fonte: {
              codigo: 'PX_1111-001',
              versao: '1.0.0',
              secao: 'Anexo D',
              trecho: 'Prazos operacionais de programação e pagamento de férias.'
            }
          }
        ]
      }
    ]
  },
  gestao: {
    titulo: 'Relatório Executivo — Perspectiva Gestão e Inovação',
    gerado_em: '2026-11-12T10:00:00Z',
    secoes: [
      {
        titulo: 'Programa Corporativo Ideias em Campo',
        itens: [
          {
            texto:
              'A NG_1130 regulamenta o ecossistema corporativo de inovação aberta e captação de soluções de colaboradores.',
            fonte: {
              codigo: 'NG_1130',
              versao: '1.0.0',
              secao: '1',
              trecho:
                'Estabelece o regulamento e metodologia do programa corporativo de inovação Ideias em Campo.'
            }
          },
          {
            texto:
              'Fundo anual rotativo de R$ 50.000,00 e premiação de R$ 2.500,00 para propostas homologadas e implementadas pelo CIN.',
            fonte: {
              codigo: 'NG_1130',
              versao: '1.0.0',
              secao: '3',
              trecho:
                'Competência do CIN para aprovar orçamentos e premiar iniciativas.'
            }
          }
        ]
      }
    ]
  },
  'CTR_2026-012': {
    titulo: 'Relatório Executivo — Documento CTR_2026-012 (Coworking)',
    gerado_em: '2026-11-12T10:00:00Z',
    secoes: [
      {
        titulo: 'Metadados e Cláusulas Principais',
        itens: [
          {
            texto:
              'Contrato de locação corporativa com valor global de R$ 18.250,00 e vigência de 12 meses (01/03/2026 a 28/02/2027).',
            fonte: {
              codigo: 'CTR_2026-012',
              versao: '1.0.0',
              secao: 'Cláusula Sétima',
              trecho:
                'O valor global estimado do presente instrumento é de R$ 18.250,00 (dezoito mil duzentos e cinquenta reais).'
            }
          },
          {
            texto:
              'Fiscal técnico (GOC) possui prazo de 5 dias úteis para ateste de faturas, com vistoria final agendada para 25/11/2026.',
            fonte: {
              codigo: 'CTR_2026-012',
              versao: '1.0.0',
              secao: 'Apêndice B',
              trecho:
                'Fiscal técnico: GOC, com prazo de 5 dias úteis para ateste. Vistoria final agendada para 25/11/2026.'
            }
          }
        ]
      }
    ]
  }
};
