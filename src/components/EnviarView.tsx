import React, { useState, useSyncExternalStore } from 'react';
import { ArquivoLote } from '../api/types';
import { enviarLote } from '../api/client';
import { navegar, url } from '../app/rotas';
import { LEITURA_FL, LOTE_EXEMPLO, TEMAS } from '../mocks/v2';
import { Aviso, CabecalhoTela, ProximaAcao, SemQuebra } from '../ui/componentes';
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
const CLASSE: Record<ArquivoLote['estado'], string> = {
  enviando: 'status-neutro',
  classificado: 'status-vigente',
  'sem-tema': 'status-atencao',
  revisar: 'status-info',
  publicado: 'status-vigente',
  erro: 'status-divergente'
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

  return (
    <div className="view-container enviar-view" data-testid="enviar-view">
      <CabecalhoTela
        etiqueta="Enviar documentos"
        titulo="Enviar em lote e digitalizar"
        descricao="Traga um ou vários documentos de uma vez. O tema é sugerido pelo código e você confirma antes de publicar. Fotos passam pela revisão de uma pessoa."
      />

      <div
        className={`area-soltar ${sobre ? 'sobre' : ''}`}
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
        <Icon nome="arquivo" tamanho={28} />
        <p>
          <strong>Solte aqui PDFs, Markdown ou fotos</strong>
          <br />
          <span className="texto-apoio">Até 20 arquivos · 10 MB cada · 50 MB no total</span>
        </p>
        <div className="linha-botoes">
          <label className="btn btn-outline" htmlFor="arquivos-lote">
            Escolher arquivos
          </label>
          <input id="arquivos-lote" type="file" multiple className="sr-only" onChange={(e) => doArquivo(e.target.files)} />
          <button
            type="button"
            className="btn btn-primary"
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
        <section className="painel-secao" aria-labelledby="t-lote">
          <div className="secao-titulo-wrap">
            <h2 id="t-lote" className="secao-titulo">
              Lote
            </h2>
            <p aria-live="polite" data-testid="lote-resumo">
              <strong>
                {prontos} de {arquivos.length} arquivos prontos.
              </strong>{' '}
              {pendentes ? `${pendentes} ${pendentes === 1 ? 'precisa' : 'precisam'} da sua revisão.` : ''}
            </p>
          </div>
          <div className="tabela-responsiva">
            <table className="tabela-documentos tabela-lote">
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
                    <td>{a.nome}</td>
                    <td>{a.tipo === 'desconhecido' ? '—' : a.tipo}</td>
                    <td>
                      <span className={`status-tag ${CLASSE[a.estado]}`}>{ROTULO[a.estado]}</span>
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
                            <p className="texto-apoio">
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
          <ProximaAcao>
            <button type="button" className="btn btn-primary" onClick={publicar} data-testid="btn-publicar-lote">
              Confirmar temas e publicar
            </button>
            <span className="texto-apoio">Publica os digitais classificados. Fotos seguem para a revisão, uma a uma.</span>
          </ProximaAcao>
        </section>
      )}

      {arquivos.length === 0 && !enviando && (
        <section className="painel-secao">
          <span className="badge-tag">Exemplo de foto</span>
          <div className="papel" aria-hidden="true">
            <strong>FL_1111-001 — Fluxograma de Férias</strong>
            {LEITURA_FL.slice(3, 7).map((l) => (
              <span key={l.texto}>{l.texto.replace('av?so', 'aviso')}</span>
            ))}
          </div>
          <p className="texto-apoio">Foto da página inteira, com boa luz.</p>
        </section>
      )}
    </div>
  );
};
