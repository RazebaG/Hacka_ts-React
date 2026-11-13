import React from 'react';
import { Citacao } from '../api/types';
import { camadaDe } from '../mocks/v2';
import { SemQuebra } from '../ui/componentes';
import { navegar, url } from '../app/rotas';

interface CitacaoCardProps {
  citacao: Citacao;
  onSelect: (codigo: string, versao: string, secao: string) => void;
}

export const CitacaoCard: React.FC<CitacaoCardProps> = ({ citacao, onSelect }) => {
  const c = camadaDe(citacao.codigo);
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
        <a
          className="citacao-link-action citacao-ficha"
          href={url.ficha(citacao.codigo, citacao.versao)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navegar(url.ficha(citacao.codigo, citacao.versao));
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          Ver ficha
        </a>
      </div>
      <span className="fonte-camada">
        <SemQuebra texto={`${c.sigla} ${c.tipo_nome} · ${c.grupo}${c.subordinado_a ? ` · subordinado à ${c.subordinado_a}` : ''}`} />
      </span>
      <p className="citacao-trecho">"<SemQuebra texto={citacao.trecho} />"</p>
    </div>
  );
};
