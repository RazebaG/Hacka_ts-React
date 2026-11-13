import React, { useRef } from 'react';
import { BlocoDecisao as Bloco, FichaDocumento } from '../../api/types';
import { TOM } from './comum';

/** Bloco de decisão (RF73): o mesmo para todas as famílias; muda só o dado. */
export const BlocoDecisao: React.FC<{
  b: Bloco;
  ativo: boolean;
  ligado: boolean;
  onEscolher: () => void;
  onTecla: (e: React.KeyboardEvent) => void;
  refBtn: (el: HTMLButtonElement | null) => void;
}> = ({ b, ativo, ligado, onEscolher, onTecla, refBtn }) => (
  <button
    ref={refBtn}
    type="button"
    className={`mesa-bloco sinal-${b.sinal} ${ativo ? 'ativo' : ''} ${ligado ? 'ligado' : ''}`}
    aria-pressed={ativo}
    aria-controls="mesa-detalhe"
    onClick={onEscolher}
    onKeyDown={onTecla}
    data-testid={`bloco-${b.id}`}
  >
    <span className="mesa-bloco-topo">
      <span className="mesa-bloco-titulo">{b.titulo}</span>
      <span className={`mesa-bloco-relevancia tom-${TOM[b.sinal]}`} title={`${b.relevancia.posicao}º · ${b.relevancia.motivo}`} data-testid={`relevancia-${b.id}`}>
        {b.relevancia.posicao}º · {b.relevancia.motivo}
      </span>
    </span>
    <strong className="mesa-bloco-destaque">{b.destaque}</strong>
    {b.apoio && <span className="mesa-bloco-apoio">{b.apoio}</span>}
  </button>
);

interface Props {
  ficha: FichaDocumento;
  ativoId: string | null;
  secaoFoco: string | null;
  onEscolher: (id: string) => void;
}

/** Blocos por família (RF73), ordenados por relevância (RF74). Setas movem o foco entre os blocos. */
export const GradeBlocos: React.FC<Props> = ({ ficha, ativoId, secaoFoco, onEscolher }) => {
  const blocos = ficha.blocos ?? [];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const gerando = ficha.estado === 'gerando' || ficha.estado === 'parcial';

  const tecla = (i: number) => (e: React.KeyboardEvent) => {
    const alvo = ['ArrowRight', 'ArrowDown'].includes(e.key) ? i + 1 : ['ArrowLeft', 'ArrowUp'].includes(e.key) ? i - 1 : -1;
    if (alvo >= 0 && alvo < blocos.length) {
      e.preventDefault();
      refs.current[alvo]?.focus();
    }
  };

  if (gerando && !blocos.length) {
    return (
      <div className="mesa-blocos" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mesa-bloco triagem-esqueleto" />
        ))}
        {ficha.progresso && (
          <p className="fg-sub" aria-live="polite">
            {ficha.progresso.etapa} ({ficha.progresso.feito}/{ficha.progresso.total})
          </p>
        )}
      </div>
    );
  }
  if (!blocos.length) return <p className="fg-sub">Nenhum bloco de decisão saiu deste documento por regra. Leia o texto completo.</p>;

  return (
    <div className="mesa-blocos" role="group" aria-label="Blocos de decisão, do mais importante ao menos" data-testid="mesa-blocos">
      {blocos.map((b, i) => (
        <BlocoDecisao
          key={b.id}
          b={b}
          ativo={ativoId === b.id}
          ligado={Boolean(secaoFoco && b.secoes_mapa.includes(secaoFoco))}
          onEscolher={() => onEscolher(b.id)}
          onTecla={tecla(i)}
          refBtn={(el) => (refs.current[i] = el)}
        />
      ))}
    </div>
  );
};
