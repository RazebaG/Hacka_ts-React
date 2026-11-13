import React from 'react';
import { BlocoDecisao, FichaDocumento } from '../../api/types';
import { TOM, VarianteMesa } from './comum';

interface Props {
  ficha: FichaDocumento;
  variante: VarianteMesa;
  ativo: BlocoDecisao | null;
  secaoFoco: string | null;
  onFocoSecao: (secaoId: string | null) => void;
  onAbrirSecao: (secaoId: string) => void;
}

/**
 * "Onde isso está no documento" (RF75): uma célula por seção, cinza ao abrir; acende as seções do bloco escolhido.
 * Clicar (ou Enter) numa célula abre o pop-up de resumo daquela seção.
 */
export const MapaCalor: React.FC<Props> = ({ ficha, variante, ativo, secaoFoco, onFocoSecao, onAbrirSecao }) => {
  const blocos = ficha.blocos ?? [];
  const id = ficha.identidade;
  const celulas = [...ficha.mapa_calor].sort((a, b) => a.ordem - b.ordem);
  const destacadas = ativo ? celulas.filter((c) => ativo.secoes_mapa.includes(c.secao_id)).length : 0;
  const blocosDaSecao = (secao: string) => blocos.filter((b) => b.secoes_mapa.includes(secao)).map((b) => b.titulo);
  // Compacta: uma célula por seção (43 no contrato), como no protótipo; completa: largura pelo texto
  const total = Math.max(id.metricas.secoes, ...celulas.map((c) => c.ordem));
  const posicoes =
    variante === 'compacta' && celulas.every((c) => c.ordem >= 1 && c.ordem <= total)
      ? Array.from({ length: total }, (_, k) => celulas.find((c) => c.ordem === k + 1) ?? null)
      : celulas;

  return (
    <div className="mesa-mapa">
      <div className="mesa-mapa-topo">
        <span>
          Onde isso está · {id.camada.tipo_nome} · {id.metricas.secoes} seções
          {variante === 'completa' && celulas.length < id.metricas.secoes && ` (mostrando ${celulas.length})`}
        </span>
        <span aria-live="polite" data-testid="mesa-mapa-dica">
          {secaoFoco
            ? `${secaoFoco}: ${blocosDaSecao(secaoFoco).join(' · ') || 'nenhum bloco usa esta seção'}`
            : ativo
            ? `${destacadas} ${destacadas === 1 ? 'seção destacada' : 'seções destacadas'}`
            : 'Escolha um bloco ou clique numa seção'}
        </span>
      </div>
      <div className="mapa-faixa mesa-faixa" role="list" aria-label="Seções do documento, da primeira à última">
        {posicoes.map((c, k) => {
          if (!c) return <span key={`vazia-${k}`} className="mesa-celula vazia" role="listitem" aria-hidden="true" />;
          const acesa = ativo?.secoes_mapa.includes(c.secao_id);
          return (
            <button
              key={c.secao_id}
              type="button"
              role="listitem"
              className={`mesa-celula ${acesa ? `acesa tom-${TOM[ativo!.sinal]}` : ''}`}
              style={variante === 'completa' ? { flexGrow: Math.max(c.peso, 0.01) * 100 } : undefined}
              title={`${c.secao_id} · ${c.titulo}`}
              aria-label={`${c.secao_id}, ${c.titulo}${acesa ? ' (usada no bloco escolhido)' : ''}. Abrir o resumo da seção.`}
              data-secao={c.secao_id}
              onMouseEnter={() => onFocoSecao(c.secao_id)}
              onMouseLeave={() => onFocoSecao(null)}
              onFocus={() => onFocoSecao(c.secao_id)}
              onBlur={() => onFocoSecao(null)}
              onClick={() => onAbrirSecao(c.secao_id)}
            />
          );
        })}
      </div>
      {variante === 'completa' && (
        <details className="mapa-lista">
          <summary>Ver o mapa em lista</summary>
          <ol>
            {celulas.map((c) => (
              <li key={c.secao_id}>
                <button type="button" className="fg-link" onClick={() => onAbrirSecao(c.secao_id)}>
                  {c.secao_id} · {c.titulo}
                </button>
                {blocosDaSecao(c.secao_id).length > 0 && <span className="fg-sub"> ({blocosDaSecao(c.secao_id).join(', ')})</span>}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
};
