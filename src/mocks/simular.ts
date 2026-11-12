import { ImpactoSimulacao, RegraItem, SimularRequest, SimularResponse } from '../api/types';

export const MOCK_REGRAS: RegraItem[] = [
  {
    id: 'ferias_antecedencia_dias',
    rotulo: 'Antecedência mínima para pedir férias',
    valor: 45,
    unidade: 'dias',
    fonte: {
      codigo: 'NG_111',
      versao: '3.0.0',
      secao: '4.5.1',
      trecho: 'Solicitação: até 45 dias antes.'
    }
  }
];

function subtrairDiasDe20270505(dias: number): string {
  // 05/05/2027 (início de gozo do exemplo NG_111 Anexo C / PX_1111-001)
  const d = new Date(Date.UTC(2027, 4, 5));
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().split('T')[0];
}

export function mockSimular(req: SimularRequest): SimularResponse {
  if (req.regra !== 'ferias_antecedencia_dias') {
    throw new Error('Regra desconhecida');
  }

  const novoValor = Number(req.novo_valor);
  if (Number.isNaN(novoValor) || novoValor < 1 || novoValor > 90) {
    throw new Error('Valor fora do intervalo permitido (1 a 90 dias)');
  }

  const dataAntes = subtrairDiasDe20270505(45); // 2027-03-21
  const dataDepois = subtrairDiasDe20270505(novoValor);
  const mudaSolicitacao = novoValor !== 45;

  const linhaDoTempo = [
    {
      marco: 'Solicitação',
      antes: dataAntes,
      depois: dataDepois,
      muda: mudaSolicitacao,
      fonte: {
        codigo: 'NG_111',
        versao: '3.0.0',
        secao: '4.5.1',
        trecho: 'Solicitação: até 45 dias antes.'
      }
    },
    {
      marco: 'Aviso da GGC (D-35)',
      antes: '2027-03-31',
      depois: '2027-03-31',
      muda: false,
      fonte: {
        codigo: 'NG_111',
        versao: '3.0.0',
        secao: '4.5.3',
        trecho: 'Aviso da GGC: emitido até 35 dias antes do início do gozo (31/03/2027).'
      }
    }
  ];

  const impactos: ImpactoSimulacao[] = [];
  const resumo: string[] = [];

  // Se novo_valor < 35, o prazo de solicitação (D-novoValor) fica depois da data do aviso (D-35)
  if (novoValor < 35) {
    impactos.push({
      tipo: 'conflito_interno',
      descricao: `O aviso D-35 ficaria antes do fim do prazo de solicitação (D-${novoValor}).`,
      fontes: [
        {
          codigo: 'NG_111',
          versao: '3.0.0',
          secao: '4.5.3',
          trecho: 'Aviso da GGC: até 35 dias antes.'
        }
      ]
    });
  }

  if (novoValor !== 45) {
    // Documentos vigentes que citam 45 dias
    impactos.push(
      {
        tipo: 'revisar_documento',
        codigo: 'PX_1111-001',
        versao: '1.0.0',
        descricao: 'Cita o marco D-45',
        fontes: [
          {
            codigo: 'PX_1111-001',
            versao: '1.0.0',
            secao: '8.2',
            trecho: 'Solicitação formalizada com antecedência mínima de 45 dias corridos (D-45).'
          }
        ]
      },
      {
        tipo: 'revisar_documento',
        codigo: 'NG_111',
        versao: '3.0.0',
        descricao: 'Cita a antecedência de 45 dias',
        fontes: [
          {
            codigo: 'NG_111',
            versao: '3.0.0',
            secao: '4.3.1',
            trecho: 'A antecedência mínima para solicitação de férias é de 45 (quarenta e cinco) dias corridos.'
          }
        ]
      },
      {
        tipo: 'revisar_documento',
        codigo: 'FM_1111-001',
        versao: '2.0.0',
        descricao: 'Cita antecedência mínima de 45 dias no formulário eletrônico',
        fontes: [
          {
            codigo: 'FM_1111-001',
            versao: '2.0.0',
            secao: '1',
            trecho: 'Preenchimento eletrônico via Portal Raiz com antecedência mínima de 45 dias corridos.'
          }
        ]
      },
      {
        tipo: 'revisar_documento',
        codigo: 'TB_1111-001',
        versao: '1.0.0',
        descricao: 'Tabela de prazos com marco D-45',
        fontes: [
          {
            codigo: 'TB_1111-001',
            versao: '1.0.0',
            secao: '1',
            trecho: 'Marco D-45: prazo limite para abertura do pedido de férias.'
          }
        ]
      },
      {
        tipo: 'revisar_documento',
        codigo: 'FL_1111-001',
        versao: '1.0.0',
        descricao: 'Fluxograma com validação de 45 dias',
        fontes: [
          {
            codigo: 'FL_1111-001',
            versao: '1.0.0',
            secao: '1',
            trecho: 'Etapa inicial: validação do marco de 45 dias de antecedência.'
          }
        ]
      }
    );

    const dataFormatadaPt = dataDepois.split('-').reverse().join('/');
    resumo.push(`A solicitação passa para D-${novoValor} (${dataFormatadaPt} no exemplo).`);
    if (novoValor < 35) {
      resumo.push('O D-35 do aviso fica incompatível.');
    }
    resumo.push('Documentos vigentes que citam 45 dias exigiriam revisão.');
  } else {
    resumo.push('Nenhuma alteração nos prazos vigentes.');
  }

  return {
    regra: req.regra,
    valor_atual: 45,
    novo_valor: novoValor,
    unidade: 'dias',
    linha_do_tempo: linhaDoTempo,
    impactos,
    resumo,
    aviso: 'Simulação hipotética: não altera os documentos.'
  };
}
