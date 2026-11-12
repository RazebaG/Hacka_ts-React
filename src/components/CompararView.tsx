import React, { useEffect, useState } from 'react';
import { CompararResultado } from '../api/types';
import { fetchComparar } from '../api/client';
import { Icon } from '../ui/Icon';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { Aviso, FonteChip } from '../ui/componentes';

/** Versões anteriores que não estão no acervo, com as diferenças declaradas pelo próprio documento (C6). */
const ANTERIOR_AUSENTE: Record<string, { de: string; para: string; secao: string; itens: string[] }> = {
  RG_1100: {
    de: '1.0.0',
    para: '2.0.0',
    secao: 'Anexo K',
    itens: [
      'Ideias por proponente: até 3 na edição anterior, até 2 na edição 2027.',
      'Premiação: por colocação (R$ 8.000,00, R$ 5.000,00 e R$ 3.000,00) e por arena (R$ 2.000,00); antes, R$ 5.000,00 por ideia.',
      'Gamificação com pontos e ranking: não havia na edição anterior.'
    ]
  }
};

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
    rotulo: 'Férias (NG_111): versão 2.0.0 e versão 3.0.0'
  },
  {
    codigo: 'FM_1111-001',
    de: '1.0.0',
    para: '2.0.0',
    rotulo: 'Formulário de Férias (FM_1111-001): versão 1.0.0 e versão 2.0.0'
  },
  {
    codigo: 'RG_1100',
    de: '1.0.0',
    para: '2.0.0',
    rotulo: 'Ideias em Campo (RG_1100): a versão antiga não está no arquivo'
  }
];

export const CompararView: React.FC<CompararViewProps> = ({
  onNavegarDocumento,
  codigoInicial = 'NG_111',
  deInicial,
  paraInicial
}) => {
  const predef = COMPARATIVOS_DISPONIVEIS.find((c) => c.codigo === codigoInicial);
  const [codigo, setCodigo] = useState<string>(codigoInicial);
  const [de, setDe] = useState<string>(deInicial ?? predef?.de ?? '2.0.0');
  const [para, setPara] = useState<string>(paraInicial ?? predef?.para ?? '3.0.0');
  const ausente = ANTERIOR_AUSENTE[codigo];
  const versoesNoAcervo = MOCK_DOCUMENTOS.filter((d) => d.codigo === codigo);
  const unicaVersao = !ausente && versoesNoAcervo.length === 1;
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
    if (ausente || unicaVersao) {
      setCarregando(false);
      setResultado(null);
      return;
    }
    executarComparacao(codigo, de, para);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <span className="badge-tag">Comparar versões</span>
          <h1 className="view-title">O que mudou de uma versão para outra</h1>
        </div>
        <p className="view-description">
          Escolha um documento. Mostramos o texto antigo e o texto novo de cada parte que mudou.
        </p>
      </header>

      {/* Barra de Seleção de Comparação */}
      <div className="comparar-toolbar" role="region" aria-label="Seleção de Documentos e Versões">
        <div className="comparar-predefinidos">
          <span className="toolbar-label">Documentos com mais de uma versão:</span>
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
            <label htmlFor="de-comparar">Versão antiga:</label>
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
            <label htmlFor="para-comparar">Versão nova:</label>
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
              Comparar
            </button>
          </div>
        </div>
      </div>

      {ausente && (
        <section className="painel-secao" data-testid="comparar-anterior-ausente">
          <Aviso>
            A versão {ausente.de} não está no acervo. Diferenças declaradas no {ausente.secao}:
          </Aviso>
          <ul className="lista-impactos">
            {ausente.itens.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <FonteChip fonte={{ codigo, versao: ausente.para, secao: ausente.secao }} />
        </section>
      )}

      {unicaVersao && (
        <section className="painel-secao" data-testid="comparar-unica-versao">
          <p>Este documento tem só uma versão no acervo.</p>
          <FonteChip fonte={{ codigo, versao: versoesNoAcervo[0].versao, secao: versoesNoAcervo[0].secoes[0]?.id ?? '' }} />
        </section>
      )}

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
                Resumo das mudanças ({resultado.codigo})
              </h2>
              <span className="secao-subtitulo">
                Destaque das transições de regras de <strong>v{resultado.de}</strong> para{' '}
                <strong>v{resultado.para}</strong>
              </span>
            </div>

            <ul className="resumo-lista" data-testid="lista-resumo-mudancas">
              {resultado.resumo.map((ponto, i) => (
                <li key={i} className="resumo-item">
                  <span className="resumo-bullet"><Icon nome="check" tamanho={16} /></span>
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
                  badgeTexto = 'Novo';
                } else if (mudanca.tipo === 'removido') {
                  badgeClass = 'badge-removido';
                  badgeTexto = 'Retirado';
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
                        Ler no documento
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
