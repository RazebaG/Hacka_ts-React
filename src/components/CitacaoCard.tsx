import React from 'react';
import { Citacao } from '../api/types';

interface CitacaoCardProps {
  citacao: Citacao;
  onSelect: (codigo: string, versao: string, secao: string) => void;
}

export const CitacaoCard: React.FC<CitacaoCardProps> = ({ citacao, onSelect }) => {
  return (
    <div
      data-testid={`citacao-${citacao.codigo}-${citacao.secao}`}
      className="citacao-card"
      onClick={() => onSelect(citacao.codigo, citacao.versao, citacao.secao)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(citacao.codigo, citacao.versao, citacao.secao);
        }
      }}
      title={`Ver ${citacao.codigo} v${citacao.versao} na seção ${citacao.secao}`}
    >
      <div className="citacao-header">
        <span className="citacao-tag">
          <strong>{citacao.codigo}</strong> · v{citacao.versao} · Seção {citacao.secao}
        </span>
        <span className="citacao-link-action">Abrir no texto &rarr;</span>
      </div>
      <p className="citacao-trecho">"{citacao.trecho}"</p>
    </div>
  );
};
