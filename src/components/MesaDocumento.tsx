import React, { useEffect, useRef, useState } from 'react';
import { AcaoFicha, BlocoDecisao, FichaDocumento, ItemFicha, SinalBloco } from '../api/types';
import { navegar, url } from '../app/rotas';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { Icon } from '../ui/Icon';
import { SemaforoSituacao } from './FichaPecas';
import { PopupSecao } from './PopupSecao';
import { fraseExtrativa } from '../ficha/frase';

/**
 * Mesa de decisão (FLUXO-DE-TELAS-FICHA §0, RF71–RF76): o documento "desmiuçado" para decidir.
 * Um só componente: `compacta` na tela inicial (T1) e `completa` na Ficha (T14).
 */

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

/** Tom do selo de relevância por sinal (protótipo de 13/11): valor verde, prazo âmbar, risco vermelho, demais azul. */
const TOM: Record<SinalBloco, 'ok' | 'aviso' | 'info' | 'perigo'> = {
  valor: 'ok',
  prazo: 'aviso',
  responsavel: 'info',
  regra: 'info',
  risco: 'perigo',
  alerta: 'perigo'
};

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
    <span className="mesa-bloco-topo">
      <span className="mesa-bloco-titulo">{b.titulo}</span>
      <span className={`mesa-bloco-relevancia tom-${TOM[b.sinal]}`}>
        {b.relevancia.posicao}º · {b.relevancia.motivo}
      </span>
    </span>
    <strong className="mesa-bloco-destaque">{b.destaque}</strong>
    {b.apoio && <span className="mesa-bloco-apoio">{b.apoio}</span>}
  </button>
);

const ORIGEM_TEXTO = { literal: 'Trecho literal', resumo: 'Resumo da IA', calculado: 'Calculado' } as const;

/** Fonte da frase em uma linha discreta: origem e seções clicáveis (todo número e frase com fonte). */
const FonteDaFrase: React.FC<{ origem: keyof typeof ORIGEM_TEXTO; fontes: { codigo: string; versao: string; secao: string }[] }> = ({ origem, fontes }) => (
  <span className="mesa-frase-fonte">
    {ORIGEM_TEXTO[origem]}
    {fontes.map((x, i) => (
      <React.Fragment key={i}>
        {' · '}
        <a href={url.documento(x.codigo, x.versao, x.secao)} onClick={ir(url.documento(x.codigo, x.versao, x.secao))}>
          {x.secao}
        </a>
      </React.Fragment>
    ))}
  </span>
);

export const MesaDocumento: React.FC<{ ficha: FichaDocumento; variante: 'compacta' | 'completa' }> = ({ ficha, variante }) => {
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
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const ativo = blocos.find((b) => b.id === ativoId) ?? null;
  const id = ficha.identidade;
  const celulas = [...ficha.mapa_calor].sort((a, b) => a.ordem - b.ordem);
  const acao = [...ficha.acoes].sort((a, b) => ['alta', 'media', 'baixa'].indexOf(a.urgencia) - ['alta', 'media', 'baixa'].indexOf(b.urgencia))[0];
  const gerando = ficha.estado === 'gerando' || ficha.estado === 'parcial';

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

  // Frase: resumo da IA ou, sem IA, a frase copiada do documento (a mesma da apresentação)
  const fraseDoc = ficha.bluf ? null : fraseExtrativa(ficha);

  // "Precisa de você": a ação mais urgente; sem ação, o alerta que muda a decisão (ex.: regra que mudou de versão)
  const alertaChave = ficha.alertas.find((a) => a.tipo === 'versao_substituida') ?? ficha.alertas.find((a) => a.tipo === 'divergencia' || a.tipo === 'vigencia_proxima');
  const minusculaInicial = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
  const semPonto = (t: string) => t.replace(/[.;]+$/, '');

  const situacaoCurta = id.substituido ? 'versão substituída' : id.vigencia.fim ? `vigente até ${dataBR(id.vigencia.fim)}` : `v${ficha.versao} vigente`;
  const meta = [id.camada.tipo_nome, situacaoCurta, id.classificacao].filter(Boolean).join(' · ');
  const gov = (c: { valor: string | null }) => (c.valor ? /\(([A-Z]{2,6})\)\s*$/.exec(c.valor)?.[1] ?? c.valor : 'não consta');
  const familiaPergunta: Record<string, string> = { contrato: 'a este contrato', norma: 'a esta norma', procedimento: 'a este procedimento', nota_tecnica: 'a esta nota técnica' };
  const exemplo = ficha.perguntas_sugeridas?.[0];
  const placeholder = `Pergunte ${familiaPergunta[ficha.familia ?? ''] ?? 'a este documento'}${exemplo ? `: ${minusculaInicial(exemplo)}` : '…'}`;

  const itensAtivo = ativo ? itensDoBloco(ficha, ativo) : [];
  const origemAtivo = !ativo
    ? ''
    : ativo.alerta !== undefined
    ? 'Alerta do radar'
    : ativo.id === 'b-versao'
    ? 'Comparado'
    : itensAtivo[0]?.origem === 'calculado'
    ? 'Calculado'
    : itensAtivo[0]?.origem === 'resumo'
    ? 'Resumo da IA'
    : itensAtivo.length
    ? 'Trecho literal'
    : 'Cabeçalho do documento';
  const destacadas = ativo ? celulas.filter((c) => ativo.secoes_mapa.includes(c.secao_id)).length : 0;
  // Compacta: uma célula por seção (43 no contrato), como no protótipo; completa: largura pelo texto
  const total = Math.max(id.metricas.secoes, ...celulas.map((c) => c.ordem));
  const posicoes =
    variante === 'compacta' && celulas.every((c) => c.ordem >= 1 && c.ordem <= total)
      ? Array.from({ length: total }, (_, k) => celulas.find((c) => c.ordem === k + 1) ?? null)
      : celulas;

  const trecho = (x: { codigo: string; versao: string; secao: string; trecho: string }, n: number) => (
    <div key={n} className="mesa-trecho">
      <q>{x.trecho}</q>
      <span className="mesa-trecho-pe">
        {x.secao} ·{' '}
        <a className="fg-link" href={url.documento(x.codigo, x.versao, x.secao)} onClick={ir(url.documento(x.codigo, x.versao, x.secao))}>
          Abrir no texto completo
        </a>
      </span>
    </div>
  );

  return (
    <section className={`mesa mesa-${variante} ${variante === 'completa' ? 'fg-card' : ''}`} aria-label={`Mesa de decisão: ${id.titulo}`} data-testid={variante === 'completa' ? 'ficha-relance' : 'mesa'}>
      {/* Cabeçalho do documento + "Precisa de você" + frase (protótipo de 13/11) */}
      <div className="mesa-cab">
        <div className="mesa-cab-topo">
          <div className="mesa-cab-id">
            {variante === 'completa' && <SemaforoSituacao nivel={ficha.semaforo.nivel} />}
            <p className="mesa-cab-meta">{meta}</p>
            {variante === 'compacta' ? (
              <h2 className="mesa-titulo">{id.titulo}</h2>
            ) : (
              <p className="mesa-situacao">
                {id.substituido
                  ? `Versão substituída${id.vigente_em ? `: a que vale hoje é a ${id.vigente_em.versao}` : ''}`
                  : id.vigencia.fim
                  ? `Em vigor até ${dataBR(id.vigencia.fim)}${id.vigencia.dias_restantes !== null && id.vigencia.dias_restantes >= 0 ? ` (faltam ${id.vigencia.dias_restantes} dias)` : ''}`
                  : `Vigência: ${id.vigencia.texto}`}
              </p>
            )}
          </div>
          <div className="mesa-cab-gov">
            <span>
              Elaborado: {gov(ficha.governanca.elaborado_por)} · Aprovado: {gov(ficha.governanca.aprovado_por)} · Assinada em: {gov(ficha.governanca.assinada_em)}
            </span>
            <span data-testid="ficha-tempo">
              Leitura {id.metricas.leitura_integral_min} min →{' '}
              {variante === 'compacta' ? (
                <a className="mesa-cab-ficha" href={url.ficha(ficha.codigo, ficha.versao)} onClick={ir(url.ficha(ficha.codigo, ficha.versao))} data-testid="mesa-abrir-ficha" title="Abrir ficha completa">
                  ficha {id.metricas.leitura_ficha_min} min
                </a>
              ) : (
                <strong className="mesa-cab-ficha">ficha {id.metricas.leitura_ficha_min} min</strong>
              )}
            </span>
          </div>
        </div>

        {acao ? (
          <div className="mesa-precisa tom-aviso" data-testid="mesa-precisa" role="note">
            <Icon nome="alerta" tamanho={18} />
            <div>
              <p className="mesa-precisa-titulo">
                Precisa de você: {minusculaInicial(acao.acao)}
                {acao.prazo?.data && <> até {dataBR(acao.prazo.data)}</>}
              </p>
              <p className="mesa-precisa-apoio">
                {acao.quem && <>Responsável: {acao.quem}. </>}
                {acao.consequencia && semPonto(acao.consequencia) + '.'}
              </p>
            </div>
          </div>
        ) : alertaChave ? (
          <div className={`mesa-precisa tom-${alertaChave.tipo === 'versao_substituida' ? 'perigo' : 'aviso'}`} data-testid="mesa-precisa" role="note">
            <Icon nome="alerta" tamanho={18} />
            <div>
              <p className="mesa-precisa-titulo">
                {alertaChave.tipo === 'versao_substituida' ? 'A regra mudou: ' : 'Atenção: '}
                {minusculaInicial(semPonto(alertaChave.titulo))}
              </p>
              <p className="mesa-precisa-apoio">{alertaChave.explicacao}</p>
            </div>
          </div>
        ) : (
          <p className="mesa-precisa tom-neutro" data-testid="mesa-precisa">
            <Icon nome="info" tamanho={16} />{' '}
            {ficha.modo.ia === 'extrativo' ? 'Sem IA, as ações com responsável não são escritas. Prazos e responsáveis estão nos blocos abaixo.' : 'Nada pede ação sua neste documento agora.'}
          </p>
        )}

        {ficha.bluf ? (
          <p className="mesa-frase" data-testid="ficha-bluf">
            {ficha.bluf.texto}{' '}
            <FonteDaFrase origem={ficha.bluf.origem} fontes={ficha.bluf.fontes} />
          </p>
        ) : fraseDoc ? (
          <p className="mesa-frase" data-testid="mesa-frase-documento">
            {fraseDoc.titulo}{' '}
            <FonteDaFrase origem="literal" fontes={fraseDoc.fontes.slice(0, 1)} />
          </p>
        ) : (
          <p className="mesa-frase mesa-frase-vazia">{gerando ? 'Resumo da IA a caminho…' : 'Sem frase-resumo: os blocos abaixo vêm direto do texto, com a fonte de cada um.'}</p>
        )}
      </div>

      {/* Onde isso está no documento: mapa ligado aos blocos (RF75) */}
      <div className="mesa-mapa">
        <div className="mesa-mapa-topo">
          <span>
            Onde isso está · {id.camada.tipo_nome} · {id.metricas.secoes} seções
            {variante === 'completa' && celulas.length < id.metricas.secoes && ` (mostrando ${celulas.length})`}
          </span>
          <span aria-live="polite" data-testid="mesa-mapa-dica">
            {secaoFoco
              ? `${secaoFoco}: ${blocos.filter((b) => b.secoes_mapa.includes(secaoFoco)).map((b) => b.titulo).join(' · ') || 'nenhum bloco usa esta seção'}`
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
                onMouseEnter={() => setSecaoFoco(c.secao_id)}
                onMouseLeave={() => setSecaoFoco(null)}
                onFocus={() => setSecaoFoco(c.secao_id)}
                onBlur={() => setSecaoFoco(null)}
                onClick={() => setSecaoAberta(c.secao_id)}
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
                  <button type="button" className="fg-link" onClick={() => setSecaoAberta(c.secao_id)}>
                    {c.secao_id} · {c.titulo}
                  </button>
                  {blocos.some((b) => b.secoes_mapa.includes(c.secao_id)) && (
                    <span className="fg-sub"> ({blocos.filter((b) => b.secoes_mapa.includes(c.secao_id)).map((b) => b.titulo).join(', ')})</span>
                  )}
                </li>
              ))}
            </ol>
          </details>
        )}
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

      {/* Detalhe com a fonte (RF76): sempre à vista; vazio até escolher um bloco */}
      {ativo ? (
        <div id="mesa-detalhe" className="mesa-detalhe" role="region" aria-label={`Detalhe: ${ativo.titulo}`} data-testid="mesa-detalhe">
          <div className="mesa-detalhe-topo">
            <span>{ativo.titulo} · de onde vem</span>
            <span className="mesa-detalhe-origem">{origemAtivo}</span>
            <button type="button" className="fg-acao" onClick={() => setAtivoId(null)} aria-label="Fechar o detalhe">
              <Icon nome="fechar" tamanho={15} />
            </button>
          </div>
          <ul className="mesa-detalhe-itens">
            {itensAtivo.map((it) => (
              <li key={it.id}>
                <p className="mesa-detalhe-item">
                  {valorItem(it) && <strong>{valorItem(it)} · </strong>}
                  {textoItem(it)}
                  {'calculo' in it && it.calculo && <span className="fg-sub"> · conta: {it.calculo}</span>}
                </p>
                {it.fontes.map(trecho)}
              </li>
            ))}
            {ativo.alerta !== undefined && ficha.alertas[ativo.alerta] && (
              <li>
                <p className="mesa-detalhe-item">
                  <strong>{ficha.alertas[ativo.alerta].titulo}</strong> <span className="fg-sub">{ficha.alertas[ativo.alerta].explicacao}</span>
                </p>
                {ficha.alertas[ativo.alerta].fontes.map(trecho)}
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
                      Comparar a v{ficha.delta.de} e a v{ficha.delta.para}, lado a lado
                    </a>
                  </>
                ) : (
                  <p className="mesa-detalhe-item">
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
                )}
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="mesa-detalhe mesa-detalhe-vazio" data-testid="mesa-detalhe-vazio">
          <span className="mesa-detalhe-topo">Detalhe</span>
          <p>Escolha um bloco para ver o trecho exato e onde ele fica.</p>
        </div>
      )}

      {/* Pergunta limitada ao documento + apresentar */}
      <div className="mesa-rodape">
        <form className="mesa-pergunta" onSubmit={perguntar} role="search">
          <label htmlFor={`mesa-pergunta-${variante}`} className="sr-only">
            Pergunte a este documento
          </label>
          <input id={`mesa-pergunta-${variante}`} type="search" placeholder={placeholder} value={pergunta} onChange={(e) => setPergunta(e.target.value)} data-testid="mesa-pergunta" />
        </form>
      </div>
      {secaoAberta && (
        <PopupSecao
          ficha={ficha}
          secaoId={secaoAberta}
          onFechar={() => setSecaoAberta(null)}
          onAbrir={(id) => setSecaoAberta(id)}
        />
      )}
    </section>
  );
};
