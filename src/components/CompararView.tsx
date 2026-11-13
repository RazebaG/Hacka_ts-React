import React, { useEffect, useState } from 'react';
import { CompararResultado } from '../api/types';
import { fetchComparar } from '../api/client';
import { Icon } from '../ui/Icon';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { Aviso, CabecalhoTela, FonteChip, nomeDoDocumento } from '../ui/componentes';
import { navegar, url } from '../app/rotas';

/** Versões anteriores que não estão no acervo, com as diferenças declaradas pelo próprio documento (C6). */
const ANTERIOR_AUSENTE: Record<string, { de: string; para: string; secao: string; itens: string[] }> = {
  RG_1100: {
    de: '1.0.0',
    para: '2.0.0',
    secao: 'Anexo K',
    itens: [
      'Ideias por proponente: até 3 na edição anterior, até 2 na edição 2027.',
      'Premiação: por colocação (R$ 8.000,00, R$ 5.000,00 e R$ 3.000,00) e por arena (R$ 2.000,00); antes, R$ 5.000,00 por ideia.',
      'Gamificação com pontos e ranking: não havia na edição anterior.'
    ]
  }
};

interface CompararViewProps {
  onNavegarDocumento: (codigo: string, versao?: string, secaoId?: string) => void;
  codigoInicial?: string;
  deInicial?: string;
  paraInicial?: string;
}

interface ParComparacaoPredefinido {
  codigo: string;
  de: string;
  para: string;
  rotulo: string;
}

const COMPARATIVOS_DISPONIVEIS: ParComparacaoPredefinido[] = [
  {
    codigo: 'NG_111',
    de: '2.0.0',
    para: '3.0.0',
    rotulo: 'Férias (NG_111): versão 2.0.0 e versão 3.0.0'
  },
  {
    codigo: 'FM_1111-001',
    de: '1.0.0',
    para: '2.0.0',
    rotulo: 'Formulário de Férias (FM_1111-001): versão 1.0.0 e versão 2.0.0'
  },
  {
    codigo: 'RG_1100',
    de: '1.0.0',
    para: '2.0.0',
    rotulo: 'Ideias em Campo (RG_1100): a versão antiga não está no arquivo'
  }
];

export const CompararView: React.FC<CompararViewProps> = ({
  onNavegarDocumento,
  codigoInicial = 'NG_111',
  deInicial,
  paraInicial
}) => {
  const predef = COMPARATIVOS_DISPONIVEIS.find((c) => c.codigo === codigoInicial);
  const [codigo, setCodigo] = useState<string>(codigoInicial);
  const [de, setDe] = useState<string>(deInicial ?? predef?.de ?? '2.0.0');
  const [para, setPara] = useState<string>(paraInicial ?? predef?.para ?? '3.0.0');
  const ausente = ANTERIOR_AUSENTE[codigo];
  const versoesNoAcervo = MOCK_DOCUMENTOS.filter((d) => d.codigo === codigo);
  const unicaVersao = !ausente && versoesNoAcervo.length === 1;
  const [resultado, setResultado] = useState<CompararResultado | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const executarComparacao = (c: string, vDe: string, vPara: string) => {
    setCarregando(true);
    setErro(null);

    fetchComparar(c, vDe, vPara)
      .then((res) => {
        setResultado(res);
        setCarregando(false);
      })
      .catch((err) => {
        setErro(err instanceof Error ? err.message : 'Erro ao comparar versões');
        setCarregando(false);
      });
  };

  useEffect(() => {
    if (ausente || unicaVersao) {
      setCarregando(false);
      setResultado(null);
      return;
    }
    executarComparacao(codigo, de, para);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo, de, para]);

  const handleSelecionarPredefinido = (item: ParComparacaoPredefinido) => {
    setCodigo(item.codigo);
    setDe(item.de);
    setPara(item.para);
  };

  const trocar = () => {
    setDe(para);
    setPara(de);
  };
  const versoes = versoesNoAcervo.map((d) => d.versao);
  const opcoesVersao = (atual: string) => [...new Set([...versoes, atual])].filter(Boolean);
  const copiarTrechos = () => {
    if (!resultado) return;
    const texto = resultado.mudancas
      .map((m) => `${resultado.codigo}, item ${m.secao}\nAntes (v${resultado.de}): ${m.antes ?? '—'}\nAgora (v${resultado.para}): ${m.depois ?? '—'}`)
      .join('\n\n');
    navigator.clipboard?.writeText(texto).catch(() => undefined);
  };
  const rotuloTipo = (tipo: string) => (tipo === 'incluido' ? 'Novo' : tipo === 'removido' ? 'Retirado' : 'Alterado');

  return (
    <div className="view-container comparar-view" data-testid="comparar-view">
      {!carregando && resultado && resultado.mudancas.length > 0 && (
        <div className="fg-faixa-alerta fg-faixa-fina" role="status">
          <Icon nome="alerta" tamanho={16} />
          <span>
            <strong>{resultado.mudancas.length} alterações</strong> requerem atenção entre as versões selecionadas
          </span>
          <a
            className="fg-link"
            href={url.radar()}
            onClick={(e) => {
              e.preventDefault();
              navegar(url.radar());
            }}
          >
            Ver pendências <span aria-hidden="true">→</span>
          </a>
        </div>
      )}

      <CabecalhoTela
        etiqueta="Comparar versões"
        titulo="O que mudou de uma versão para outra"
        descricao="Escolha um documento. Mostramos o texto antigo e o texto novo de cada parte que mudou."
        acoes={
          <div className="fg-alternador" role="group" aria-label="Documento">
            {COMPARATIVOS_DISPONIVEIS.map((item) => {
              const ativo = codigo === item.codigo;
              return (
                <button
                  key={item.codigo}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => handleSelecionarPredefinido(item)}
                  data-testid={`btn-comparar-${item.codigo}`}
                  title={item.rotulo}
                >
                  {item.codigo}
                </button>
              );
            })}
          </div>
        }
      />

      <div className="fg-card fg-seletor-versoes" role="region" aria-label="Versões comparadas">
        <div className="fg-seletor-campo">
          <label htmlFor="de-comparar" className="fg-rotulo">
            Versão anterior (substituída)
          </label>
          <div className="fg-seletor-linha">
            <span className="fg-icone fg-icone-sm perigo" aria-hidden="true">
              <Icon nome="historico" tamanho={16} />
            </span>
            <select id="de-comparar" className="fg-select" value={de} onChange={(e) => setDe(e.target.value)} data-testid="input-de-comparar">
              {opcoesVersao(de).map((v) => (
                <option key={v} value={v}>
                  {codigo} · v{v} · {nomeDoDocumento(codigo)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="button" className="fg-trocar" onClick={trocar} aria-label="Trocar as versões de lugar" title="Trocar as versões de lugar">
          <Icon nome="trocar" tamanho={18} />
        </button>
        <div className="fg-seletor-campo">
          <label htmlFor="para-comparar" className="fg-rotulo">
            Versão atual
          </label>
          <div className="fg-seletor-linha">
            <span className="fg-icone fg-icone-sm ok" aria-hidden="true">
              <Icon nome="marca" tamanho={16} />
            </span>
            <select id="para-comparar" className="fg-select" value={para} onChange={(e) => setPara(e.target.value)} data-testid="input-para-comparar">
              {opcoesVersao(para).map((v) => (
                <option key={v} value={v}>
                  {codigo} · v{v} · {nomeDoDocumento(codigo)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {ausente && (
        <section className="fg-card" data-testid="comparar-anterior-ausente">
          <Aviso>
            A versão {ausente.de} não está no acervo. Diferenças declaradas no {ausente.secao}:
          </Aviso>
          <ul className="lista-impactos">
            {ausente.itens.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <FonteChip fonte={{ codigo, versao: ausente.para, secao: ausente.secao }} />
        </section>
      )}

      {unicaVersao && (
        <section className="fg-card" data-testid="comparar-unica-versao">
          <p>Este documento tem só uma versão no acervo.</p>
          <FonteChip fonte={{ codigo, versao: versoesNoAcervo[0].versao, secao: versoesNoAcervo[0].secoes[0]?.id ?? '' }} />
        </section>
      )}

      {carregando && (
        <div className="loading-state" data-testid="comparar-loading">
          <div className="spinner"></div>
          <p>Comparando as versões...</p>
        </div>
      )}

      {erro && (
        <div className="alerta alerta-erro" data-testid="comparar-erro">
          <strong>Não foi possível comparar as versões:</strong> {erro}
        </div>
      )}

      {!carregando && resultado && (
        <div className="comparar-conteudo fg-comparar" data-testid="comparar-conteudo">
          <section className="fg-card fg-resumo-mudancas">
            <div className="fg-cabeca-card">
              <h2>
                <Icon nome="check" tamanho={18} /> Resumo das mudanças ({resultado.codigo})
              </h2>
              <span className="fg-sub">
                v{resultado.de} → v{resultado.para}
              </span>
            </div>
            <ul className="fg-resumo-lista" data-testid="lista-resumo-mudancas">
              {resultado.resumo.map((ponto, i) => (
                <li key={i}>{ponto}</li>
              ))}
            </ul>
          </section>

          {resultado.mudancas.map((mudanca, idx) => (
            <article key={idx} className="fg-card fg-diff" data-testid={`diff-card-${idx}`}>
              <header className="fg-diff-cabeca">
                <span className="fg-diff-n" aria-hidden="true">
                  {idx + 1}
                </span>
                <h2 className="fg-diff-titulo">
                  <span>Seção {mudanca.secao}</span>
                </h2>
                <span className={`fg-pilula ${mudanca.tipo === 'incluido' ? 'ok' : mudanca.tipo === 'removido' ? 'perigo' : 'aviso'}`}>{rotuloTipo(mudanca.tipo)}</span>
                <button
                  type="button"
                  className="fg-link fg-diff-ref"
                  onClick={() => onNavegarDocumento(resultado.codigo, resultado.para, mudanca.secao)}
                  title={`Abrir o item ${mudanca.secao} no documento ${resultado.codigo}`}
                  data-testid={`btn-abrir-secao-${mudanca.secao}`}
                >
                  Ler no documento <Icon nome="seta" tamanho={14} />
                </button>
              </header>
              <div className="fg-diff-colunas">
                <div className="fg-diff-antes">
                  <p className="fg-diff-rotulo">
                    <Icon nome="fechar" tamanho={13} /> Versão anterior (v{resultado.de})
                  </p>
                  {mudanca.antes ? <p className="fg-diff-texto">{mudanca.antes}</p> : <p className="fg-diff-texto fg-diff-vazio">Não constava nesta versão.</p>}
                </div>
                <div className="fg-diff-depois">
                  <p className="fg-diff-rotulo">
                    <Icon nome="marca" tamanho={13} /> Nova redação vigente (v{resultado.para})
                  </p>
                  {mudanca.depois ? <p className="fg-diff-texto">{mudanca.depois}</p> : <p className="fg-diff-texto fg-diff-vazio">Retirado da versão vigente.</p>}
                </div>
              </div>
            </article>
          ))}

          <div className="fg-card fg-barra-acao">
            <span className="fg-sub">
              <Icon nome="marca" tamanho={16} /> Comparativo pronto: {resultado.mudancas.length} partes mudaram de v{resultado.de} para v{resultado.para}.
            </span>
            <div className="fg-mudanca-acoes">
              <button type="button" className="btn btn-outline btn-sm" onClick={copiarTrechos}>
                <Icon nome="copiar" tamanho={15} /> Copiar trechos
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
                <Icon nome="baixar" tamanho={15} /> Exportar relatório (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
