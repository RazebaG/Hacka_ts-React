import React, { useEffect, useState } from 'react';
import { FonteCita, PerspectivaDetalhe, PerspectivaResumo } from '../api/types';
import { fetchPerspectivaDetalhe, fetchPerspectivas } from '../api/client';

interface PerspectivasViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
  perspectivaInicial?: string;
}

export const PerspectivasView: React.FC<PerspectivasViewProps> = ({
  onNavegarDocumento,
  perspectivaInicial = 'pessoas'
}) => {
  const [perspectivas, setPerspectivas] = useState<PerspectivaResumo[]>([]);
  const [perspectivaAtiva, setPerspectivaAtiva] = useState<string>(perspectivaInicial);
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
        <span className="fonte-icone">📄</span>
        <span className="fonte-texto">
          {rotuloExtra && <strong>{rotuloExtra}: </strong>}
          {fonte.codigo} v{fonte.versao} · {fonte.secao}
        </span>
      </button>
    );
  };

  return (
    <div className="view-container perspectivas-view" data-testid="perspectivas-view">
      <header className="view-header">
        <div className="header-meta">
          <span className="badge-tag">Inteligência Empresarial</span>
          <h1 className="view-title">Painéis por Perspectiva</h1>
        </div>
        <p className="view-description">
          Síntese executiva extraída do acervo normativo: cada número, prazo e alçada
          é auditável com link direto para o trecho exato na fonte.
        </p>
      </header>

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
              onClick={() => setPerspectivaAtiva(p.id)}
              data-testid={`tab-perspectiva-${p.id}`}
            >
              {p.id === 'pessoas' && '👥 '}
              {p.id === 'financeiro' && '💰 '}
              {p.id === 'juridico' && '⚖️ '}
              {p.id === 'gestao' && '🚀 '}
              {p.nome}
            </button>
          );
        })}
      </nav>

      {carregando && (
        <div className="loading-state" data-testid="perspectivas-loading">
          <div className="spinner"></div>
          <p>Carregando dados da perspectiva...</p>
        </div>
      )}

      {erro && (
        <div className="alerta alerta-erro" data-testid="perspectivas-erro">
          <strong>Erro ao carregar perspectiva:</strong> {erro}
        </div>
      )}

      {!carregando && detalhe && (
        <div className="perspectiva-conteudo" data-testid={`perspectiva-conteudo-${detalhe.id}`}>
          {/* SEÇÃO 1: CARTÕES DE DESTAQUE (Com gancho da versão anterior / Cena 1 e Cena 2) */}
          <section className="painel-secao" aria-labelledby="secao-destaques-titulo">
            <div className="secao-titulo-wrap">
              <h2 id="secao-destaques-titulo" className="secao-titulo">
                Destaques e Regras Principais
              </h2>
              <span className="secao-subtitulo">
                Marcos normativos com rastreabilidade de versões
              </span>
            </div>

            <div className="destaques-grid">
              {detalhe.destaques.map((item, idx) => {
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
                          ⚠️ {item.aviso || 'Versão Anterior Divergente'}
                        </span>
                      )}
                    </div>

                    <div className="destaque-valor-wrap">
                      <span className="destaque-valor-grande" data-testid="destaque-valor-principal">
                        {item.valor}
                      </span>
                    </div>

                    {/* Fonte Vigente */}
                    <div className="destaque-fonte-row">
                      <span className="fonte-rotulo">Regra Vigente:</span>
                      {renderBotaoFonte(item.fonte, undefined, 'btn-fonte-vigente')}
                    </div>

                    {/* Gancho da Armadilha de Versão (Cena 1 do PRD / Adendo v0.1 F) */}
                    {item.fonte_anterior && (
                      <div
                        className="box-alerta-versao-anterior"
                        data-testid="box-alerta-versao-anterior"
                      >
                        <div className="alerta-versao-header">
                          <span className="alerta-icone">⚠️</span>
                          <strong>Armadilha de Versão:</strong>
                        </div>
                        <p className="alerta-versao-texto">
                          A norma anterior <strong>{item.fonte_anterior.codigo} v{item.fonte_anterior.versao}</strong> previa{' '}
                          <em>regra diferente</em>. Consultar documentos desatualizados induz a erros em auditorias.
                        </p>
                        <div className="alerta-versao-acoes">
                          <span className="fonte-rotulo">Regra Revogada/Substituída:</span>
                          {renderBotaoFonte(
                            item.fonte_anterior,
                            'Versão Anterior',
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

          {/* SEÇÃO 2: GRÁFICO DE VALORES E ALÇADAS (Acessível) */}
          {detalhe.valores.length > 0 && (
            <section className="painel-secao" aria-labelledby="secao-valores-titulo">
              <div className="secao-titulo-wrap">
                <h2 id="secao-valores-titulo" className="secao-titulo">
                  Valores, Alçadas e Penalidades
                </h2>
                <span className="secao-subtitulo">
                  Gráfico quantitativo de impacto orçamentário e multas com fontes citadas
                </span>
              </div>

              <div
                className="grafico-valores-container"
                role="region"
                aria-label="Gráfico de barras de valores financeiros e penalidades"
              >
                <div className="barras-lista" role="list">
                  {detalhe.valores.map((v, i) => {
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
                <table className="sr-only" aria-label="Tabela acessível dos valores do gráfico">
                  <thead>
                    <tr>
                      <th scope="col">Rótulo</th>
                      <th scope="col">Valor</th>
                      <th scope="col">Documento Fonte</th>
                      <th scope="col">Seção Citada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalhe.valores.map((v, i) => (
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
            </section>
          )}

          {/* SEÇÃO 3: LINHA DO TEMPO DE PRAZOS E MARCOS */}
          {detalhe.prazos.length > 0 && (
            <section className="painel-secao" aria-labelledby="secao-prazos-titulo">
              <div className="secao-titulo-wrap">
                <h2 id="secao-prazos-titulo" className="secao-titulo">
                  Linha do Tempo e Marcos Temporais
                </h2>
                <span className="secao-subtitulo">
                  Cronologia de eventos normativos, prazos legais e régua de contagem
                </span>
              </div>

              <ol className="timeline-container" data-testid="timeline-prazos">
                {detalhe.prazos.map((p, idx) => (
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
                          <span className="badge-cenario">{p.cenario}</span>
                        )}
                      </div>
                      <h3 className="timeline-evento">{p.evento}</h3>
                      <div className="timeline-fonte">
                        {renderBotaoFonte(p.fonte)}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* SEÇÃO 4: MATRIZ DE RESPONSÁVEIS */}
          {detalhe.responsaveis.length > 0 && (
            <section className="painel-secao" aria-labelledby="secao-responsaveis-titulo">
              <div className="secao-titulo-wrap">
                <h2 id="secao-responsaveis-titulo" className="secao-titulo">
                  Matriz de Responsáveis e Competências
                </h2>
                <span className="secao-subtitulo">
                  Atribuições formais por área, cargo e comitê
                </span>
              </div>

              <div className="responsaveis-grid">
                {detalhe.responsaveis.map((r, idx) => (
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
          {detalhe.riscos.length > 0 && (
            <section className="painel-secao" aria-labelledby="secao-riscos-titulo">
              <div className="secao-titulo-wrap">
                <h2 id="secao-riscos-titulo" className="secao-titulo">
                  Riscos Normativos e Pontos de Atenção
                </h2>
                <span className="secao-subtitulo">
                  Consequências do descumprimento de prazos e alçadas
                </span>
              </div>

              <div className="riscos-lista">
                {detalhe.riscos.map((risco, idx) => (
                  <div
                    key={idx}
                    className="risco-card"
                    data-testid={`risco-card-${idx}`}
                  >
                    <div className="risco-icone-wrap">
                      <span className="risco-icone">⚠️</span>
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
        </div>
      )}
    </div>
  );
};
