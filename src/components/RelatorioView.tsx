import React, { useEffect, useState } from 'react';
import { FonteCita, RelatorioExecutivo } from '../api/types';
import { fetchRelatorio } from '../api/client';

interface RelatorioViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
  perspectivaInicial?: string;
  codigoDocumentoInicial?: string;
}

export const RelatorioView: React.FC<RelatorioViewProps> = ({
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

  const renderFonteBotao = (fonte: FonteCita) => {
    return (
      <button
        type="button"
        className="btn-fonte-relatorio"
        onClick={() => onNavegarDocumento(fonte.codigo, fonte.versao, fonte.secao)}
        title={`Abrir ${fonte.codigo} v${fonte.versao} na seção ${fonte.secao}`}
        data-testid={`btn-fonte-relatorio-${fonte.codigo}-${fonte.secao}`}
      >
        <span className="fonte-badge">Fonte Oficial:</span>
        <span className="fonte-ref">
          {fonte.codigo} (v{fonte.versao}) · Seção {fonte.secao}
        </span>
      </button>
    );
  };

  return (
    <div className="view-container relatorio-view" data-testid="relatorio-view">
      {/* Barra de Controles (oculta na impressão) */}
      <div className="relatorio-controles-bar print-hidden" role="toolbar" aria-label="Controles do Relatório">
        <div className="controles-opcoes">
          <div className="campo-form-inline">
            <label htmlFor="tipo-relatorio">Tipo de Síntese:</label>
            <select
              id="tipo-relatorio"
              className="select-small"
              value={tipoSelecao}
              onChange={(e) => setTipoSelecao(e.target.value as any)}
              data-testid="select-tipo-relatorio"
            >
              <option value="perspectiva">Por Perspectiva Empresarial</option>
              <option value="documento">Por Documento do Acervo</option>
            </select>
          </div>

          {tipoSelecao === 'perspectiva' ? (
            <div className="campo-form-inline">
              <label htmlFor="select-perspectiva">Perspectiva:</label>
              <select
                id="select-perspectiva"
                className="select-small"
                value={perspectiva}
                onChange={(e) => setPerspectiva(e.target.value)}
                data-testid="select-perspectiva"
              >
                <option value="juridico">Jurídico e Contratos (Cena 5)</option>
                <option value="financeiro">Financeiro</option>
                <option value="pessoas">Pessoas (RH)</option>
                <option value="gestao">Gestão e Inovação</option>
              </select>
            </div>
          ) : (
            <div className="campo-form-inline">
              <label htmlFor="select-documento-rel">Documento:</label>
              <select
                id="select-documento-rel"
                className="select-small"
                value={codigoDoc}
                onChange={(e) => setCodigoDoc(e.target.value)}
                data-testid="select-doc-relatorio"
              >
                <option value="CTR_2026-012">CTR_2026-012 (Coworking)</option>
                <option value="NG_111">NG_111 (Férias)</option>
              </select>
            </div>
          )}
        </div>

        <div className="controles-acoes">
          <button
            type="button"
            className="btn btn-primary btn-imprimir"
            onClick={handleImprimir}
            data-testid="btn-imprimir-relatorio"
          >
            🖨️ Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {carregando && (
        <div className="loading-state" data-testid="relatorio-loading">
          <div className="spinner"></div>
          <p>Compilando síntese executiva com ancoragem de fontes...</p>
        </div>
      )}

      {erro && (
        <div className="alerta alerta-erro" data-testid="relatorio-erro">
          <strong>Erro ao compilar relatório:</strong> {erro}
        </div>
      )}

      {!carregando && relatorio && (
        <article className="folha-relatorio-executivo" data-testid="folha-relatorio">
          {/* Cabeçalho Formal do Relatório */}
          <header className="relatorio-cabecalho">
            <div className="relatorio-topo">
              <div className="relatorio-emissor">
                <span className="logo-acme-mini">ACME</span>
                <span className="orgao-emissor">
                  Arquivo Central de Normas · Governança e Inteligência
                </span>
              </div>
              <div className="relatorio-carimbo">
                <span className="badge-auditado">✓ Rastreabilidade Verificada</span>
                <time className="relatorio-data" dateTime={relatorio.gerado_em}>
                  Emitido em: {new Date(relatorio.gerado_em).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(relatorio.gerado_em).toLocaleTimeString('pt-BR')}
                </time>
              </div>
            </div>

            <h1 className="relatorio-titulo-documento" data-testid="relatorio-titulo">
              {relatorio.titulo}
            </h1>

            <p className="relatorio-aviso-confiabilidade">
              Este relatório consolida exclusivamente disposições e valores das normas vigentes da
              ACME. Todas as afirmações possuem referência rastreável aos documentos oficiais.
            </p>
          </header>

          {/* Seções do Relatório */}
          <div className="relatorio-corpo">
            {relatorio.secoes.map((secao, sIdx) => (
              <section
                key={sIdx}
                className="relatorio-bloco-secao"
                data-testid={`relatorio-secao-${sIdx}`}
              >
                <h2 className="relatorio-secao-titulo">{secao.titulo}</h2>

                <div className="relatorio-itens-lista">
                  {secao.itens.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="relatorio-item-card"
                      data-testid={`relatorio-item-${sIdx}-${iIdx}`}
                    >
                      <p className="relatorio-item-texto">{item.texto}</p>
                      <div className="relatorio-item-fonte-box">
                        {renderFonteBotao(item.fonte)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Rodapé Oficial do Relatório */}
          <footer className="relatorio-rodape-formal">
            <div className="rodape-linha">
              <span>HACKA/TS 2026 · Desafio 2 — Inteligência Empresarial</span>
              <span>Documento gerado pelo Assistente Oficial de Normas</span>
            </div>
            <div className="rodape-assinatura">
              <span className="sigilo-tag">USO INTERNO EXCLUSIVO · ACME CORPORATE</span>
            </div>
          </footer>
        </article>
      )}
    </div>
  );
};
