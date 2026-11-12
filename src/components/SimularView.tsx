import React, { useEffect, useState } from 'react';
import { FonteCita, RegraItem, SimularResponse } from '../api/types';
import { fetchRegras, postSimular, isMockMode } from '../api/client';

interface SimularViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
  onNavegarRadar?: () => void;
}

export const SimularView: React.FC<SimularViewProps> = ({
  onNavegarDocumento,
  onNavegarRadar
}) => {
  const [regras, setRegras] = useState<RegraItem[]>([]);
  const [regraSelecionada, setRegraSelecionada] = useState<string>('ferias_antecedencia_dias');
  const [novoValor, setNovoValor] = useState<number>(30);
  const [resultado, setResultado] = useState<SimularResponse | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [simulando, setSimulando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  const mockAtivo = isMockMode();

  // Carregar regras disponíveis
  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    fetchRegras()
      .then((res) => {
        if (ativo) {
          setRegras(res);
          if (res.length > 0 && !res.some((r) => r.id === regraSelecionada)) {
            setRegraSelecionada(res[0].id);
          }
          setCarregando(false);
        }
      })
      .catch((err) => {
        if (ativo) {
          setErro(err instanceof Error ? err.message : 'Erro ao listar regras');
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  // Executa simulação
  const executarSimulacao = (regraId: string, valor: number) => {
    setSimulando(true);
    setErro(null);

    postSimular({
      regra: regraId,
      novo_valor: valor,
      cenario: 'Exemplo NG_111 Anexo C / PX_1111-001: férias a partir de 05/05/2027'
    })
      .then((res) => {
        setResultado(res);
        setSimulando(false);
      })
      .catch((err) => {
        setErro(err instanceof Error ? err.message : 'Erro ao simular regra');
        setSimulando(false);
      });
  };

  // Simular inicialmente com novoValor (30) quando a regra estiver carregada
  useEffect(() => {
    if (regras.length > 0) {
      executarSimulacao(regraSelecionada, novoValor);
    }
  }, [regraSelecionada, regras.length]);

  const regraAtual = regras.find((r) => r.id === regraSelecionada);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setNovoValor(val);
    executarSimulacao(regraSelecionada, val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!Number.isNaN(val)) {
      setNovoValor(val);
      if (val >= 1 && val <= 90) {
        executarSimulacao(regraSelecionada, val);
      }
    }
  };

  const aplicarAtalho = (valor: number) => {
    setNovoValor(valor);
    executarSimulacao(regraSelecionada, valor);
  };

  const renderBotaoFonte = (fonte: FonteCita, rotuloExtra?: string, testId?: string) => {
    return (
      <button
        type="button"
        className="btn-fonte-simular"
        onClick={() => onNavegarDocumento(fonte.codigo, fonte.versao, fonte.secao)}
        title={`Abrir ${fonte.codigo} v${fonte.versao} na seção ${fonte.secao}`}
        data-testid={testId || `btn-fonte-${fonte.codigo}-${fonte.secao}`}
      >
        <span className="fonte-icone">📄</span>
        <span className="fonte-texto">
          {rotuloExtra && <strong>{rotuloExtra}: </strong>}
          {fonte.codigo} v{fonte.versao} · {fonte.secao}
        </span>
      </button>
    );
  };

  const formatarDataIso = (iso: string) => {
    const partes = iso.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return iso;
  };

  return (
    <div className="view-container simular-view" data-testid="simular-view">
      <header className="view-header">
        <div className="header-meta">
          <div className="meta-tags-row">
            <span className="badge-tag">Simulador Hipotético</span>
            {mockAtivo && (
              <span className="badge-tag badge-fixture" data-testid="selo-dados-fixture">
                Dados de fixture
              </span>
            )}
          </div>
          <h1 className="view-title">E se? — Simulação de Alteração de Regra</h1>
        </div>
        <p className="view-description">
          Avalie previamente o impacto temporal, conflitos normativos internos e os documentos
          vigentes que precisariam ser revisados ao alterar uma regra corporativa.
        </p>
      </header>

      {/* AVISO FIXO: sempre visível */}
      <aside
        className="aviso-hipotetico-banner"
        role="note"
        aria-label="Aviso legal sobre simulação hipotética"
        data-testid="aviso-hipotetico-fixo"
      >
        <span className="aviso-icone">ℹ️</span>
        <div className="aviso-conteudo">
          <strong>Simulação hipotética: não altera os documentos.</strong>
          <span className="aviso-detalhe">
            Nenhuma diretriz ou prazo é modificado no acervo sem publicação formal e deliberação
            competente.
          </span>
        </div>
      </aside>

      {carregando && (
        <div className="loading-state" data-testid="simular-loading">
          <div className="spinner"></div>
          <p>Carregando regras corporativas...</p>
        </div>
      )}

      {erro && (
        <div className="alerta alerta-erro" data-testid="simular-erro">
          <strong>Erro:</strong> {erro}
        </div>
      )}

      {!carregando && regraAtual && (
        <div className="simulador-painel-grid">
          {/* PAINEL DE CONTROLE DA REGRA */}
          <section
            className="card-painel controle-regra-card"
            aria-labelledby="titulo-controle-regra"
          >
            <h2 id="titulo-controle-regra" className="card-titulo">
              Regra Selecionada
            </h2>

            <div className="regra-meta-box">
              <span className="regra-rotulo-nome">{regraAtual.rotulo}</span>
              <div className="regra-valor-atual-row">
                <span className="rotulo-muted">Valor Vigente no Acervo:</span>
                <span className="valor-destaque-badge" data-testid="valor-regra-atual">
                  {regraAtual.valor} {regraAtual.unidade}
                </span>
              </div>
              <div className="regra-fonte-row">
                <span className="rotulo-muted">Fonte Vigente:</span>
                {renderBotaoFonte(
                  regraAtual.fonte,
                  'Vigente',
                  `btn-fonte-regra-${regraAtual.fonte.codigo}`
                )}
              </div>
            </div>

            {/* CONTROLES DO NOVO VALOR (SLIDER + INPUT) */}
            <div className="controle-ajuste-box">
              <label htmlFor="input-slider-valor" className="campo-label">
                Novo valor a simular (em dias):
              </label>

              <div className="slider-input-grupo">
                <input
                  id="input-slider-valor"
                  type="range"
                  min={1}
                  max={90}
                  step={1}
                  value={novoValor}
                  onChange={handleSliderChange}
                  className="slider-range-input"
                  aria-label="Slider para ajustar novo valor da antecedência em dias"
                  data-testid="slider-novo-valor"
                />

                <div className="input-number-wrap">
                  <input
                    id="input-number-valor"
                    type="number"
                    min={1}
                    max={90}
                    value={novoValor}
                    onChange={handleInputChange}
                    className="input-numero"
                    aria-label="Digitar novo valor da antecedência em dias"
                    data-testid="input-novo-valor"
                  />
                  <span className="unidade-texto">dias</span>
                </div>
              </div>

              {/* Atalhos Rápidos */}
              <div className="atalhos-simulacao-row" role="group" aria-label="Atalhos de Simulação">
                <span className="atalhos-label">Cenários rápidos:</span>
                <button
                  type="button"
                  className={`btn-atalho-cenario ${novoValor === 30 ? 'active' : ''}`}
                  onClick={() => aplicarAtalho(30)}
                  data-testid="btn-cenario-30"
                >
                  ⚡ Cenário 1: 30 dias (D-30)
                </button>
                <button
                  type="button"
                  className={`btn-atalho-cenario ${novoValor === 45 ? 'active' : ''}`}
                  onClick={() => aplicarAtalho(45)}
                  data-testid="btn-cenario-45"
                >
                  ↩️ Restaurar 45 dias (Vigente)
                </button>
                <button
                  type="button"
                  className={`btn-atalho-cenario ${novoValor === 20 ? 'active' : ''}`}
                  onClick={() => aplicarAtalho(20)}
                  data-testid="btn-cenario-20"
                >
                  ⚠️ 20 dias (Prazo Limite)
                </button>
              </div>

              <p className="exemplo-cenario-nota">
                <strong>Cenário de Referência:</strong> Exemplo oficial do PX_1111-001 / NG_111
                (início de gozo de férias em <strong>05/05/2027</strong>).
              </p>
            </div>
          </section>

          {/* PAINEL DE RESULTADO DA SIMULAÇÃO */}
          {simulando && (
            <div className="loading-state" data-testid="simulando-loading">
              <div className="spinner"></div>
              <p>Calculando impacto determinístico da alteração...</p>
            </div>
          )}

          {!simulando && resultado && (
            <div className="resultado-simulacao-wrap" data-testid="resultado-simulacao">
              {/* LINHA DO TEMPO ANTES / DEPOIS */}
              <section
                className="card-painel timeline-card"
                aria-labelledby="titulo-timeline-simular"
              >
                <div className="secao-titulo-wrap">
                  <h2 id="titulo-timeline-simular" className="card-titulo">
                    Linha do Tempo: Comparativo Antes × Depois
                  </h2>
                  <span className="secao-subtitulo">
                    Destaque visual automático nos marcos cuja data é afetada pelo novo prazo
                  </span>
                </div>

                <div
                  className="timeline-simulacao-lista"
                  role="list"
                  data-testid="timeline-simulacao"
                >
                  {resultado.linha_do_tempo.map((marco, i) => {
                    return (
                      <div
                        key={i}
                        className={`timeline-marco-item ${marco.muda ? 'marco-muda' : 'marco-estavel'}`}
                        role="listitem"
                        data-testid={`timeline-marco-${i}`}
                      >
                        <div className="marco-cabecalho">
                          <span className="marco-nome">{marco.marco}</span>
                          {marco.muda ? (
                            <span
                              className="badge-marco-mudou"
                              data-testid="badge-marco-muda-true"
                            >
                              ⚠️ Data Alterada (muda=true)
                            </span>
                          ) : (
                            <span className="badge-marco-estavel">Data Inalterada</span>
                          )}
                        </div>

                        <div className="marco-datas-grid">
                          <div className="data-coluna data-antes">
                            <span className="data-legenda">Antes (Vigente 45d):</span>
                            <span className="data-valor">{formatarDataIso(marco.antes)}</span>
                          </div>

                          <div className="data-seta" aria-hidden="true">
                            ➔
                          </div>

                          <div className={`data-coluna data-depois ${marco.muda ? 'destaque-mudanca' : ''}`}>
                            <span className="data-legenda">Depois (Simulado {resultado.novo_valor}d):</span>
                            <span className="data-valor-depois" data-testid={`data-depois-${i}`}>
                              {formatarDataIso(marco.depois)}
                            </span>
                          </div>
                        </div>

                        <div className="marco-fonte-row">
                          {renderBotaoFonte(marco.fonte, 'Marco Fonte', `btn-fonte-marco-${i}`)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* IMPACTOS: CONFLITOS INTERNOS E DOCUMENTOS A REVISAR */}
              <section className="card-painel impactos-card" aria-labelledby="titulo-impactos">
                <div className="secao-titulo-wrap">
                  <h2 id="titulo-impactos" className="card-titulo">
                    Impactos Normativos e Conflitos Internos
                  </h2>
                  <span className="secao-subtitulo">
                    Incompatibilidades geradas com prazos vigentes e normas que exigirão revisão formal
                  </span>
                </div>

                {resultado.impactos.length === 0 ? (
                  <div className="alerta alerta-sucesso" data-testid="sem-impactos">
                    ✅ Nenhum conflito gerado. A regra mantém compatibilidade integral com as normas
                    vigentes.
                  </div>
                ) : (
                  <div className="impactos-grid">
                    {/* CONFLITOS INTERNOS */}
                    {resultado.impactos
                      .filter((imp) => imp.tipo === 'conflito_interno')
                      .map((imp, idx) => (
                        <div
                          key={`conflito-${idx}`}
                          className="impacto-box conflito-box"
                          data-testid="impacto-conflito-interno"
                        >
                          <div className="impacto-header">
                            <span className="impacto-icone">🚨</span>
                            <div>
                              <strong className="impacto-tipo-titulo">
                                Conflito Normativo Interno
                              </strong>
                              <p className="impacto-descricao" data-testid="conflito-descricao">
                                {imp.descricao}
                              </p>
                            </div>
                          </div>
                          <div className="impacto-fontes">
                            <span className="rotulo-muted">Norma conflitada:</span>
                            {imp.fontes.map((f, fIdx) => (
                              <React.Fragment key={fIdx}>
                                {renderBotaoFonte(f, undefined, `btn-fonte-conflito-${f.codigo}`)}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}

                    {/* DOCUMENTOS QUE EXIGIRÃO REVISÃO */}
                    {resultado.impactos.some((imp) => imp.tipo === 'revisar_documento') && (
                      <div
                        className="impacto-box revisar-box"
                        data-testid="impacto-revisar-documentos"
                      >
                        <div className="impacto-header">
                          <span className="impacto-icone">📝</span>
                          <div>
                            <strong className="impacto-tipo-titulo">
                              Documentos Vigentes que Exigirão Revisão Formal
                            </strong>
                            <p className="impacto-descricao">
                              Os seguintes documentos e seções do acervo citam a antecedência mínima
                              de 45 dias e deverão ser reeditados e publicados:
                            </p>
                          </div>
                        </div>

                        <ul className="documentos-revisar-lista" role="list">
                          {resultado.impactos
                            .filter((imp) => imp.tipo === 'revisar_documento')
                            .map((imp, idx) => (
                              <li
                                key={idx}
                                className="doc-revisar-item"
                                data-testid={`item-revisar-${imp.codigo}`}
                              >
                                <div className="doc-info">
                                  <strong>
                                    {imp.codigo} v{imp.versao}
                                  </strong>
                                  <span className="doc-desc">{imp.descricao}</span>
                                </div>
                                <div className="doc-acao">
                                  {imp.fontes.map((f, fIdx) => (
                                    <React.Fragment key={fIdx}>
                                      {renderBotaoFonte(
                                        f,
                                        undefined,
                                        `btn-fonte-revisar-${f.codigo}-${f.secao}`
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* RESUMO EXECUTIVO DA SIMULAÇÃO */}
              <section className="card-painel resumo-card-painel" aria-labelledby="titulo-resumo-simulacao">
                <h2 id="titulo-resumo-simulacao" className="card-titulo">
                  Resumo da Simulação
                </h2>
                <ul className="resumo-pontos-lista">
                  {resultado.resumo.map((ponto, idx) => (
                    <li key={idx} className="resumo-ponto-item" data-testid={`resumo-ponto-${idx}`}>
                      <span className="ponto-bullet">•</span>
                      <span>{ponto}</span>
                    </li>
                  ))}
                </ul>

                {onNavegarRadar && (
                  <div className="simular-rodape-acoes">
                    <button
                      type="button"
                      className="btn-voltar-radar"
                      onClick={onNavegarRadar}
                      data-testid="btn-voltar-radar"
                    >
                      🔍 Consultar Radar de Contradições
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
