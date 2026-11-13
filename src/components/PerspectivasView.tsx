import React, { useEffect, useState } from 'react';
import { FontesBase } from './PainelFontes';
import { FonteCita, PerspectivaDetalhe, PerspectivaResumo } from '../api/types';
import { fetchPerspectivaDetalhe, fetchPerspectivas } from '../api/client';
import { Icon, NomeIcone } from '../ui/Icon';
import { navegar, url } from '../app/rotas';
import { TEMAS, temaDe, DATA_REFERENCIA } from '../mocks/v2';
import { CabecalhoTela, IncluirRelatorio, ProximaAcao, SemQuebra } from '../ui/componentes';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';

const PRAZOS: [string, string][] = [
  ['30', 'Próximos 30 dias'],
  ['90', 'Próximos 90 dias'],
  ['180', 'Próximos 180 dias'],
  ['vencidos', 'Vencidos']
];
const REF = Date.parse(DATA_REFERENCIA);
const dentroDoPrazo = (dataIso: string, prazo: string) => {
  if (!prazo) return true;
  const t = Date.parse(dataIso);
  if (Number.isNaN(t)) return false;
  const dias = (t - REF) / 864e5;
  return prazo === 'vencidos' ? dias < 0 : dias >= 0 && dias <= Number(prazo);
};
const dataBR = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : iso);

const ICONE_PERSPECTIVA: Record<string, NomeIcone> = {
  pessoas: 'pessoas',
  financeiro: 'financeiro',
  juridico: 'juridico',
  gestao: 'gestao'
};

interface PerspectivasViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
  perspectivaInicial?: string;
  /** Filtros do fluxo v2 (RF37), feitos só no frontend. */
  tema?: string;
  prazo?: string;
}

export const PerspectivasView: React.FC<PerspectivasViewProps> = ({
  onNavegarDocumento,
  perspectivaInicial = 'pessoas',
  tema = '',
  prazo = ''
}) => {
  const temaOk = (codigo: string) => !tema || temaDe(codigo) === tema;
  const [perspectivas, setPerspectivas] = useState<PerspectivaResumo[]>([]);
  const [perspectivaAtiva, setPerspectivaAtiva] = useState<string>(perspectivaInicial);
  const filtrar = (novo: { tema?: string; prazo?: string; p?: string }) =>
    navegar(url.painel(novo.p ?? perspectivaAtiva, { tema: novo.tema ?? tema, prazo: novo.prazo ?? prazo }), true);
  const [detalhe, setDetalhe] = useState<PerspectivaDetalhe | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Carregar lista de perspectivas
  useEffect(() => {
    fetchPerspectivas()
      .then((res) => {
        setPerspectivas(res);
      })
      .catch((err) => {
        setErro(err instanceof Error ? err.message : 'Erro ao listar perspectivas');
      });
  }, []);

  // Carregar detalhe da perspectiva ativa
  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    fetchPerspectivaDetalhe(perspectivaAtiva)
      .then((res) => {
        if (ativo) {
          setDetalhe(res);
          setCarregando(false);
        }
      })
      .catch((err) => {
        if (ativo) {
          setErro(err instanceof Error ? err.message : 'Erro ao carregar perspectiva');
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [perspectivaAtiva]);

  // Se a prop mudar externamente (ex.: via atalho de demo)
  useEffect(() => {
    if (perspectivaInicial) {
      setPerspectivaAtiva(perspectivaInicial);
    }
  }, [perspectivaInicial]);

  const formatarValorGrafico = (numero: number, unidade: string) => {
    if (unidade === 'BRL') {
      return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }
    return `${numero} ${unidade}`;
  };

  const proximos = detalhe ? detalhe.prazos.filter((p) => dentroDoPrazo(p.data, '90')).length : 0;

  const maiorValorNumerico = detalhe
    ? Math.max(...detalhe.valores.map((v) => v.numero), 1)
    : 1;

  const renderBotaoFonte = (fonte: FonteCita, rotuloExtra?: string, className = 'btn-fonte') => {
    return (
      <button
        type="button"
        className={className}
        onClick={() => onNavegarDocumento(fonte.codigo, fonte.versao, fonte.secao)}
        title={`Abrir ${fonte.codigo} v${fonte.versao} na seção ${fonte.secao}`}
        data-testid={`btn-fonte-${fonte.codigo}-${fonte.secao}`}
      >
        <span className="fonte-icone"><Icon nome="arquivo" tamanho={14} /></span>
        <span className="fonte-texto">
          {rotuloExtra && <strong>{rotuloExtra}: </strong>}
          {fonte.codigo} v{fonte.versao} · {fonte.secao}
        </span>
      </button>
    );
  };

  return (
    <div className="view-container perspectivas-view" data-testid="perspectivas-view">
      <CabecalhoTela
        etiqueta="Ciclo 2026/2027"
        titulo="Resumo por Área"
        descricao="Normas, responsabilidades e prazos vigentes consolidados por área. Cada número mostra de qual documento veio."
        acoes={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
            <Icon nome="baixar" tamanho={16} /> Exportar Painel (PDF)
          </button>
        }
      />
      <FontesBase fontes={(detalhe ? [...detalhe.destaques.map((d) => d.fonte), ...detalhe.valores.map((v) => v.fonte), ...detalhe.prazos.map((p) => p.fonte), ...detalhe.responsaveis.map((r) => r.fonte), ...detalhe.riscos.map((r) => r.fonte)] : [])} />

      <div className="fg-grid-3 fg-stats">
        <div className="fg-card fg-stat">
          <div className="fg-stat-texto">
            <p className="fg-rotulo">Normas mapeadas</p>
            <p className="fg-valor">{MOCK_DOCUMENTOS.length}</p>
            <p className="fg-sub">Documentos no arquivo</p>
          </div>
          <span className="fg-icone" aria-hidden="true">
            <Icon nome="catalogo" tamanho={20} />
          </span>
        </div>
        <div className="fg-card fg-stat">
          <div className="fg-stat-texto">
            <p className="fg-rotulo">Prazos próximos</p>
            <p className={`fg-valor ${proximos ? "fg-valor-perigo" : ""}`}>{proximos} {proximos === 1 ? "alerta" : "alertas"}</p>
            <p className="fg-sub">Nos próximos 90 dias desta área</p>
          </div>
          <span className="fg-icone perigo" aria-hidden="true">
            <Icon nome="calendario" tamanho={20} />
          </span>
        </div>
        <div className="fg-card fg-stat">
          <div className="fg-stat-texto">
            <p className="fg-rotulo">Comprometido fixo</p>
            <p className="fg-valor">R$ 18.250,00</p>
            <p className="fg-sub">Contrato de coworking (CTR_2026-012)</p>
          </div>
          <span className="fg-icone" aria-hidden="true">
            <Icon nome="financeiro" tamanho={20} />
          </span>
        </div>
      </div>

      {/* Abas das Perspectivas */}
      <nav
        className="perspectivas-tabs"
        role="tablist"
        aria-label="Seleção de Perspectiva Empresarial"
      >
        {perspectivas.map((p) => {
          const isAtiva = perspectivaAtiva === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={isAtiva}
              className={`perspectiva-tab-btn ${isAtiva ? 'active' : ''}`}
              onClick={() => {
                setPerspectivaAtiva(p.id);
                if (typeof window !== 'undefined' && window.location.pathname.startsWith('/painel')) filtrar({ p: p.id });
              }}
              data-testid={`tab-perspectiva-${p.id}`}
            >
              <Icon nome={ICONE_PERSPECTIVA[p.id] ?? 'painel'} tamanho={16} />
              {p.nome}
            </button>
          );
        })}
      </nav>

      {carregando && (
        <div className="loading-state" data-testid="perspectivas-loading">
          <div className="spinner"></div>
          <p>Carregando o resumo da área…</p>
        </div>
      )}

      {erro && (
        <div className="alerta alerta-erro" data-testid="perspectivas-erro">
          <strong>Erro ao carregar perspectiva:</strong> {erro}
        </div>
      )}

      <div className="filtros-linha" role="group" aria-label="Filtros do painel">
        <label htmlFor="painel-tema">Assunto</label>
        <select id="painel-tema" value={tema} onChange={(e) => filtrar({ tema: e.target.value })} data-testid="filtro-tema-painel">
          <option value="">Todos</option>
          {Object.entries(TEMAS).map(([id, nome]) => (
            <option key={id} value={id}>
              {nome}
            </option>
          ))}
        </select>
        <label htmlFor="painel-prazo">Prazos</label>
        <select id="painel-prazo" value={prazo} onChange={(e) => filtrar({ prazo: e.target.value })} data-testid="filtro-prazo-painel">
          <option value="">Qualquer prazo</option>
          {PRAZOS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <span className="texto-apoio">a partir de {dataBR(DATA_REFERENCIA)}</span>
        {tema && (
          <button type="button" className="chip-filtro" onClick={() => filtrar({ tema: '' })} aria-label={`Remover filtro de tema ${TEMAS[tema]}`}>
            Tema: {TEMAS[tema]} <span aria-hidden="true">×</span>
          </button>
        )}
        {prazo && (
          <button type="button" className="chip-filtro" onClick={() => filtrar({ prazo: '' })} aria-label="Remover filtro de prazo">
            Prazo: {PRAZOS.find(([v]) => v === prazo)?.[1]} <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {!carregando && detalhe && (() => {
        const destaques = prazo ? [] : detalhe.destaques.filter((d) => temaOk(d.fonte.codigo));
        const prazos = detalhe.prazos.filter((p) => temaOk(p.fonte.codigo) && dentroDoPrazo(p.data, prazo));
        const responsaveis = prazo ? [] : detalhe.responsaveis.filter((r) => temaOk(r.fonte.codigo));
        const riscos = prazo ? [] : detalhe.riscos.filter((r) => temaOk(r.fonte.codigo));
        const valores = prazo ? [] : detalhe.valores.filter((v) => temaOk(v.fonte.codigo));
        if (!destaques.length && !prazos.length && !responsaveis.length && !riscos.length && !valores.length)
          return (
            <div className="painel-secao" data-testid="painel-filtro-vazio">
              <p>Nenhum item neste filtro. Remova um filtro ou amplie o prazo.</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => filtrar({ tema: '', prazo: '' })}>
                Limpar filtros
              </button>
            </div>
          );
        return (
        <div className="perspectiva-conteudo" data-testid={`perspectiva-conteudo-${detalhe.id}`}>
          {/* SEÇÃO 1: CARTÕES DE DESTAQUE (Com gancho da versão anterior / Cena 1 e Cena 2) */}
          {destaques.length > 0 && (
          <section className="painel-secao" aria-labelledby="secao-destaques-titulo">
            <div className="secao-titulo-wrap">
              <h2 id="secao-destaques-titulo" className="secao-titulo">
                Regras principais
              </h2>
              <span className="secao-subtitulo">
                As regras mais importantes desta área, com a fonte
              </span>
            </div>

            <div className="destaques-grid">
              {destaques.map((item, idx) => {
                const temAlertaVersao = Boolean(item.aviso || item.fonte_anterior);
                return (
                  <article
                    key={idx}
                    className={`destaque-card ${temAlertaVersao ? 'card-com-alerta' : ''}`}
                    data-testid={`destaque-card-${idx}`}
                  >
                    <div className="destaque-cabecalho">
                      <span className="destaque-titulo">{item.titulo}</span>
                      {temAlertaVersao && (
                        <span className="badge-aviso-versao" data-testid="badge-aviso-versao">
                          <Icon nome="alerta" tamanho={14} /> {item.aviso || 'A versão antiga dizia outra coisa'}
                        </span>
                      )}
                    </div>

                    <div className="destaque-valor-wrap">
                      <span className="destaque-valor-grande" data-testid="destaque-valor-principal">
                        <SemQuebra texto={item.valor} />
                      </span>
                    </div>

                    {/* Fonte Vigente */}
                    <div className="destaque-fonte-row">
                      <span className="fonte-rotulo">Regra em vigor:</span>
                      {renderBotaoFonte(item.fonte, undefined, 'btn-fonte-vigente')}
                    </div>

                    {/* Gancho da Armadilha de Versão (Cena 1 do PRD / Adendo v0.1 F) */}
                    {item.fonte_anterior && (
                      <div
                        className="box-alerta-versao-anterior"
                        data-testid="box-alerta-versao-anterior"
                      >
                        <div className="alerta-versao-header">
                          <span className="alerta-icone"><Icon nome="alerta" tamanho={16} /></span>
                          <strong>Atenção: esta regra mudou</strong>
                        </div>
                        <p className="alerta-versao-texto">
                          A norma anterior <strong>{item.fonte_anterior.codigo} v{item.fonte_anterior.versao}</strong> previa{' '}
                          <em>uma regra diferente</em>. Use sempre a versão em vigor.
                        </p>
                        <div className="alerta-versao-acoes">
                          <span className="fonte-rotulo">Regra antiga:</span>
                          {renderBotaoFonte(
                            item.fonte_anterior,
                            'Versão antiga',
                            'btn-fonte-anterior'
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
          )}

          {/* SEÇÃO 2: GRÁFICO DE VALORES E ALÇADAS (Acessível) */}
          {valores.length > 0 && (
            <section className="painel-secao" aria-labelledby="secao-valores-titulo">
              <div className="secao-titulo-wrap">
                <h2 id="secao-valores-titulo" className="secao-titulo">
                  Valores e multas
                </h2>
                <span className="secao-subtitulo">
                  Valores em reais, com a fonte de cada um
                </span>
              </div>

              <div
                className="grafico-valores-container"
                role="region"
                aria-label="Gráfico de barras de valores financeiros e penalidades"
              >
                <div className="barras-lista" role="list">
                  {valores.map((v, i) => {
                    const percLargura = Math.max(
                      Math.round((v.numero / maiorValorNumerico) * 100),
                      8
                    );
                    return (
                      <div
                        key={i}
                        className="barra-item-row"
                        role="listitem"
                        data-testid={`grafico-barra-item-${i}`}
                      >
                        <div className="barra-rotulo-col">
                          <span className="barra-nome">{v.rotulo}</span>
                          <span className="barra-valor-destaque">
                            {formatarValorGrafico(v.numero, v.unidade)}
                          </span>
                        </div>

                        <div className="barra-visual-col">
                          <div
                            className="barra-trilho"
                            role="progressbar"
                            aria-valuenow={v.numero}
                            aria-valuemin={0}
                            aria-valuemax={maiorValorNumerico}
                            aria-label={`${v.rotulo}: ${formatarValorGrafico(v.numero, v.unidade)}`}
                          >
                            <div
                              className={`barra-preenchimento barra-cor-${i % 4}`}
                              style={{ width: `${percLargura}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="barra-fonte-col">
                          {renderBotaoFonte(v.fonte)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tabela de acessibilidade para leitores de tela */}
                <div className="sr-only">
                <table aria-label="Tabela acessível dos valores do gráfico">
                  <thead>
                    <tr>
                      <th scope="col">Rótulo</th>
                      <th scope="col">Valor</th>
                      <th scope="col">Documento Fonte</th>
                      <th scope="col">Seção Citada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valores.map((v, i) => (
                      <tr key={i}>
                        <td>{v.rotulo}</td>
                        <td>{formatarValorGrafico(v.numero, v.unidade)}</td>
                        <td>
                          {v.fonte.codigo} v{v.fonte.versao}
                        </td>
                        <td>{v.fonte.secao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </section>
          )}

          {/* SEÇÃO 3: LINHA DO TEMPO DE PRAZOS E MARCOS */}
          {prazos.length > 0 && (
            <section className="painel-secao" aria-labelledby="secao-prazos-titulo">
              <div className="secao-titulo-wrap">
                <h2 id="secao-prazos-titulo" className="secao-titulo">
                  Prazos em ordem
                </h2>
                <span className="secao-subtitulo">
                  Datas de cada etapa, da primeira à última
                </span>
              </div>

              <ol className="timeline-container" data-testid="timeline-prazos">
                {prazos.map((p, idx) => (
                  <li
                    key={idx}
                    className="timeline-item"
                    data-testid={`timeline-item-${idx}`}
                  >
                    <div className="timeline-marcador">
                      {p.marco ? (
                        <span className="badge-marco" data-testid="badge-marco">
                          {p.marco}
                        </span>
                      ) : (
                        <span className="ponto-timeline"></span>
                      )}
                    </div>

                    <div className="timeline-conteudo">
                      <div className="timeline-data-wrap">
                        <time className="timeline-data" dateTime={p.data}>
                          {p.data}
                        </time>
                        {p.cenario && (
                          <span className="badge-cenario"><SemQuebra texto={p.cenario} /></span>
                        )}
                      </div>
                      <h3 className="timeline-evento"><SemQuebra texto={p.evento} /></h3>
                      <div className="timeline-fonte">
                        {renderBotaoFonte(p.fonte)}
                      </div>
                      <IncluirRelatorio item={{ id: `prazo-${detalhe.id}-${idx}`, texto: `${dataBR(p.data)}: ${p.evento}.`, fonte: p.fonte }} />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* SEÇÃO 4: MATRIZ DE RESPONSÁVEIS */}
          {responsaveis.length > 0 && (
            <section className="painel-secao" aria-labelledby="secao-responsaveis-titulo">
              <div className="secao-titulo-wrap">
                <h2 id="secao-responsaveis-titulo" className="secao-titulo">
                  Quem faz o quê
                </h2>
                <span className="secao-subtitulo">
                  Cada área e o que ela precisa fazer
                </span>
              </div>

              <div className="responsaveis-grid">
                {responsaveis.map((r, idx) => (
                  <div
                    key={idx}
                    className="responsavel-card"
                    data-testid={`responsavel-card-${idx}`}
                  >
                    <div className="responsavel-papel-badge">
                      <span className="papel-sigla">{r.papel}</span>
                    </div>
                    <div className="responsavel-info">
                      <p className="responsavel-texto">{r.responsabilidade}</p>
                      <div className="responsavel-fonte">
                        {renderBotaoFonte(r.fonte)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SEÇÃO 5: RISCOS E DIRETRIZES DE MITIGAÇÃO */}
          {riscos.length > 0 && (
            <section className="painel-secao" aria-labelledby="secao-riscos-titulo">
              <div className="secao-titulo-wrap">
                <h2 id="secao-riscos-titulo" className="secao-titulo">
                  Cuidados e riscos
                </h2>
                <span className="secao-subtitulo">
                  O que acontece se um prazo ou uma regra não for cumprido
                </span>
              </div>

              <div className="riscos-lista">
                {riscos.map((risco, idx) => (
                  <div
                    key={idx}
                    className="risco-card"
                    data-testid={`risco-card-${idx}`}
                  >
                    <div className="risco-icone-wrap">
                      <span className="risco-icone"><Icon nome="alerta" tamanho={18} /></span>
                    </div>
                    <div className="risco-corpo">
                      <p className="risco-descricao">{risco.descricao}</p>
                      <div className="risco-fonte">
                        {renderBotaoFonte(risco.fonte)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <ProximaAcao>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => navegar(url.ese('ferias_antecedencia_dias', 30))}>
              Simular regra
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navegar(url.relatorio({ perspectiva: detalhe.id }))}>
              Gerar relatório
            </button>
          </ProximaAcao>
        </div>
        );
      })()}
    </div>
  );
};
