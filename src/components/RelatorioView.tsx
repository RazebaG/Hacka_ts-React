import React, { useEffect, useState } from 'react';
import { FonteCita, RelatorioExecutivo } from '../api/types';
import { fetchRelatorio } from '../api/client';
import { Icon } from '../ui/Icon';
import { RelatorioSelecao } from './RelatorioSelecao';
import { CabecalhoTela } from '../ui/componentes';
import { navegar, url } from '../app/rotas';

interface RelatorioViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
  perspectivaInicial?: string;
  codigoDocumentoInicial?: string;
  /** Rota /relatorio?selecao=1: relatório só com os itens marcados (RF41). */
  modoSelecao?: boolean;
}

export const RelatorioView: React.FC<RelatorioViewProps> = ({ modoSelecao, ...props }) =>
  modoSelecao ? <RelatorioSelecao /> : <RelatorioPorFonte {...props} />;

const RelatorioPorFonte: React.FC<Omit<RelatorioViewProps, 'modoSelecao'>> = ({
  onNavegarDocumento,
  perspectivaInicial = 'juridico',
  codigoDocumentoInicial
}) => {
  const [tipoSelecao, setTipoSelecao] = useState<'perspectiva' | 'documento'>(
    codigoDocumentoInicial ? 'documento' : 'perspectiva'
  );
  const [perspectiva, setPerspectiva] = useState<string>(perspectivaInicial);
  const [codigoDoc, setCodigoDoc] = useState<string>(codigoDocumentoInicial || 'CTR_2026-012');
  const [relatorio, setRelatorio] = useState<RelatorioExecutivo | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [parecer, setParecer] = useState('');

  const carregarRelatorio = (params: { perspectiva?: string; codigo?: string }) => {
    setCarregando(true);
    setErro(null);

    fetchRelatorio(params)
      .then((res) => {
        setRelatorio(res);
        setCarregando(false);
      })
      .catch((err) => {
        setErro(err instanceof Error ? err.message : 'Erro ao gerar relatório');
        setCarregando(false);
      });
  };

  useEffect(() => {
    if (tipoSelecao === 'perspectiva') {
      carregarRelatorio({ perspectiva });
    } else {
      carregarRelatorio({ codigo: codigoDoc });
    }
  }, [tipoSelecao, perspectiva, codigoDoc]);

  const handleImprimir = () => {
    window.print();
  };

  const renderFonteBotao = (fonte: FonteCita) => (
    <button
      type="button"
      className="fonte-link"
      onClick={() => onNavegarDocumento(fonte.codigo, fonte.versao, fonte.secao)}
      title={`Abrir ${fonte.codigo} v${fonte.versao} na seção ${fonte.secao}`}
      data-testid={`btn-fonte-relatorio-${fonte.codigo}-${fonte.secao}`}
    >
      <Icon nome="documento" tamanho={14} />
      {fonte.codigo} · v{fonte.versao} · {fonte.secao}
    </button>
  );

  const AREAS: [string, string][] = [
    ['juridico', 'Jurídico e Contratos'],
    ['financeiro', 'Financeiro'],
    ['pessoas', 'Pessoas e Férias'],
    ['gestao', 'Gestão e Inovação']
  ];
  const DOCS: [string, string][] = [
    ['CTR_2026-012', 'Coworking'],
    ['NG_111', 'Férias']
  ];
  const fontes = relatorio ? [...new Set(relatorio.secoes.flatMap((s) => s.itens.map((i) => i.fonte.codigo)))] : [];
  const nItens = relatorio ? relatorio.secoes.reduce((t, s) => t + s.itens.length, 0) : 0;

  return (
    <div className="view-container relatorio-view" data-testid="relatorio-view">
      <div className="print-hidden">
        <CabecalhoTela
          etiqueta="Auditoria e governança"
          titulo="Montar Relatório Executivo"
          descricao="Consolidação de indicadores, conformidade normativa e prazos para deliberação da diretoria."
          acoes={
            <>
              <a
                className="btn btn-outline btn-sm"
                href={url.relatorio({ selecao: true })}
                onClick={(e) => {
                  e.preventDefault();
                  navegar(url.relatorio({ selecao: true }));
                }}
              >
                <Icon nome="relatorio" tamanho={16} /> Meu relatório
              </a>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleImprimir}>
                <Icon nome="baixar" tamanho={16} /> Exportar PDF
              </button>
            </>
          }
        />
      </div>

      <div className="fg-relatorio-grade">
        <div className="fg-coluna print-hidden" role="toolbar" aria-label="Controles do relatório">
          <section className="fg-card">
            <div className="fg-cabeca-card">
              <h2>
                <span className="fg-passo-n">1</span> Escopo Temático
              </h2>
              <span className="fg-sub">{tipoSelecao === 'perspectiva' ? 'Por área' : 'Por documento'}</span>
            </div>
            <div className="fg-alternador fg-alternador-cheio" role="group" aria-label="Tipo de síntese">
              <button type="button" aria-pressed={tipoSelecao === 'perspectiva'} onClick={() => setTipoSelecao('perspectiva')}>
                Por área
              </button>
              <button type="button" aria-pressed={tipoSelecao === 'documento'} onClick={() => setTipoSelecao('documento')}>
                Por documento
              </button>
            </div>
            {tipoSelecao === 'perspectiva' ? (
              <ul className="fg-escopo" role="radiogroup" aria-label="Área">
                {AREAS.map(([id, nome]) => (
                  <li key={id}>
                    <label className={`fg-escopo-item ${perspectiva === id ? 'ativo' : ''}`}>
                      <input type="radio" name="perspectiva-rel" value={id} checked={perspectiva === id} onChange={() => setPerspectiva(id)} />
                      <span>{nome}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="fg-escopo" role="radiogroup" aria-label="Documento">
                {DOCS.map(([id, nome]) => (
                  <li key={id}>
                    <label className={`fg-escopo-item ${codigoDoc === id ? 'ativo' : ''}`}>
                      <input type="radio" name="doc-rel" value={id} checked={codigoDoc === id} onChange={() => setCodigoDoc(id)} />
                      <span>
                        {id} · {nome}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="fg-card">
            <div className="fg-cabeca-card">
              <h2>
                <span className="fg-passo-n">2</span> Vigência e Parâmetros
              </h2>
              <Icon nome="calendario" tamanho={18} />
            </div>
            <div className="fg-grid-2">
              <div className="fg-ese-valor">
                <span className="fg-rotulo">Documentos</span>
                <strong>Só vigentes</strong>
              </div>
              <div className="fg-ese-valor">
                <span className="fg-rotulo">Fontes citadas</span>
                <strong>{fontes.length}</strong>
              </div>
            </div>
          </section>

          <section className="fg-card">
            <div className="fg-cabeca-card">
              <h2>
                <Icon nome="perguntar" tamanho={18} /> Parecer do Gestor
              </h2>
              <span className="fg-sub">Opcional</span>
            </div>
            <label htmlFor="parecer-rel" className="sr-only">
              Parecer do gestor
            </label>
            <textarea
              id="parecer-rel"
              className="fg-textarea"
              rows={4}
              value={parecer}
              onChange={(e) => setParecer(e.target.value)}
              placeholder="Escreva aqui a sua conclusão. Ela aparece no fim do relatório, separada das fontes."
            />
          </section>
        </div>

        <div className="fg-coluna">
          {carregando && (
            <div className="loading-state" data-testid="relatorio-loading">
              <div className="spinner"></div>
              <p>Montando o relatório com as fontes...</p>
            </div>
          )}

          {erro && (
            <div className="alerta alerta-erro" data-testid="relatorio-erro">
              <strong>Erro ao compilar relatório:</strong> {erro}
            </div>
          )}

          {!carregando && relatorio && (
            <article className="fg-card fg-folha" data-testid="folha-relatorio">
              <div className="fg-folha-faixa">
                <span>
                  <span className="fg-ponto" aria-hidden="true" /> Folha executiva · Síntese oficial
                </span>
                <span>
                  Emitido em {new Date(relatorio.gerado_em).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <header className="fg-folha-cabeca">
                <span className="side-logo" aria-hidden="true">
                  A
                </span>
                <div>
                  <p className="fg-folha-org">ACME</p>
                  <p className="fg-sub">Arquivo Central de Normas e Governança</p>
                </div>
                <span className="fg-pilula ok fg-folha-selo">
                  <Icon nome="check" tamanho={13} /> Fontes verificadas
                </span>
              </header>

              <h1 className="fg-folha-titulo" data-testid="relatorio-titulo">
                {relatorio.titulo}
              </h1>
              <p className="fg-sub">Só disposições e valores das normas vigentes. Cada afirmação traz a fonte.</p>

              {relatorio.secoes.map((secao, sIdx) => (
                <section key={sIdx} className="fg-folha-secao" data-testid={`relatorio-secao-${sIdx}`}>
                  <h2>{secao.titulo}</h2>
                  <ul className="fg-folha-itens">
                    {secao.itens.map((item, iIdx) => (
                      <li key={iIdx} data-testid={`relatorio-item-${sIdx}-${iIdx}`}>
                        <p>{item.texto}</p>
                        {renderFonteBotao(item.fonte)}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              {parecer.trim() && (
                <section className="fg-folha-secao fg-folha-parecer">
                  <h2>Parecer do gestor</h2>
                  <p>{parecer}</p>
                  <p className="fg-sub">Opinião de quem montou o relatório, não é texto de norma.</p>
                </section>
              )}

              <footer className="fg-folha-rodape">
                <span className="fg-rotulo">Normativas:</span>
                {fontes.map((c) => (
                  <span key={c} className="fg-pilula neutra">
                    {c}
                  </span>
                ))}
                <span className="fg-sub fg-folha-uso">Uso interno · ACME</span>
              </footer>
            </article>
          )}
        </div>
      </div>

      <div className="fg-card fg-barra-acao print-hidden">
        <span className="fg-sub">
          <Icon nome="marca" tamanho={16} />
          <span>
            <strong>Relatório executivo pronto</strong> · {relatorio ? `${relatorio.secoes.length} seções, ${nItens} itens com fonte` : 'carregando'}
          </span>
        </span>
        <div className="fg-mudanca-acoes">
          <button type="button" className="btn btn-outline btn-sm" onClick={handleImprimir} data-testid="btn-imprimir-relatorio">
            <Icon nome="imprimir" tamanho={16} /> Imprimir ou salvar PDF
          </button>
          <a
            className="btn btn-escuro btn-sm"
            href={url.relatorio({ selecao: true })}
            onClick={(e) => {
              e.preventDefault();
              navegar(url.relatorio({ selecao: true }));
            }}
          >
            <Icon nome="relatorio" tamanho={16} /> Ver meus itens guardados
          </a>
        </div>
      </div>
    </div>
  );
};
