import React, { useEffect, useState } from 'react';
import { PerfilUsuario, RespostaPerguntar } from '../api/types';
import { postPerguntar } from '../api/client';
import { CitacaoCard } from './CitacaoCard';
import { EXEMPLOS_PERGUNTAS } from '../mocks/perguntas';
import { acoes, useEstado } from '../app/store';
import { AvaliarResposta, IncluirRelatorio, ProximaAcao } from '../ui/componentes';
import { PERFIS } from './perfis';

interface PerguntarViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
  /** Pergunta vinda da rota /perguntar?q= (topo, Visão geral, Slack, Teams). */
  perguntaInicial?: string;
}

export const PerguntarView: React.FC<PerguntarViewProps> = ({ onNavegarDocumento, perguntaInicial }) => {
  const [pergunta, setPergunta] = useState<string>(perguntaInicial ?? '');
  // Perfil global (T0): lembrado no navegador e compartilhado com o topo
  const perfil = useEstado((e) => e.perfil);
  const setPerfil = (p: PerfilUsuario) => acoes.definirPerfil(p);
  const [respostaId, setRespostaId] = useState(0);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [resposta, setResposta] = useState<RespostaPerguntar | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const executarPergunta = async (texto: string, perfilSelecionado: PerfilUsuario) => {
    if (!texto.trim()) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await postPerguntar(texto, perfilSelecionado);
      setResposta(res);
      setRespostaId((n) => n + 1);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao processar pergunta');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (perguntaInicial) executarPergunta(perguntaInicial, perfil);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perguntaInicial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executarPergunta(pergunta, perfil);
  };

  const selecionarExemplo = (texto: string) => {
    setPergunta(texto);
    executarPergunta(texto, perfil);
  };

  return (
    <div className="view-container pergunte-view">
      <div className="view-header">
        <h1 className="view-title">Tire sua dúvida</h1>
        <p className="subtitle">
          Escreva sua dúvida com suas palavras. A resposta mostra de qual documento e de qual
          item veio. Se os documentos não tratarem do assunto, nós avisamos.
        </p>
      </div>

      <div className="exemplos-banner">
        <span className="exemplos-title">Exemplos de perguntas:</span>
        <div className="exemplos-buttons">
          {EXEMPLOS_PERGUNTAS.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className="btn-exemplo"
              onClick={() => selecionarExemplo(ex.pergunta)}
              title={ex.descricao}
            >
              {ex.pergunta}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-perguntar" role="search">
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="input-pergunta">Sua dúvida:</label>
            <textarea
              id="input-pergunta"
              data-testid="input-pergunta"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Ex.: Qual a antecedência mínima para solicitar férias?"
              rows={3}
              required
            />
          </div>

          <div className="perfil-group">
            <label htmlFor="select-perfil">Responder como:</label>
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
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            data-testid="btn-enviar-pergunta"
            disabled={carregando || !pergunta.trim()}
          >
            {carregando ? 'Buscando nos documentos…' : 'Perguntar'}
          </button>
          {pergunta && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setPergunta('');
                setResposta(null);
                setErro(null);
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </form>

      {erro && (
        <div className="alerta alerta-erro" role="alert" data-testid="msg-erro">
          <strong>Erro:</strong> {erro}
        </div>
      )}

      {carregando && (
        <div className="loading-state" data-testid="loading-perguntar">
          <div className="spinner"></div>
          <p>Buscando a resposta nos documentos em vigor…</p>
        </div>
      )}

      {resposta && !carregando && (
        <div className="resultado-pergunta" data-testid="resultado-pergunta">
          {resposta.consta ? (
            <div className="resposta-box resposta-consta">
              <div className="resposta-header">
                <h3>Resposta</h3>
                <span className="badge badge-vigente">Com fonte</span>
              </div>
              <p className="resposta-texto" data-testid="texto-resposta">
                {resposta.resposta}
              </p>
            </div>
          ) : (
            <div
              className="resposta-box resposta-nao-consta"
              data-testid="alerta-nao-consta"
            >
              <div className="resposta-header">
                <h3>Os documentos não tratam deste assunto</h3>
                <span className="badge badge-abstenção">Sem resposta inventada</span>
              </div>
              <p className="resposta-texto" data-testid="texto-resposta">
                {resposta.resposta}
              </p>
              <div className="nao-consta-dica">
                <p>
                  Para não errar, só respondemos com o que está escrito nos documentos. Tente perguntar
                  de outro jeito ou procure a área responsável pelo assunto.
                </p>
              </div>
            </div>
          )}

          {resposta.avisos && resposta.avisos.length > 0 && (
            <div className="avisos-box" data-testid="box-avisos">
              <h4>Atenção: esta regra mudou</h4>
              <ul>
                {resposta.avisos.map((aviso, idx) => (
                  <li key={idx} className="aviso-item" data-testid={`aviso-${idx}`}>
                    {aviso}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resposta.citacoes && resposta.citacoes.length > 0 && (
            <div className="citacoes-secao" data-testid="secao-citacoes">
              <h4>
                De onde veio a resposta ({resposta.citacoes.length})
              </h4>
              <p className="instrucao-clique">
                Toque numa fonte para ler o texto original do documento.
              </p>
              <div className="citacoes-grid">
                {resposta.citacoes.map((cit, idx) => (
                  <CitacaoCard
                    key={`${cit.codigo}-${cit.secao}-${idx}`}
                    citacao={cit}
                    onSelect={(cod, ver, sec) => onNavegarDocumento(cod, ver, sec)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="resposta-rodape">
            {resposta.consta && resposta.citacoes[0] && (
              <IncluirRelatorio
                item={{
                  id: `resposta-${pergunta.slice(0, 40)}`,
                  texto: resposta.resposta,
                  fonte: resposta.citacoes[0]
                }}
              />
            )}
            <AvaliarResposta key={respostaId} respostaId={`web-${respostaId}`} perfil={perfil} />
          </div>
          <ProximaAcao
            texto={
              resposta.consta
                ? 'Abra a citação para ler o trecho completo na fonte.'
                : 'Reformule a pergunta ou consulte o catálogo de documentos.'
            }
          />
        </div>
      )}
    </div>
  );
};
