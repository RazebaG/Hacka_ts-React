import React from 'react';
import { SinalBloco } from '../../api/types';
import { navegar } from '../../app/rotas';

/** Peças pequenas usadas por mais de uma parte da Mesa de decisão. */

export const dataBR = (iso: string | null) => (iso ? iso.split('-').reverse().join('/') : '');

export const ir = (destino: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  navegar(destino);
};

export const minusculaInicial = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
export const semPonto = (t: string) => t.replace(/[.;]+$/, '');

/** Tom do selo de relevância por sinal (protótipo de 13/11): valor verde, prazo âmbar, risco vermelho, demais azul. */
export const TOM: Record<SinalBloco, 'ok' | 'aviso' | 'info' | 'perigo'> = {
  valor: 'ok',
  prazo: 'aviso',
  responsavel: 'info',
  regra: 'info',
  risco: 'perigo',
  alerta: 'perigo'
};

export type VarianteMesa = 'compacta' | 'completa';
