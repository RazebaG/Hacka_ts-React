import React, { useEffect, useRef, useState } from 'react';
import { FichaDocumento } from '../api/types';
import { navegar, url } from '../app/rotas';
import { PopupSecao } from './PopupSecao';
import { VarianteMesa, minusculaInicial } from './mesa/comum';
import { MesaCabecalho } from './mesa/MesaCabecalho';
import { FaixaPrecisaDeVoce } from './mesa/FaixaPrecisaDeVoce';
import { MapaCalor } from './mesa/MapaCalor';
import { GradeBlocos } from './mesa/GradeBlocos';
import { DetalheBloco } from './mesa/DetalheBloco';

/**
 * Mesa de decisão (FLUXO-DE-TELAS-FICHA §0, RF71–RF76): o documento "desmiuçado" para decidir.
 * Um só componente: `compacta` na tela inicial (T1) e `completa` na Ficha (T14).
 * Aqui fica só o estado (bloco escolhido, seção em foco, pop-up aberto); as partes estão em ./mesa/.
 * Na variante completa a Mesa não é um cartão: a Ficha já tem o próprio cabeçalho com o título,
 * e o cabeçalho da Mesa já é uma caixa (evita cartão dentro de cartão e o título repetido).
 */

const FAMILIA_PERGUNTA: Record<string, string> = { contrato: 'a este contrato', norma: 'a esta norma', procedimento: 'a este procedimento', nota_tecnica: 'a esta nota técnica' };

export const MesaDocumento: React.FC<{ ficha: FichaDocumento; variante: VarianteMesa }> = ({ ficha, variante }) => {
  const blocos = ficha.blocos ?? [];
  // ?bloco= reabre o bloco que estava escolhido
  const [ativoId, setAtivoId] = useState<string | null>(() => {
    const b = new URLSearchParams(window.location.search).get('bloco');
    return b && blocos.some((x) => x.id === b) ? b : null;
  });
  const chaveDoc = useRef(`${ficha.codigo}@${ficha.versao}`);
  const [secaoFoco, setSecaoFoco] = useState<string | null>(null);
  // Pop-up de resumo da seção: abre ao clicar numa célula do mapa (?secao= abre direto, link compartilhável)
  const [secaoAberta, setSecaoAberta] = useState<string | null>(() => {
    const s = new URLSearchParams(window.location.search).get('secao');
    return s && ficha.mapa_calor.some((c) => c.secao_id === s) ? s : null;
  });
  const [pergunta, setPergunta] = useState('');
  const ativo = blocos.find((b) => b.id === ativoId) ?? null;

  // Trocou de documento: fecha o detalhe
  useEffect(() => {
    const chave = `${ficha.codigo}@${ficha.versao}`;
    if (chave === chaveDoc.current) return;
    chaveDoc.current = chave;
    setAtivoId(null);
    setSecaoFoco(null);
    setSecaoAberta(null);
  }, [ficha.codigo, ficha.versao]);

  // Mantém ?secao= na URL enquanto o pop-up está aberto (sem criar entrada no histórico)
  useEffect(() => {
    const u = new URL(window.location.href);
    if (secaoAberta) u.searchParams.set('secao', secaoAberta);
    else if (u.searchParams.has('secao')) u.searchParams.delete('secao');
    else return;
    window.history.replaceState(null, '', u.pathname + u.search + u.hash);
  }, [secaoAberta]);

  // Esc fecha o detalhe (RF76, teclado)
  useEffect(() => {
    if (!ativoId || secaoAberta) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAtivoId(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [ativoId, secaoAberta]);

  const perguntar = (e: React.FormEvent) => {
    e.preventDefault();
    if (pergunta.trim()) navegar(url.perguntar(pergunta.trim(), [ficha.codigo]));
  };
  const exemplo = ficha.perguntas_sugeridas?.[0];
  const placeholder = `Pergunte ${FAMILIA_PERGUNTA[ficha.familia ?? ''] ?? 'a este documento'}${exemplo ? `: ${minusculaInicial(exemplo)}` : '…'}`;

  return (
    <section
      className={`mesa mesa-${variante}`}
      aria-label={variante === 'compacta' ? `Mesa de decisão: ${ficha.identidade.titulo}` : 'Mesa de decisão'}
      data-testid={variante === 'completa' ? 'ficha-relance' : 'mesa'}
    >
      <MesaCabecalho ficha={ficha} variante={variante}>
        <FaixaPrecisaDeVoce ficha={ficha} />
      </MesaCabecalho>

      <MapaCalor ficha={ficha} variante={variante} ativo={ativo} secaoFoco={secaoFoco} onFocoSecao={setSecaoFoco} onAbrirSecao={setSecaoAberta} />

      <GradeBlocos ficha={ficha} ativoId={ativoId} secaoFoco={secaoFoco} onEscolher={(id) => setAtivoId((x) => (x === id ? null : id))} />

      <DetalheBloco ficha={ficha} ativo={ativo} onFechar={() => setAtivoId(null)} />

      {/* Pergunta limitada ao documento */}
      <div className="mesa-rodape">
        <form className="mesa-pergunta" onSubmit={perguntar} role="search">
          <label htmlFor={`mesa-pergunta-${variante}`} className="sr-only">
            Pergunte a este documento
          </label>
          <input id={`mesa-pergunta-${variante}`} type="search" placeholder={placeholder} value={pergunta} onChange={(e) => setPergunta(e.target.value)} data-testid="mesa-pergunta" />
        </form>
      </div>
      {secaoAberta && <PopupSecao ficha={ficha} secaoId={secaoAberta} onFechar={() => setSecaoAberta(null)} onAbrir={setSecaoAberta} />}
    </section>
  );
};
