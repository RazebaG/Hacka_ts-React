import React, { useEffect, useState } from 'react';
import { FichaDocumento, RadarItem, TriagemResposta } from '../api/types';
import { fetchFicha, fetchRadar, fetchTriagem } from '../api/client';
import { navegar, url } from '../app/rotas';
import { useEstado } from '../app/store';
import { CabecalhoTela, FonteLink, ProximaAcao } from '../ui/componentes';
import { TEMAS } from '../mocks/v2';
import { Icon, NomeIcone } from '../ui/Icon';
import { SUGESTOES_POR_PERFIL } from './perfis';
import { MesaDocumento } from './MesaDocumento';
import { PERFIS } from './perfis';

/** T1 Início (layout do Figma): atalhos, pendências, resumo por área, prazo e dúvidas. */
const CARTOES = [
  { id: 'juridico', nome: 'Jurídico', rotulo: 'Coworking vigente até', valor: '29/04/2027', fonte: { codigo: 'CTR_2026-012', versao: '1.0.0', secao: 'Cláusula Primeira' } },
  { id: 'financeiro', nome: 'Financeiro', rotulo: 'Valor global coworking', valor: 'R$18.250,00', fonte: { codigo: 'CTR_2026-012', versao: '1.0.0', secao: 'Cláusula Sétima' } },
  { id: 'pessoas', nome: 'Pessoas', rotulo: 'Prazo para solicitar férias', valor: '45 dias', fonte: { codigo: 'NG_111', versao: '3.0.0', secao: '4.3' } },
  { id: 'gestao', nome: 'Gestão', rotulo: 'Orçamento Ideias em Campo', valor: 'R$96.000,00', fonte: { codigo: 'NT_2026-021', versao: '1.0.0', secao: '2' } }
];

const ATALHOS: { titulo: string; descricao: string; icone: NomeIcone; destino: string }[] = [
  { titulo: 'Tirar Dúvida', descricao: 'Consulta inteligente', icone: 'perguntar', destino: url.perguntar() },
  { titulo: 'Regras que Mudaram', descricao: 'Comparação de vigências', icone: 'regras', destino: url.radar() },
  { titulo: 'Consultar Acervo', descricao: 'Normas e contratos', icone: 'catalogo', destino: url.catalogo() },
  { titulo: 'Montar Relatório', descricao: 'Síntese com fontes', icone: 'relatorio', destino: url.relatorio() }
];

const ir = (destino: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  navegar(destino);
};

export const VisaoGeralView: React.FC<{ docSelecionado?: string }> = ({ docSelecionado }) => {
  const [radar, setRadar] = useState<RadarItem[] | null>(null);
  const [erro, setErro] = useState(false);
  const perfil = useEstado((e) => e.perfil);
  const avaliacoes = useEstado((e) => e.avaliacoes);
  const [fila, setFila] = useState<TriagemResposta | null>(null);

  const [fichaMesa, setFichaMesa] = useState<FichaDocumento | null>(null);
  const [erroMesa, setErroMesa] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    fetchRadar().then(setRadar).catch(() => setErro(true));
  }, []);

  // RF71: lista curta (até 5) ordenada por urgência e pelo perfil escolhido
  useEffect(() => {
    fetchTriagem({ limite: 5, perfil }).then(setFila).catch(() => setFila({ total: 0, pagina: 1, tamanho: 5, pedem_acao: 0, itens: [] }));
  }, [perfil]);

  // A Mesa abre sozinha no primeiro chip; ?doc= escolhe outro (link compartilhável)
  const escolhido = docSelecionado ?? fila?.itens[0]?.codigo;
  useEffect(() => {
    if (!escolhido) return;
    let vivo = true;
    setErroMesa(false);
    fetchFicha(escolhido, undefined, { perfil })
      .then((f) => vivo && setFichaMesa(f))
      .catch(() => vivo && setErroMesa(true));
    return () => {
      vivo = false;
    };
  }, [escolhido, perfil, tentativa]);

  const sugestoes = (SUGESTOES_POR_PERFIL[perfil ?? 'diretoria'] ?? SUGESTOES_POR_PERFIL.diretoria).slice(0, 2);
  const nRegras = radar?.filter((i) => i.tipo !== 'referencia_ausente').length ?? 0;
  const nAusentes = radar?.filter((i) => i.tipo === 'referencia_ausente').length ?? 0;

  return (
    <div className="view-container visao-geral" data-testid="visao-geral">
      <CabecalhoTela titulo="Arquivo Central de Normas" descricao="Acesse normas, consulte regras e acompanhe prazos institucionais." />

      <nav className="fg-atalhos" aria-label="Atalhos">
        {ATALHOS.map((t) => (
          <a key={t.titulo} className="fg-card fg-atalho" href={t.destino} onClick={ir(t.destino)}>
            <span className="fg-icone" aria-hidden="true">
              <Icon nome={t.icone} tamanho={20} />
            </span>
            <span className="fg-atalho-texto">
              <strong>{t.titulo}</strong>
              <span>{t.descricao}</span>
            </span>
            <Icon nome="seta" tamanho={16} className="fg-atalho-seta" />
          </a>
        ))}
      </nav>

      {/* Revisão 13/11 (RF71/RF72): documentos que pedem atenção + Mesa de decisão */}
      <section className="inicio-mesa" aria-labelledby="t-atencao" data-testid="inicio-atencao">
        <div className="fg-secao-titulo inicio-mesa-titulo">
          <div>
            <h2 id="t-atencao">Documentos que pedem sua atenção</h2>
            <p className="fg-sub">
              Para: {perfil ? PERFIS.find((p) => p.id === perfil)?.nome ?? perfil : 'qualquer pessoa'} · escolha um documento para ver o que decidir
            </p>
          </div>
          <a className="fg-link" href={url.atencao()} onClick={ir(url.atencao())}>
            Ver fila completa <Icon nome="seta" tamanho={14} />
          </a>
        </div>
        {!fila ? (
          <div className="mesa-chips" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="mesa-chip triagem-esqueleto" />
            ))}
          </div>
        ) : fila.itens.length === 0 ? (
          <p className="fg-card">Nada pede sua atenção agora.</p>
        ) : (
          <>
            <div className="mesa-chips" role="tablist" aria-label="Documentos que pedem sua atenção">
              {fila.itens.map((i) => (
                <button
                  key={i.codigo}
                  type="button"
                  role="tab"
                  aria-selected={i.codigo === escolhido}
                  className={`mesa-chip nivel-${i.semaforo.nivel}`}
                  onClick={() => navegar(url.inicio(i.codigo), true)}
                  data-testid={`chip-${i.codigo}`}
                >
                  <span className={`mesa-chip-ponto nivel-${i.semaforo.nivel}`} aria-hidden="true" />
                  <strong>{i.codigo}</strong>
                  <span>· {i.motivo_curto ?? i.semaforo.motivos[0] ?? 'em dia'}</span>
                </button>
              ))}
            </div>
            {fichaMesa ? (
              <MesaDocumento ficha={fichaMesa} variante="compacta" />
            ) : erroMesa ? (
              <div className="alerta alerta-erro" role="alert">
                Não conseguimos abrir este documento agora.{' '}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setTentativa((t) => t + 1)}>
                  Tentar de novo
                </button>
              </div>
            ) : (
              <div className="fg-card triagem-esqueleto mesa-carregando" aria-busy="true" />
            )}
          </>
        )}
      </section>

      {erro ? (
        <div className="alerta alerta-erro" role="alert">
          Não conseguimos carregar as pendências agora. Tente de novo em alguns segundos.
        </div>
      ) : !radar ? (
        <div className="loading-state" aria-busy="true">
          <div className="spinner"></div>
          <p>Buscando nos documentos…</p>
        </div>
      ) : radar.length === 0 ? (
        <div className="fg-card">Nenhuma pendência nos documentos em vigor.</div>
      ) : (
        <section className="fg-faixa-alerta" aria-labelledby="t-radar">
          <span className="fg-icone" aria-hidden="true">
            <Icon nome="alerta" tamanho={20} />
          </span>
          <span className="fg-etiqueta-atencao">Atenção</span>
          <strong id="t-radar">{radar.length} pontos requerem análise</strong>
          <span className="fg-sub">
            {nRegras} {nRegras === 1 ? 'regra alterada' : 'regras alteradas'} e {nAusentes} {nAusentes === 1 ? 'documento pendente' : 'documentos pendentes'} de arquivo
          </span>
          <a className="btn btn-primary btn-sm" href={url.radar()} onClick={ir(url.radar())}>
            Ver pendências <span aria-hidden="true">→</span>
          </a>
        </section>
      )}


      <div className="fg-secao-titulo">
        <div>
          <h2>Resumo normativo por área</h2>
          <p className="fg-sub">Indicadores principais em vigor e referências documentais.</p>
        </div>
        <a className="fg-link" href={url.painel()} onClick={ir(url.painel())}>
          Ver todas as áreas <Icon nome="seta" tamanho={14} />
        </a>
      </div>

      <div className="fg-grid-4">
        {CARTOES.map((c) => (
          <article key={c.id} className="fg-card fg-area">
            <div className="fg-area-topo">
              <p className="fg-rotulo">{c.nome}</p>
              <span className="fg-ponto" aria-hidden="true" />
            </div>
            <p className="fg-area-rotulo">{c.rotulo}</p>
            <p className="fg-valor">
              <a href={url.painel(c.id)} onClick={ir(url.painel(c.id))} className="fg-valor-link" aria-label={`${c.valor}: ver resumo de ${c.nome}`}>
                {c.valor}
              </a>
            </p>
            <div className="fg-area-fonte">
              <FonteLink fonte={c.fonte} />
            </div>
          </article>
        ))}
      </div>

      {radar && (
        <section className="fg-assuntos" aria-labelledby="t-assuntos" data-testid="inicio-assuntos">
          <h2 id="t-assuntos" className="fg-rotulo">
            Por assunto
          </h2>
          <div className="fg-grid-3">
            {Object.entries(TEMAS).map(([id, nome]) => {
              const n = radar.filter((i) => i.tema.includes(id)).length;
              return (
                <article key={id} className="fg-card fg-assunto" data-testid={`assunto-${id}`}>
                  <p className="fg-assunto-nome">
                    <strong>{nome}</strong> · {n} {n === 1 ? 'ponto' : 'pontos'} no radar
                  </p>
                  <div className="fg-assunto-links">
                    <a className="fg-link" href={url.radar({ tema: id })} onClick={ir(url.radar({ tema: id }))}>
                      Ver avisos <Icon nome="seta" tamanho={13} />
                    </a>
                    <a className="fg-link" href={url.painel(undefined, { tema: id })} onClick={ir(url.painel(undefined, { tema: id }))}>
                      Resumo <Icon nome="seta" tamanho={13} />
                    </a>
                    <a className="fg-link" href={url.catalogo(id)} onClick={ir(url.catalogo(id))}>
                      Documentos <Icon nome="seta" tamanho={13} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="fg-grid-2 fg-inicio-baixo">
        <section className="fg-card">
          <div className="fg-cabeca-card">
            <h2>
              <Icon nome="calendario" tamanho={18} /> Próximo Prazo Relevante
            </h2>
            <span className="fg-pilula neutra">Cronograma</span>
          </div>
          <p className="fg-valor">25/11/2026</p>
          <p className="fg-texto">Vistoria presencial do espaço de coworking.</p>
          <div className="fg-rodape-card">
            <FonteLink fonte={{ codigo: 'CTR_2026-012', versao: '1.0.0', secao: 'Apêndice B' }} comSecao />
            <a
              className="fg-link"
              href={url.documento('CTR_2026-012', '1.0.0', 'Apêndice B')}
              onClick={ir(url.documento('CTR_2026-012', '1.0.0', 'Apêndice B'))}
            >
              Ver detalhes <Icon nome="seta" tamanho={14} />
            </a>
          </div>
        </section>

        <section className="fg-card">
          <div className="fg-cabeca-card">
            <h2>
              <Icon nome="duvida" tamanho={18} /> Dúvidas Frequentes
            </h2>
            <span className="fg-sub" data-testid="resumo-avaliacoes">
              Respostas avaliadas: <strong>{avaliacoes.length}</strong> · úteis: <strong>{avaliacoes.filter((a) => a.util).length}</strong>
            </span>
          </div>
          <ul className="fg-lista">
            {sugestoes.map((s) => (
              <li key={s}>
                <a className="fg-lista-item" href={url.perguntar(s)} onClick={ir(url.perguntar(s))}>
                  {s}
                  <Icon nome="seta" tamanho={14} />
                </a>
              </li>
            ))}
          </ul>
          <div className="fg-rodape-card">
            <span className="fg-sub">Outra pergunta?</span>
            <a className="fg-link" href={url.perguntar()} onClick={ir(url.perguntar())}>
              Consultar assistente <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </div>

      <ProximaAcao texto={radar && radar.length ? `Comece pelas ${radar.length} pendências do radar: veja o que mudou e decida o que encaminhar.` : 'Tire uma dúvida ou procure um documento.'}>
        <a className="btn btn-primary btn-sm" href={url.radar()} onClick={ir(url.radar())}>
          Ver pendências
        </a>
      </ProximaAcao>
    </div>
  );
};
