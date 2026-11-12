import React, { useState, useSyncExternalStore } from 'react';
import { ArquivoLote } from '../api/types';
import { enviarLote } from '../api/client';
import { navegar, url } from '../app/rotas';
import { LEITURA_FL, LOTE_EXEMPLO, TEMAS } from '../mocks/v2';
import { Aviso, CabecalhoTela, SemQuebra } from '../ui/componentes';
import { Icon } from '../ui/Icon';

/* Lote atual guardado fora do componente, para a revisão (T13) voltar à mesma tabela. */
let loteAtual: ArquivoLote[] = [];
const ouvintes = new Set<() => void>();
export const lote = {
  ler: () => loteAtual,
  definir(l: ArquivoLote[]) {
    loteAtual = l;
    ouvintes.forEach((f) => f());
  },
  atualizar(id: string, parcial: Partial<ArquivoLote>) {
    lote.definir(loteAtual.map((a) => (a.id === id ? { ...a, ...parcial } : a)));
  }
};
const useLote = () =>
  useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => loteAtual
  );

const ROTULO: Record<ArquivoLote['estado'], string> = {
  enviando: 'Enviando',
  classificado: 'Classificado',
  'sem-tema': 'Sem tema',
  revisar: 'Revisar texto',
  publicado: 'Publicado',
  erro: 'Erro'
};
const PILULA: Record<ArquivoLote['estado'], string> = {
  enviando: 'neutra',
  classificado: 'ok',
  'sem-tema': 'aviso',
  revisar: '',
  publicado: 'ok',
  erro: 'perigo'
};

/** T12 Enviar em lote e digitalizar (RF23, RF24, RF35, RF36). */
export const EnviarView: React.FC = () => {
  const arquivos = useLote();
  const [enviando, setEnviando] = useState(false);
  const [sobre, setSobre] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  const enviar = async (lista: { nome: string; tamanho: number; arquivo?: File }[]) => {
    setMsg(null);
    if (lista.length > 20) return setMsg({ ok: false, texto: 'Envie até 20 arquivos por lote.' });
    if (lista.reduce((s, a) => s + a.tamanho, 0) > 50 * 1048576)
      return setMsg({ ok: false, texto: 'O lote passa de 50 MB. Divida em dois envios.' });
    setEnviando(true);
    try {
      lote.definir(await enviarLote(lista));
    } catch (e) {
      setMsg({ ok: false, texto: e instanceof Error ? e.message : 'Não conseguimos enviar o lote.' });
    } finally {
      setEnviando(false);
    }
  };

  const doArquivo = (files: FileList | null) => files && enviar([...files].map((f) => ({ nome: f.name, tamanho: f.size, arquivo: f })));

  const publicar = () => {
    const semTema = arquivos.filter((a) => a.tipo === 'digital' && a.estado === 'sem-tema');
    const prontos = arquivos.filter((a) => a.tipo === 'digital' && a.estado === 'classificado');
    prontos.forEach((a) => lote.atualizar(a.id, { estado: 'publicado' }));
    const fotos = arquivos.filter((a) => a.estado === 'revisar').length;
    const partes = [
      prontos.length ? `${prontos.length} ${prontos.length === 1 ? 'documento digital publicado' : 'documentos digitais publicados'}.` : '',
      semTema.length ? `Escolha o tema de ${semTema.map((a) => a.nome).join(', ')} antes de publicar.` : '',
      fotos ? `${fotos} ${fotos === 1 ? 'foto segue' : 'fotos seguem'} para a revisão.` : ''
    ].filter(Boolean);
    setMsg({ ok: !semTema.length, texto: partes.join(' ') || 'Nada para publicar agora.' });
  };

  const prontos = arquivos.filter((a) => a.estado === 'classificado' || a.estado === 'publicado').length;
  const pendentes = arquivos.filter((a) => a.estado === 'revisar' || a.estado === 'sem-tema').length;
  const publicados = arquivos.filter((a) => a.estado === 'publicado').length;
  const semTema = arquivos.filter((a) => a.estado === 'sem-tema').length;
  const fotos = arquivos.filter((a) => a.estado === 'revisar').length;
  const erros = arquivos.filter((a) => a.estado === 'erro').length;
  const passo = publicados > 0 ? 3 : arquivos.length > 0 ? 2 : 1;
  const PASSOS = ['Envio dos arquivos', 'Tema e conferência', 'Publicação no arquivo'];

  return (
    <div className="view-container enviar-view" data-testid="enviar-view">
      <CabecalhoTela
        etiqueta="Protocolo digital"
        titulo="Protocolar Novos Documentos"
        descricao="Envie um ou vários documentos de uma vez. O tema é sugerido pelo código e você confirma antes de publicar. Fotos passam pela revisão de uma pessoa."
        acoes={
          <a
            className="btn btn-outline btn-sm"
            href={url.catalogo()}
            onClick={(e) => {
              e.preventDefault();
              navegar(url.catalogo());
            }}
          >
            <Icon nome="historico" tamanho={16} /> Ver documentos
          </a>
        }
      />

      <ol className="fg-card fg-passos" aria-label="Etapas do envio">
        {PASSOS.map((p, i) => {
          const n = i + 1;
          const estado = n < passo ? 'feito' : n === passo ? 'atual' : 'depois';
          return (
            <li key={p} className={`fg-passo fg-passo-${estado}`} aria-current={estado === 'atual' ? 'step' : undefined}>
              <span className="fg-passo-marca" aria-hidden="true">
                {estado === 'feito' ? <Icon nome="check" tamanho={14} /> : n}
              </span>
              <span>
                <small>
                  Passo {n}
                  {estado === 'atual' ? ' · em andamento' : ''}
                </small>
                <strong>{p}</strong>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="fg-enviar-grade">
        <div className="fg-coluna">
          <section className="fg-card">
            <div className="fg-cabeca-card">
              <div>
                <h2>Arquivos do lote</h2>
                <p className="fg-sub">PDF, Markdown ou foto da página inteira.</p>
              </div>
              {arquivos.length > 0 && <span className="fg-pilula ok">{arquivos.length} recebidos</span>}
            </div>

            <div
              className={`area-soltar fg-soltar ${sobre ? 'sobre' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setSobre(true);
              }}
              onDragLeave={() => setSobre(false)}
              onDrop={(e) => {
                e.preventDefault();
                setSobre(false);
                doArquivo(e.dataTransfer.files);
              }}
            >
              <span className="fg-icone" aria-hidden="true">
                <Icon nome="enviar" tamanho={22} />
              </span>
              <p>
                <strong>Solte aqui PDFs, Markdown ou fotos</strong>
                <br />
                <span className="fg-sub">Até 20 arquivos · 10 MB cada · 50 MB no total</span>
              </p>
              <div className="linha-botoes">
                <label className="btn btn-outline btn-sm" htmlFor="arquivos-lote">
                  Escolher arquivos
                </label>
                <input id="arquivos-lote" type="file" multiple className="sr-only" onChange={(e) => doArquivo(e.target.files)} />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  data-testid="btn-lote-exemplo"
                  onClick={() => enviar(LOTE_EXEMPLO.map(([nome, tamanho]) => ({ nome, tamanho })))}
                >
                  Usar lote de exemplo
                </button>
              </div>
            </div>

            {enviando && (
              <div className="loading-state" aria-busy="true">
                <div className="spinner"></div>
                <p>Enviando e lendo os arquivos…</p>
              </div>
            )}

            {msg && <Aviso tipo={msg.ok ? 'ok' : 'aviso'}>{msg.texto}</Aviso>}

            {arquivos.length > 0 && !enviando && (
              <div className="fg-lote" aria-labelledby="t-lote">
                <h3 id="t-lote" className="sr-only">
                  Lote
                </h3>
                <p aria-live="polite" data-testid="lote-resumo" className="fg-sub">
                  <strong>
                    {prontos} de {arquivos.length} arquivos prontos.
                  </strong>{' '}
                  {pendentes ? `${pendentes} ${pendentes === 1 ? 'precisa' : 'precisam'} da sua revisão.` : ''}
                </p>
                <div className="tabela-responsiva">
                  <table className="tabela-documentos fg-tabela tabela-lote">
                    <thead>
                      <tr>
                        <th>Arquivo</th>
                        <th>Tipo</th>
                        <th>Situação</th>
                        <th>Tema sugerido</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arquivos.map((a) => (
                        <tr key={a.id} data-testid={`lote-${a.nome}`}>
                          <td>
                            <span className="fg-arquivo">
                              <Icon nome={a.tipo === 'foto' ? 'olho' : 'documento'} tamanho={15} />
                              <SemQuebra texto={a.nome} />
                            </span>
                          </td>
                          <td>{a.tipo === 'desconhecido' ? '—' : a.tipo}</td>
                          <td>
                            <span className={`fg-pilula ${PILULA[a.estado]}`}>{ROTULO[a.estado]}</span>
                            {a.erro && <p className="erro-campo">{a.erro}</p>}
                          </td>
                          <td>
                            {a.estado === 'erro' ? (
                              '—'
                            ) : (
                              <>
                                <label className="sr-only" htmlFor={`tema-${a.id}`}>
                                  Tema de {a.nome}
                                </label>
                                <select
                                  id={`tema-${a.id}`}
                                  className="fg-select fg-select-sm"
                                  value={a.tema}
                                  disabled={a.estado === 'publicado'}
                                  onChange={(e) =>
                                    lote.atualizar(a.id, {
                                      tema: e.target.value,
                                      estado: e.target.value
                                        ? a.estado === 'sem-tema'
                                          ? 'classificado'
                                          : a.estado
                                        : a.estado === 'classificado'
                                        ? 'sem-tema'
                                        : a.estado,
                                      motivo: e.target.value && a.estado === 'sem-tema' ? 'Tema escolhido por você.' : a.motivo
                                    })
                                  }
                                >
                                  <option value="">Escolha um tema</option>
                                  {Object.entries(TEMAS).map(([id, nome]) => (
                                    <option key={id} value={id}>
                                      {nome}
                                    </option>
                                  ))}
                                </select>
                                {a.motivo && (
                                  <p className="fg-doc-sub">
                                    {a.tema && a.motivo !== 'Tema escolhido por você.' ? 'Sugerido porque ' : ''}
                                    <SemQuebra texto={a.motivo} />
                                  </p>
                                )}
                              </>
                            )}
                          </td>
                          <td>
                            {a.estado === 'revisar' && (
                              <a
                                className="btn btn-primary btn-sm"
                                href={url.revisar(a.id)}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navegar(url.revisar(a.id));
                                }}
                              >
                                Revisar texto
                              </a>
                            )}
                            {a.estado === 'erro' && (
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => lote.definir(arquivos.filter((x) => x.id !== a.id))}>
                                Retirar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="fg-coluna">
          <section className="fg-card">
            <div className="fg-cabeca-card">
              <h2>
                <Icon nome="escudo" tamanho={18} /> Pré-Auditoria
              </h2>
              {arquivos.length > 0 && <span className={`fg-pilula ${pendentes || erros ? 'aviso' : 'ok'}`}>{pendentes || erros ? `${pendentes + erros} pendentes` : 'Tudo conforme'}</span>}
            </div>
            <p className="fg-sub fg-espaco">Conferência antes de publicar no arquivo.</p>
            <ul className="fg-checagens">
              <li className={arquivos.length && prontos === arquivos.length ? 'ok' : ''}>
                <Icon nome="marca" tamanho={18} />
                <span>
                  <strong>Tema confirmado</strong>
                  <small>{arquivos.length ? `${prontos} de ${arquivos.length} classificados` : 'Envie arquivos para conferir'}</small>
                </span>
              </li>
              <li className={arquivos.length && !semTema ? 'ok' : semTema ? 'aviso' : ''}>
                <Icon nome="marca" tamanho={18} />
                <span>
                  <strong>Sem tema</strong>
                  <small>{semTema ? `${semTema} esperando sua escolha` : 'Nenhum pendente'}</small>
                </span>
              </li>
              <li className={fotos ? 'aviso' : arquivos.length ? 'ok' : ''}>
                <Icon nome="marca" tamanho={18} />
                <span>
                  <strong>Fotos para revisar</strong>
                  <small>{fotos ? `${fotos} seguem para a revisão de uma pessoa` : 'Nenhuma'}</small>
                </span>
              </li>
              <li className={erros ? 'perigo' : arquivos.length ? 'ok' : ''}>
                <Icon nome="marca" tamanho={18} />
                <span>
                  <strong>Arquivos com erro</strong>
                  <small>{erros ? `${erros} não puderam ser lidos` : 'Nenhum'}</small>
                </span>
              </li>
            </ul>
          </section>

          {arquivos.length === 0 && !enviando && (
            <section className="fg-card">
              <p className="fg-rotulo">Exemplo de foto</p>
              <div className="papel" aria-hidden="true">
                <strong>FL_1111-001 — Fluxograma de Férias</strong>
                {LEITURA_FL.slice(3, 7).map((l) => (
                  <span key={l.texto}>{l.texto.replace('av?so', 'aviso')}</span>
                ))}
              </div>
              <p className="fg-sub">Foto da página inteira, com boa luz.</p>
            </section>
          )}
        </aside>
      </div>

      {arquivos.length > 0 && !enviando && (
        <div className="fg-card fg-barra-acao">
          <span className="fg-sub">
            <Icon nome="info" tamanho={16} /> Publica os digitais classificados. Fotos seguem para a revisão, uma a uma.
          </span>
          <div className="fg-mudanca-acoes">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => (lote.definir([]), setMsg(null))}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={publicar} data-testid="btn-publicar-lote">
              <Icon nome="marca" tamanho={16} /> Confirmar temas e publicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
