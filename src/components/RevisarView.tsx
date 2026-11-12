import React, { useState } from 'react';
import { navegar, url } from '../app/rotas';
import { acoes } from '../app/store';
import { LEITURA_FL, TEMAS } from '../mocks/v2';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { Aviso, CabecalhoTela, ProximaAcao, SemQuebra } from '../ui/componentes';
import { Icon } from '../ui/Icon';
import { lote } from './EnviarView';

/** T13 Revisar texto lido: uma pessoa confere a leitura antes de o texto virar fonte (RF25, RF26). */
export const RevisarView: React.FC<{ arquivoId: string }> = ({ arquivoId }) => {
  const arquivo = lote.ler().find((a) => a.id === arquivoId);
  const [linhas, setLinhas] = useState(LEITURA_FL.map((l) => ({ ...l })));
  const [conferidas, setConferidas] = useState<Record<number, boolean>>({});
  const [versao, setVersao] = useState('');
  const [tema, setTema] = useState(arquivo?.tema || 'ferias');
  const [publicado, setPublicado] = useState(false);
  const [erro, setErro] = useState('');

  const incertas = linhas.map((l, i) => (l.incerta ? i : -1)).filter((i) => i >= 0);
  const faltaConferir = incertas.filter((i) => !conferidas[i]).length;
  const versaoOk = /^\d+\.\d+\.\d+$/.test(versao);
  const falta = [
    faltaConferir ? `conferir ${faltaConferir} ${faltaConferir === 1 ? 'linha' : 'linhas'}` : '',
    versaoOk ? '' : 'preencher a Versão'
  ].filter(Boolean);

  if (!arquivo)
    return (
      <div className="view-container">
        <CabecalhoTela etiqueta="Conferir documento lido" titulo="Arquivo não encontrado" />
        <p>Este arquivo não está no lote atual. Envie de novo pela tela de envio.</p>
        <a className="btn btn-outline" href={url.enviar()} onClick={(e) => { e.preventDefault(); navegar(url.enviar()); }}>
          Ir para o envio
        </a>
      </div>
    );

  const publicar = () => {
    if (MOCK_DOCUMENTOS.some((d) => d.codigo === 'FL_1111-001' && d.versao === versao) && publicado) {
      setErro(`Já existe FL_1111-001 v${versao}. Altere a versão ou cancele.`);
      return;
    }
    acoes.publicarDigitalizado('FL_1111-001');
    lote.atualizar(arquivo.id, { estado: 'publicado', tema });
    setPublicado(true);
  };

  return (
    <div className="view-container revisar-view" data-testid="revisar-view">
      <CabecalhoTela
        etiqueta="Conferir documento lido"
        titulo={arquivo.nome}
        descricao="Confira a leitura antes de o texto virar fonte. As linhas incertas estão marcadas."
      />

      {publicado ? (
        <Aviso tipo="ok" testId="revisao-publicado">
          <strong>FL_1111-001 v{versao} publicado. Ele já pode ser citado.</strong>
          <div className="linha-botoes">
            <a className="btn btn-primary btn-sm" href={url.documento('FL_1111-001')} onClick={(e) => { e.preventDefault(); navegar(url.documento('FL_1111-001')); }}>
              Abrir documento
            </a>
            <a className="btn btn-outline btn-sm" href={url.enviar()} onClick={(e) => { e.preventDefault(); navegar(url.enviar()); }}>
              Próximo arquivo do lote
            </a>
          </div>
        </Aviso>
      ) : (
        <>
          <Aviso>Algumas linhas ficaram difíceis de ler. Confira os trechos marcados antes de publicar.</Aviso>

          <div className="grade-cartoes grade-2">
            <section className="painel-secao">
              <span className="badge-tag">Imagem da página</span>
              <div className="papel" role="img" aria-label="Foto da página do FL_1111-001">
                <strong>FL_1111-001 — Fluxograma de Férias</strong>
                {LEITURA_FL.map((l) => (
                  <span key={l.texto}>{l.texto.replace('av?so', 'aviso')}</span>
                ))}
              </div>
            </section>

            <section className="painel-secao">
              <span className="badge-tag">Texto lido</span>
              <ol className="linhas-lidas">
                {linhas.map((l, i) => (
                  <li key={i} className={l.incerta && !conferidas[i] ? 'linha-incerta' : ''}>
                    <label className="sr-only" htmlFor={`linha-${i}`}>
                      Linha {i + 1}
                    </label>
                    <input
                      id={`linha-${i}`}
                      value={l.texto}
                      onChange={(e) => setLinhas(linhas.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)))}
                    />
                    {l.incerta && (
                      <label className="conferi">
                        <span className="status-tag status-atencao">
                          <Icon nome="alerta" tamanho={12} /> incerta
                        </span>
                        <input
                          type="checkbox"
                          checked={!!conferidas[i]}
                          onChange={(e) => setConferidas({ ...conferidas, [i]: e.target.checked })}
                          data-testid={`conferi-${i}`}
                        />
                        Conferi
                      </label>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section className="painel-secao" aria-labelledby="t-cab">
            <h2 id="t-cab" className="secao-titulo">
              Cabeçalho sugerido
            </h2>
            <div className="grade-campos">
              {[
                ['Documento', 'Fluxo'],
                ['Título *', 'Fluxograma de Férias'],
                ['Sigla e Número *', 'FL_1111-001'],
                ['Fase', 'Vigente'],
                ['Vinculado a', 'PX_1111-001']
              ].map(([rotulo, valor]) => (
                <div className="campo" key={rotulo}>
                  <label htmlFor={`cab-${rotulo}`}>{rotulo}</label>
                  <input id={`cab-${rotulo}`} defaultValue={valor} />
                </div>
              ))}
              <div className="campo">
                <label htmlFor="cab-versao">Versão *</label>
                <input id="cab-versao" placeholder="ex.: 1.0.0" value={versao} onChange={(e) => (setVersao(e.target.value.trim()), setErro(''))} data-testid="input-versao" />
              </div>
              <div className="campo">
                <label htmlFor="cab-tema">Tema sugerido</label>
                <select id="cab-tema" value={tema} onChange={(e) => setTema(e.target.value)}>
                  {Object.entries(TEMAS).map(([id, nome]) => (
                    <option key={id} value={id}>
                      {nome}
                    </option>
                  ))}
                </select>
                <p className="texto-apoio"><SemQuebra texto="O cabeçalho lido diz “Vinculado a: PX_1111-001”, que se liga à NG_111." /></p>
              </div>
            </div>
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
            <ProximaAcao>
              <span className={falta.length ? 'erro-campo' : ''} data-testid="revisao-falta">
                {falta.length ? `Falta ${falta.join(' e ')}.` : 'Pronto para publicar.'}
              </span>
              <button type="button" className="btn btn-primary" disabled={falta.length > 0} onClick={publicar} data-testid="btn-publicar-revisao">
                Publicar
              </button>
            </ProximaAcao>
          </section>
        </>
      )}
    </div>
  );
};
