import React, { useEffect, useState } from 'react';
import { FontesBase } from './PainelFontes';
import { fetchDocumentoDetalhe } from '../api/client';
import { navegar, url } from '../app/rotas';
import { acoes, useEstado } from '../app/store';
import { Aviso, CabecalhoTela, FonteChip, ProximaAcao } from '../ui/componentes';
import { Icon } from '../ui/Icon';

/**
 * T11 modo "Relatório da seleção" (RF41): só os itens marcados em respostas, painéis,
 * radar, lado a lado e E se?. Confere cada fonte com GET /api/documentos/{codigo}.
 */
export const RelatorioSelecao: React.FC = () => {
  const itens = useEstado((e) => e.selecao);
  const [titulo, setTitulo] = useState('');
  const [vigentes, setVigentes] = useState<Record<string, string>>({});

  useEffect(() => {
    const codigos = [...new Set(itens.map((i) => i.fonte.codigo))];
    codigos.forEach((c) =>
      fetchDocumentoDetalhe(c)
        .then((d) => setVigentes((v) => ({ ...v, [c]: d.versao })))
        .catch(() => undefined)
    );
  }, [itens]);

  const dataHoje = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="view-container relatorio-selecao" data-testid="relatorio-selecao">
      <CabecalhoTela
        etiqueta="Montar relatório"
        titulo="Meu relatório"
        descricao="Aqui ficam os itens que você guardou. Você pode mudar a ordem, tirar itens e imprimir."
        acoes={
          <a className="btn btn-outline btn-sm" href={url.relatorio()} onClick={(e) => { e.preventDefault(); navegar(url.relatorio()); }}>
            Relatório por área
          </a>
        }
      />
      <FontesBase fontes={itens.map((x) => x.fonte)} />

      {itens.length === 0 ? (
        <div className="painel-secao" data-testid="selecao-vazia">
          <p>Você ainda não guardou nenhum item. Toque em “Guardar no meu relatório” numa resposta, num resumo ou num aviso.</p>
          <div className="linha-botoes">
            <a className="btn btn-outline btn-sm" href={url.painel()} onClick={(e) => { e.preventDefault(); navegar(url.painel()); }}>
              Ver resumos por área
            </a>
            <a className="btn btn-outline btn-sm" href={url.radar()} onClick={(e) => { e.preventDefault(); navegar(url.radar()); }}>
              Ver o que mudou
            </a>
          </div>
        </div>
      ) : (
        <article className="folha-relatorio-executivo">
          <div className="campo print-hidden">
            <label htmlFor="titulo-selecao">Título</label>
            <input id="titulo-selecao" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Férias: o que mudou" />
          </div>
          <h2 className="relatorio-titulo-documento">{titulo || 'Meu relatório'}</h2>
          <p className="texto-apoio">
            Feito em {dataHoje} com os documentos da ACME. Cada item mostra de onde veio.
          </p>
          <ol className="lista-selecao">
            {itens.map((x, i) => {
              const vig = vigentes[x.fonte.codigo];
              const mudou = vig && vig !== x.fonte.versao;
              return (
                <li key={x.id} className="item-selecao" data-testid={`item-selecao-${i}`}>
                  <div className="item-selecao-ordem print-hidden">
                    <button type="button" aria-label={`Subir item ${i + 1}`} disabled={i === 0} onClick={() => acoes.moverSelecao(i, -1)}>
                      ▲
                    </button>
                    <button type="button" aria-label={`Descer item ${i + 1}`} disabled={i === itens.length - 1} onClick={() => acoes.moverSelecao(i, 1)}>
                      ▼
                    </button>
                  </div>
                  <div className="item-selecao-corpo">
                    {x.hipotetico && <span className="status-tag status-atencao">Simulação (não é regra)</span>}
                    <p>{x.texto}</p>
                    <FonteChip fonte={x.fonte} curto />
                    {mudou && (
                      <Aviso testId="fonte-mudou">
                        O documento mudou depois que você guardou este item. A versão em vigor agora é a {vig}.
                      </Aviso>
                    )}
                  </div>
                  <button type="button" className="btn btn-outline btn-sm print-hidden" onClick={() => acoes.removerSelecao(x.id)}>
                    Retirar
                  </button>
                </li>
              );
            })}
          </ol>
          <ProximaAcao>
            <button type="button" className="btn btn-primary btn-sm print-hidden" onClick={() => window.print()}>
              <Icon nome="imprimir" tamanho={16} /> Imprimir ou salvar PDF
            </button>
            <button type="button" className="btn btn-outline btn-sm print-hidden" onClick={() => acoes.limparSelecao()}>
              Tirar todos os itens
            </button>
          </ProximaAcao>
        </article>
      )}
    </div>
  );
};
