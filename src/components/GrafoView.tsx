import React, { useEffect, useState, useMemo } from 'react';
import { CabecalhoTela } from '../ui/componentes';
import { GrafoAcervo, GrafoNo } from '../api/types';
import { fetchGrafo } from '../api/client';
import { Icon } from '../ui/Icon';

interface GrafoViewProps {
  onNavegarDocumento: (codigo: string, versao?: string) => void;
}

// Cor do nó pela camada da norma (grupo do CATÁLOGO), com os tokens da paleta HACKA/TS Azul (src/index.css)
type EsquemaCor = { bg: string; border: string; text: string };
const camadaCor = (grupo: string): EsquemaCor => ({
  bg: `var(--graph-${grupo}-bg)`,
  border: `var(--graph-${grupo}-border)`,
  text: `var(--graph-${grupo}-text)`
});
const CORES_POR_TIPO: Record<string, EsquemaCor> = {
  NG: camadaCor('normativo'),
  PX: camadaCor('normativo'),
  FM: camadaCor('apoio'),
  TB: camadaCor('apoio'),
  FL: camadaCor('apoio'),
  RG: camadaCor('programa'),
  CTR: camadaCor('instrumento'),
  NT: camadaCor('instrumento')
};
const COR_AUSENTE: EsquemaCor = {
  bg: 'var(--color-warning-bg)',
  border: 'var(--color-warning-text)', // âmbar escuro: o selo com texto branco precisa de 4,5:1
  text: 'var(--color-warning-text)'
};

// Coordenadas calculadas para visualização esteticamente equilibrada do acervo
const COORDENADAS_NOS: Record<string, { x: number; y: number }> = {
  'NG_111@3.0.0': { x: 260, y: 70 },
  'NG_111@2.0.0': { x: 100, y: 70 },
  'PX_1111-001@1.0.0': { x: 260, y: 190 },
  'FM_1111-001@2.0.0': { x: 140, y: 310 },
  'FM_1111-001@1.0.0': { x: 20, y: 310 },
  'TB_1111-001@1.0.0': { x: 270, y: 310 },
  'FL_1111-001@1.0.0': { x: 390, y: 310 },

  'NG_1130@1.0.0': { x: 570, y: 70 },
  'PX_1130-001@1.0.0': { x: 500, y: 190 },
  'NT_2026-021@1.0.0': { x: 650, y: 190 },

  'CTR_2026-012@1.0.0': { x: 840, y: 70 },
  'NT_2026-018@1.0.0': { x: 840, y: 190 },
  'NG_012': { x: 990, y: 190 },

  'RG_1100@1.0.0': { x: 680, y: 310 },
  'NG_010': { x: 830, y: 310 }
};

export const GrafoView: React.FC<GrafoViewProps> = ({ onNavegarDocumento }) => {
  const [grafo, setGrafo] = useState<GrafoAcervo | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados de interação e filtros
  const [noSelecionadoId, setNoSelecionadoId] = useState<string | null>('NG_111@3.0.0');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'vigente' | 'substituido'>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    fetchGrafo()
      .then((res) => {
        if (ativo) {
          setGrafo(res);
          setCarregando(false);
        }
      })
      .catch((err) => {
        if (ativo) {
          setErro(err instanceof Error ? err.message : 'Erro ao carregar grafo');
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  const noSelecionado = useMemo(() => {
    if (!grafo || !noSelecionadoId) return null;
    return grafo.nos.find((n) => n.id === noSelecionadoId) || null;
  }, [grafo, noSelecionadoId]);

  // Nós e arestas conectados ao nó selecionado
  const conexoesNoSelecionado = useMemo(() => {
    if (!grafo || !noSelecionadoId) return { conectados: new Set<string>(), arestas: [] };
    const conectados = new Set<string>([noSelecionadoId]);
    const arestasConectadas = grafo.arestas.filter((a) => {
      if (a.de === noSelecionadoId) {
        conectados.add(a.para);
        return true;
      }
      if (a.para === noSelecionadoId) {
        conectados.add(a.de);
        return true;
      }
      return false;
    });
    return { conectados, arestas: arestasConectadas };
  }, [grafo, noSelecionadoId]);

  // Nós filtrados
  const nosFiltrados = useMemo(() => {
    if (!grafo) return [];
    return grafo.nos.filter((no) => {
      if (filtroTipo !== 'todos' && no.tipo !== filtroTipo) return false;
      if (filtroStatus === 'vigente' && (no.substituido || !no.existe_no_acervo)) return false;
      if (filtroStatus === 'substituido' && !no.substituido) return false;
      if (termoBusca) {
        const query = termoBusca.toLowerCase();
        return (
          no.codigo.toLowerCase().includes(query) ||
          no.id.toLowerCase().includes(query) ||
          no.tipo.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [grafo, filtroTipo, filtroStatus, termoBusca]);

  const nosFiltradosIds = useMemo(() => new Set(nosFiltrados.map((n) => n.id)), [nosFiltrados]);

  const handleAbrirLeitor = (no: GrafoNo) => {
    if (no.existe_no_acervo) {
      onNavegarDocumento(no.codigo, no.versao || undefined);
    }
  };

  if (carregando) {
    return (
      <div className="view-container grafo-view" data-testid="grafo-loading">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando mapa do acervo...</p>
        </div>
      </div>
    );
  }

  if (erro || !grafo) {
    return (
      <div className="view-container grafo-view" data-testid="grafo-erro">
        <div className="alerta alerta-erro">
          <strong>Não foi possível carregar o mapa do acervo:</strong> {erro}
        </div>
      </div>
    );
  }

  return (
    <div className="view-container grafo-view" data-testid="grafo-view">
      <CabecalhoTela
        titulo="Ligações entre Documentos"
        descricao="Conexões e dependências entre normas, contratos e notas técnicas do acervo."
        acoes={
          <button type="button" className="btn btn-outline btn-sm" onClick={() => { setTermoBusca(''); setFiltroTipo('todos'); setFiltroStatus('todos'); }}>
            <Icon nome="atualizar" tamanho={16} /> Limpar filtros
          </button>
        }
      />

      <div className="fg-grid-3 fg-stats">
        <div className="fg-card fg-stat">
          <div className="fg-stat-texto">
            <p className="fg-rotulo">Acervo total</p>
            <p className="fg-valor">{grafo?.nos.filter((n) => n.existe_no_acervo).length ?? 0}</p>
            <p className="fg-sub">Versões de documentos no mapa</p>
          </div>
          <span className="fg-icone" aria-hidden="true"><Icon nome="catalogo" tamanho={20} /></span>
        </div>
        <div className="fg-card fg-stat">
          <div className="fg-stat-texto">
            <p className="fg-rotulo">Vínculos ativos</p>
            <p className="fg-valor">{grafo?.arestas.length ?? 0}</p>
            <p className="fg-sub">Ligações entre documentos</p>
          </div>
          <span className="fg-icone" aria-hidden="true"><Icon nome="mapa" tamanho={20} /></span>
        </div>
        <div className="fg-card fg-stat">
          <div className="fg-stat-texto">
            <p className="fg-rotulo">Fora do acervo</p>
            <p className="fg-valor fg-valor-perigo">{grafo?.nos.filter((n) => !n.existe_no_acervo).length ?? 0}</p>
            <p className="fg-sub">{grafo?.nos.filter((n) => !n.existe_no_acervo).map((n) => n.codigo).join(' · ') || 'Nenhum'}</p>
          </div>
          <span className="fg-icone perigo" aria-hidden="true"><Icon nome="alerta" tamanho={20} /></span>
        </div>
      </div>

      {/* Barra de filtros: mesmo padrão de Documentos e Regras que mudaram */}
      <div className="fg-card fg-barra-filtros" role="search" aria-label="Filtros do mapa">
        <label className="fg-busca" htmlFor="busca-grafo">
          <Icon nome="busca" tamanho={18} />
          <span className="sr-only">Buscar documento</span>
          <input
            id="busca-grafo"
            type="search"
            placeholder="Buscar norma ou código, ex.: NG_111"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            data-testid="input-busca-grafo"
          />
        </label>

        <label htmlFor="filtro-tipo-grafo" className="sr-only">
          Tipo de documento
        </label>
        <select id="filtro-tipo-grafo" className="fg-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} data-testid="select-tipo-grafo">
          <option value="todos">Tipo: Todos</option>
          <option value="NG">Tipo: Normas gerais (NG)</option>
          <option value="PX">Tipo: Procedimentos (PX)</option>
          <option value="FM">Tipo: Formulários (FM)</option>
          <option value="TB">Tipo: Tabelas (TB)</option>
          <option value="FL">Tipo: Fluxogramas (FL)</option>
          <option value="CTR">Tipo: Contratos (CTR)</option>
          <option value="NT">Tipo: Notas técnicas (NT)</option>
          <option value="RG">Tipo: Regulamentos (RG)</option>
        </select>

        <label htmlFor="filtro-status-grafo" className="sr-only">
          Vigência
        </label>
        <select
          id="filtro-status-grafo"
          className="fg-select"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as 'todos' | 'vigente' | 'substituido')}
          data-testid="select-status-grafo"
        >
          <option value="todos">Vigência: Todas as versões</option>
          <option value="vigente">Vigência: Só vigentes</option>
          <option value="substituido">Vigência: Só versões antigas</option>
        </select>

      </div>

      {/* Legenda do Mapa */}
      <div className="grafo-legenda" aria-label="Legenda das relações e convenções visuais">
        <div className="legenda-grupo">
          <span className="legenda-titulo">Ligações</span>
          <span className="legenda-item">
            <span className="linha-legenda linha-vinculado"></span> Segue outro documento
          </span>
          <span className="legenda-item">
            <span className="linha-legenda linha-referencia"></span> Cita outro documento
          </span>
          <span className="legenda-item">
            <span className="linha-legenda linha-substitui"></span> Substitui a versão anterior
          </span>
        </div>
        <div className="legenda-grupo">
          <span className="legenda-titulo">Documentos</span>
          <span className="legenda-item">
            <span className="amostra-no no-vigente"></span> Vigente
          </span>
          <span className="legenda-item">
            <span className="amostra-no no-substituido"></span> Versão antiga (tracejado)
          </span>
          <span className="legenda-item">
            <span className="amostra-no no-externo"></span> Fora do acervo
          </span>
        </div>
      </div>

      <div className="grafo-layout-grid">
        {/* Painel Central: Grafo SVG Interativo */}
          <div className="grafo-canvas-container" data-testid="grafo-canvas">
            <svg
              className="grafo-svg"
              viewBox="0 0 1100 420"
              preserveAspectRatio="xMidYMid meet"
              role="graphics-document"
              aria-label="Grafo interativo das relações normativas"
            >
              <defs>
                {/* Marcadores de setas */}
                <marker
                  id="seta-vinculado"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" style={{ fill: 'var(--color-primary)' }} />
                </marker>
                <marker
                  id="seta-referencia"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" style={{ fill: 'var(--color-text-muted)' }} />
                </marker>
                <marker
                  id="seta-substitui"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" style={{ fill: 'var(--color-border-strong)' }} />
                </marker>
              </defs>

              {/* RENDERIZAR ARESTAS */}
              <g className="grafo-arestas" aria-label="Relações entre documentos">
                {grafo.arestas.map((aresta, idx) => {
                  const pDe = COORDENADAS_NOS[aresta.de];
                  const pPara = COORDENADAS_NOS[aresta.para];
                  if (!pDe || !pPara) return null;

                  const isVisivel =
                    nosFiltradosIds.has(aresta.de) && nosFiltradosIds.has(aresta.para);
                  const isConectadaAoSelecionado =
                    aresta.de === noSelecionadoId || aresta.para === noSelecionadoId;

                  let corLinha = 'var(--color-text-muted)';
                  let marker = 'url(#seta-referencia)';
                  let strokeDash = 'none';

                  if (aresta.tipo === 'vinculado_a') {
                    corLinha = 'var(--color-primary)';
                    marker = 'url(#seta-vinculado)';
                  } else if (aresta.tipo === 'substitui') {
                    // Substituição é neutra (cinza tracejado); vermelho fica só para conflito
                    corLinha = 'var(--color-border-strong)';
                    marker = 'url(#seta-substitui)';
                    strokeDash = '4,4';
                  }

                  const opacidade = !isVisivel
                    ? 0.15
                    : noSelecionadoId && !isConectadaAoSelecionado
                    ? 0.25
                    : 1;

                  return (
                    <g key={idx} opacity={opacidade}>
                      <line
                        x1={pDe.x}
                        y1={pDe.y}
                        x2={pPara.x}
                        y2={pPara.y}
                        style={{ stroke: corLinha }}
                        strokeWidth={isConectadaAoSelecionado ? 3 : 1.8}
                        strokeDasharray={strokeDash}
                        markerEnd={marker}
                      />
                    </g>
                  );
                })}
              </g>

              {/* RENDERIZAR NÓS */}
              <g className="grafo-nos" aria-label="Documentos do acervo">
                {grafo.nos.map((no) => {
                  const pos = COORDENADAS_NOS[no.id] || { x: 500, y: 200 };
                  const isSelecionado = no.id === noSelecionadoId;
                  const isConectado = conexoesNoSelecionado.conectados.has(no.id);
                  const isVisivel = nosFiltradosIds.has(no.id);
                  const esquemaCor = !no.existe_no_acervo
                    ? COR_AUSENTE
                    : CORES_POR_TIPO[no.tipo] || camadaCor('apoio');

                  const opacidade = !isVisivel
                    ? 0.15
                    : noSelecionadoId && !isConectado
                    ? 0.35
                    : 1;

                  const largura = 96;
                  const altura = 48;
                  const rx = 8;

                  return (
                    <g
                      key={no.id}
                      transform={`translate(${pos.x - largura / 2}, ${pos.y - altura / 2})`}
                      opacity={opacidade}
                      className="grafo-no-group"
                      cursor="pointer"
                      onClick={() => setNoSelecionadoId(no.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setNoSelecionadoId(no.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`${no.codigo} versão ${no.versao || 'externa'}. ${
                        no.substituido ? 'Substituído' : 'Vigente'
                      }`}
                      data-testid={`grafo-no-${no.id}`}
                    >
                      <rect
                        width={largura}
                        height={altura}
                        rx={rx}
                        style={{
                          fill: no.substituido ? 'var(--color-neutral-bg)' : esquemaCor.bg,
                          stroke: isSelecionado
                            ? 'var(--color-text)'
                            : no.substituido
                            ? 'var(--color-border-strong)'
                            : esquemaCor.border
                        }}
                        strokeWidth={isSelecionado ? 3 : 1.8}
                        strokeDasharray={
                          no.substituido ? '4,3' : !no.existe_no_acervo ? '3,3' : 'none'
                        }
                      />

                      {/* Tipo badge no canto superior direito */}
                      <rect
                        x={largura - 26}
                        y={4}
                        width={22}
                        height={14}
                        rx={3}
                        style={{ fill: esquemaCor.border }}
                      />
                      <text
                        x={largura - 15}
                        y={14}
                        style={{ fill: 'var(--color-on-primary)' }}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {no.tipo}
                      </text>

                      {/* Código do documento */}
                      <text
                        x={10}
                        y={20}
                        style={{ fill: esquemaCor.text }}
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {no.codigo}
                      </text>

                      {/* Versão ou selo externo */}
                      <text
                        x={10}
                        y={36}
                        style={{ fill: no.substituido ? 'var(--color-neutral-text)' : 'var(--color-text-muted)' }}
                        fontSize="9"
                        fontWeight={no.substituido ? 'bold' : 'normal'}
                      >
                        {no.existe_no_acervo
                          ? `v${no.versao}${no.substituido ? ' (Subst.)' : ''}`
                          : 'Externo'}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

        {/* Painel Lateral: Detalhes do Nó Selecionado */}
        <aside
          className="grafo-painel-detalhes"
          data-testid="grafo-painel-detalhes"
          aria-labelledby="detalhe-no-titulo"
        >
          {noSelecionado ? (
            <div className="detalhe-no-card">
              <div className="detalhe-no-header">
                <span className="detalhe-tipo-badge">{noSelecionado.tipo}</span>
                <h2 id="detalhe-no-titulo" className="detalhe-no-codigo">
                  {noSelecionado.codigo}
                </h2>
              </div>

              <div className="detalhe-no-metas">
                <div className="meta-linha">
                  <span className="meta-k">Versão:</span>
                  <span className="meta-v">
                    {noSelecionado.versao ? `v${noSelecionado.versao}` : 'Documento Externo'}
                  </span>
                </div>
                <div className="meta-linha">
                  <span className="meta-k">Situação:</span>
                  <span className="meta-v">
                    {noSelecionado.substituido ? (
                      <span className="badge-aviso-tag">Versão Substituída</span>
                    ) : noSelecionado.existe_no_acervo ? (
                      <span className="badge-ok-tag">Versão Vigente</span>
                    ) : (
                      <span className="badge-externo-tag">Não Ingerido (NG_012/010)</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Relações Conectadas */}
              <div className="detalhe-relacoes">
                <h3 className="relacoes-subtitulo">Conexões no Grafo:</h3>
                {conexoesNoSelecionado.arestas.length === 0 ? (
                  <p className="text-muted">Sem conexões diretas registradas.</p>
                ) : (
                  <ul className="relacoes-lista">
                    {conexoesNoSelecionado.arestas.map((a, i) => {
                      const ehOrigem = a.de === noSelecionado.id;
                      const outroId = ehOrigem ? a.para : a.de;
                      return (
                        <li key={i} className="relacao-item">
                          <span className="relacao-tipo-tag">
                            {a.tipo === 'vinculado_a' && 'Vinculado a'}
                            {a.tipo === 'referencia' && 'Cita / Referencia'}
                            {a.tipo === 'substitui' && 'Substitui'}
                          </span>
                          <button
                            type="button"
                            className="btn-link relacao-outro-link"
                            onClick={() => setNoSelecionadoId(outroId)}
                          >
                            {outroId}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {noSelecionado.existe_no_acervo ? (
                <button
                  type="button"
                  className="btn btn-primary btn-block mt-4"
                  onClick={() => handleAbrirLeitor(noSelecionado)}
                  data-testid="btn-abrir-no-leitor"
                >
                  <Icon nome="livro" tamanho={16} />
                  Abrir no leitor
                </button>
              ) : (
                <div className="alerta alerta-info mt-4">
                  <strong>Documento Externo:</strong> Referenciado em notas e contratos, porém não
                  fornecido no acervo fechado da ACME.
                </div>
              )}
            </div>
          ) : (
            <div className="detalhe-placeholder">
              <p>Clique em qualquer nó do mapa para examinar suas conexões e versões.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
