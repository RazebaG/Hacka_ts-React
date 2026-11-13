import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FichaDocumento, FonteFicha } from '../api/types';
import { fetchFicha } from '../api/client';
import { navegar, url } from '../app/rotas';
import { DURACAO_ALVO_S, montarCartoes, podeApresentar } from '../ficha/cartoes';
import { SemaforoSituacao, SeloOrigem } from './FichaPecas';
import { Icon } from '../ui/Icon';

export { montarCartoes } from '../ficha/cartoes';
export type { Cartao } from '../ficha/cartoes';

/** De onde a apresentação foi aberta (Mesa no Início ou Ficha) e o bloco que estava escolhido. */
function origemDaUrl(): { de?: 'inicio' | 'ficha'; bloco: string | null } {
  const q = new URLSearchParams(window.location.search);
  const de = q.get('de');
  return { de: de === 'inicio' || de === 'ficha' ? de : undefined, bloco: q.get('bloco') };
}

const fmtTempo = (s: number) => `${s < 0 ? '-' : ''}${Math.floor(Math.abs(s) / 60)}:${String(Math.abs(s) % 60).padStart(2, '0')}`;

/** Ritmo do cartão atual em relação ao relógio (§5.1), com folga de 10 s. */
export function ritmo(decorrido: number, inicioCartao: number, fimCartao: number): 'adiantado' | 'no ritmo' | 'atrasado' {
  if (decorrido < inicioCartao - 10) return 'adiantado';
  if (decorrido > fimCartao + 10) return 'atrasado';
  return 'no ritmo';
}

const digitando = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  return !!t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable);
};

/**
 * T16 · Modo apresentação (RF58, MODO-APRESENTACAO-v1): até 8 cartões e 5 minutos.
 * Os cartões vêm da ficha, sem nova chamada de IA; cada item mantém a fonte.
 */
export const ApresentacaoView: React.FC<{ codigo: string; versao?: string; cartaoInicial?: number }> = ({ codigo, versao, cartaoInicial }) => {
  const [ficha, setFicha] = useState<FichaDocumento | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [atual, setAtual] = useState(Math.max(0, (cartaoInicial ?? 1) - 1));
  const [restante, setRestante] = useState<number | null>(null);
  const [pausado, setPausado] = useState(false);
  const [notas, setNotas] = useState(false);
  const [imprimirNotas, setImprimirNotas] = useState(false);
  const [fonteAberta, setFonteAberta] = useState<FonteFicha | null>(null);
  const palco = useRef<HTMLDivElement>(null);
  const toque = useRef<number | null>(null);

  useEffect(() => {
    fetchFicha(codigo, versao)
      .then(setFicha)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Não conseguimos abrir a apresentação.'));
  }, [codigo, versao]);

  const cartoes = useMemo(() => (ficha ? montarCartoes(ficha) : []), [ficha]);
  const total = cartoes.length;
  const cartao = cartoes[Math.min(atual, Math.max(0, total - 1))];

  const sair = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => undefined);
    const { de, bloco } = origemDaUrl();
    navegar(de === 'inicio' ? url.inicio(codigo, bloco ?? undefined) : url.ficha(codigo, versao, bloco ?? undefined));
  }, [codigo, versao]);

  // Trocar de cartão preserva o resto do endereço (?versao, ?perfil, ?de, ?bloco)
  const ir = useCallback(
    (i: number) => {
      if (!total) return;
      const n = Math.min(total - 1, Math.max(0, i));
      setAtual(n);
      setFonteAberta(null);
      const q = new URLSearchParams(window.location.search);
      q.set('cartao', String(n + 1));
      navegar(`${window.location.pathname}?${q.toString()}`, true);
    },
    [total]
  );

  const telaCheia = useCallback(() => {
    (document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.())?.catch?.(() => undefined);
  }, []);

  const relogio = useCallback(() => {
    if (restante === null) {
      setRestante(DURACAO_ALVO_S);
      setPausado(false);
    } else setPausado((p) => !p);
  }, [restante]);

  /** `S`: abre a fonte do item em foco (ou o primeiro item com fonte do cartão). */
  const abrirFonteEmFoco = useCallback(() => {
    if (!cartao) return;
    const li = (document.activeElement as HTMLElement | null)?.closest?.('li[data-linha]');
    const j = li ? Number(li.getAttribute('data-linha')) : -1;
    const linha = (j >= 0 ? cartao.linhas[j] : undefined) ?? cartao.linhas.find((l) => l.fontes.length);
    if (linha?.fontes[0]) setFonteAberta(linha.fontes[0]);
  }, [cartao]);

  // Teclado (§5.2)
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (digitando(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (['ArrowRight', 'PageDown', ' '].includes(k)) {
        e.preventDefault();
        ir(atual + 1);
      } else if (['ArrowLeft', 'PageUp'].includes(k)) {
        e.preventDefault();
        ir(atual - 1);
      } else if (k === 'Home') ir(0);
      else if (k === 'End') ir(total - 1);
      else if (/^[1-8]$/.test(k) && Number(k) <= total) ir(Number(k) - 1);
      else if (k === 't' || k === 'T') relogio();
      else if (k === 'n' || k === 'N') setNotas((v) => !v);
      else if (k === 's' || k === 'S') abrirFonteEmFoco();
      else if (k === 'f' || k === 'F') telaCheia();
      else if (k === 'Escape') {
        if (fonteAberta) setFonteAberta(null);
        else if (!document.fullscreenElement) sair();
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [atual, total, ir, sair, fonteAberta, relogio, abrirFonteEmFoco, telaCheia]);

  // Cronômetro regressivo de 5:00, pausável; passa de 0:00 sem cortar a apresentação
  useEffect(() => {
    if (restante === null || pausado) return;
    const t = setTimeout(() => setRestante((r) => (r === null ? r : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [restante, pausado]);

  useEffect(() => {
    palco.current?.focus();
  }, [atual]);

  if (erro)
    return (
      <div className="apresentacao" data-testid="apresentacao-erro">
        <div className="apresentacao-cartao ativo">
          <h1>{erro}</h1>
          <button type="button" className="btn btn-primary" onClick={() => navegar(url.catalogo())}>
            Ir para Documentos
          </button>
        </div>
      </div>
    );
  if (ficha && !podeApresentar(ficha))
    return (
      <div className="apresentacao" data-testid="apresentacao-sem-resumo">
        <div className="apresentacao-cartao ativo">
          <h1>Este documento ainda não tem resumo pronto.</h1>
          <p className="apresentacao-detalhe">A apresentação precisa ao menos da capa, de uma frase do documento e da cobertura. Use a ficha enquanto isso.</p>
          <button type="button" className="btn btn-primary" onClick={sair}>
            Voltar
          </button>
        </div>
      </div>
    );
  if (!ficha || !cartao)
    return (
      <div className="apresentacao loading-state" aria-busy="true">
        <div className="spinner"></div>
        <p>Montando a apresentação…</p>
      </div>
    );

  const inicio = cartoes.slice(0, atual).reduce((s, k) => s + k.tempo_s, 0);
  const decorrido = restante === null ? null : DURACAO_ALVO_S - restante;
  const passo = decorrido === null ? null : ritmo(decorrido, inicio, inicio + cartao.tempo_s);

  return (
    <div
      className={`apresentacao ${imprimirNotas ? 'imprimir-notas' : ''}`}
      data-testid="apresentacao"
      role="region"
      aria-roledescription="apresentação"
      aria-label={`Apresentação de ${ficha.identidade.titulo}`}
      onTouchStart={(e) => (toque.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const x0 = toque.current;
        const x1 = e.changedTouches[0]?.clientX;
        toque.current = null;
        if (x0 === null || x1 === undefined || Math.abs(x1 - x0) < 50) return;
        ir(x1 < x0 ? atual + 1 : atual - 1);
      }}
    >
      <header className="apresentacao-topo print-hidden">
        <span className="fg-codigo">{ficha.codigo}</span>
        <span className="apresentacao-indicador" data-testid="apresentacao-indicador">
          {atual + 1} de {total}
        </span>
        <span className="sr-only" aria-live="polite" data-testid="apresentacao-anuncio">
          Cartão {atual + 1} de {total}: {cartao.titulo}
        </span>
        <div className="apresentacao-controles">
          {restante === null ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={relogio} data-testid="apresentacao-iniciar-relogio">
              <Icon nome="historico" tamanho={15} /> Cronômetro 5:00
            </button>
          ) : (
            <>
              <button
                type="button"
                className={`btn btn-sm apresentacao-relogio ${restante <= 0 ? 'zero' : restante <= 60 ? 'fim' : ''}`}
                onClick={relogio}
                aria-label={`Tempo restante ${fmtTempo(restante)}. ${pausado ? 'Retomar' : 'Pausar'} o cronômetro (T).`}
                aria-pressed={pausado}
                data-testid="apresentacao-relogio"
              >
                {pausado ? '❚❚ ' : ''}
                {fmtTempo(restante)}
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setRestante(null)} aria-label="Ocultar o cronômetro">
                <Icon nome="fechar" tamanho={13} />
              </button>
            </>
          )}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setNotas((v) => !v)} aria-pressed={notas} data-testid="apresentacao-notas-botao">
            Notas (N)
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={telaCheia}>
            Tela cheia
          </button>
          <label className="apresentacao-imprimir-notas">
            <input type="checkbox" checked={imprimirNotas} onChange={(e) => setImprimirNotas(e.target.checked)} /> Notas no PDF
          </label>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Icon nome="baixar" tamanho={15} /> Exportar PDF
          </button>
          <button type="button" className="btn btn-escuro btn-sm" onClick={sair} data-testid="apresentacao-sair">
            <Icon nome="fechar" tamanho={15} /> Sair
          </button>
        </div>
      </header>

      {/* Indicador de ritmo: um segmento por cartão, largura pelo tempo previsto (§5.1) */}
      <div className="apresentacao-ritmo print-hidden" data-testid="apresentacao-ritmo">
        <div className="apresentacao-segmentos" aria-hidden="true">
          {cartoes.map((k, i) => (
            <span key={k.tipo} style={{ flexGrow: k.tempo_s }} className={i < atual ? 'feito' : i === atual ? `atual ${passo ? passo.replace(' ', '-') : ''}` : ''} />
          ))}
        </div>
        <span className="fg-sub">
          ~{cartao.tempo_s} s neste cartão{passo ? ` · ${passo}` : ''}
        </span>
      </div>

      {/* Na tela, um cartão por vez; na impressão, todos (um por página, A4 paisagem) */}
      {cartoes.map((k, i) => (
        <section
          key={k.tipo}
          ref={i === atual ? palco : undefined}
          tabIndex={-1}
          className={`apresentacao-cartao cartao-${k.tipo} ${i === atual ? 'ativo' : ''}`}
          aria-hidden={i !== atual}
          data-testid={i === atual ? 'apresentacao-cartao' : undefined}
        >
          <p className="apresentacao-tempo print-hidden">
            Cartão {i + 1} · ~{k.tempo_s} s
          </p>
          {k.tipo === 'capa' && <SemaforoSituacao nivel={ficha.semaforo.nivel} />}
          <h1 className="apresentacao-titulo">{k.titulo}</h1>
          <ul className={`apresentacao-linhas ${k.tipo === 'numeros' ? 'em-grade' : ''}`}>
            {k.linhas.map((l, j) => (
              <li key={j} className={l.hoje ? 'hoje' : ''} data-linha={j}>
                {l.valor && k.tipo !== 'capa' && <strong className="apresentacao-valor">{l.valor}</strong>}
                <span className="apresentacao-texto">{l.texto}</span>
                {l.detalhe && <span className="apresentacao-detalhe">{l.detalhe}</span>}
                {(l.origem || l.fontes.length > 0) && (
                  <span className="apresentacao-fontes">
                    {l.origem && <SeloOrigem origem={l.origem} />}
                    {l.fontes.slice(0, k.tipo === 'fontes' ? 12 : 2).map((x, n) => (
                      <button key={n} type="button" className="fonte-link" onClick={() => setFonteAberta(x)} aria-label={`Ver o trecho de ${x.codigo}, ${x.secao}`}>
                        <Icon nome="documento" tamanho={14} /> {x.codigo} · {x.secao}
                      </button>
                    ))}
                    {/* Na impressão, a fonte sai por extenso abaixo do item */}
                    {l.fontes[0] && k.tipo !== 'fontes' && (
                      <span className="apresentacao-fonte-impressa">
                        Fonte: {l.fontes[0].codigo} · v{l.fontes[0].versao} · {l.fontes[0].secao}
                      </span>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {k.tipo === 'capa' && ficha.bluf === null && <p className="apresentacao-detalhe">Sem resumo da IA: esta apresentação usa só trechos do documento.</p>}
          <p className="apresentacao-notas-impressas">Notas: {k.notas}</p>
        </section>
      ))}

      {notas && (
        <aside className="apresentacao-notas print-hidden" aria-label="Notas do apresentador" data-testid="apresentacao-notas">
          <strong>Notas do apresentador · cartão {atual + 1}</strong>
          <p>{cartao.notas}</p>
        </aside>
      )}

      {fonteAberta && (
        <aside className="apresentacao-fonte print-hidden" role="dialog" aria-label="Trecho da fonte" data-testid="apresentacao-fonte">
          <div className="fg-cabeca-card">
            <strong>
              {fonteAberta.codigo} · {fonteAberta.secao}
            </strong>
            <button type="button" className="fg-acao" onClick={() => setFonteAberta(null)} aria-label="Fechar o trecho">
              <Icon nome="fechar" tamanho={16} />
            </button>
          </div>
          <blockquote className="fg-trecho">{fonteAberta.trecho}</blockquote>
          <a className="fg-link" href={url.documento(fonteAberta.codigo, fonteAberta.versao, fonteAberta.secao)} target="_blank" rel="noopener">
            Abrir no texto completo (nova aba)
          </a>
        </aside>
      )}

      <nav className="apresentacao-navegacao print-hidden" aria-label="Navegar entre os cartões">
        <button type="button" className="btn btn-outline" onClick={() => ir(atual - 1)} disabled={atual === 0} aria-label="Cartão anterior" data-testid="apresentacao-anterior">
          <Icon nome="recolher" tamanho={18} /> Anterior
        </button>
        <div className="apresentacao-pontos" role="tablist" aria-label="Cartões">
          {cartoes.map((k, i) => (
            <button key={k.tipo} type="button" role="tab" aria-selected={i === atual} aria-label={`Cartão ${i + 1}: ${k.titulo}`} className={i === atual ? 'ativo' : ''} onClick={() => ir(i)} />
          ))}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => ir(atual + 1)} disabled={atual === total - 1} aria-label="Próximo cartão" data-testid="apresentacao-proximo">
          Próximo <Icon nome="seta" tamanho={18} />
        </button>
      </nav>
      <p className="apresentacao-dica print-hidden">
        Setas ou deslizar: trocar de cartão · 1–8: ir ao cartão · T: cronômetro · N: notas · S: fonte · F: tela cheia · Esc: sair
      </p>
    </div>
  );
};
