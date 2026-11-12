import React, { useEffect, useState } from 'react';
import { RadarItem } from '../api/types';
import { fetchRadar } from '../api/client';
import { navegar, url } from '../app/rotas';
import { acoes, useEstado } from '../app/store';
import { TEMAS } from '../mocks/v2';
import { Aviso, CabecalhoTela, FonteChip, FonteLink, IncluirRelatorio, ProximaAcao, secaoLegivel } from '../ui/componentes';
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
  const [busca, setBusca] = useState('');

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

  const visiveis = itens.filter((i) => !tema || i.tema.includes(tema)).filter((i) => !busca || `${i.titulo} ${i.fontes.map((f) => f.codigo).join(' ')} ${i.codigo_ausente ?? ''}`.toLowerCase().includes(busca.toLowerCase()));
  const nSub = itens.filter((i) => i.tipo === 'versao_substituida').length;
  const nAus = itens.filter((i) => i.tipo === 'referencia_ausente').length;
  const temas = [...new Set(itens.flatMap((i) => i.tema))];
  const grupos: { id: string; rotulo: string; titulo: string; sub: string; itens: RadarItem[] }[] = [
    {
      id: 'mudaram',
      rotulo: 'Versões',
      titulo: 'Regras que mudaram de versão',
      sub: 'A versão nova vale; a antiga aparece para conferência.',
      itens: visiveis.filter((i) => i.tipo !== 'referencia_ausente')
    },
    {
      id: 'ausentes',
      rotulo: 'Acervo',
      titulo: 'Documentos citados que faltam no arquivo',
      sub: 'Outros documentos citam uma norma cujo texto não está no acervo.',
      itens: visiveis.filter((i) => i.tipo === 'referencia_ausente')
    }
  ].filter((g) => g.itens.length > 0);

  return (
    <div className="view-container radar-view" data-testid="radar-view">
      <CabecalhoTela
        etiqueta="Auditoria e ciclos regulatórios"
        titulo="Regras que Mudaram"
        descricao="Acompanhe as modificações de regras, cláusulas e termos dos documentos da ACME. A lista é montada por regras fixas, sem adivinhação."
        acoes={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
            <Icon nome="baixar" tamanho={16} /> Exportar (PDF)
          </button>
        }
      />

      <div className="fg-grid-3 fg-stats">
        <div className="fg-card fg-radar-stat">
          <div className="fg-radar-stat-topo">
            <div>
              <p className="fg-rotulo">Volume global</p>
              <p className="fg-titulo">Regras que mudaram</p>
            </div>
            <span className="fg-icone" aria-hidden="true">
              <Icon nome="regras" tamanho={20} />
            </span>
          </div>
          <p className="fg-radar-n" data-testid="contador-substituida">
            <strong>{nSub}</strong> <span className="sr-only">Regras que mudaram: {nSub}</span>
            <span aria-hidden="true">versões substituídas</span>
          </p>
          <p className="fg-sub">Vale sempre a versão em vigor.</p>
        </div>
        <div className="fg-card fg-radar-stat">
          <div className="fg-radar-stat-topo">
            <div>
              <p className="fg-rotulo">Integridade do acervo</p>
              <p className="fg-titulo">Documentos que faltam</p>
            </div>
            <span className="fg-icone aviso" aria-hidden="true">
              <Icon nome="alerta" tamanho={20} />
            </span>
          </div>
          <p className="fg-radar-n" data-testid="contador-ausente">
            <strong>{nAus}</strong> <span className="sr-only">Documentos que faltam: {nAus}</span>
            <span aria-hidden="true">norma citada fora do arquivo</span>
          </p>
          <p className="fg-sub">Mostramos quem cita.</p>
        </div>
        <div className="fg-card fg-radar-stat">
          <div className="fg-radar-stat-topo">
            <div>
              <p className="fg-rotulo">Abrangência</p>
              <p className="fg-titulo">Assuntos afetados</p>
            </div>
            <span className="fg-icone" aria-hidden="true">
              <Icon nome="resumo" tamanho={20} />
            </span>
          </div>
          <p className="fg-radar-n">
            <strong>{temas.length}</strong> <span>assuntos</span>
          </p>
          <p className="fg-sub">{temas.map((t) => TEMAS[t] ?? t).join(' · ')}</p>
        </div>
      </div>

      <div className="fg-card fg-barra-filtros" role="group" aria-label="Filtros">
        <label className="fg-busca" htmlFor="radar-busca">
          <Icon nome="busca" tamanho={18} />
          <span className="sr-only">Filtrar por código ou palavra-chave</span>
          <input id="radar-busca" type="search" placeholder="Filtrar por código, palavra-chave ou termo..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <label htmlFor="radar-tema" className="sr-only">
          Assunto
        </label>
        <select id="radar-tema" className="fg-select" value={tema} onChange={(e) => navegar(url.radar({ tema: e.target.value }), true)} data-testid="filtro-tema-radar">
          <option value="">Todas as áreas</option>
          {Object.entries(TEMAS).map(([id, nome]) => (
            <option key={id} value={id}>
              {nome}
            </option>
          ))}
        </select>
        <span className="fg-pilula">
          <Icon nome="busca" tamanho={13} /> Exibindo {visiveis.length} {visiveis.length === 1 ? 'alteração' : 'alterações'}
        </span>
        {tema && (
          <button type="button" className="chip-filtro" onClick={() => navegar(url.radar(), true)} aria-label={`Remover filtro de tema ${TEMAS[tema]}`}>
            Assunto: {TEMAS[tema]} <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {visiveis.length === 0 ? (
        <div className="fg-card" data-testid="radar-vazio">
          <p>Nenhum aviso para este assunto. Escolha “Todas as áreas” para ver tudo.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setBusca('');
              navegar(url.radar(), true);
            }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="fg-linha-tempo">
          {grupos.map((g) => (
            <section key={g.id} className="fg-ciclo" aria-labelledby={`ciclo-${g.id}`}>
              <div className="fg-ciclo-cabeca">
                <span className="fg-ciclo-marca" aria-hidden="true">
                  <small>{g.rotulo}</small>
                  <strong>{g.itens.length}</strong>
                </span>
                <div>
                  <h2 id={`ciclo-${g.id}`}>{g.titulo}</h2>
                  <p className="fg-sub">{g.sub}</p>
                </div>
              </div>
              <ul className="fg-ciclo-lista">
                {g.itens.map((i) => {
                  const antiga = i.fontes.find((f) => f.situacao === 'substituida');
                  const nova = i.fontes.find((f) => f.situacao === 'vigente');
                  const codigo = nova?.codigo ?? i.codigo_ausente ?? '';
                  return (
                    <li key={i.id} className="fg-card fg-mudanca" data-testid={`radar-item-${i.id}`}>
                      <div className="fg-mudanca-topo">
                        <span className="fg-codigo">
                          <Icon nome="documento" tamanho={14} /> {codigo}
                        </span>
                        <span className="fg-pilula neutra">{i.tema.map((t) => TEMAS[t] ?? t).join(' · ')}</span>
                        {i.tipo === 'referencia_ausente' ? (
                          <span className="fg-pilula aviso ponto">Documento que falta</span>
                        ) : (
                          <span className="fg-pilula ponto">Vigente: v{nova?.versao}</span>
                        )}
                      </div>
                      <h3 className="fg-mudanca-titulo">{i.titulo}</h3>
                      {i.tipo !== 'referencia_ausente' && <p className="fg-sub">{i.explicacao}</p>}

                      {antiga && nova ? (
                        <div className="fg-antes-depois">
                          <span className="fg-icone fg-icone-sm" aria-hidden="true">
                            <Icon nome="regras" tamanho={16} />
                          </span>
                          <div className="fg-antes-depois-texto">
                            <p className="fg-rotulo">Antes e agora</p>
                            <p>
                              <span className="fg-antes">
                                v{antiga.versao}, {secaoLegivel(antiga.secao)}
                              </span>{' '}
                              <span aria-hidden="true">→</span> <strong className="fg-depois">v{nova.versao}, {secaoLegivel(nova.secao)}</strong>
                            </p>
                          </div>
                          <div className="fg-antes-depois-fontes">
                            <FonteChip fonte={antiga} curto />
                            <FonteChip fonte={nova} curto />
                          </div>
                        </div>
                      ) : (
                        <div className="fg-antes-depois fg-antes-depois-aviso">
                          <span className="fg-icone fg-icone-sm aviso" aria-hidden="true">
                            <Icon nome="alerta" tamanho={16} />
                          </span>
                          <div className="fg-antes-depois-texto">
                            <p className="fg-rotulo">Citado por {(i.citado_por ?? []).length} documentos</p>
                            <p>{i.explicacao}</p>
                          </div>
                          <div className="fg-antes-depois-fontes">
                            {(i.citado_por ?? []).map((f) => (
                              <FonteLink key={f.codigo} fonte={f} />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="fg-mudanca-rodape">
                        <IncluirRelatorio item={{ id: `radar-${i.id}`, texto: i.titulo, fonte: i.fontes[1] ?? i.citado_por?.[0] ?? { codigo: '', versao: '', secao: '' } }} />
                        <div className="fg-mudanca-acoes">
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => abrirDecisao(i)}>
                            Enviar para a área responsável ({i.responsavel})
                          </button>
                          <a className="btn btn-primary btn-sm" href={url.radar({ item: i.id })} onClick={ir(url.radar({ item: i.id }))}>
                            <Icon nome="comparar" tamanho={15} /> Ver comparativo
                          </a>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {decisoes.length > 0 && (
        <section className="fg-card fg-decisoes" aria-labelledby="t-hist">
          <div className="fg-cabeca-card">
            <h2 id="t-hist">
              <Icon nome="historico" tamanho={18} /> O que já foi decidido
            </h2>
          </div>
          <div className="tabela-responsiva">
            <table className="tabela-documentos fg-tabela">
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

/** T5 Comparação lado a lado (mesmo visual de "Comparar versões"). */
const LadoALado: React.FC<{ item?: RadarItem }> = ({ item }) => {
  const voltar = (
    <a className="btn btn-outline btn-sm" href={url.radar()} onClick={ir(url.radar())}>
      <Icon nome="recolher" tamanho={15} /> Voltar aos avisos
    </a>
  );

  if (!item)
    return (
      <div className="view-container" data-testid="lado-inexistente">
        <CabecalhoTela etiqueta="Lado a lado" titulo="Item não encontrado" acoes={voltar} />
        <div className="fg-card">
          <p>Não encontramos este item. Ele pode ter sido resolvido.</p>
        </div>
      </div>
    );

  return (
    <div className="view-container lado-view" data-testid="lado-a-lado">
      <CabecalhoTela etiqueta="Texto antigo e texto novo" titulo={item.titulo} acoes={voltar} />

      {item.tipo === 'referencia_ausente' ? (
        <>
          <Aviso>
            <strong>{item.codigo_ausente} não está no acervo.</strong> {item.explicacao}
          </Aviso>
          <div className="fg-grid-2 fg-lado">
            {(item.citado_por ?? []).map((f) => (
              <article key={f.codigo} className="fg-card coluna-fonte">
                <div className="fg-cabeca-card">
                  <h2>{f.codigo}</h2>
                  <span className="fg-pilula ok ponto">Em vigor</span>
                </div>
                <blockquote className="fg-trecho">{f.trecho}</blockquote>
                <FonteLink fonte={f} comSecao />
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <article className="fg-card fg-diff">
            <div className="fg-diff-colunas">
              {item.fontes.map((f) => {
                const antiga = f.situacao === 'substituida';
                return (
                  <div key={f.versao} className={antiga ? 'fg-diff-antes coluna-antiga' : 'fg-diff-depois'} data-testid={`coluna-${f.situacao}`}>
                    <p className="fg-diff-rotulo">
                      <Icon nome={antiga ? 'fechar' : 'marca'} tamanho={13} /> {f.codigo} · v{f.versao} · {antiga ? 'Versão antiga' : 'Em vigor'}
                    </p>
                    <p className="fg-diff-texto">{f.trecho}</p>
                    <div className="fg-diff-pe">
                      <FonteLink fonte={f} comSecao />
                      <IncluirRelatorio item={{ id: `lado-${item.id}-${f.versao}`, texto: `${f.codigo} v${f.versao}, ${f.secao}: ${f.trecho}`, fonte: f }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
          <Aviso tipo="info">
            <strong>{item.explicacao}</strong> As duas versões ficam à vista para você conferir.
          </Aviso>
          {item.precedencia && (
            <section className="fg-card">
              <div className="fg-cabeca-card">
                <h2>
                  <Icon nome="escudo" tamanho={18} /> O que o próprio documento diz
                </h2>
              </div>
              <blockquote className="fg-trecho">{item.precedencia.trecho}</blockquote>
              <FonteLink fonte={item.precedencia} comSecao />
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
