import React, { useEffect, useState } from 'react';
import { SimulacaoResultado } from '../api/types';
import { postSimular } from '../api/client';
import { navegar, url } from '../app/rotas';
import { acoes } from '../app/store';
import { Aviso, CabecalhoTela, FonteChip, IncluirRelatorio, ProximaAcao, SemQuebra } from '../ui/componentes';
import { Icon } from '../ui/Icon';

const REGRA = 'ferias_antecedencia_dias';
const MIN = 1;
const MAX = 90;

/** T6 E se?: testar uma mudança de regra antes de publicar. Datas e conflitos calculados sem IA. */
export const ESeView: React.FC<{ valorInicial?: number }> = ({ valorInicial = 30 }) => {
  const [bruto, setBruto] = useState(String(valorInicial));
  const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
  const [erroApi, setErroApi] = useState<string | null>(null);

  const n = Number(bruto);
  const valido = bruto.trim() !== '' && Number.isInteger(n) && n >= MIN && n <= MAX;

  useEffect(() => {
    if (!valido) return;
    let ativo = true;
    postSimular(REGRA, n)
      .then((r) => ativo && (setResultado(r), setErroApi(null)))
      .catch((e) => ativo && setErroApi(e instanceof Error ? e.message : 'Erro na simulação'));
    navegar(url.ese(REGRA, n), true);
    return () => {
      ativo = false;
    };
  }, [n, valido]);

  const conflitos = resultado?.impactos.filter((i) => i.tipo !== 'revisar_documento') ?? [];
  const revisar = resultado?.impactos.filter((i) => i.tipo === 'revisar_documento') ?? [];

  return (
    <div className="view-container ese-view" data-testid="ese-view">
      <div className="faixa-simulacao" role="note">
        <Icon nome="alerta" tamanho={16} /> Simulação: nada muda nos documentos até a norma ser revisada.
      </div>

      <CabecalhoTela
        etiqueta="Simulação"
        titulo="E se a regra mudar?"
        descricao="Mude o número de dias e veja o que aconteceria com os prazos das férias. Nada muda nos documentos."
      />

      <div className="grade-cartoes grade-2">
        <section className="painel-secao">
          <span className="badge-tag">Regra</span>
          <p>
            Antecedência para pedir férias. Hoje: <strong>45 dias</strong>
          </p>
          <FonteChip fonte={{ codigo: 'NG_111', versao: '3.0.0', secao: '4.3' }} />
          <div className="campo-simulacao">
            <label htmlFor="ese-valor">Quantos dias antes pedir as férias?</label>
            <div className="campo-simulacao-linha">
              <input
                type="range"
                min={MIN}
                max={MAX}
                value={valido ? n : 45}
                onChange={(e) => setBruto(e.target.value)}
                aria-label="Novo valor em dias"
              />
              <input
                id="ese-valor"
                type="number"
                min={MIN}
                max={MAX}
                value={bruto}
                onChange={(e) => setBruto(e.target.value)}
                aria-invalid={!valido}
                aria-describedby={!valido ? 'ese-erro' : undefined}
                data-testid="input-ese-valor"
              />
            </div>
            {!valido && (
              <p id="ese-erro" className="erro-campo" role="alert">
                Use um número entre 1 e 90 dias.
              </p>
            )}
          </div>
          <p className="texto-apoio">Exemplo: férias a partir de 05/05/2027, como no Anexo C da NG_111.</p>
        </section>

        <section className="painel-secao" aria-live="polite">
          <span className="badge-tag">Resultado</span>
          {erroApi ? (
            <Aviso tipo="erro">{erroApi}</Aviso>
          ) : !valido || !resultado ? (
            <p className="texto-apoio">Corrija o valor para ver a simulação.</p>
          ) : (
            <>
              <p className="resultado-resumo" data-testid="ese-resumo">
                <SemQuebra texto={resultado.resumo} />
              </p>
              {n !== 45 && (
                <div className="linha-botoes">
                  <span className={`status-tag ${conflitos.length ? 'status-divergente' : 'status-vigente'}`} data-testid="ese-conflitos">
                    {conflitos.length
                      ? `${conflitos.length} ${conflitos.length === 1 ? 'regra fica' : 'regras ficam'} em conflito`
                      : 'Sem conflito de prazos'}
                  </span>
                  <span className="status-tag status-atencao">Revisar {revisar.length} documentos antes de publicar</span>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {valido && resultado && (
        <>
          <section className="painel-secao" aria-labelledby="t-linha">
            <h2 id="t-linha" className="secao-titulo">
              Linha do tempo antes e depois
            </h2>
            <div className="tabela-responsiva">
              <table className="tabela-documentos tabela-simulacao" data-testid="ese-linha-tempo">
                <thead>
                  <tr>
                    <th>Etapa</th>
                    <th>Hoje (45 dias)</th>
                    <th>Simulado ({n} dias)</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.linha_do_tempo.map((l) => (
                    <tr key={l.etapa} className={l.conflito ? 'linha-conflito' : l.muda ? 'linha-muda' : ''}>
                      <td>{l.etapa}</td>
                      <td>{l.atual}</td>
                      <td>{l.simulado}</td>
                      <td>
                        {l.conflito ? (
                          <span className="status-tag status-divergente">
                            <Icon nome="alerta" tamanho={13} /> Conflito
                          </span>
                        ) : l.muda ? (
                          <span className="status-tag status-atencao">Muda</span>
                        ) : (
                          <span className="texto-apoio">Sem mudança</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {n !== 45 && (
            <div className="grade-cartoes grade-2">
              <section className="painel-secao">
                <h2 className="secao-titulo">Conflitos ({conflitos.length})</h2>
                {conflitos.length ? (
                  <ul className="lista-impactos">
                    {conflitos.map((c) => (
                      <li key={c.tipo}>
                        <p>{c.descricao}</p>
                        <FonteChip fonte={c.fonte} curto />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="texto-apoio">Nenhum prazo fica em conflito.</p>
                )}
              </section>
              <section className="painel-secao">
                <h2 className="secao-titulo">Documentos a revisar ({revisar.length})</h2>
                <p className="texto-apoio">Só documentos vigentes que tratam da antecedência.</p>
                <div className="linha-fontes">
                  {revisar.map((r) => (
                    <FonteChip key={r.fonte.codigo} fonte={r.fonte} curto />
                  ))}
                </div>
              </section>
            </div>
          )}

          {n !== 45 && (
            <>
              <IncluirRelatorio
                item={{
                  id: `simulacao-${n}`,
                  texto: `Simulação hipotética: ${resultado.resumo}${conflitos.length ? ` ${conflitos.length} regras ficam em conflito.` : ''}`,
                  fonte: { codigo: 'NG_111', versao: '3.0.0', secao: '4.5' },
                  hipotetico: true
                }}
              />
              <ProximaAcao texto={resultado.proxima_acao}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  data-testid="btn-encaminhar-simulacao"
                  onClick={() =>
                    acoes.abrirDecisao({
                      item: `Simulação: antecedência de férias 45 → ${n} dias`,
                      fontes: [{ codigo: 'NG_111', versao: '3.0.0', secao: '4.5' }],
                      responsavel: 'GGC'
                    })
                  }
                >
                  Encaminhar à GGC
                </button>
                <a
                  className="btn btn-outline btn-sm"
                  href={url.documento('NG_111', '3.0.0', '4.5')}
                  onClick={(e) => {
                    e.preventDefault();
                    navegar(url.documento('NG_111', '3.0.0', '4.5'));
                  }}
                >
                  Revisar documentos
                </a>
              </ProximaAcao>
            </>
          )}
        </>
      )}
    </div>
  );
};
