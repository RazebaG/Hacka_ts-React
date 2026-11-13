import React, { useEffect, useRef, useState } from 'react';
import { AcaoFicha, BlocoDecisao, FichaDocumento, ItemFicha, SinalBloco } from '../api/types';
import { navegar, url } from '../app/rotas';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { FonteLink } from '../ui/componentes';
import { Icon } from '../ui/Icon';
import { SeloOrigem, SemaforoSituacao } from './FichaPecas';

/**
 * Mesa de decisão (FLUXO-DE-TELAS-FICHA §0, RF71–RF76): o documento "desmiuçado" para decidir.
 * Um só componente: `compacta` na tela inicial (T1) e `completa` na Ficha (T14).
 */

const SINAL: Record<SinalBloco, { rotulo: string; icone: string }> = {
  valor: { rotulo: 'Valor', icone: 'financeiro' },
  prazo: { rotulo: 'Prazo', icone: 'calendario' },
  responsavel: { rotulo: 'Responsável', icone: 'usuario' },
  risco: { rotulo: 'Risco', icone: 'alerta' },
  regra: { rotulo: 'Regra', icone: 'escudo' },
  alerta: { rotulo: 'Alerta', icone: 'alerta' }
};

const dataBR = (iso: string | null) => (iso ? iso.split('-').reverse().join('/') : '');
const ir = (destino: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  navegar(destino);
};

/** Acha os itens com fonte que sustentam o bloco (ids de ações, números e pontos). */
function itensDoBloco(f: FichaDocumento, b: BlocoDecisao): (ItemFicha | AcaoFicha)[] {
  const todos: (ItemFicha | AcaoFicha)[] = [...f.numeros, ...f.acoes, ...Object.values(f.pontos).flat()];
  return b.itens.map((id) => todos.find((i) => i.id === id)).filter(Boolean) as (ItemFicha | AcaoFicha)[];
}
const textoItem = (i: ItemFicha | AcaoFicha) => ('acao' in i ? i.acao : i.titulo);
const valorItem = (i: ItemFicha | AcaoFicha) => ('acao' in i ? (i.prazo?.data ? `até ${dataBR(i.prazo.data)}` : i.prazo?.regra ?? null) : i.valor);

/** Bloco de decisão (BlocoDecisao): o mesmo para todas as famílias; muda só o dado. */
const Bloco: React.FC<{
  b: BlocoDecisao;
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
    <span className="mesa-bloco-relevancia">
      {b.relevancia.posicao}º · {b.relevancia.motivo}
    </span>
    <span className="mesa-bloco-titulo">
      <Icon nome={SINAL[b.sinal].icone} tamanho={15} /> {b.titulo}
    </span>
    <strong className="mesa-bloco-destaque">{b.destaque}</strong>
    {b.apoio && <span className="mesa-bloco-apoio">{b.apoio}</span>}
  </button>
);

/** Mínimo para existir apresentação: capa, frase e "De onde vem" (MODO-APRESENTACAO §3). */
export const SEM_RESUMO = 'Este documento ainda não tem resumo pronto.';

export const MesaDocumento: React.FC<{ ficha: FichaDocumento; variante: 'compacta' | 'completa' }> = ({ ficha, variante }) => {
  const blocos = ficha.blocos ?? [];
  // ?bloco= (volta da apresentação) reabre o bloco que estava escolhido
  const [ativoId, setAtivoId] = useState<string | null>(() => {
    const b = new URLSearchParams(window.location.search).get('bloco');
    return b && blocos.some((x) => x.id === b) ? b : null;
  });
  const chaveDoc = useRef(`${ficha.codigo}@${ficha.versao}`);
  const [secaoFoco, setSecaoFoco] = useState<string | null>(null);
  const [pergunta, setPergunta] = useState('');
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const ativo = blocos.find((b) => b.id === ativoId) ?? null;
  const id = ficha.identidade;
  const celulas = [...ficha.mapa_calor].sort((a, b) => a.ordem - b.ordem);
  const acao = [...ficha.acoes].sort((a, b) => ['alta', 'media', 'baixa'].indexOf(a.urgencia) - ['alta', 'media', 'baixa'].indexOf(b.urgencia))[0];
  const gerando = ficha.estado === 'gerando' || ficha.estado === 'parcial';
  const linkApresentar = url.apresentar(ficha.codigo, ficha.versao, undefined, { de: variante === 'compacta' ? 'inicio' : 'ficha', bloco: ativoId });

  // Trocou de documento: fecha o detalhe
  useEffect(() => {
    const chave = `${ficha.codigo}@${ficha.versao}`;
    if (chave === chaveDoc.current) return;
    chaveDoc.current = chave;
    setAtivoId(null);
    setSecaoFoco(null);
  }, [ficha.codigo, ficha.versao]);

  // Esc fecha o detalhe (RF76, teclado)
  useEffect(() => {
    if (!ativoId) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAtivoId(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [ativoId]);

  const tecla = (i: number) => (e: React.KeyboardEvent) => {
    const alvo = ['ArrowRight', 'ArrowDown'].includes(e.key) ? i + 1 : ['ArrowLeft', 'ArrowUp'].includes(e.key) ? i - 1 : -1;
    if (alvo >= 0 && alvo < blocos.length) {
      e.preventDefault();
      refs.current[alvo]?.focus();
    }
  };

  const perguntar = (e: React.FormEvent) => {
    e.preventDefault();
    if (pergunta.trim()) navegar(url.perguntar(pergunta.trim(), [ficha.codigo]));
  };

  const codigosCitados = (b: BlocoDecisao): string[] => [
    ...(b.destaque.match(/[A-Z]{2,3}_\d+(?:-\d+)?/g) ?? []),
    ...(b.apoio?.match(/[A-Z]{2,3}_\d+(?:-\d+)?/g) ?? [])
  ];

  return (
    <section className={`fg-card mesa mesa-${variante}`} aria-label={`Mesa de decisão: ${id.titulo}`} data-testid={variante === 'completa' ? 'ficha-relance' : 'mesa'}>
      {/* Cabeçalho resumido */}
      <header className="mesa-cabeca">
        <div className="mesa-cabeca-linha">
          <SemaforoSituacao nivel={ficha.semaforo.nivel} />
          {variante === 'compacta' && (
            <a className="fg-codigo fg-codigo-link" href={url.ficha(ficha.codigo, ficha.versao)} onClick={ir(url.ficha(ficha.codigo, ficha.versao))}>
              {ficha.codigo}
            </a>
          )}
          <span className="fg-pilula neutra">
            {id.camada.tipo_nome} · v{ficha.versao}
          </span>
          {id.classificacao && <span className="fg-pilula neutra">Classificação: {id.classificacao}</span>}
          <span className="fg-sub mesa-tempo" data-testid="ficha-tempo">
            <Icon nome="historico" tamanho={14} /> Leitura ~{id.metricas.leitura_integral_min} min · Ficha {id.metricas.leitura_ficha_min} min
          </span>
        </div>
        {variante === 'compacta' && <h2 className="mesa-titulo">{id.titulo}</h2>}
        <p className="mesa-situacao">
          {id.substituido
            ? `Versão substituída${id.vigente_em ? `: a que vale hoje é a ${id.vigente_em.versao}` : ''}`
            : id.vigencia.fim
            ? `Em vigor até ${dataBR(id.vigencia.fim)}${id.vigencia.dias_restantes !== null && id.vigencia.dias_restantes >= 0 ? ` (faltam ${id.vigencia.dias_restantes} dias)` : ''}`
            : `Vigência: ${id.vigencia.texto}`}
          {ficha.governanca.aprovado_por.valor && <span className="fg-sub"> · Aprovado por {ficha.governanca.aprovado_por.valor}</span>}
          {variante === 'compacta' && ficha.governanca.elaborado_por.valor && <span className="fg-sub"> · Elaborado por {ficha.governanca.elaborado_por.valor}</span>}
        </p>
      </header>

      {/* Precisa de você (RF72) */}
      {acao ? (
        <div className={`mesa-precisa urgencia-${acao.urgencia}`} data-testid="mesa-precisa">
          <span className="mesa-precisa-rotulo">
            <Icon nome="raio" tamanho={15} /> Precisa de você
          </span>
          <p>
            <strong>{acao.acao}</strong>
            {acao.prazo?.data && <> até {dataBR(acao.prazo.data)}</>}
            {acao.quem && <span className="fg-sub"> ({acao.quem})</span>}
          </p>
          {acao.consequencia && <p className="mesa-precisa-consequencia">Se não fizer: {acao.consequencia}</p>}
        </div>
      ) : (
        <p className="mesa-precisa mesa-precisa-vazia" data-testid="mesa-precisa">
          <Icon nome="info" tamanho={15} />{' '}
          {ficha.modo.ia === 'extrativo' ? 'Sem IA, as ações com responsável não são escritas. Os prazos e quem faz o quê estão nos blocos abaixo.' : 'Este documento não cria ações para você agora.'}
        </p>
      )}

      {/* Frase-resumo */}
      {ficha.bluf ? (
        <blockquote className="mesa-frase" data-testid="ficha-bluf">
          <p>{ficha.bluf.texto}</p>
          <footer>
            <SeloOrigem origem={ficha.bluf.origem} />
            {ficha.bluf.fontes.map((x, i) => (
              <FonteLink key={i} fonte={x} comSecao />
            ))}
          </footer>
        </blockquote>
      ) : (
        <p className="mesa-frase mesa-frase-vazia">{gerando ? 'Resumo da IA a caminho…' : 'Resumo em uma frase indisponível sem IA. Os blocos abaixo vêm direto do texto, com a fonte de cada um.'}</p>
      )}

      {/* Mapa de posição ligado aos blocos (RF75) */}
      <div className="mesa-mapa">
        <p className="fg-rotulo">
          Mapa do documento · {id.metricas.secoes} seções
          {celulas.length < id.metricas.secoes && ` · mostrando ${celulas.length}`}
          {ativo && ` · acesas: as seções de “${ativo.titulo}”`}
        </p>
        <div className="mapa-faixa" role="list" aria-label="Seções do documento, da primeira à última">
          {celulas.map((c) => {
            const acesa = ativo?.secoes_mapa.includes(c.secao_id);
            return (
              <button
                key={c.secao_id}
                type="button"
                role="listitem"
                className={`mapa-celula ${c.intensidade > 0 ? 'com-sinal' : ''} ${acesa ? `acesa sinal-${ativo!.sinal}` : ''} ${ativo && !acesa ? 'apagada' : ''}`}
                style={{ flexGrow: Math.max(c.peso, 0.01) * 100, ['--forca' as string]: c.intensidade.toFixed(2) }}
                title={`${c.secao_id} · ${c.titulo}`}
                aria-label={`${c.secao_id}, ${c.titulo}${acesa ? ' (usada no bloco escolhido)' : ''}. Abrir a seção.`}
                onMouseEnter={() => setSecaoFoco(c.secao_id)}
                onMouseLeave={() => setSecaoFoco(null)}
                onFocus={() => setSecaoFoco(c.secao_id)}
                onBlur={() => setSecaoFoco(null)}
                onClick={() => navegar(url.documento(ficha.codigo, ficha.versao, c.secao_id))}
              />
            );
          })}
        </div>
        {secaoFoco && (
          <p className="fg-sub mesa-mapa-dica" aria-live="polite">
            {secaoFoco}: {blocos.filter((b) => b.secoes_mapa.includes(secaoFoco)).map((b) => b.titulo).join(' · ') || 'nenhum bloco usa esta seção'}
          </p>
        )}
        <details className="mapa-lista">
          <summary>Ver o mapa em lista</summary>
          <ol>
            {celulas.map((c) => (
              <li key={c.secao_id}>
                <a className="fg-link" href={url.documento(ficha.codigo, ficha.versao, c.secao_id)} onClick={ir(url.documento(ficha.codigo, ficha.versao, c.secao_id))}>
                  {c.secao_id} · {c.titulo}
                </a>
                {blocos.some((b) => b.secoes_mapa.includes(c.secao_id)) && (
                  <span className="fg-sub"> ({blocos.filter((b) => b.secoes_mapa.includes(c.secao_id)).map((b) => b.titulo).join(', ')})</span>
                )}
              </li>
            ))}
          </ol>
        </details>
      </div>

      {/* Blocos por família (RF73), ordenados por relevância (RF74) */}
      {gerando && !blocos.length ? (
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
      ) : blocos.length ? (
        <div className="mesa-blocos" role="group" aria-label="Blocos de decisão, do mais importante ao menos" data-testid="mesa-blocos">
          {blocos.map((b, i) => (
            <Bloco
              key={b.id}
              b={b}
              ativo={ativoId === b.id}
              ligado={Boolean(secaoFoco && b.secoes_mapa.includes(secaoFoco))}
              onEscolher={() => setAtivoId((x) => (x === b.id ? null : b.id))}
              onTecla={tecla(i)}
              refBtn={(el) => (refs.current[i] = el)}
            />
          ))}
        </div>
      ) : (
        <p className="fg-sub">Nenhum bloco de decisão saiu deste documento por regra. Leia o texto completo.</p>
      )}

      {/* Detalhe com a fonte (RF76) */}
      {ativo && (
        <div id="mesa-detalhe" className="mesa-detalhe" role="region" aria-label={`Detalhe: ${ativo.titulo}`} data-testid="mesa-detalhe">
          <div className="fg-cabeca-card">
            <h3>
              <Icon nome={SINAL[ativo.sinal].icone} tamanho={16} /> {ativo.titulo}
            </h3>
            <button type="button" className="fg-acao" onClick={() => setAtivoId(null)} aria-label="Fechar o detalhe">
              <Icon nome="fechar" tamanho={16} />
            </button>
          </div>
          <ul className="mesa-detalhe-itens">
            {itensDoBloco(ficha, ativo).map((it) => (
              <li key={it.id}>
                <div className="ficha-acao-topo">
                  <span>
                    {valorItem(it) && <strong>{valorItem(it)} · </strong>}
                    {textoItem(it)}
                  </span>
                  <SeloOrigem origem={it.origem} />
                </div>
                {'calculo' in it && it.calculo && <p className="fg-sub">Conta: {it.calculo}</p>}
                {it.fontes.map((x, n) => (
                  <div key={n} className="mesa-trecho">
                    <q>{x.trecho}</q>
                    <span className="mesa-trecho-pe">
                      <span className="fg-rotulo">{x.secao}</span>
                      <a className="fg-link" href={url.documento(x.codigo, x.versao, x.secao)} onClick={ir(url.documento(x.codigo, x.versao, x.secao))}>
                        Abrir no texto completo <Icon nome="seta" tamanho={13} />
                      </a>
                    </span>
                  </div>
                ))}
              </li>
            ))}
            {ativo.alerta !== undefined && ficha.alertas[ativo.alerta] && (
              <li>
                <p>
                  <strong>{ficha.alertas[ativo.alerta].titulo}</strong>
                </p>
                <p className="fg-sub">{ficha.alertas[ativo.alerta].explicacao}</p>
                {ficha.alertas[ativo.alerta].fontes.map((x, n) => (
                  <div key={n} className="mesa-trecho">
                    <q>{x.trecho}</q>
                    <span className="mesa-trecho-pe">
                      <span className="fg-rotulo">{x.secao}</span>
                      <a className="fg-link" href={url.documento(x.codigo, x.versao, x.secao)} onClick={ir(url.documento(x.codigo, x.versao, x.secao))}>
                        Abrir no texto completo <Icon nome="seta" tamanho={13} />
                      </a>
                    </span>
                  </div>
                ))}
              </li>
            )}
            {ativo.itens.length === 0 && ativo.alerta === undefined && (
              <li>
                {ativo.id === 'b-versao' && ficha.delta ? (
                  <>
                    <ul className="ficha-delta-lista">
                      {ficha.delta.resumo.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    <a className="fg-link" href={url.comparar(ficha.codigo, ficha.delta.de, ficha.delta.para)} onClick={ir(url.comparar(ficha.codigo, ficha.delta.de, ficha.delta.para))}>
                      Ver o que mudou, lado a lado <Icon nome="seta" tamanho={13} />
                    </a>
                  </>
                ) : (
                  <>
                    <p className="fg-sub">Lido no cabeçalho do documento.</p>
                    <p>
                      {[...new Set(codigosCitados(ativo))].map((c, n) => (
                        <React.Fragment key={c}>
                          {n > 0 && ' · '}
                          {MOCK_DOCUMENTOS.some((d) => d.codigo === c) ? (
                            <a className="fg-link" href={url.ficha(c)} onClick={ir(url.ficha(c))}>
                              {c}
                            </a>
                          ) : (
                            <span>
                              {c} <span className="fg-pilula aviso">ausente no acervo</span>
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                  </>
                )}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Pergunta limitada ao documento + ações */}
      <div className="mesa-rodape">
        <form className="fg-busca mesa-pergunta" onSubmit={perguntar} role="search">
          <Icon nome="perguntar" tamanho={16} />
          <label htmlFor={`mesa-pergunta-${variante}`} className="sr-only">
            Pergunte a este documento
          </label>
          <input id={`mesa-pergunta-${variante}`} type="search" placeholder="Pergunte a este documento…" value={pergunta} onChange={(e) => setPergunta(e.target.value)} data-testid="mesa-pergunta" />
        </form>
        {ficha.bluf ? (
          <a className="btn btn-outline btn-sm" href={linkApresentar} onClick={ir(linkApresentar)} data-testid="mesa-apresentar">
            <Icon nome="apresentacao" tamanho={15} /> Apresentar em 5 min
          </a>
        ) : (
          <span className="mesa-apresentar-off">
            <button type="button" className="btn btn-outline btn-sm" disabled aria-describedby={`mesa-apresentar-motivo-${variante}`} data-testid="mesa-apresentar">
              <Icon nome="apresentacao" tamanho={15} /> Apresentar em 5 min
            </button>
            <span id={`mesa-apresentar-motivo-${variante}`} className="fg-sub">
              {SEM_RESUMO}
            </span>
          </span>
        )}
        {variante === 'compacta' && (
          <a className="btn btn-primary btn-sm" href={url.ficha(ficha.codigo, ficha.versao)} onClick={ir(url.ficha(ficha.codigo, ficha.versao))} data-testid="mesa-abrir-ficha">
            Abrir ficha completa <Icon nome="seta" tamanho={15} />
          </a>
        )}
      </div>

      {variante === 'compacta' && (
        <p className="fg-sub mesa-resumo">
          {ficha.alertas.length} {ficha.alertas.length === 1 ? 'alerta' : 'alertas'} · cobertura {ficha.cobertura.secoes_lidas}/{ficha.cobertura.secoes_total} seções, {ficha.cobertura.itens_verificados} itens com fonte ·{' '}
          {ficha.modo.ia === 'extrativo' ? 'modo extrativo (sem IA)' : 'resumo com IA, conferido nas fontes'}
        </p>
      )}
    </section>
  );
};
