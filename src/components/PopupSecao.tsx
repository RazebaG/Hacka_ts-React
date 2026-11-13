import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DocumentoDetalhe, FichaDocumento } from '../api/types';
import { fetchDocumentoDetalhe } from '../api/client';
import { navegar, url } from '../app/rotas';
import { ROTULO_SINAL, Sinal, montarResumoSecao } from '../ficha/resumoSecao';
import { Icon } from '../ui/Icon';

/**
 * Pop-up de resumo explicado da seção, aberto pelo mapa de calor (POPUP-RESUMO-DA-SECAO-v1).
 * Fundo desfocado, foco contido, Esc/×/clique no fundo fecham e o foco volta à célula que abriu.
 * Sem IA: "Principais trechos" no lugar de "Em palavras simples" (P1, endpoint C28).
 */
interface Props {
  ficha: FichaDocumento;
  secaoId: string;
  onFechar: () => void;
  onAbrir: (secaoId: string) => void;
}

const FOCAVEIS = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
const PALAVRAS_LONGO = 400;

export const PopupSecao: React.FC<Props> = ({ ficha, secaoId, onFechar, onAbrir }) => {
  const [doc, setDoc] = useState<DocumentoDetalhe | null>(null);
  const [erro, setErro] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const corpo = useRef<HTMLDivElement>(null);
  const origem = useRef<HTMLElement | null>(typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null);

  useEffect(() => {
    let ativo = true;
    setDoc(null);
    setErro(false);
    fetchDocumentoDetalhe(ficha.codigo, ficha.versao)
      .then((d) => ativo && setDoc(d))
      .catch(() => ativo && setErro(true));
    return () => {
      ativo = false;
    };
  }, [ficha.codigo, ficha.versao]);

  // Seção aberta por último: se quem abriu o pop-up sumiu (ex.: aberto por ?secao=), o foco volta à célula dela
  const ultimaSecao = useRef(secaoId);
  ultimaSecao.current = secaoId;

  // Trava a rolagem da página, leva o foco para dentro e devolve ao fechar
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    caixa.current?.focus();
    const alvo = origem.current;
    return () => {
      document.body.style.overflow = anterior;
      const valido = alvo && alvo !== document.body && alvo.isConnected;
      const celula = Array.from(document.querySelectorAll<HTMLElement>('[data-secao]')).find((el) => el.dataset.secao === ultimaSecao.current);
      (valido ? alvo : celula)?.focus?.();
    };
  }, []);

  const resumo = useMemo(() => (doc ? montarResumoSecao(ficha, doc, secaoId) : null), [ficha, doc, secaoId]);
  // Título da seção já ao abrir (vem do mapa de calor), para o leitor de tela anunciar o nome completo
  const tituloSecao = resumo?.secao.titulo ?? ficha.mapa_calor.find((c) => c.secao_id === secaoId)?.titulo ?? '';
  const nomeSecao = tituloSecao && tituloSecao !== secaoId ? `${secaoId} · ${tituloSecao}` : secaoId;

  // Trocou de seção (Anterior/Próxima, "Ligada a"): volta ao topo. O diálogo continua aberto e o leitor de tela
  // não relê o título, então o novo nome vai para uma região viva. Se o botão usado ficou desativado
  // (primeira ou última seção), o foco não se perde: vai para o próprio pop-up.
  const [anuncio, setAnuncio] = useState('');
  const navegou = useRef(false);
  const secaoAnterior = useRef(secaoId);
  useEffect(() => {
    if (secaoAnterior.current === secaoId) return;
    secaoAnterior.current = secaoId;
    navegou.current = true;
    corpo.current?.scrollTo?.({ top: 0 });
    const focado = document.activeElement as HTMLButtonElement | null;
    if (!caixa.current?.contains(focado) || focado?.disabled) caixa.current?.focus();
  }, [secaoId]);
  useEffect(() => {
    if (navegou.current) setAnuncio(`Seção aberta: ${nomeSecao}`);
  }, [nomeSecao]);

  // Teclado: Esc fecha, setas trocam de seção (fora de campos), Tab fica preso no pop-up
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onFechar();
        return;
      }
      if (e.key === 'ArrowLeft' && resumo?.anterior) onAbrir(resumo.anterior);
      if (e.key === 'ArrowRight' && resumo?.proxima) onAbrir(resumo.proxima);
      if (e.key !== 'Tab' || !caixa.current) return;
      const itens = Array.from(caixa.current.querySelectorAll<HTMLElement>(FOCAVEIS));
      if (!itens.length) return;
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      const dentro = caixa.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === primeiro || !dentro)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !dentro)) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [onFechar, onAbrir, resumo]);

  const ir = (destino: string) => () => {
    onFechar();
    navegar(destino);
  };

  const longo = resumo ? resumo.secao.texto.split(/\s+/).length > PALAVRAS_LONGO : false;
  const contagens = resumo?.sinais
    ? ([
        ['prazo', resumo.sinais.prazo],
        ['valor', resumo.sinais.valor],
        ['regra', resumo.sinais.obrigacao],
        ['risco', resumo.sinais.risco]
      ] as [Sinal, number][]).filter(([, n]) => n > 0)
    : [];

  const textoOriginal = resumo && (
    <p className="popup-original" lang="pt-BR">
      {resumo.segmentos.map((s, i) =>
        s.sinal ? (
          <mark key={i} className={`popup-marca sinal-${s.sinal}`}>
            {s.texto}
          </mark>
        ) : (
          <React.Fragment key={i}>{s.texto}</React.Fragment>
        )
      )}
    </p>
  );

  // Portal no body: o pop-up fica acima de qualquer contexto de empilhamento da página (barra superior, menus)
  return createPortal(
    <div className="popup-fundo" onMouseDown={(e) => e.target === e.currentTarget && onFechar()} data-testid="popup-fundo">
      <div ref={caixa} className="popup" role="dialog" aria-modal="true" aria-labelledby="popup-titulo" aria-describedby="popup-eyebrow" tabIndex={-1} data-testid="popup-secao">
        <header className="popup-cab">
          <div className="popup-cab-texto">
            <p id="popup-eyebrow" className="popup-eyebrow">
              {ficha.codigo}
              {resumo ? ` · seção ${resumo.posicao} de ${resumo.total}` : ''}
            </p>
            <h2 id="popup-titulo" className="popup-titulo">
              {secaoId}
              {tituloSecao && tituloSecao !== secaoId && <span> · {tituloSecao}</span>}
            </h2>
            <p className="sr-only" aria-live="polite" data-testid="popup-anuncio">
              {anuncio}
            </p>
          </div>
          <button type="button" className="popup-fechar" onClick={onFechar} aria-label="Fechar o resumo" data-testid="popup-fechar">
            <Icon nome="fechar" tamanho={16} />
          </button>
        </header>

        <div ref={corpo} className="popup-corpo" aria-busy={!doc && !erro}>
          {!doc && !erro && (
            <div className="popup-carregando" data-testid="popup-carregando">
              <span className="spinner" aria-hidden="true" /> Lendo a seção…
            </div>
          )}
          {erro && (
            <p className="popup-aviso" role="alert">
              Não consegui abrir esta seção agora. Você ainda pode ler o texto completo.
            </p>
          )}
          {doc && !resumo && <p className="popup-aviso">Não achei o texto desta seção. Você ainda pode abrir o documento completo.</p>}

          {resumo && (
            <>
              <section className="popup-sec" aria-labelledby="popup-s1">
                <h3 id="popup-s1" className="popup-rotulo">Principais trechos</h3>
                <ul className="popup-trechos">
                  {resumo.principais.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="popup-fonte">
                  {secaoId} · <span className="popup-selo">Sem IA: trechos do próprio documento</span>
                </p>
              </section>

              {resumo.pontos.length > 0 && (
                <section className="popup-sec" aria-labelledby="popup-s2">
                  <h3 id="popup-s2" className="popup-rotulo">O que ela diz, em pontos</h3>
                  <ul className="popup-pontos">
                    {resumo.pontos.map((p) => (
                      <li key={p.texto}>
                        <span className={`popup-ponto-selo sinal-${p.sinal}`}>{p.rotulo}</span>
                        <span className="popup-ponto-texto">{p.texto}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="popup-sec" aria-labelledby="popup-s3">
                <h3 id="popup-s3" className="popup-rotulo">Sinais nesta seção</h3>
                {resumo.semSinais ? (
                  <p className="popup-texto">Sem prazo, valor, obrigação ou risco: texto de apoio.</p>
                ) : (
                  <p className="popup-sinais">
                    {contagens.map(([s, n]) => (
                      <span key={s} className={`popup-ponto-selo sinal-${s}`}>
                        {ROTULO_SINAL[s]} {n}
                      </span>
                    ))}
                  </p>
                )}
                <p className="popup-nota">Sinais por palavra-chave: mostram onde olhar, não o que é mais importante. A importância está na ordem dos blocos.</p>
              </section>

              {resumo.relacionadas.length > 0 && (
                <section className="popup-sec" aria-labelledby="popup-s4">
                  <h3 id="popup-s4" className="popup-rotulo">Ligada a</h3>
                  <ul className="popup-chips">
                    {resumo.relacionadas.map((r) => (
                      <li key={r.id}>
                        <button type="button" className="popup-chip" onClick={() => onAbrir(r.id)} title={`${r.motivo}`}>
                          {r.id}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="popup-sec popup-sec-ultima" aria-labelledby="popup-s5">
                <h3 id="popup-s5" className="popup-rotulo">Texto original</h3>
                {longo ? (
                  <details>
                    <summary>Ver texto completo da seção</summary>
                    {textoOriginal}
                  </details>
                ) : (
                  textoOriginal
                )}
              </section>
            </>
          )}
        </div>

        <footer className="popup-rodape">
          <div className="popup-nav">
            <button type="button" className="btn btn-outline btn-sm" disabled={!resumo?.anterior} onClick={() => resumo?.anterior && onAbrir(resumo.anterior)} data-testid="popup-anterior">
              ← Anterior
            </button>
            <button type="button" className="btn btn-outline btn-sm" disabled={!resumo?.proxima} onClick={() => resumo?.proxima && onAbrir(resumo.proxima)} data-testid="popup-proxima">
              Próxima →
            </button>
          </div>
          <div className="popup-acoes">
            <button type="button" className="btn btn-outline btn-sm" onClick={ir(url.perguntar(`O que diz a ${secaoId}?`, [ficha.codigo]))} data-testid="popup-perguntar">
              Perguntar sobre esta seção
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={ir(url.documento(ficha.codigo, ficha.versao, secaoId))} data-testid="popup-abrir-texto">
              Abrir no texto completo
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
};
