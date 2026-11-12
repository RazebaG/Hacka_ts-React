import React, { useEffect, useState } from 'react';
import { CompararResultado } from '../api/types';
import { fetchComparar } from '../api/client';

interface CompararViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
  codigoInicial?: string;
  deInicial?: string;
  paraInicial?: string;
}

interface ParComparacaoPredefinido {
  codigo: string;
  de: string;
  para: string;
  rotulo: string;
}

const COMPARATIVOS_DISPONIVEIS: ParComparacaoPredefinido[] = [
  {
    codigo: 'NG_111',
    de: '2.0.0',
    para: '3.0.0',
    rotulo: 'NG_111 — Férias (v2.0.0 → v3.0.0 · Cena 3)'
  },
  {
    codigo: 'FM_1111-001',
    de: '1.0.0',
    para: '2.0.0',
    rotulo: 'FM_1111-001 — Formulário de Férias (v1.0.0 → v2.0.0)'
  }
];

export const CompararView: React.FC<CompararViewProps> = ({
  onNavegarDocumento,
  codigoInicial = 'NG_111',
  deInicial = '2.0.0',
  paraInicial = '3.0.0'
}) => {
  const [codigo, setCodigo] = useState<string>(codigoInicial);
  const [de, setDe] = useState<string>(deInicial);
  const [para, setPara] = useState<string>(paraInicial);
  const [resultado, setResultado] = useState<CompararResultado | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const executarComparacao = (c: string, vDe: string, vPara: string) => {
    setCarregando(true);
    setErro(null);

    fetchComparar(c, vDe, vPara)
      .then((res) => {
        setResultado(res);
        setCarregando(false);
      })
      .catch((err) => {
        setErro(err instanceof Error ? err.message : 'Erro ao comparar versões');
        setCarregando(false);
      });
  };

  useEffect(() => {
    executarComparacao(codigo, de, para);
  }, [codigo, de, para]);

  const handleSelecionarPredefinido = (item: ParComparacaoPredefinido) => {
    setCodigo(item.codigo);
    setDe(item.de);
    setPara(item.para);
  };

  return (
    <div className="view-container comparar-view" data-testid="comparar-view">
      <header className="view-header">
        <div className="header-meta">
          <span className="badge-tag">Auditoria de Mudanças</span>
          <h1 className="view-title">O Que Mudou entre Versões</h1>
        </div>
        <p className="view-description">
          Comparativo semântico lado a lado e resumo executivo das alterações entre
          versões vigentes e substituídas. Evita armadilhas de regras revogadas.
        </p>
      </header>

      {/* Barra de Seleção de Comparação */}
      <div className="comparar-toolbar" role="region" aria-label="Seleção de Documentos e Versões">
        <div className="comparar-predefinidos">
          <span className="toolbar-label">Comparações do Pitch / Acervo:</span>
          <div className="botoes-predefinidos">
            {COMPARATIVOS_DISPONIVEIS.map((item, idx) => {
              const isAtivo =
                codigo === item.codigo && de === item.de && para === item.para;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`btn-predefinido ${isAtivo ? 'active' : ''}`}
                  onClick={() => handleSelecionarPredefinido(item)}
                  data-testid={`btn-comparar-${item.codigo}`}
                >
                  {item.rotulo}
                </button>
              );
            })}
          </div>
        </div>

        <div className="comparar-inputs-grid">
          <div className="campo-form">
            <label htmlFor="codigo-comparar">Documento:</label>
            <input
              id="codigo-comparar"
              type="text"
              className="input-base"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.trim())}
              placeholder="Ex.: NG_111"
              data-testid="input-codigo-comparar"
            />
          </div>

          <div className="campo-form">
            <label htmlFor="de-comparar">Versão Anterior (De):</label>
            <input
              id="de-comparar"
              type="text"
              className="input-base"
              value={de}
              onChange={(e) => setDe(e.target.value.trim())}
              placeholder="Ex.: 2.0.0"
              data-testid="input-de-comparar"
            />
          </div>

          <div className="campo-form">
            <label htmlFor="para-comparar">Versão Vigente (Para):</label>
            <input
              id="para-comparar"
              type="text"
              className="input-base"
              value={para}
              onChange={(e) => setPara(e.target.value.trim())}
              placeholder="Ex.: 3.0.0"
              data-testid="input-para-comparar"
            />
          </div>

          <div className="campo-form botao-aplicar">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => executarComparacao(codigo, de, para)}
              data-testid="btn-executar-comparacao"
            >
              Comparar Versões
            </button>
          </div>
        </div>
      </div>

      {carregando && (
        <div className="loading-state" data-testid="comparar-loading">
          <div className="spinner"></div>
          <p>Processando diferenças textuais entre as versões...</p>
        </div>
      )}

      {erro && (
        <div className="alerta alerta-erro" data-testid="comparar-erro">
          <strong>Não foi possível comparar as versões:</strong> {erro}
        </div>
      )}

      {!carregando && resultado && (
        <div className="comparar-conteudo" data-testid="comparar-conteudo">
          {/* RESUMO EXECUTIVO DAS ALTERAÇÕES */}
          <section className="painel-secao resumo-mudancas-box">
            <div className="secao-titulo-wrap">
              <h2 className="secao-titulo">
                Resumo Executivo das Alterações ({resultado.codigo})
              </h2>
              <span className="secao-subtitulo">
                Destaque das transições de regras de <strong>v{resultado.de}</strong> para{' '}
                <strong>v{resultado.para}</strong>
              </span>
            </div>

            <ul className="resumo-lista" data-testid="lista-resumo-mudancas">
              {resultado.resumo.map((ponto, i) => (
                <li key={i} className="resumo-item">
                  <span className="resumo-bullet">✓</span>
                  <span className="resumo-texto">{ponto}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* COMPARAÇÃO SEÇÃO A SEÇÃO LADO A LADO */}
          <section className="painel-secao" aria-labelledby="diff-secoes-titulo">
            <div className="secao-titulo-wrap">
              <h2 id="diff-secoes-titulo" className="secao-titulo">
                Detalhamento Lado a Lado ({resultado.mudancas.length} seções impactadas)
              </h2>
              <span className="secao-subtitulo">
                Redação na versão substituída vs nova redação na versão vigente
              </span>
            </div>

            <div className="diff-secoes-grid">
              {resultado.mudancas.map((mudanca, idx) => {
                let badgeClass = 'badge-modificado';
                let badgeTexto = 'Alterado';

                if (mudanca.tipo === 'incluido') {
                  badgeClass = 'badge-incluido';
                  badgeTexto = 'Novo / Incluído';
                } else if (mudanca.tipo === 'removido') {
                  badgeClass = 'badge-removido';
                  badgeTexto = 'Revogado / Removido';
                }

                return (
                  <article
                    key={idx}
                    className="diff-card"
                    data-testid={`diff-card-${idx}`}
                  >
                    <header className="diff-card-header">
                      <div className="diff-secao-info">
                        <span className="diff-secao-rotulo">
                          Seção {mudanca.secao}
                        </span>
                        <span className={`badge-diff ${badgeClass}`}>
                          {badgeTexto}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          onNavegarDocumento(resultado.codigo, resultado.para, mudanca.secao)
                        }
                        title={`Abrir Seção ${mudanca.secao} no documento ${resultado.codigo}`}
                        data-testid={`btn-abrir-secao-${mudanca.secao}`}
                      >
                        Abrir Seção no Leitor &rarr;
                      </button>
                    </header>

                    <div className="diff-lado-a-lado">
                      {/* Coluna Versão Anterior */}
                      <div className="diff-coluna diff-coluna-antes">
                        <div className="diff-coluna-header">
                          <span className="coluna-versao-tag substituida">
                            Versão Anterior (v{resultado.de})
                          </span>
                        </div>
                        <div className="diff-texto-corpo diff-texto-antes">
                          {mudanca.antes ? (
                            <p>{mudanca.antes}</p>
                          ) : (
                            <p className="texto-inexistente">
                              [Não constava nesta versão]
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Coluna Versão Vigente */}
                      <div className="diff-coluna diff-coluna-depois">
                        <div className="diff-coluna-header">
                          <span className="coluna-versao-tag vigente">
                            Versão Vigente (v{resultado.para})
                          </span>
                        </div>
                        <div className="diff-texto-corpo diff-texto-depois">
                          {mudanca.depois ? (
                            <p>{mudanca.depois}</p>
                          ) : (
                            <p className="texto-inexistente">
                              [Removido da versão vigente]
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
