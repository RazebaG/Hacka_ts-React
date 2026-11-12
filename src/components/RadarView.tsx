import React, { useEffect, useState } from 'react';
import { RadarItem } from '../api/types';
import { fetchRadar } from '../api/client';
import { navegar, url } from '../app/rotas';
import { acoes, useEstado } from '../app/store';
import { TEMAS } from '../mocks/v2';
import { Aviso, CabecalhoTela, FonteChip, IncluirRelatorio, ProximaAcao } from '../ui/componentes';
import { Icon } from '../ui/Icon';

interface RadarViewProps {
  itemId?: string;
  tema?: string;
}

const ir = (destino: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  navegar(destino);
};

const abrirDecisao = (i: RadarItem) =>
  acoes.abrirDecisao({
    item: i.titulo,
    fontes: (i.fontes.length ? i.fontes : i.citado_por ?? []).map(({ codigo, versao, secao }) => ({ codigo, versao, secao })),
    responsavel: i.responsavel
  });

/** T4 Radar de contradições + T5 Comparação lado a lado (quando há `itemId`). */
export const RadarView: React.FC<RadarViewProps> = ({ itemId, tema = '' }) => {
  const [itens, setItens] = useState<RadarItem[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const decisoes = useEstado((e) => e.decisoes);

  useEffect(() => {
    fetchRadar()
      .then(setItens)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Não conseguimos carregar os avisos agora'));
  }, []);

  if (erro)
    return (
      <div className="view-container">
        <Aviso tipo="erro">{erro}</Aviso>
      </div>
    );
  if (!itens)
    return (
      <div className="view-container loading-state" aria-busy="true">
        <div className="spinner"></div>
        <p>Buscando nos documentos…</p>
      </div>
    );

  if (itemId) {
    const item = itens.find((i) => i.id === itemId);
    return <LadoALado item={item} />;
  }

  const visiveis = itens.filter((i) => !tema || i.tema.includes(tema));
  const nSub = itens.filter((i) => i.tipo === 'versao_substituida').length;
  const nAus = itens.filter((i) => i.tipo === 'referencia_ausente').length;

  return (
    <div className="view-container radar-view" data-testid="radar-view">
      <CabecalhoTela
        etiqueta="Regras que mudaram"
        titulo="Regras que mudaram ou estão em conflito"
        descricao="Esta lista é montada por regras fixas, sem adivinhação. Nada aqui é inventado."
      />

      <div className="radar-contadores">
        <span className="status-tag status-divergente" data-testid="contador-substituida">
          <Icon nome="alerta" tamanho={14} /> Regras que mudaram: {nSub}
        </span>
        <span className="status-tag status-atencao" data-testid="contador-ausente">
          <Icon nome="alerta" tamanho={14} /> Documentos que faltam: {nAus}
        </span>
      </div>

      <details className="painel-secao radar-legenda">
        <summary>O que significa cada aviso</summary>
        <ul>
          <li>
            <strong>Regra mudou:</strong> vale a versão nova. Mostramos a antiga e a nova para você conferir.
          </li>
          <li>
            <strong>Dois documentos em vigor dizem coisas diferentes:</strong> mostramos os dois, sem escolher. Se um documento disser qual vale, isso aparece.
          </li>
          <li>
            <strong>Documento que falta:</strong> outros documentos citam uma norma que não está no arquivo. Mostramos quem cita.
          </li>
        </ul>
      </details>

      <div className="filtros-linha" role="group" aria-label="Filtro por tema">
        <label htmlFor="radar-tema">Assunto</label>
        <select id="radar-tema" value={tema} onChange={(e) => navegar(url.radar({ tema: e.target.value }), true)} data-testid="filtro-tema-radar">
          <option value="">Todos</option>
          {Object.entries(TEMAS).map(([id, nome]) => (
            <option key={id} value={id}>
              {nome}
            </option>
          ))}
        </select>
        {tema && (
          <button type="button" className="chip-filtro" onClick={() => navegar(url.radar(), true)} aria-label={`Remover filtro de tema ${TEMAS[tema]}`}>
            Assunto: {TEMAS[tema]} <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {visiveis.length === 0 ? (
        <div className="painel-secao" data-testid="radar-vazio">
          <p>Nenhum aviso para este assunto. Escolha “Todos” para ver tudo.</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navegar(url.radar(), true)}>
            Limpar filtros
          </button>
        </div>
      ) : (
        <ul className="radar-lista">
          {visiveis.map((i) => (
            <li key={i.id} className="radar-item" data-testid={`radar-item-${i.id}`}>
              <div className="radar-item-topo">
                <span className={`status-tag ${i.severidade === 'divergente' ? 'status-divergente' : 'status-atencao'}`}>
                  <Icon nome="alerta" tamanho={14} />
                  {i.tipo === 'referencia_ausente' ? 'Documento que falta' : 'Regra mudou'}
                </span>
              </div>
              <h2 className="radar-item-titulo">{i.titulo}</h2>
              {i.tipo !== 'referencia_ausente' && <p className="radar-item-explicacao">{i.explicacao}</p>}
              <div className="linha-fontes">
                {i.tipo === 'referencia_ausente'
                  ? (i.citado_por ?? []).map((f) => <FonteChip key={f.codigo} fonte={f} curto />)
                  : i.fontes.map((f) => <FonteChip key={f.versao} fonte={f} curto />)}
              </div>
              <IncluirRelatorio
                item={{ id: `radar-${i.id}`, texto: i.titulo, fonte: i.fontes[1] ?? i.citado_por?.[0] ?? { codigo: '', versao: '', secao: '' } }}
              />
              <ProximaAcao texto={i.proxima_acao}>
                <a className="btn btn-primary btn-sm" href={url.radar({ item: i.id })} onClick={ir(url.radar({ item: i.id }))}>
                  Ver texto antigo e novo
                </a>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => abrirDecisao(i)}>
                  Enviar para a área responsável ({i.responsavel})
                </button>
              </ProximaAcao>
            </li>
          ))}
        </ul>
      )}

      {decisoes.length > 0 && (
        <section className="painel-secao" aria-labelledby="t-hist">
          <h2 id="t-hist" className="secao-titulo">
            O que já foi decidido
          </h2>
          <div className="tabela-responsiva">
            <table className="tabela-documentos">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Item</th>
                  <th>Ação</th>
                  <th>Responsável</th>
                </tr>
              </thead>
              <tbody>
                {decisoes.map((d) => (
                  <tr key={d.id}>
                    <td>{new Date(d.registrado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>{d.item}</td>
                    <td>{d.acao === 'encaminhar' ? 'Encaminhado para revisão' : d.acao === 'aceitar' ? 'Aceito' : 'Descartado'}</td>
                    <td>{d.responsavel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

/** T5 Comparação lado a lado. */
const LadoALado: React.FC<{ item?: RadarItem }> = ({ item }) => {
  if (!item)
    return (
      <div className="view-container" data-testid="lado-inexistente">
        <CabecalhoTela etiqueta="Lado a lado" titulo="Item não encontrado" />
        <p>Não encontramos este item. Ele pode ter sido resolvido.</p>
        <a className="btn btn-outline" href={url.radar()} onClick={ir(url.radar())}>
          Voltar aos avisos
        </a>
      </div>
    );

  return (
    <div className="view-container lado-view" data-testid="lado-a-lado">
      <CabecalhoTela
        etiqueta="Texto antigo e texto novo"
        titulo={item.titulo}
        acoes={
          <a className="btn btn-outline btn-sm" href={url.radar()} onClick={ir(url.radar())}>
            Voltar aos avisos
          </a>
        }
      />

      {item.tipo === 'referencia_ausente' ? (
        <>
          <Aviso>
            <strong>{item.codigo_ausente} não está no acervo.</strong> {item.explicacao}
          </Aviso>
          <div className="grade-cartoes grade-2">
            {(item.citado_por ?? []).map((f) => (
              <article key={f.codigo} className="coluna-fonte">
                <div className="coluna-topo">
                  <strong>{f.codigo}</strong>
                  <span className="status-tag status-vigente">Em vigor</span>
                </div>
                <FonteChip fonte={f} />
                <blockquote className="trecho">{f.trecho}</blockquote>
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grade-cartoes grade-2">
            {item.fontes.map((f) => (
              <article key={f.versao} className={`coluna-fonte ${f.situacao === 'substituida' ? 'coluna-antiga' : ''}`} data-testid={`coluna-${f.situacao}`}>
                <div className="coluna-topo">
                  <strong>
                    {f.codigo} · v{f.versao}
                  </strong>
                  <span className={`status-tag ${f.situacao === 'vigente' ? 'status-vigente' : 'status-neutro'}`}>
                    {f.situacao === 'vigente' ? 'Em vigor' : 'Versão antiga'}
                  </span>
                </div>
                <FonteChip fonte={f} />
                <blockquote className="trecho">{f.trecho}</blockquote>
                <IncluirRelatorio item={{ id: `lado-${item.id}-${f.versao}`, texto: `${f.codigo} v${f.versao}, ${f.secao}: ${f.trecho}`, fonte: f }} />
              </article>
            ))}
          </div>
          <Aviso tipo="info">
            <strong>{item.explicacao}</strong> As duas versões ficam à vista para você conferir.
          </Aviso>
          {item.precedencia && (
            <section className="painel-secao">
              <span className="badge-tag">O que o próprio documento diz</span>
              <p>{item.precedencia.trecho}</p>
              <FonteChip fonte={item.precedencia} />
            </section>
          )}
        </>
      )}

      <ProximaAcao texto={item.proxima_acao}>
        {item.regra_simulavel && (
          <a className="btn btn-primary btn-sm" href={url.ese(item.regra_simulavel, 30)} onClick={ir(url.ese(item.regra_simulavel, 30))}>
            Simular uma mudança
          </a>
        )}
        <button type="button" className="btn btn-outline btn-sm" onClick={() => abrirDecisao(item)} data-testid="btn-encaminhar">
          Enviar para a área responsável ({item.responsavel})
        </button>
      </ProximaAcao>
    </div>
  );
};
