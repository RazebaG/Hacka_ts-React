import React, { useEffect, useState } from 'react';
import { FonteCita, RadarResponse } from '../api/types';
import { fetchRadar, isMockMode } from '../api/client';

interface RadarViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
  onNavegarSimular?: () => void;
  perspectivaInicial?: string;
}

export const RadarView: React.FC<RadarViewProps> = ({
  onNavegarDocumento,
  onNavegarSimular,
  perspectivaInicial = 'todos'
}) => {
  const [perspectivaAtiva, setPerspectivaAtiva] = useState<string>(perspectivaInicial);
  const [radarDados, setRadarDados] = useState<RadarResponse | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const mockAtivo = isMockMode();

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    fetchRadar(perspectivaAtiva)
      .then((res) => {
        if (ativo) {
          setRadarDados(res);
          setCarregando(false);
        }
      })
      .catch((err) => {
        if (ativo) {
          setErro(err instanceof Error ? err.message : 'Erro ao carregar radar');
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [perspectivaAtiva]);

  const renderBotaoFonte = (fonte: FonteCita, rotulo: string, testId: string) => {
    return (
      <button
        type="button"
        className="btn-fonte-radar"
        onClick={() => onNavegarDocumento(fonte.codigo, fonte.versao, fonte.secao)}
        title={`Abrir ${fonte.codigo} v${fonte.versao} na seção ${fonte.secao}`}
        data-testid={testId}
      >
        <span className="fonte-icone">📄</span>
        <span className="fonte-rotulo">
          <strong>{rotulo}:</strong> {fonte.codigo} v{fonte.versao} · {fonte.secao}
        </span>
      </button>
    );
  };

  const listaPerspectivas = [
    { id: 'todos', nome: 'Todos os Conflitos' },
    { id: 'pessoas', nome: 'Pessoas (RH)' },
    { id: 'financeiro', nome: 'Financeiro' },
    { id: 'juridico', nome: 'Jurídico e Contratos' },
    { id: 'gestao', nome: 'Gestão e Inovação' }
  ];

  return (
    <div className="view-container radar-view" data-testid="radar-view">
      <header className="view-header">
        <div className="header-meta">
          <div className="meta-tags-row">
            <span className="badge-tag">Inteligência Normativa</span>
            {mockAtivo && (
              <span className="badge-tag badge-fixture" data-testid="selo-dados-fixture">
                Dados de fixture
              </span>
            )}
          </div>
          <h1 className="view-title">Radar de Contradições e Divergências</h1>
        </div>
        <p className="view-description">
          Identificação contínua de conflitos entre versões substituídas e regras vigentes,
          além de normas citadas ausentes do acervo central.
        </p>
      </header>

      {/* Contadores por Status */}
      {radarDados && (
        <section className="radar-resumo-grid" aria-label="Contadores de Divergências">
          <div className="resumo-card divergente-card" data-testid="card-resumo-divergente">
            <div className="resumo-icone">⚠️</div>
            <div className="resumo-info">
              <span className="resumo-valor" data-testid="contador-divergente">
                {radarDados.resumo.divergente}
              </span>
              <span className="resumo-label">Divergências de Versão</span>
            </div>
            <span className="resumo-badge badge-divergente">Status: Divergente</span>
          </div>

          <div className="resumo-card atencao-card" data-testid="card-resumo-atencao">
            <div className="resumo-icone">🔍</div>
            <div className="resumo-info">
              <span className="resumo-valor" data-testid="contador-atencao">
                {radarDados.resumo.atencao}
              </span>
              <span className="resumo-label">Referências Ausentes</span>
            </div>
            <span className="resumo-badge badge-atencao">Status: Atenção</span>
          </div>

          <div className="resumo-card total-card" data-testid="card-resumo-total">
            <div className="resumo-icone">📊</div>
            <div className="resumo-info">
              <span className="resumo-valor">{radarDados.itens.length}</span>
              <span className="resumo-label">Itens Mapeados</span>
            </div>
            <span className="resumo-badge badge-info">Auditoria 100%</span>
          </div>
        </section>
      )}

      {/* Filtro por Perspectiva */}
      <nav
        className="radar-filtro-nav"
        role="tablist"
        aria-label="Filtrar contradições por perspectiva"
      >
        <span className="filtro-label">Filtrar por Perspectiva:</span>
        <div className="filtro-botoes">
          {listaPerspectivas.map((p) => {
            const isAtiva = perspectivaAtiva === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isAtiva}
                className={`filtro-btn ${isAtiva ? 'active' : ''}`}
                onClick={() => setPerspectivaAtiva(p.id)}
                data-testid={`filtro-perspectiva-${p.id}`}
              >
                {p.nome}
              </button>
            );
          })}
        </div>
      </nav>

      {carregando && (
        <div className="loading-state" data-testid="radar-loading">
          <div className="spinner"></div>
          <p>Analisando contradições normativas...</p>
        </div>
      )}

      {erro && (
        <div className="alerta alerta-erro" data-testid="radar-erro">
          <strong>Erro ao carregar radar:</strong> {erro}
        </div>
      )}

      {/* Lista de Itens do Radar */}
      {!carregando && radarDados && (
        <div className="radar-lista-container">
          {radarDados.itens.length === 0 ? (
            <div className="radar-vazio-card" data-testid="radar-vazio">
              <div className="vazio-icone">✅</div>
              <h2 className="vazio-titulo">Nenhuma divergência encontrada</h2>
              <p className="vazio-texto">
                Não há divergências nem referências ausentes identificadas para a perspectiva
                selecionada. O acervo auditado está em plena conformidade.
              </p>
            </div>
          ) : (
            <div className="radar-itens-grid" role="list">
              {radarDados.itens.map((item) => {
                const isVersao = item.tipo === 'versao_substituida';
                const isAusente = item.tipo === 'referencia_ausente';

                return (
                  <article
                    key={item.id}
                    className={`radar-item-card ${isVersao ? 'item-divergente' : 'item-atencao'}`}
                    role="listitem"
                    data-testid={`radar-item-${item.id}`}
                  >
                    <header className="item-card-header">
                      <div className="item-badges-row">
                        {item.status === 'divergente' ? (
                          <span className="badge badge-divergente" data-testid="badge-status-divergente">
                            ⚠️ Divergente
                          </span>
                        ) : (
                          <span className="badge badge-atencao" data-testid="badge-status-atencao">
                            🔍 Ponto de Atenção
                          </span>
                        )}

                        <span
                          className={`badge badge-severidade severidade-${item.severidade}`}
                          title={`Severidade ${item.severidade}`}
                        >
                          Severidade {item.severidade.toUpperCase()}
                        </span>

                        {isAusente && (
                          <span
                            className="badge-referencia-ausente"
                            data-testid="selo-referencia-ausente"
                          >
                            citada, não está no acervo
                          </span>
                        )}
                      </div>

                      <div className="item-perspectivas">
                        {item.perspectivas.map((persp) => (
                          <span key={persp} className="perspectiva-chip">
                            {persp}
                          </span>
                        ))}
                      </div>

                      <h2 className="item-titulo">{item.titulo}</h2>
                      <p className="item-explicacao">{item.explicacao}</p>
                    </header>

                    {/* Comparação lado a lado de versões */}
                    {isVersao && item.fontes.length >= 2 && (
                      <div
                        className="lado-a-lado-fontes-grid"
                        data-testid={`lado-a-lado-fontes-${item.id}`}
                        aria-label="Comparação das duas fontes lado a lado"
                      >
                        {/* Coluna 1: Regra Vigente */}
                        <div className="fonte-coluna fonte-vigente-col">
                          <div className="coluna-cabecalho">
                            <span className="coluna-rotulo">✅ Regra Vigente</span>
                            <span className="coluna-sub">Prevalece juridicamente</span>
                          </div>
                          <blockquote className="coluna-trecho">
                            &ldquo;{item.fontes[0].trecho}&rdquo;
                          </blockquote>
                          <div className="coluna-acao">
                            {renderBotaoFonte(
                              item.fontes[0],
                              'Fonte Vigente',
                              `btn-fonte-vigente-${item.id}`
                            )}
                          </div>
                        </div>

                        {/* Coluna 2: Regra Substituída */}
                        <div className="fonte-coluna fonte-substituida-col">
                          <div className="coluna-cabecalho">
                            <span className="coluna-rotulo">⚠️ Regra Anterior (Substituída)</span>
                            <span className="coluna-sub">Revogada / Desatualizada</span>
                          </div>
                          <blockquote className="coluna-trecho">
                            &ldquo;{item.fontes[1].trecho}&rdquo;
                          </blockquote>
                          <div className="coluna-acao">
                            {renderBotaoFonte(
                              item.fontes[1],
                              'Fonte Anterior',
                              `btn-fonte-substituida-${item.id}`
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Referência Ausente */}
                    {isAusente && item.fontes.length > 0 && (
                      <div
                        className="referencia-ausente-detalhe"
                        data-testid="detalhe-referencia-ausente"
                      >
                        <div className="ausente-alerta-box">
                          <div className="ausente-header">
                            <span className="ausente-icone">🚫</span>
                            <div>
                              <strong>Norma Ausente: {item.codigo_ausente || 'NG_012'}</strong>
                              <p className="ausente-desc">
                                Citada como base de regras/alçadas na norma abaixo, mas o documento
                                não foi fornecido no acervo digital.
                              </p>
                            </div>
                          </div>
                          <blockquote className="coluna-trecho">
                            &ldquo;{item.fontes[0].trecho}&rdquo;
                          </blockquote>
                          <div className="coluna-acao">
                            {renderBotaoFonte(
                              item.fontes[0],
                              'Documento Citante',
                              `btn-fonte-citante-${item.id}`
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ação de simular (se aplicável ao cenário de férias) */}
                    {item.id.includes('antecedencia') && onNavegarSimular && (
                      <div className="item-rodape-acoes">
                        <button
                          type="button"
                          className="btn-simular-atalho"
                          onClick={onNavegarSimular}
                          data-testid="btn-simular-radar"
                          title="Simular o impacto da alteração desta regra no módulo E se?"
                        >
                          ⚡ Simular alteração desta regra no &ldquo;E se?&rdquo;
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
