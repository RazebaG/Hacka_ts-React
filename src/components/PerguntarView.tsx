import React, { useEffect, useRef, useState } from 'react';
import { PerfilUsuario, RespostaPerguntar } from '../api/types';
import { postPerguntar } from '../api/client';
import { CitacaoCard } from './CitacaoCard';
import { EXEMPLOS_PERGUNTAS } from '../mocks/perguntas';
import { acoes, useEstado } from '../app/store';
import { AvaliarResposta, IncluirRelatorio, nomeDoDocumento, secaoLegivel } from '../ui/componentes';
import { Icon } from '../ui/Icon';
import { navegar, url } from '../app/rotas';
import { PERFIS } from './perfis';

interface PerguntarViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
  /** Pergunta vinda da rota /perguntar?q= (topo, Visão geral, Slack, Teams). */
  perguntaInicial?: string;
}

interface Turno {
  id: number;
  pergunta: string;
  hora: string;
  resposta: RespostaPerguntar;
}

/** Fontes de cada pergunta frequente, para a coluna lateral (dados do acervo). */
const FONTE_EXEMPLO: Record<string, string> = {
  'prazo-ferias-substituicao': 'NG_111 · Item 4.3',
  'nao-consta': 'Não consta no acervo',
  'coworking-financeiro': 'CTR_2026-012 · Cláusulas 7 e 12',
  'ideias-em-campo': 'RG_1100 · Inovação',
  'fracionamento-ferias': 'NG_111 · Item 4.4'
};

const MAIS_CONSULTADOS = [
  { codigo: 'CTR_2026-012', nome: 'Locação Coworking' },
  { codigo: 'NG_111', nome: 'Concessão de Férias' },
  { codigo: 'NT_2026-021', nome: 'Ideias em Campo' }
];

const agora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** T2 Tirar uma dúvida (layout do Figma): conversa à esquerda, perguntas frequentes à direita. */
export const PerguntarView: React.FC<PerguntarViewProps> = ({ onNavegarDocumento, perguntaInicial }) => {
  const [pergunta, setPergunta] = useState<string>(perguntaInicial ?? '');
  const perfil = useEstado((e) => e.perfil);
  const setPerfil = (p: PerfilUsuario) => acoes.definirPerfil(p);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const fim = useRef<HTMLDivElement>(null);

  const executarPergunta = async (texto: string, perfilSelecionado: PerfilUsuario) => {
    if (!texto.trim()) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await postPerguntar(texto, perfilSelecionado);
      setTurnos((t) => [...t, { id: t.length + 1, pergunta: texto.trim(), hora: agora(), resposta: res }]);
      setPergunta('');
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao processar pergunta');
    } finally {
      setCarregando(false);
    }
  };

  // Evita perguntar duas vezes a mesma pergunta da rota (o React roda o efeito 2x em desenvolvimento)
  const jaPerguntou = useRef<string | null>(null);
  useEffect(() => {
    if (!perguntaInicial || jaPerguntou.current === perguntaInicial) return;
    jaPerguntou.current = perguntaInicial;
    executarPergunta(perguntaInicial, perfil);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perguntaInicial]);

  useEffect(() => {
    fim.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [turnos.length, carregando]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executarPergunta(pergunta, perfil);
  };

  const copiar = (texto: string) => {
    navigator.clipboard?.writeText(texto).catch(() => undefined);
  };

  return (
    <div className="view-container pergunte-view fg-chat-view">
      <header className="fg-card fg-chat-cabeca">
        <span className="fg-icone" aria-hidden="true">
          <Icon nome="perguntar" tamanho={20} />
        </span>
        <div className="fg-chat-cabeca-texto">
          <h1 className="view-title fg-chat-titulo">
            Tirar uma Dúvida <span className="fg-pilula">13 normas ativas</span>
          </h1>
          <p className="fg-sub">Consulte regras, prazos e políticas corporativas com fundamentação literal.</p>
        </div>
        {turnos.length > 0 && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setTurnos([])}>
            <Icon nome="historico" tamanho={16} /> Nova conversa
          </button>
        )}
      </header>

      <div className="fg-layout-lateral">
        <section className="fg-card fg-chat" aria-label="Conversa">
          <div className="fg-chat-fio" aria-live="polite">
            {turnos.length === 0 && !carregando && (
              <div className="fg-chat-vazio">
                <span className="fg-icone" aria-hidden="true">
                  <Icon nome="livro" tamanho={22} />
                </span>
                <p className="fg-titulo">Pergunte com suas palavras</p>
                <p className="fg-sub">A resposta mostra de qual documento e de qual item veio. Se os documentos não tratarem do assunto, avisamos.</p>
              </div>
            )}

            {turnos.map((t, i) => {
              const ultimo = i === turnos.length - 1;
              const r = t.resposta;
              const principal = r.citacoes[0];
              return (
                <div key={t.id} className="fg-turno" data-testid={ultimo ? 'resultado-pergunta' : undefined}>
                  <div className="fg-msg-usuario">
                    <div className="fg-bolha">
                      <span className="fg-bolha-meta">
                        Você <span>{t.hora}</span>
                      </span>
                      <p>{t.pergunta}</p>
                    </div>
                    <span className="fg-avatar" aria-hidden="true">
                      <Icon nome="usuario" tamanho={16} />
                    </span>
                  </div>

                  <div className="fg-msg-assistente">
                    <span className="fg-avatar fg-avatar-azul" aria-hidden="true">
                      <Icon nome="livro" tamanho={16} />
                    </span>
                    <article className={`fg-resposta ${r.consta ? '' : 'fg-resposta-nao-consta'}`} data-testid={ultimo && !r.consta ? 'alerta-nao-consta' : undefined}>
                      <div className="fg-resposta-topo">
                        {r.consta ? (
                          <>
                            <strong>{r.citacoes.length > 1 ? 'Fundamentação Cruzada' : 'Fundamentação Literal'}</strong>
                            <span className="fg-pilula ok">
                              <Icon nome="marca" tamanho={13} />
                              {r.citacoes.length > 1 ? `${r.citacoes.length} trechos extraídos` : 'Com fonte'}
                            </span>
                          </>
                        ) : (
                          <>
                            <h3>Os documentos não tratam deste assunto</h3>
                            <span className="fg-pilula aviso">Sem resposta inventada</span>
                          </>
                        )}
                        {principal && (
                          <span className="fg-resposta-ref">
                            {principal.codigo} · {secaoLegivel(principal.secao)}
                          </span>
                        )}
                      </div>

                      {r.consta && principal && (
                        <p className="fg-sub">
                          De acordo com <strong>{nomeDoDocumento(principal.codigo)} ({principal.codigo})</strong>:
                        </p>
                      )}
                      <p className="fg-resposta-texto" data-testid={ultimo ? 'texto-resposta' : undefined}>
                        {r.resposta}
                      </p>
                      {!r.consta && (
                        <p className="fg-sub">
                          Para não errar, só respondemos com o que está escrito nos documentos. Tente perguntar de outro jeito ou procure a área
                          responsável pelo assunto.
                        </p>
                      )}

                      {r.avisos && r.avisos.length > 0 && (
                        <div className="fg-aviso-mudou" data-testid={ultimo ? 'box-avisos' : undefined}>
                          <strong>
                            <Icon nome="alerta" tamanho={15} /> Atenção: esta regra mudou
                          </strong>
                          <ul>
                            {r.avisos.map((aviso, idx) => (
                              <li key={idx} data-testid={ultimo ? `aviso-${idx}` : undefined}>
                                {aviso}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {r.citacoes.length > 0 && (
                        <div className="fg-citacoes" data-testid={ultimo ? 'secao-citacoes' : undefined}>
                          {r.citacoes.map((cit, idx) => (
                            <CitacaoCard key={`${cit.codigo}-${cit.secao}-${idx}`} citacao={cit} onSelect={(cod, ver, sec) => onNavegarDocumento(cod, ver, sec)} />
                          ))}
                        </div>
                      )}

                      <div className="fg-resposta-rodape">
                        {principal && (
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => onNavegarDocumento(principal.codigo, principal.versao, principal.secao)}>
                            Abrir {principal.codigo} na íntegra <Icon nome="link" tamanho={14} />
                          </button>
                        )}
                        <div className="fg-resposta-acoes">
                          {r.consta && principal && <IncluirRelatorio item={{ id: `resposta-${t.pergunta.slice(0, 40)}`, texto: r.resposta, fonte: principal }} />}
                          <button type="button" className="fg-link" onClick={() => copiar(r.resposta)}>
                            <Icon nome="copiar" tamanho={14} /> Copiar
                          </button>
                        </div>
                      </div>
                      <AvaliarResposta key={t.id} respostaId={`web-${t.id}`} perfil={perfil} />
                    </article>
                  </div>
                </div>
              );
            })}

            {carregando && (
              <div className="loading-state" data-testid="loading-perguntar">
                <div className="spinner"></div>
                <p>Buscando a resposta nos documentos em vigor…</p>
              </div>
            )}
            {erro && (
              <div className="alerta alerta-erro" role="alert" data-testid="msg-erro">
                <strong>Erro:</strong> {erro}
              </div>
            )}
            <div ref={fim} />
          </div>

          <form onSubmit={handleSubmit} className="fg-chat-form" role="search">
            <label htmlFor="input-pergunta" className="sr-only">
              Sua dúvida
            </label>
            <div className="fg-busca fg-chat-input">
              <Icon nome="busca" tamanho={18} />
              <textarea
                id="input-pergunta"
                data-testid="input-pergunta"
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    executarPergunta(pergunta, perfil);
                  }
                }}
                placeholder="Escreva sua dúvida sobre normas, cláusulas ou prazos..."
                rows={1}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm" data-testid="btn-enviar-pergunta" disabled={carregando || !pergunta.trim()}>
                {carregando ? 'Buscando…' : 'Consultar'} <Icon nome="enviar" tamanho={14} />
              </button>
            </div>
            <div className="fg-chat-form-rodape">
              <span className="fg-sub">
                <Icon nome="escudo" tamanho={14} /> Respostas formuladas exclusivamente com base em normas vigentes.
              </span>
              <label className="fg-perfil-chat">
                <span>Responder como</span>
                <select
                  id="select-perfil"
                  data-testid="select-perfil"
                  value={perfil || ''}
                  onChange={(e) => setPerfil((e.target.value as PerfilUsuario) || null)}
                >
                  <option value="">Geral</option>
                  {PERFIS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </label>
              {pergunta && (
                <button type="button" className="fg-link" onClick={() => setPergunta('')}>
                  Limpar campo
                </button>
              )}
            </div>
          </form>
        </section>

        <aside className="fg-coluna">
          <section className="fg-card">
            <div className="fg-cabeca-card">
              <h2>
                <Icon nome="duvida" tamanho={18} /> Perguntas Frequentes
              </h2>
            </div>
            <p className="fg-sub fg-espaco">Consultas recorrentes com respostas já validadas:</p>
            <ul className="fg-lista">
              {EXEMPLOS_PERGUNTAS.map((ex) => (
                <li key={ex.id}>
                  <button type="button" className="fg-lista-item" onClick={() => executarPergunta(ex.pergunta, perfil)} title={ex.descricao}>
                    <span className="fg-lista-texto">
                      <span>{ex.pergunta}</span>
                      <small>{FONTE_EXEMPLO[ex.id]}</small>
                    </span>
                    <Icon nome="seta" tamanho={14} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="fg-card">
            <div className="fg-cabeca-card">
              <h2>
                <Icon nome="tendencia" tamanho={18} /> Mais Consultados
              </h2>
              <a
                className="fg-link"
                href={url.catalogo()}
                onClick={(e) => {
                  e.preventDefault();
                  navegar(url.catalogo());
                }}
              >
                Ver catálogo
              </a>
            </div>
            <ul className="fg-lista">
              {MAIS_CONSULTADOS.map((d) => (
                <li key={d.codigo}>
                  <button type="button" className="fg-lista-item fg-lista-doc" onClick={() => onNavegarDocumento(d.codigo)}>
                    <span className="fg-icone fg-icone-sm" aria-hidden="true">
                      <Icon nome="documento" tamanho={16} />
                    </span>
                    <span className="fg-lista-doc-texto">
                      <strong>{d.codigo}</strong>
                      <small>{d.nome}</small>
                    </span>
                    <Icon nome="seta" tamanho={14} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};
