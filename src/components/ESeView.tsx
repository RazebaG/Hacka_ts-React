import React, { useEffect, useState } from 'react';
import { FontesBase } from './PainelFontes';
import { SimulacaoResultado } from '../api/types';
import { postSimular } from '../api/client';
import { navegar, url } from '../app/rotas';
import { acoes } from '../app/store';
import { Aviso, CabecalhoTela, FonteLink, IncluirRelatorio, SemQuebra } from '../ui/componentes';
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
      <CabecalhoTela
        etiqueta="Simulador ativo"
        titulo="Simulador de Impacto Normativo"
        descricao="Simule alterações em regras, prazos ou valores e veja os desdobramentos nas demais normas."
        acoes={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => undefined)}>
              <Icon nome="link" tamanho={16} /> Copiar link do cenário
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Icon nome="baixar" tamanho={16} /> Exportar Estudo
            </button>
          </>
        }
      />
      <FontesBase fontes={[{ codigo: 'NG_111', versao: '3.0.0' }, ...(resultado?.impactos.map((i) => i.fonte) ?? [])]} />

      <div className="fg-faixa-info" role="note">
        <Icon nome="info" tamanho={16} /> Simulação: nada muda nos documentos até a norma ser revisada.
      </div>

      <div className="fg-ese-grade">
        <div className="fg-coluna">
          <section className="fg-card">
            <div className="fg-cabeca-card">
              <h2>Configuração do Cenário</h2>
              <span className="fg-sub">#SIM-{n}</span>
            </div>
            <div className="fg-ese-passo">
              <p className="fg-ese-passo-rotulo">
                1. Documento alvo <span className="fg-pilula ok">Vigente (v3.0.0)</span>
              </p>
              <div className="fg-ese-campo-fixo">
                <Icon nome="documento" tamanho={16} /> NG_111 · Férias
              </div>
            </div>
            <div className="fg-ese-passo">
              <p className="fg-ese-passo-rotulo">2. Parâmetro a alterar</p>
              <div className="fg-ese-campo-fixo">
                <Icon nome="calendario" tamanho={16} /> Item 4.3 · Prazo de antecedência para pedir férias
              </div>
            </div>
            <div className="fg-ese-passo">
              <p className="fg-ese-passo-rotulo">3. Novo valor testado</p>
              <div className="fg-ese-valores">
                <div className="fg-ese-valor">
                  <span className="fg-rotulo">Atual</span>
                  <strong>45 dias</strong>
                </div>
                <div className="fg-ese-valor fg-ese-valor-sim">
                  <label htmlFor="ese-valor" className="fg-rotulo">
                    Simulado
                  </label>
                  <span className="fg-ese-input">
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
                    dias
                  </span>
                </div>
              </div>
              <input
                type="range"
                className="fg-ese-range"
                min={MIN}
                max={MAX}
                value={valido ? n : 45}
                onChange={(e) => setBruto(e.target.value)}
                aria-label="Novo valor em dias"
              />
              {!valido ? (
                <p id="ese-erro" className="erro-campo" role="alert">
                  Use um número entre 1 e 90 dias.
                </p>
              ) : (
                n !== 45 && (
                  <p className="fg-ese-variacao">
                    {n < 45 ? 'Redução' : 'Aumento'} de {Math.abs(Math.round(((n - 45) / 45) * 1000) / 10).toLocaleString('pt-BR')}% no prazo de solicitação
                  </p>
                )
              )}
            </div>
            <p className="fg-sub">Exemplo: férias a partir de 05/05/2027, como no Anexo C da NG_111.</p>
          </section>

          {valido && resultado && n !== 45 && (
            <section className="fg-card">
              <div className="fg-cabeca-card">
                <h2>
                  <Icon nome="mapa" tamanho={18} /> Documentos Afetados
                </h2>
                <span className="fg-pilula">{revisar.length} documentos</span>
              </div>
              <ul className="fg-lista">
                {revisar.map((r) => (
                  <li key={r.fonte.codigo} className="fg-lista-item fg-ese-doc">
                    <FonteLink fonte={r.fonte} />
                    <span className="fg-pilula aviso">Revisar</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="fg-coluna" aria-live="polite">
          <section className="fg-card">
            {erroApi ? (
              <Aviso tipo="erro">{erroApi}</Aviso>
            ) : !valido || !resultado ? (
              <p className="fg-sub">Corrija o valor para ver a simulação.</p>
            ) : (
              <>
                <span className={`fg-pilula ${n === 45 ? 'ok' : conflitos.length ? 'perigo' : 'ok'}`}>
                  {n === 45 ? 'Sem mudança' : conflitos.length ? 'Atenção recomendada' : 'Viável'}
                </span>
                <h2 className="fg-ese-veredito">{n === 45 ? 'Igual à regra atual' : conflitos.length ? 'Viabilidade com restrições' : 'Sem conflito de prazos'}</h2>
                <p className="resultado-resumo fg-texto" data-testid="ese-resumo">
                  <SemQuebra texto={resultado.resumo} />
                </p>
                {n !== 45 && (
                  <div className="fg-grid-2 fg-ese-indicadores">
                    <div className="fg-ese-indicador">
                      <p className="fg-rotulo">Conflitos de prazo</p>
                      <p className={`fg-valor ${conflitos.length ? 'fg-valor-perigo' : ''}`} data-testid="ese-conflitos">
                        {conflitos.length
                          ? `${conflitos.length} ${conflitos.length === 1 ? 'regra fica' : 'regras ficam'} em conflito`
                          : 'Sem conflito de prazos'}
                      </p>
                    </div>
                    <div className="fg-ese-indicador">
                      <p className="fg-rotulo">Documentos a revisar</p>
                      <p className="fg-valor">{revisar.length}</p>
                      <p className="fg-sub">Só vigentes que tratam da antecedência</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {valido && resultado && n !== 45 && (
            <section className="fg-card">
              <div className="fg-cabeca-card">
                <h2>Conflitos Normativos Detectados</h2>
                <span className={`fg-pilula ${conflitos.length ? 'perigo' : 'ok'}`}>
                  {conflitos.length} {conflitos.length === 1 ? 'alerta' : 'alertas'}
                </span>
              </div>
              {conflitos.length ? (
                <ul className="fg-conflitos">
                  {conflitos.map((c) => (
                    <li key={c.tipo} className="fg-conflito">
                      <p>{c.descricao}</p>
                      <FonteLink fonte={c.fonte} comSecao />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="fg-sub">Nenhum prazo fica em conflito.</p>
              )}
            </section>
          )}

          {valido && resultado && n !== 45 && (
            <section className="fg-card fg-recomendacao">
              <div>
                <p className="fg-rotulo">
                  <Icon nome="info" tamanho={13} /> Próximo passo
                </p>
                <p className="fg-texto">{resultado.proxima_acao}</p>
              </div>
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
            </section>
          )}
        </div>
      </div>

      {valido && resultado && (
        <>
          <section className="fg-card fg-ese-linha" aria-labelledby="t-linha">
            <div className="fg-cabeca-card">
              <h2 id="t-linha">
                <Icon nome="calendario" tamanho={18} /> Linha do tempo antes e depois
              </h2>
            </div>
            <div className="tabela-responsiva">
              <table className="tabela-documentos fg-tabela tabela-simulacao" data-testid="ese-linha-tempo">
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
                          <span className="fg-pilula perigo">
                            <Icon nome="alerta" tamanho={13} /> Conflito
                          </span>
                        ) : l.muda ? (
                          <span className="fg-pilula aviso">Muda</span>
                        ) : (
                          <span className="fg-sub">Sem mudança</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {n !== 45 && (
            <div className="fg-rodape-card">
              <IncluirRelatorio
                item={{
                  id: `simulacao-${n}`,
                  texto: `Simulação hipotética: ${resultado.resumo}${conflitos.length ? ` ${conflitos.length} regras ficam em conflito.` : ''}`,
                  fonte: { codigo: 'NG_111', versao: '3.0.0', secao: '4.5' },
                  hipotetico: true
                }}
              />
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
            </div>
          )}
        </>
      )}
    </div>
  );
};
