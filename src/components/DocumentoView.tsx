import React, { useEffect, useState, useRef } from 'react';
import { DocumentoDetalhe } from '../api/types';
import { fetchDocumentoDetalhe } from '../api/client';
import { BadgeStatus } from './BadgeStatus';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { cadeiaDe, camadaDe } from '../mocks/v2';
import { navegar, url } from '../app/rotas';
import { useEstado } from '../app/store';
import { Icon } from '../ui/Icon';

const COM_HISTORICO = ['NG_111', 'FM_1111-001', 'RG_1100'];

interface DocumentoViewProps {
  codigo: string;
  versao?: string;
  secaoDestacada?: string;
  onVoltar: () => void;
  onMudarVersao: (codigo: string, novaVersao: string) => void;
}

export const DocumentoView: React.FC<DocumentoViewProps> = ({
  codigo,
  versao,
  secaoDestacada,
  onVoltar,
  onMudarVersao
}) => {
  const [documento, setDocumento] = useState<DocumentoDetalhe | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const secaoRefs = useRef<Record<string, HTMLElement | null>>({});
  const digitalizado = useEstado((e) => e.digitalizados.includes(codigo));
  const versoes = MOCK_DOCUMENTOS.filter((d) => d.codigo === codigo).map((d) => ({ versao: d.versao, substituido: d.substituido }));
  const vigente = versoes.find((v) => !v.substituido);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    fetchDocumentoDetalhe(codigo, versao)
      .then((doc) => {
        if (ativo) {
          setDocumento(doc);
          setCarregando(false);
        }
      })
      .catch((err) => {
        if (ativo) {
          setErro(err instanceof Error ? err.message : 'Erro ao carregar documento');
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [codigo, versao]);

  // Seção citada: igual ao id, ou a primeira subseção ("4.3" encontra "4.3.1"); maiúsculas não importam
  const norm = (s: string) => s.toLocaleLowerCase('pt-BR').trim();
  const idDestacado = (() => {
    if (!documento || !secaoDestacada) return undefined;
    const alvo = norm(secaoDestacada);
    return (documento.secoes.find((s) => norm(s.id) === alvo) || documento.secoes.find((s) => norm(s.id).startsWith(alvo + '.')))?.id;
  })();

  // Efeito para rolar suavemente até a seção citada
  useEffect(() => {
    if (!carregando && documento && secaoDestacada) {
      const el = secaoRefs.current[idDestacado ?? secaoDestacada];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [carregando, documento, secaoDestacada, idDestacado]);

  if (carregando) {
    return (
      <div className="view-container documento-view" data-testid="documento-loading">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando documento {codigo}...</p>
        </div>
      </div>
    );
  }

  if (erro || !documento) {
    return (
      <div className="view-container documento-view" data-testid="documento-erro">
        <button type="button" className="btn btn-outline" onClick={onVoltar}>
          &larr; Voltar
        </button>
        <div className="alerta alerta-erro mt-4" role="alert">
          {versoes.length === 0 ? (
            <>Não encontramos {codigo}. Confira o código ou volte ao catálogo.</>
          ) : (
            <>
              <strong>Não foi possível exibir o documento:</strong> {erro || 'Documento não encontrado'}
            </>
          )}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navegar(url.catalogo())}>
          Ir para o catálogo
        </button>
      </div>
    );
  }

  const cadeia = cadeiaDe(documento.codigo);
  const vinculados = MOCK_DOCUMENTOS.filter((d) => !d.substituido && d.vinculado_a === documento.codigo);
  const simulavel = documento.codigo === 'NG_111' && !documento.substituido;
  const copiarLink = () => navigator.clipboard?.writeText(window.location.href).catch(() => undefined);

  return (
    <div className="view-container documento-view" data-testid="documento-view">
      <div className="documento-nav-top">
        <button type="button" className="fg-link" onClick={onVoltar} data-testid="btn-voltar-catalogo">
          <Icon nome="recolher" tamanho={16} /> Voltar
        </button>
      </div>

      <header className="fg-card fg-doc-cabeca documento-header" data-testid="documento-header">
        <div className="fg-doc-cabeca-texto">
          <div className="fg-mudanca-topo">
            <span className="fg-codigo" data-testid="doc-codigo-display">
              {documento.codigo}
            </span>
            <BadgeStatus substituido={documento.substituido} fase={documento.fase} />
            <span className="fg-pilula neutra">{documento.tipo_nome}</span>
            {digitalizado && <span className="fg-pilula">Lido de uma foto e conferido por uma pessoa</span>}
          </div>
          <p className="fg-sub fg-doc-desde">
            <Icon nome="calendario" tamanho={14} /> Vigência: {documento.vigencia} · Versão <span data-testid="doc-versao-display">v{documento.versao}</span>
          </p>
          <h1 className="fg-doc-nome">{documento.titulo}</h1>
          <p className="fg-sub">
            {camadaDe(documento.codigo).sigla} {camadaDe(documento.codigo).tipo_nome} · {camadaDe(documento.codigo).grupo}
            {documento.referencia ? ` · Referências: ${documento.referencia}` : ''}
          </p>
        </div>
        <div className="fg-mudanca-acoes fg-doc-acoes">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navegar(url.ficha(documento.codigo, documento.versao))} data-testid="btn-ver-ficha">
            <Icon nome="resumo" tamanho={15} /> Voltar à ficha
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navegar(url.perguntar(undefined, [documento.codigo]))} data-testid="btn-perguntar-doc">
            <Icon nome="perguntar" tamanho={15} /> Perguntar só neste documento
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={copiarLink}>
            <Icon nome="link" tamanho={15} /> Copiar Link
          </button>
          {simulavel && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navegar(url.ese('ferias_antecedencia_dias', 30))}>
              <Icon nome="simular" tamanho={15} /> Simular Mudança
            </button>
          )}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Icon nome="baixar" tamanho={15} /> Exportar PDF
          </button>
        </div>
      </header>

      {documento.substituido && (
        <div className="alerta alerta-aviso documento-alerta-substituido" data-testid="alerta-doc-substituido">
          <strong>Atenção:</strong> Este documento é uma versão substituída ou revogada. O uso de suas regras para novas decisões pode violar as
          diretrizes vigentes da ACME.
          {vigente && (
            <>
              {' '}
              Você está lendo a versão {documento.versao}; a vigente é a {vigente.versao}.{' '}
              <button type="button" className="btn btn-primary btn-sm" onClick={() => onMudarVersao(documento.codigo, vigente.versao)}>
                Abrir vigente
              </button>
            </>
          )}
        </div>
      )}

      {secaoDestacada && (
        <div className="fg-faixa-info" data-testid="banner-secao-destacada">
          <Icon nome="info" tamanho={16} />
          <span>
            Exibindo citação referenciada na <strong>Seção {secaoDestacada}</strong>.
          </span>
        </div>
      )}

      <div className="fg-layout-lateral">
        <section className="fg-card documento-corpo">
          <div className="fg-cabeca-card">
            <h2 className="secoes-titulo">
              <Icon nome="documento" tamanho={18} /> Seções do Documento ({documento.secoes.length})
            </h2>
            <span className="fg-sub">
              {documento.codigo} · v{documento.versao}
            </span>
          </div>

          <div className="secoes-lista fg-secoes">
            {documento.secoes.map((secao) => {
              const isDestacada = idDestacado === secao.id;
              return (
                <article
                  key={secao.id}
                  id={`secao-${secao.id}`}
                  data-testid={`secao-${secao.id}`}
                  ref={(el) => {
                    secaoRefs.current[secao.id] = el;
                  }}
                  className={`secao-card fg-secao ${isDestacada ? 'secao-destacada' : ''}`}
                >
                  <div className="secao-header">
                    <span className="secao-numero">Seção {secao.id}</span>
                    <h3 className="secao-nome">{secao.titulo}</h3>
                    {isDestacada && <span className="fg-pilula">Trecho Citado</span>}
                  </div>
                  <p className="secao-texto">{secao.texto}</p>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="fg-coluna">
          {simulavel && (
            <section className="fg-card">
              <div className="fg-cabeca-card">
                <p className="fg-rotulo">Simulador</p>
                <Icon nome="tendencia" tamanho={18} />
              </div>
              <p className="fg-texto fg-texto-sm">Projetar o impacto de mudar o prazo de antecedência das férias.</p>
              <button type="button" className="btn btn-outline btn-sm fg-largo" onClick={() => navegar(url.ese('ferias_antecedencia_dias', 30))}>
                <Icon nome="play" tamanho={14} /> Simular Mudança
              </button>
            </section>
          )}

          {(cadeia.length > 1 || vinculados.length > 0 || documento.vinculado_a) && (
            <section className="fg-card">
              <div className="fg-cabeca-card">
                <p className="fg-rotulo">Documentos vinculados</p>
                <a
                  className="fg-link"
                  href={url.mapa()}
                  onClick={(e) => {
                    e.preventDefault();
                    navegar(url.mapa());
                  }}
                >
                  Relações
                </a>
              </div>
              {cadeia.length > 1 && (
                <p className="fg-sub doc-cadeia" data-testid="doc-cadeia">
                  Cadeia:{' '}
                  {cadeia.map((c, i) => (
                    <React.Fragment key={c}>
                      {i > 0 && <span aria-hidden="true"> → </span>}
                      {i === 0 ? (
                        <strong>{c}</strong>
                      ) : (
                        <button type="button" className="btn-link" onClick={() => onMudarVersao(c, '')}>
                          {c}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </p>
              )}
              <ul className="fg-lista">
                {documento.vinculado_a && (
                  <li>
                    <button type="button" className="fg-lista-item" onClick={() => onMudarVersao(documento.vinculado_a!, '')}>
                      <strong>{documento.vinculado_a}</strong>
                      <small>Segue este documento</small>
                    </button>
                  </li>
                )}
                {vinculados.map((d) => (
                  <li key={d.codigo}>
                    <button type="button" className="fg-lista-item" onClick={() => onMudarVersao(d.codigo, '')}>
                      <strong>{d.codigo}</strong>
                      <small>{d.tipo_nome}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="fg-card">
            <div className="fg-cabeca-card">
              <p className="fg-rotulo">
                <Icon nome="historico" tamanho={14} /> Versão
              </p>
              {COM_HISTORICO.includes(documento.codigo) && (
                <button type="button" className="fg-link" onClick={() => navegar(url.comparar(documento.codigo))}>
                  O que mudou
                </button>
              )}
            </div>
            {versoes.length > 1 ? (
              <label className="doc-versao-seletor fg-perfil-chat">
                <span>Ler a versão</span>
                <select value={documento.versao} onChange={(e) => onMudarVersao(documento.codigo, e.target.value)} data-testid="select-versao">
                  {versoes.map((v) => (
                    <option key={v.versao} value={v.versao}>
                      {v.versao}
                      {v.substituido ? ' (substituída)' : ' (vigente)'}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="fg-texto fg-texto-sm">Este documento tem só uma versão no acervo.</p>
            )}
          </section>

          <section className="fg-card">
            <div className="fg-cabeca-card">
              <p className="fg-rotulo">Dúvida rápida</p>
              <Icon nome="duvida" tamanho={18} />
            </div>
            <a
              className="fg-lista-item"
              href={url.perguntar(`O que diz o ${documento.codigo}?`)}
              onClick={(e) => {
                e.preventDefault();
                navegar(url.perguntar(`O que diz o ${documento.codigo}?`));
              }}
            >
              Perguntar sobre {documento.codigo}
              <Icon nome="seta" tamanho={14} />
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
};
