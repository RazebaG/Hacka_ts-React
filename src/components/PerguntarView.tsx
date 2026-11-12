import React, { useState } from 'react';
import { PerfilUsuario, RespostaPerguntar } from '../api/types';
import { postPerguntar } from '../api/client';
import { CitacaoCard } from './CitacaoCard';
import { EXEMPLOS_PERGUNTAS } from '../mocks/perguntas';

interface PerguntarViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
}

export const PerguntarView: React.FC<PerguntarViewProps> = ({ onNavegarDocumento }) => {
  const [pergunta, setPergunta] = useState<string>('');
  const [perfil, setPerfil] = useState<PerfilUsuario>(null);
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
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao processar pergunta');
    } finally {
      setCarregando(false);
    }
  };

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
        <h2>Pergunte ao Acervo Central de Normas</h2>
        <p className="subtitle">
          Respostas confiáveis extraídas exclusivamente de documentos vigentes, com citação
          auditável de fontes e abstenção explícita quando a informação não constar nos autos.
        </p>
      </div>

      <div className="exemplos-banner">
        <span className="exemplos-title">Cenários rápidos da demonstração:</span>
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
            <label htmlFor="input-pergunta">Pergunta:</label>
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
            <label htmlFor="select-perfil">Perfil do Usuário (opcional):</label>
            <select
              id="select-perfil"
              data-testid="select-perfil"
              value={perfil || ''}
              onChange={(e) => setPerfil((e.target.value as PerfilUsuario) || null)}
            >
              <option value="">Geral / Sem restrição</option>
              <option value="empregado">Empregado</option>
              <option value="gestor">Gestor Imediato</option>
              <option value="ggc">GGC (Gente e Cultura)</option>
              <option value="gfi">GFI (Finanças)</option>
              <option value="gco">GCO (Contratos)</option>
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
            {carregando ? 'Consultando acervo...' : 'Consultar Acervo'}
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
          <p>Localizando trechos normativos e checando vigência das normas...</p>
        </div>
      )}

      {resposta && !carregando && (
        <div className="resultado-pergunta" data-testid="resultado-pergunta">
          {resposta.consta ? (
            <div className="resposta-box resposta-consta">
              <div className="resposta-header">
                <h3>Resposta Baseada no Acervo Vigente</h3>
                <span className="badge badge-vigente">Fonte Verificada</span>
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
                <h3>Informação Não Consta nas Fontes</h3>
                <span className="badge badge-abstenção">Abstenção Segura</span>
              </div>
              <p className="resposta-texto" data-testid="texto-resposta">
                {resposta.resposta}
              </p>
              <div className="nao-consta-dica">
                <p>
                  <strong>Diretriz de Confiabilidade:</strong> O assistente não formula
                  suposições ou alucinações regulamentares quando a regra não está documentada
                  no acervo oficial.
                </p>
              </div>
            </div>
          )}

          {resposta.avisos && resposta.avisos.length > 0 && (
            <div className="avisos-box" data-testid="box-avisos">
              <h4>Avisos Normativos de Substituição:</h4>
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
                Citações Oficiais de Apoio ({resposta.citacoes.length}):
              </h4>
              <p className="instrucao-clique">
                Clique em qualquer citação para inspecionar o trecho original no documento:
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
        </div>
      )}
    </div>
  );
};
