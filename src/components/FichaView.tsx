import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AcaoFicha, CampoGov, FichaDocumento, ItemFicha } from '../api/types';
import { SeloOrigem } from './FichaPecas';
import { BotaoApresentar, MesaDocumento } from './MesaDocumento';
import { podeApresentar } from '../ficha/cartoes';
import { fetchFicha, isMockMode } from '../api/client';
import { acoes as acoesEstado, useEstado } from '../app/store';
import { PERFIS } from './perfis';
import { PerfilUsuario } from '../api/types';
import { navegar, url } from '../app/rotas';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { BadgeStatus } from './BadgeStatus';
import { CabecalhoTela, FonteLink, IncluirRelatorio } from '../ui/componentes';
import { Icon } from '../ui/Icon';

/* ---------- Peças pequenas (inventário do FLUXO-DE-TELAS-FICHA §7) ---------- */

export { SeloOrigem, SemaforoSituacao } from './FichaPecas';

const Fontes: React.FC<{ item: { fontes: ItemFicha['fontes'] } }> = ({ item }) => (
  <span className="ficha-fontes">
    {item.fontes.map((f, i) => (
      <FonteLink key={`${f.secao}-${i}`} fonte={f} comSecao />
    ))}
  </span>
);

const dataBR = (iso: string | null) => (iso ? iso.split('-').reverse().join('/') : '');

/* ---------- Blocos ---------- */

const SeloGov: React.FC<{ rotulo: string; campo: CampoGov }> = ({ rotulo, campo }) => (
  <div className={`gov-selo ${campo.valor ? '' : 'gov-vazio'}`}>
    <span className="fg-rotulo">{rotulo}</span>
    {campo.valor ? (
      <strong title={campo.fonte ? `No documento: “${campo.fonte.trecho}”` : undefined}>{campo.valor}</strong>
    ) : (
      <span className="gov-nao-consta">Não consta no documento</span>
    )}
  </div>
);

const Acao: React.FC<{ a: AcaoFicha; codigo: string }> = ({ a, codigo }) => (
  <li className={`ficha-acao urgencia-${a.urgencia}`}>
    <div className="ficha-acao-topo">
      <strong>{a.acao}</strong>
      <SeloOrigem origem={a.origem} />
    </div>
    <p className="ficha-acao-meta">
      {a.quem && (
        <span>
          <Icon nome="usuario" tamanho={14} /> {a.quem}
        </span>
      )}
      {a.prazo && (
        <span>
          <Icon nome="calendario" tamanho={14} /> {a.prazo.data ? `até ${dataBR(a.prazo.data)}` : a.prazo.regra}
          {a.prazo.data && a.prazo.regra ? ` (${a.prazo.regra})` : ''}
        </span>
      )}
    </p>
    {a.consequencia && <p className="ficha-acao-consequencia">Se não fizer: {a.consequencia}</p>}
    <div className="ficha-item-pe">
      <Fontes item={a} />
      {a.fontes[0] && <IncluirRelatorio item={{ id: `ficha-${codigo}-${a.id}`, texto: a.acao, fonte: a.fontes[0] }} />}
    </div>
  </li>
);

const TEMAS_PONTOS: [keyof FichaDocumento['pontos'], string][] = [
  ['obrigacoes', 'Obrigações'],
  ['prazos', 'Prazos'],
  ['valores', 'Valores'],
  ['riscos', 'Riscos'],
  ['responsaveis', 'Responsáveis'],
  ['condicoes', 'Condições']
];

const PontosChave: React.FC<{ ficha: FichaDocumento; preferida?: keyof FichaDocumento['pontos'] }> = ({ ficha, preferida }) => {
  const temas = TEMAS_PONTOS.filter(([k]) => ficha.pontos[k].length);
  const [aba, setAba] = useState(temas.find(([k]) => k === preferida)?.[0] ?? temas[0]?.[0]);
  if (!temas.length) return null;
  const itens = ficha.pontos[aba ?? temas[0][0]];
  return (
    <section className="fg-card" aria-labelledby="t-pontos">
      <div className="fg-cabeca-card">
        <h2 id="t-pontos">
          <Icon nome="check" tamanho={18} /> Pontos-chave
        </h2>
      </div>
      <div className="fg-alternador fg-alternador-rolavel" role="tablist" aria-label="Tema">
        {temas.map(([k, nome]) => (
          <button key={k} type="button" role="tab" aria-selected={aba === k} aria-pressed={aba === k} onClick={() => setAba(k)}>
            {nome} <span className="fg-sub">({ficha.pontos[k].length})</span>
          </button>
        ))}
      </div>
      <ul className="ficha-pontos" role="tabpanel">
        {itens.map((p) => (
          <li key={p.id} className="ficha-ponto">
            <div className="ficha-acao-topo">
              <span>{p.titulo}</span>
              <SeloOrigem origem={p.origem} />
            </div>
            {p.valor && p.valor !== p.titulo && <p className="ficha-ponto-valor">{p.valor}</p>}
            {p.texto && <p className="fg-sub">{p.texto}</p>}
            {p.calculo && <p className="fg-sub">Conta: {p.calculo}</p>}
            <div className="ficha-item-pe">
              <Fontes item={p} />
              {p.fontes[0] && <IncluirRelatorio item={{ id: `ficha-${ficha.codigo}-${p.id}`, texto: p.valor ? `${p.titulo}: ${p.valor}` : p.titulo, fonte: p.fontes[0] }} />}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

/** Ênfase por perfil (REQUISITOS-FICHA §4, RF59): muda a ordem e o título, nunca os dados. */
const ENFASE: Record<string, { tituloAcoes: string; aba?: keyof FichaDocumento['pontos']; pontosPrimeiro?: boolean }> = {
  '': { tituloAcoes: 'O que isso exige de você' },
  empregado: { tituloAcoes: 'O que muda para você', aba: 'prazos' },
  gestor: { tituloAcoes: 'O que isso exige de você', aba: 'obrigacoes' },
  juridico: { tituloAcoes: 'O que isso exige de você', aba: 'riscos', pontosPrimeiro: true },
  financeiro: { tituloAcoes: 'O que isso exige de você', aba: 'valores', pontosPrimeiro: true },
  rh: { tituloAcoes: 'O que muda para as pessoas', aba: 'prazos' },
  diretoria: { tituloAcoes: 'O que pede decisão', aba: 'riscos' }
};

/* ---------- Tela ---------- */

export const FichaView: React.FC<{ codigo: string; versao?: string }> = ({ codigo, versao }) => {
  const [ficha, setFicha] = useState<FichaDocumento | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const perfil = useEstado((e) => e.perfil);
  const [linguagem, setLinguagem] = useState<'original' | 'simples'>('original');
  const [visitaAnterior, setVisitaAnterior] = useState<{ versao: string; data: string } | null>(null);
  const inicio = useRef(Date.now());

  const carregar = useCallback(() => {
    fetchFicha(codigo, versao, { perfil, linguagem })
      .then((f) => {
        setFicha(f);
        setErro(null);
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Não conseguimos abrir a ficha.'));
  }, [codigo, versao, perfil, linguagem]);

  // "Novidades desde a sua última visita" (RF61): guarda a versão e a data vistas neste navegador
  useEffect(() => {
    if (!ficha) return;
    const k = `ac.visita.${ficha.codigo}`;
    try {
      const antes = localStorage.getItem(k);
      setVisitaAnterior(antes ? JSON.parse(antes) : null);
      localStorage.setItem(k, JSON.stringify({ versao: ficha.versao, data: new Date().toISOString().slice(0, 10) }));
    } catch {
      /* navegador sem armazenamento: só não mostra novidades */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ficha?.codigo, ficha?.versao]);

  useEffect(() => {
    inicio.current = Date.now();
    setFicha(null);
    carregar();
  }, [carregar, tentativa]);

  // "gerando"/"parcial": consulta de novo a cada 3 s, por até 2 min (RF57)
  useEffect(() => {
    if (!ficha || (ficha.estado !== 'gerando' && ficha.estado !== 'parcial')) return;
    if (Date.now() - inicio.current > 120000) return;
    const t = setTimeout(carregar, 3000);
    return () => clearTimeout(t);
  }, [ficha, carregar]);

  const versoes = MOCK_DOCUMENTOS.filter((d) => d.codigo === codigo);

  // Atalhos da Ficha (FICHA §2.6): P apresenta, ? pergunta só neste documento
  useEffect(() => {
    if (!ficha) return;
    const tecla = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey || (t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable))) return;
      if ((e.key === 'p' || e.key === 'P') && podeApresentar(ficha)) {
        e.preventDefault();
        navegar(url.apresentar(ficha.codigo, ficha.versao, undefined, { de: 'ficha' }));
      } else if (e.key === '?') {
        e.preventDefault();
        navegar(url.perguntar(undefined, [ficha.codigo]));
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [ficha]);

  if (erro && !ficha)
    return (
      <div className="view-container" data-testid="ficha-erro">
        <CabecalhoTela etiqueta="Ficha do documento" titulo={`Não encontramos ${codigo}`} />
        <div className="fg-card">
          <p>{erro}</p>
          <a
            className="btn btn-primary btn-sm"
            href={url.catalogo()}
            onClick={(e) => {
              e.preventDefault();
              navegar(url.catalogo());
            }}
          >
            Ir para Documentos
          </a>
        </div>
      </div>
    );

  if (!ficha)
    return (
      <div className="view-container loading-state" aria-busy="true" data-testid="ficha-carregando">
        <div className="spinner"></div>
        <p>Abrindo a ficha de {codigo}…</p>
      </div>
    );

  const id = ficha.identidade;
  const extrativo = ficha.modo.ia === 'extrativo';
  const perguntarAqui = url.perguntar(undefined, [ficha.codigo]);
  const ausentes = ficha.governanca.referencias.filter((r) => !MOCK_DOCUMENTOS.some((d) => d.codigo === r));
  const enfase = ENFASE[perfil ?? ''] ?? ENFASE[''];
  const pontosPrimeiro = Boolean(enfase.pontosPrimeiro && enfase.aba && ficha.pontos[enfase.aba].length);
  const simplesIndisponivel = isMockMode() || extrativo;

  return (
    <div className="view-container ficha-view" data-testid="ficha-view">
      <div className="documento-nav-top print-hidden">
        <button type="button" className="fg-link" onClick={() => (window.history.length > 1 ? window.history.back() : navegar(url.catalogo()))}>
          <Icon nome="recolher" tamanho={16} /> Voltar
        </button>
      </div>

      <header className="fg-card ficha-cabeca">
        <div className="fg-mudanca-topo">
          <span className="fg-codigo" data-testid="ficha-codigo">
            {ficha.codigo}
          </span>
          <BadgeStatus substituido={id.substituido} fase={id.fase} />
          <span className="fg-pilula neutra">
            {id.camada.tipo_nome} · {id.camada.grupo}
          </span>
          {id.classificacao && <span className="fg-pilula neutra">Classificação: {id.classificacao}</span>}
          {ficha.governanca.aprovado_por.valor && (
            <span className="fg-pilula neutra" data-testid="ficha-aprovado-por" title={ficha.governanca.aprovado_por.fonte?.trecho}>
              <Icon nome="escudo" tamanho={13} /> Aprovado por {ficha.governanca.aprovado_por.valor}
            </span>
          )}
          {versoes.length > 1 ? (
            <label className="fg-perfil-chat">
              <span>Versão</span>
              <select value={ficha.versao} onChange={(e) => navegar(url.ficha(ficha.codigo, e.target.value), true)} data-testid="ficha-versao">
                {versoes.map((v) => (
                  <option key={v.versao} value={v.versao}>
                    v{v.versao}
                    {v.substituido ? ' (antiga)' : ' (vigente)'}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="fg-pilula neutra">v{ficha.versao}</span>
          )}
        </div>
        <h1 className="fg-doc-nome">{id.titulo}</h1>
        <div className="ficha-opcoes print-hidden">
          <label className="fg-perfil-chat">
            <span>Ver como</span>
            <select value={perfil ?? ''} onChange={(e) => acoesEstado.definirPerfil((e.target.value || null) as PerfilUsuario)} data-testid="ficha-perfil">
              <option value="">Qualquer pessoa</option>
              {PERFIS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
          <div className="fg-alternador" role="group" aria-label="Linguagem do texto">
            <button type="button" aria-pressed={linguagem === 'original'} onClick={() => setLinguagem('original')}>
              Como está no documento
            </button>
            <button
              type="button"
              aria-pressed={linguagem === 'simples'}
              disabled={simplesIndisponivel}
              title={simplesIndisponivel ? 'Precisa da IA ligada no servidor' : undefined}
              onClick={() => setLinguagem('simples')}
              data-testid="ficha-simples"
            >
              Em palavras simples
            </button>
          </div>
          {simplesIndisponivel && <span className="fg-sub">Palavras simples precisa da IA ligada no servidor.</span>}
          {perfil && <span className="fg-sub">O perfil muda a ordem, não os dados.</span>}
        </div>
      </header>

      {ficha.delta && (
        <div className="fg-card ficha-delta" data-testid="ficha-delta">
          <div className="fg-cabeca-card">
            <h2>
              <Icon nome="regras" tamanho={18} /> O que mudou desde a v{ficha.delta.de}
            </h2>
            <a
              className="fg-link"
              href={url.comparar(ficha.codigo, ficha.delta.de, ficha.delta.para)}
              onClick={(e) => {
                e.preventDefault();
                navegar(url.comparar(ficha.codigo, ficha.delta!.de, ficha.delta!.para));
              }}
            >
              Ver as {ficha.delta.mudancas} mudanças <Icon nome="seta" tamanho={14} />
            </a>
          </div>
          <ul className="ficha-delta-lista">
            {ficha.delta.resumo.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {visitaAnterior && visitaAnterior.versao !== ficha.versao && (
        <div className="fg-faixa-info" role="status" data-testid="ficha-novidade">
          <Icon nome="info" tamanho={16} />
          <span>
            Novidade desde a sua última visita ({visitaAnterior.data.split('-').reverse().join('/')}): você tinha visto a versão {visitaAnterior.versao}; esta é a {ficha.versao}.
          </span>
        </div>
      )}

      {id.substituido && id.vigente_em && (
        <div className="alerta alerta-aviso" data-testid="ficha-substituida">
          <strong>Você está lendo a versão {ficha.versao}.</strong> A que vale hoje é a {id.vigente_em.versao}.{' '}
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navegar(url.ficha(ficha.codigo, id.vigente_em!.versao))}>
            Abrir a vigente
          </button>
        </div>
      )}

      {(extrativo || ficha.estado === 'erro') && (
        <div className="fg-faixa-info" role="note" data-testid="ficha-extrativo">
          <Icon nome="info" tamanho={16} />
          <span>
            {ficha.estado === 'erro' ? 'Não consegui gerar o resumo agora. ' : ''}
            IA indisponível: mostrando só o que se extrai do documento por regra, com o trecho de cada item.
          </span>
          {ficha.estado === 'erro' && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setTentativa((t) => t + 1)}>
              Tentar de novo
            </button>
          )}
        </div>
      )}

      {/* Mesa de decisão, variante completa (revisão 13/11): relance, mapa e blocos */}
      <MesaDocumento ficha={ficha} variante="completa" />

      {/* GOVERNANÇA (lida do documento, nunca pela IA) */}
      <section className="fg-card ficha-gov" aria-labelledby="t-gov" data-testid="ficha-governanca">
        <div className="fg-cabeca-card">
          <h2 id="t-gov">
            <Icon nome="escudo" tamanho={18} /> Governança
          </h2>
          <span className="fg-sub">Lida do documento</span>
        </div>
        <div className="gov-grade">
          <SeloGov rotulo="Elaborado por" campo={ficha.governanca.elaborado_por} />
          <SeloGov rotulo="Aprovado por" campo={ficha.governanca.aprovado_por} />
          <SeloGov rotulo="Aprovado em" campo={ficha.governanca.aprovado_em} />
          <SeloGov rotulo="Assinada em" campo={ficha.governanca.assinada_em} />
          <SeloGov rotulo="Classificação" campo={{ valor: id.classificacao, fonte: null }} />
          <SeloGov rotulo="Vinculado a" campo={ficha.governanca.vinculado_a} />
        </div>
        {ficha.governanca.referencias.length > 0 && (
          <p className="gov-refs">
            <span className="fg-rotulo">Referências</span>{' '}
            {ficha.governanca.referencias.map((r, i) => (
              <React.Fragment key={r}>
                {i > 0 && ' · '}
                {ausentes.includes(r) ? (
                  <span className="gov-ausente">
                    {r} <span className="fg-pilula aviso">ausente no acervo</span>
                  </span>
                ) : (
                  <a
                    className="fg-link"
                    href={url.ficha(r)}
                    onClick={(e) => {
                      e.preventDefault();
                      navegar(url.ficha(r));
                    }}
                  >
                    {r}
                  </a>
                )}
              </React.Fragment>
            ))}
          </p>
        )}
      </section>


      <div className="fg-layout-lateral ficha-corpo">
        <div className="fg-coluna">
          {pontosPrimeiro && <PontosChave ficha={ficha} preferida={enfase.aba} />}
          {/* NÍVEL 2 · DECISÃO */}
          <section className="fg-card" aria-labelledby="t-acoes" data-testid="ficha-acoes">
            <div className="fg-cabeca-card">
              <h2 id="t-acoes">
                <Icon nome="raio" tamanho={18} /> {enfase.tituloAcoes}
              </h2>
            </div>
            {ficha.acoes.length ? (
              <ol className="ficha-acoes">
                {ficha.acoes.map((a) => (
                  <Acao key={a.id} a={a} codigo={ficha.codigo} />
                ))}
              </ol>
            ) : (
              <p className="fg-sub">
                {extrativo
                  ? 'As ações com responsável e prazo são escritas pela IA, que está desligada agora. Veja os prazos e as obrigações em Pontos-chave, copiados do documento.'
                  : 'Este documento não cria ações para você.'}
              </p>
            )}
          </section>

          {!pontosPrimeiro && <PontosChave ficha={ficha} preferida={enfase.aba} />}

          <p className="ficha-cobertura" data-testid="ficha-cobertura">
            <Icon nome="marca" tamanho={15} />
            Cobertura: {ficha.cobertura.secoes_lidas}/{ficha.cobertura.secoes_total} seções · {ficha.cobertura.itens_verificados} itens com fonte verificada ·{' '}
            {ficha.cobertura.itens_descartados} descartados · modo: {extrativo ? 'extrativo (sem IA)' : `IA${ficha.modo.modelo ? ` (${ficha.modo.modelo})` : ''}`}
          </p>
          {ficha.cobertura.itens_descartados > 0 && (
            <p className="fg-sub">
              Deixei de fora {ficha.cobertura.itens_descartados} {ficha.cobertura.itens_descartados === 1 ? 'item' : 'itens'} porque não achei o trecho que o sustente.
            </p>
          )}
        </div>

        <aside className="fg-coluna">
          <section className="fg-card" aria-labelledby="t-alertas">
            <div className="fg-cabeca-card">
              <h2 id="t-alertas">
                <Icon nome="alerta" tamanho={18} /> Alertas ({ficha.alertas.length})
              </h2>
            </div>
            {ficha.alertas.length ? (
              <ul className="fg-lista">
                {ficha.alertas.map((a) => (
                  <li key={a.titulo}>
                    <a
                      className="fg-lista-item ficha-alerta"
                      href={a.radar_id ? url.radar({ item: a.radar_id }) : url.radar({ codigo: ficha.codigo })}
                      onClick={(e) => {
                        e.preventDefault();
                        navegar(a.radar_id ? url.radar({ item: a.radar_id }) : url.radar({ codigo: ficha.codigo }));
                      }}
                    >
                      <span className="fg-lista-texto">
                        <span>{a.titulo}</span>
                        <small>{a.explicacao}</small>
                      </span>
                      <Icon nome="seta" tamanho={14} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="fg-sub">Nenhum alerta para este documento.</p>
            )}
          </section>

          {ficha.perguntas_sugeridas.length > 0 && (
            <section className="fg-card" aria-labelledby="t-sugeridas">
              <div className="fg-cabeca-card">
                <h2 id="t-sugeridas">
                  <Icon nome="duvida" tamanho={18} /> Perguntas sugeridas
                </h2>
              </div>
              <ul className="fg-lista">
                {ficha.perguntas_sugeridas.map((q) => (
                  <li key={q}>
                    <a
                      className="fg-lista-item"
                      href={url.perguntar(q, [ficha.codigo])}
                      onClick={(e) => {
                        e.preventDefault();
                        navegar(url.perguntar(q, [ficha.codigo]));
                      }}
                    >
                      {q}
                      <Icon nome="seta" tamanho={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="fg-card ficha-acoes-laterais print-hidden">
            <a
              className="btn btn-primary btn-sm fg-largo"
              href={perguntarAqui}
              data-testid="ficha-perguntar"
              onClick={(e) => {
                e.preventDefault();
                navegar(perguntarAqui);
              }}
            >
              <Icon nome="perguntar" tamanho={16} /> Perguntar sobre este documento
              <kbd className="ficha-atalho" aria-hidden="true">?</kbd>
            </a>
            <a
              className="btn btn-outline btn-sm fg-largo"
              href={url.documento(ficha.codigo, ficha.versao)}
              onClick={(e) => {
                e.preventDefault();
                navegar(url.documento(ficha.codigo, ficha.versao));
              }}
            >
              <Icon nome="documento" tamanho={16} /> Ler o texto completo
            </a>
            <BotaoApresentar ficha={ficha} de="ficha" className="btn btn-outline btn-sm fg-largo" testId="ficha-apresentar" tamanho={16} />
            <button type="button" className="btn btn-outline btn-sm fg-largo" onClick={() => window.print()}>
              <Icon nome="baixar" tamanho={16} /> Exportar (PDF)
            </button>
          </section>
        </aside>
      </div>

      {/* Celular (FICHA §2.5): ações fixas no rodapé */}
      <nav className="ficha-barra-celular print-hidden" aria-label="Ações da ficha" data-testid="ficha-barra-celular">
        <a
          className="btn btn-primary btn-sm"
          href={perguntarAqui}
          onClick={(e) => {
            e.preventDefault();
            navegar(perguntarAqui);
          }}
        >
          <Icon nome="perguntar" tamanho={15} /> Perguntar
        </a>
        <BotaoApresentar ficha={ficha} de="ficha" testId="ficha-apresentar-celular" />
      </nav>
    </div>
  );
};
