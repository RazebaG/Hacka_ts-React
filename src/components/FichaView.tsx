import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AcaoFicha, CampoGov, CelulaMapa, FichaDocumento, ItemFicha, OrigemItem } from '../api/types';
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

const ORIGEM: Record<OrigemItem, { texto: string; icone: string; dica: string }> = {
  literal: { texto: 'Trecho literal', icone: '“”', dica: 'Texto copiado da seção' },
  resumo: { texto: 'Resumo da IA', icone: '✦', dica: 'Resumo da IA, confira o trecho' },
  calculado: { texto: 'Calculado', icone: '=', dica: 'Conta feita com valores do documento' }
};

/** Selo de origem (RF51): de onde veio cada afirmação. */
export const SeloOrigem: React.FC<{ origem: OrigemItem }> = ({ origem }) => (
  <span className={`fg-pilula selo-origem selo-${origem}`} title={ORIGEM[origem].dica}>
    <span aria-hidden="true">{ORIGEM[origem].icone}</span> {ORIGEM[origem].texto}
  </span>
);

const SEMAFORO = {
  ok: { classe: 'ok', icone: 'marca', texto: 'Em vigor' },
  atencao: { classe: 'aviso', icone: 'alerta', texto: 'Pede atenção' },
  critico: { classe: 'perigo', icone: 'alerta', texto: 'Não use para decidir' }
} as const;

/** Semáforo de situação (RF45): cor sempre com ícone e texto. */
export const SemaforoSituacao: React.FC<{ nivel: FichaDocumento['semaforo']['nivel']; compacto?: boolean }> = ({ nivel, compacto }) => (
  <span className={`fg-pilula semaforo semaforo-${nivel} ${SEMAFORO[nivel].classe}`}>
    <Icon nome={SEMAFORO[nivel].icone} tamanho={13} /> {compacto ? SEMAFORO[nivel].texto : SEMAFORO[nivel].texto}
  </span>
);

const Fontes: React.FC<{ item: { fontes: ItemFicha['fontes'] } }> = ({ item }) => (
  <span className="ficha-fontes">
    {item.fontes.map((f, i) => (
      <FonteLink key={`${f.secao}-${i}`} fonte={f} comSecao />
    ))}
  </span>
);

const dataBR = (iso: string | null) => (iso ? iso.split('-').reverse().join('/') : '');

/* ---------- Mapa de calor (RF53) ---------- */

type Sinal = 'tudo' | 'prazo' | 'valor' | 'obrigacao' | 'risco';
const SINAIS: [Sinal, string][] = [
  ['tudo', 'Tudo'],
  ['prazo', 'Prazo'],
  ['valor', 'Valor'],
  ['obrigacao', 'Obrigação'],
  ['risco', 'Risco']
];

const forca = (c: CelulaMapa, s: Sinal, maxPorSinal: Record<string, number>) =>
  s === 'tudo' ? c.intensidade : c.sinais[s] / (maxPorSinal[s] || 1);

const descreverSinais = (c: CelulaMapa) =>
  [
    c.sinais.prazo && `${c.sinais.prazo} de prazo`,
    c.sinais.valor && `${c.sinais.valor} de valor`,
    c.sinais.obrigacao && `${c.sinais.obrigacao} de obrigação`,
    c.sinais.risco && `${c.sinais.risco} de risco`
  ]
    .filter(Boolean)
    .join(', ') || 'sem sinais';

const MapaCalor: React.FC<{ ficha: FichaDocumento }> = ({ ficha }) => {
  const [sinal, setSinal] = useState<Sinal>('tudo');
  const celulas = [...ficha.mapa_calor].sort((a, b) => a.ordem - b.ordem);
  const maxPorSinal = { prazo: 0, valor: 0, obrigacao: 0, risco: 0 } as Record<string, number>;
  celulas.forEach((c) => (Object.keys(maxPorSinal) as (keyof CelulaMapa['sinais'])[]).forEach((k) => (maxPorSinal[k] = Math.max(maxPorSinal[k], c.sinais[k]))));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const mover = (i: number, e: React.KeyboardEvent) => {
    const alvo = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? celulas.length - 1 : -1;
    if (alvo >= 0 && alvo < celulas.length) {
      e.preventDefault();
      refs.current[alvo]?.focus();
    }
  };
  const top = [...celulas].sort((a, b) => forca(b, sinal, maxPorSinal) - forca(a, sinal, maxPorSinal)).filter((c) => forca(c, sinal, maxPorSinal) > 0).slice(0, 5);
  const abrir = (c: CelulaMapa) => navegar(url.documento(ficha.codigo, ficha.versao, c.secao_id));

  return (
    <section className="fg-card ficha-mapa" aria-labelledby="t-mapa">
      <div className="fg-cabeca-card">
        <h2 id="t-mapa">
          <Icon nome="mapa" tamanho={18} /> Mapa do documento
          <span className="fg-sub">
            {' '}
            · {ficha.identidade.metricas.secoes} seções · ~{ficha.identidade.metricas.paginas_estimadas}{' '}
            {ficha.identidade.metricas.paginas_estimadas === 1 ? 'página' : 'páginas'}
            {celulas.length < ficha.identidade.metricas.secoes && ` · mostrando ${celulas.length} de ${ficha.identidade.metricas.secoes}`}
          </span>
        </h2>
        <div className="fg-alternador" role="group" aria-label="Mostrar no mapa">
          {SINAIS.map(([id, nome]) => (
            <button key={id} type="button" aria-pressed={sinal === id} onClick={() => setSinal(id)}>
              {nome}
            </button>
          ))}
        </div>
      </div>
      <div className="mapa-faixa" role="list" aria-label="Seções do documento, da primeira à última">
        {celulas.map((c, i) => {
          const f = forca(c, sinal, maxPorSinal);
          return (
            <button
              key={c.secao_id}
              ref={(el) => (refs.current[i] = el)}
              type="button"
              role="listitem"
              className={`mapa-celula ${f > 0 ? 'com-sinal' : ''}`}
              style={{ flexGrow: Math.max(c.peso, 0.01) * 100, ['--forca' as string]: f.toFixed(2) }}
              onClick={() => abrir(c)}
              onKeyDown={(e) => mover(i, e)}
              title={`${c.secao_id} · ${c.titulo}: ${descreverSinais(c)}`}
              aria-label={`${c.secao_id}, ${c.titulo}: ${descreverSinais(c)}. Abrir a seção.`}
            />
          );
        })}
      </div>
      <p className="fg-sub mapa-dica">Cada faixa é uma seção, na ordem do documento. Quanto mais escura, mais sinais. Toque para abrir a seção.</p>
      <details className="mapa-lista">
        <summary>Ver em lista: seções com mais sinais</summary>
        {top.length ? (
          <ol>
            {top.map((c) => (
              <li key={c.secao_id}>
                <button type="button" className="fg-link" onClick={() => abrir(c)}>
                  {c.secao_id} · {c.titulo}
                </button>{' '}
                <span className="fg-sub">({descreverSinais(c)})</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="fg-sub">Nenhuma seção com este sinal.</p>
        )}
      </details>
    </section>
  );
};

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
  const dias = id.vigencia.dias_restantes;
  const semIA = ficha.estado === 'gerando' || ficha.estado === 'parcial';
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

      {/* NÍVEL 1 · RELANCE */}
      <section className="fg-card ficha-relance" aria-labelledby="t-relance" data-testid="ficha-relance">
        <h2 id="t-relance" className="sr-only">
          Resumo em 10 segundos
        </h2>
        <div className="ficha-relance-topo">
          <span className="ficha-situacao">
            <SemaforoSituacao nivel={ficha.semaforo.nivel} />
            <span>
              {id.substituido
                ? `Substituída em ${id.vigencia.fim ? dataBR(id.vigencia.fim) : 'versão posterior'}`
                : id.vigencia.fim
                ? `Em vigor até ${dataBR(id.vigencia.fim)}${dias !== null && dias >= 0 ? ` (faltam ${dias} dias)` : ''}`
                : `Vigência: ${id.vigencia.texto}`}
            </span>
          </span>
          <span className="fg-sub ficha-tempo" data-testid="ficha-tempo">
            <Icon nome="historico" tamanho={14} /> Leitura ~{id.metricas.leitura_integral_min} min · Ficha {id.metricas.leitura_ficha_min} min
          </span>
        </div>
        {ficha.semaforo.motivos.length > 0 && (
          <ul className="ficha-motivos">
            {ficha.semaforo.motivos.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}

        {ficha.bluf ? (
          <blockquote className="ficha-bluf" data-testid="ficha-bluf">
            <p>{ficha.bluf.texto}</p>
            <footer>
              <SeloOrigem origem={ficha.bluf.origem} />
              <Fontes item={ficha.bluf} />
            </footer>
          </blockquote>
        ) : (
          <p className="ficha-bluf ficha-bluf-vazio">
            {semIA ? 'Resumo da IA a caminho…' : 'Resumo em uma frase indisponível sem IA. Os números e prazos abaixo vêm direto do texto.'}
          </p>
        )}

        {ficha.numeros.length > 0 && (
          <div className="ficha-numeros">
            {ficha.numeros.map((n) => (
              <div key={n.id} className="ficha-numero">
                <p className="fg-valor">{n.valor}</p>
                <p className="ficha-numero-titulo">{n.titulo}</p>
                {n.calculo && <p className="fg-sub">{n.calculo}</p>}
                <div className="ficha-item-pe">
                  <Fontes item={n} />
                  <SeloOrigem origem={n.origem} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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

      <MapaCalor ficha={ficha} />

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
                      href={a.radar_id ? url.radar({ item: a.radar_id }) : url.radar()}
                      onClick={(e) => {
                        e.preventDefault();
                        navegar(a.radar_id ? url.radar({ item: a.radar_id }) : url.radar());
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
            <a
              className="btn btn-outline btn-sm fg-largo"
              href={url.apresentar(ficha.codigo, ficha.versao)}
              data-testid="ficha-apresentar"
              onClick={(e) => {
                e.preventDefault();
                navegar(url.apresentar(ficha.codigo, ficha.versao));
              }}
            >
              <Icon nome="apresentacao" tamanho={16} /> Apresentar em 5 min
            </a>
            <button type="button" className="btn btn-outline btn-sm fg-largo" onClick={() => window.print()}>
              <Icon nome="baixar" tamanho={16} /> Exportar (PDF)
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
};
