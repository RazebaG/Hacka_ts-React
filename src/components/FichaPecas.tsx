import React from 'react';
import { FichaDocumento, OrigemItem } from '../api/types';
import { Icon } from '../ui/Icon';

/* Peças compartilhadas pela Mesa de decisão (T1) e pela Ficha (T14). */

const ORIGEM: Record<OrigemItem, { texto: string; icone: string; dica: string }> = {
  literal: { texto: 'Trecho literal', icone: '“”', dica: 'Texto copiado da seção' },
  resumo: { texto: 'Resumo da IA', icone: '✦', dica: 'Resumo da IA, confira o trecho' },
  calculado: { texto: 'Calculado', icone: '=', dica: 'Conta feita com valores do documento' }
};

/** Selo de origem (RF51): de onde veio cada afirmação. */
export const SeloOrigem: React.FC<{ origem: OrigemItem }> = ({ origem }) => (
  <span className={`fg-pilula selo-origem selo-${origem}`} title={ORIGEM[origem].dica}>
    <span aria-hidden="true">{ORIGEM[origem].icone}</span> {ORIGEM[origem].texto}
  </span>
);

const SEMAFORO = {
  ok: { classe: 'ok', icone: 'marca', texto: 'Em vigor' },
  atencao: { classe: 'aviso', icone: 'alerta', texto: 'Pede atenção' },
  critico: { classe: 'perigo', icone: 'alerta', texto: 'Não use para decidir' }
} as const;

/** Semáforo de situação (RF45): cor sempre com ícone e texto. */
export const SemaforoSituacao: React.FC<{ nivel: FichaDocumento['semaforo']['nivel']; compacto?: boolean }> = ({ nivel, compacto }) => (
  <span className={`fg-pilula semaforo semaforo-${nivel} ${SEMAFORO[nivel].classe}`}>
    <Icon nome={SEMAFORO[nivel].icone} tamanho={13} /> {compacto ? SEMAFORO[nivel].texto : SEMAFORO[nivel].texto}
  </span>
);

