import React, { useState, useEffect } from 'react';
import { CodigoInfo } from '../api/types';
import { fetchCodigo, ApiEndpointError, isMockMode, getApiBaseUrl } from '../api/client';
import { getCodigoInfoMock } from '../mocks/codigos';

interface DecodificadorViewProps {
  onNavegarDocumento?: (codigo: string, versao?: string) => void;
  codigoInicial?: string;
}

interface ExemploCodigo {
  codigo: string;
  rotulo: string;
  descricao: string;
}

const EXEMPLOS_CODIGOS: ExemploCodigo[] = [
  {
    codigo: 'PX_1111-001',
    rotulo: 'PX_1111-001 (Procedimento Férias)',
    descricao: 'Procedimento vinculado à NG_111 (Cena 1 do Pitch)'
  },
  {
    codigo: 'NG_111',
    rotulo: 'NG_111 (Norma Geral Férias)',
    descricao: 'Norma Geral raiz que dá origem à série de férias'
  },
  {
    codigo: 'PX_1130-001',
    rotulo: 'PX_1130-001 (Procedimento Governança)',
    descricao: 'Procedimento subordinado à NG_1130'
  },
  {
    codigo: 'RG_1100',
    rotulo: 'RG_1100 (Regulamento Inovação)',
    descricao: 'Regulamento do Programa Ideias em Campo'
  },
  {
    codigo: 'CTR_2026-012',
    rotulo: 'CTR_2026-012 (Contrato Coworking)',
    descricao: 'Contrato de locação comercial (Cena 2 do Pitch)'
  },
  {
    codigo: 'NT_2026-021',
    rotulo: 'NT_2026-021 (Nota Técnica)',
    descricao: 'Nota técnica de apoio metodológico'
  },
  {
    codigo: 'CT_Dirtec — 2026/003',
    rotulo: 'CT_Dirtec (Carta transitória)',
    descricao: 'Carta com vigência transitória (≤ 150 dias)'
  },
  {
    codigo: 'NG_012',
    rotulo: 'NG_012 (Citada, ausente)',
    descricao: 'Norma citada na NT_2026-018 ausente do acervo (Radar)'
  }
];

export const DecodificadorView: React.FC<DecodificadorViewProps> = ({
  onNavegarDocumento,
  codigoInicial = 'PX_1111-001'
}) => {
  const [codigoInput, setCodigoInput] = useState<string>(codigoInicial);
  const [resultado, setResultado] = useState<CodigoInfo | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [endpointAusente, setEndpointAusente] = useState<boolean>(false);
  const [modoFallbackLocal, setModoFallbackLocal] = useState<boolean>(false);

  const mockAtivo = isMockMode();
  const apiBase = getApiBaseUrl();

  const executarDecodificacao = async (cod: string) => {
    const limpo = cod.trim();
    if (!limpo) return;

    setCarregando(true);
    setErro(null);
    setEndpointAusente(false);
    setModoFallbackLocal(false);

    try {
      const info = await fetchCodigo(limpo);
      setResultado(info);
    } catch (e: unknown) {
      if (e instanceof ApiEndpointError && e.isEndpointAusente) {
        // O backend real não possui o endpoint GET /api/codigo/{codigo} (aguardando issue BE #3)
        setEndpointAusente(true);
        // Aplica decodificação de contingência para não deixar a tela quebrada nem bloquear o usuário
        const mockFallback = getCodigoInfoMock(limpo);
        setResultado(mockFallback);
        setModoFallbackLocal(true);
      } else {
        setErro(e instanceof Error ? e.message : 'Falha ao decodificar código');
        setResultado(null);
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (codigoInicial) {
      executarDecodificacao(codigoInicial);
    }
  }, [codigoInicial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executarDecodificacao(codigoInput);
  };

  const handleSelecionarExemplo = (cod: string) => {
    setCodigoInput(cod);
    executarDecodificacao(cod);
  };

  return (
    <div className="view-container decodificador-view" data-testid="decodificador-view">
      <header className="view-header">
        <div className="header-meta">
          <span className="badge-tag">Taxonomia & Estrutura</span>
          <h1 className="view-title">Decodificador de Código de Documento</h1>
        </div>
        <p className="view-description">
          Consulte a taxonomia do acervo corporativo (CATÁLOGO §2, §3 e §5). Identifica o tipo
          documental, subordinação hierárquica, série temática e regras regulamentares de vigência.
        </p>
      </header>

      {/* Alerta explícito de indisponibilidade/ausência do endpoint no backend */}
      {endpointAusente && (
        <div
          className="alerta alerta-aviso"
          role="status"
          data-testid="alerta-endpoint-ausente"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <strong>Endpoint <code>GET /api/codigo/&#123;codigo&#125;</code> ausente no backend</strong>
              <p style={{ margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
                O backend em <code>{apiBase}</code> ainda não implementou esta rota (aguardando aprovação
                da issue <strong>BE #3</strong>).
              </p>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.88rem', color: 'var(--color-gray-700)' }}>
                ✓ <strong>O restante da aplicação continua operando normalmente</strong>.
                Exibindo abaixo a análise gerada pelo decodificador sintético local com base nas regras do CATÁLOGO v1.0.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exemplos e atalhos rápidos da demo */}
      <div className="exemplos-banner" role="region" aria-label="Casos de Teste do Decodificador">
        <span className="exemplos-title">Casos de Teste do Acervo (Pitch e BE #3):</span>
        <div className="exemplos-buttons">
          {EXEMPLOS_CODIGOS.map((ex) => (
            <button
              key={ex.codigo}
              type="button"
              className={`btn-exemplo ${codigoInput === ex.codigo ? 'btn-exemplo-ativo' : ''}`}
              onClick={() => handleSelecionarExemplo(ex.codigo)}
              title={ex.descricao}
              data-testid={`btn-exemplo-${ex.codigo}`}
            >
              {ex.rotulo}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário de Busca e Decodificação */}
      <form onSubmit={handleSubmit} className="form-decodificar" role="search">
        <div className="form-row-decodificar">
          <div className="input-group-decodificar">
            <label htmlFor="input-codigo-doc">Código do Documento:</label>
            <input
              id="input-codigo-doc"
              data-testid="input-codigo"
              type="text"
              className="input-base"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value)}
              placeholder="Ex.: PX_1111-001, NG_111, RG_1100..."
              required
            />
          </div>
          <div className="acoes-decodificar">
            <button
              type="submit"
              className="btn btn-primary"
              data-testid="btn-decodificar"
              disabled={carregando || !codigoInput.trim()}
            >
              {carregando ? 'Decodificando...' : 'Decodificar Código'}
            </button>
            {codigoInput && (
              <button
                type="button"
                className="btn btn-secondary"
                data-testid="btn-limpar-codigo"
                onClick={() => {
                  setCodigoInput('');
                  setResultado(null);
                  setErro(null);
                  setEndpointAusente(false);
                }}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Mensagem de Erro quando código não é encontrado */}
      {erro && (
        <div className="alerta alerta-erro" role="alert" data-testid="msg-erro">
          <strong>Erro na consulta:</strong> {erro}
        </div>
      )}

      {/* Loading State */}
      {carregando && (
        <div className="loading-state" data-testid="loading-decodificador">
          <div className="spinner"></div>
          <p>Consultando estrutura taxonômica do documento...</p>
        </div>
      )}

      {/* Card do Resultado da Decodificação */}
      {resultado && !carregando && (
        <div className="resultado-decodificacao" data-testid="card-decodificacao">
          <div className="decodificacao-card-header">
            <div>
              <div className="decod-codigo-linha">
                <h2 className="decod-codigo-titulo" data-testid="decod-codigo">
                  {resultado.codigo}
                </h2>
                {modoFallbackLocal && (
                  <span
                    className="badge badge-fallback"
                    data-testid="badge-fallback-mock"
                    title="Dados gerados pelas regras taxonômicas locais enquanto a issue BE #3 está pendente"
                  >
                    Mock de Contingência
                  </span>
                )}
                {!mockAtivo && !modoFallbackLocal && (
                  <span className="badge badge-api" data-testid="badge-api-real">
                    API Real Conectada
                  </span>
                )}
              </div>
              <p className="decod-tipo-subtitulo">
                <strong>{resultado.tipo}</strong> — {resultado.tipo_nome}
              </p>
            </div>

            <div className="decod-status-acervo" data-testid="decod-acervo">
              {resultado.existe_no_acervo ? (
                <span className="badge badge-vigente" title="Documento arquivado no acervo corporativo">
                  ✓ Presente no Acervo
                </span>
              ) : (
                <span
                  className="badge badge-substituido"
                  title="Documento referenciado mas ausente do acervo oficial"
                >
                  ⚠ Citada, Não Arquivada
                </span>
              )}
            </div>
          </div>

          <div className="decod-grid">
            <div className="decod-item">
              <span className="decod-label">Tipo Documental:</span>
              <span className="decod-valor" data-testid="decod-tipo">
                <strong>{resultado.tipo}</strong> ({resultado.tipo_nome})
              </span>
            </div>

            <div className="decod-item">
              <span className="decod-label">Subordinação (Vinculado a):</span>
              <div className="decod-valor" data-testid="decod-vinculado">
                {resultado.vinculado_a ? (
                  <div className="vinculo-container">
                    <span className="tag-vinculado">{resultado.vinculado_a}</span>
                    {onNavegarDocumento && (
                      <button
                        type="button"
                        className="btn-link-vinculado"
                        data-testid="btn-navegar-vinculado"
                        onClick={() => onNavegarDocumento(resultado.vinculado_a!)}
                        title={`Abrir ${resultado.vinculado_a} no Leitor`}
                      >
                        Ver Documento Pai &rarr;
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="texto-neutro">— (Norma Geral / Documento Raiz)</span>
                )}
              </div>
            </div>

            <div className="decod-item">
              <span className="decod-label">Série Temática (CATÁLOGO §5):</span>
              <span className="decod-valor" data-testid="decod-serie">
                Série <strong>{resultado.serie}</strong> — {resultado.serie_nome}
              </span>
            </div>

            <div className="decod-item">
              <span className="decod-label">Regra de Vigência:</span>
              <span className="decod-valor" data-testid="decod-vigencia">
                {resultado.vigencia_regra}
              </span>
            </div>
          </div>

          {resultado.observacao && (
            <div className="decod-observacao-box">
              <span className="decod-label">Análise Taxonômica & Contexto:</span>
              <p className="decod-observacao-texto" data-testid="decod-observacao">
                {resultado.observacao}
              </p>
            </div>
          )}

          {/* Ação rápida de leitura se presente no acervo */}
          {resultado.existe_no_acervo && onNavegarDocumento && (
            <div className="decod-acoes-finais">
              <button
                type="button"
                className="btn btn-outline"
                data-testid="btn-abrir-documento"
                onClick={() => onNavegarDocumento(resultado.codigo)}
              >
                Abrir {resultado.codigo} no Leitor de Normas &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
