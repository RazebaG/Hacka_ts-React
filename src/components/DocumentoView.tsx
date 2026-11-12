import React, { useEffect, useState, useRef } from 'react';
import { DocumentoDetalhe } from '../api/types';
import { fetchDocumentoDetalhe } from '../api/client';
import { BadgeStatus } from './BadgeStatus';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { cadeiaDe, camadaDe } from '../mocks/v2';
import { navegar, url } from '../app/rotas';
import { useEstado } from '../app/store';

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

  return (
    <div className="view-container documento-view" data-testid="documento-view">
      <div className="documento-nav-top">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onVoltar}
          data-testid="btn-voltar-catalogo"
        >
          &larr; Voltar
        </button>
      </div>

      <header className="documento-header" data-testid="documento-header">
        <div className="header-tags">
          <span className="doc-tipo-badge">{documento.tipo_nome}</span>
          <BadgeStatus substituido={documento.substituido} fase={documento.fase} />
        </div>

        <h1 className="doc-titulo">
          <span className="doc-codigo" data-testid="doc-codigo-display">
            {documento.codigo}
          </span>{' '}
          — {documento.titulo}
        </h1>

        <div className="doc-camada">
          <span className="fonte-camada">
            {camadaDe(documento.codigo).sigla} {camadaDe(documento.codigo).tipo_nome} · {camadaDe(documento.codigo).grupo}
          </span>
          {cadeiaDe(documento.codigo).length > 1 && (
            <span className="doc-cadeia" data-testid="doc-cadeia">
              Cadeia:{' '}
              {cadeiaDe(documento.codigo).map((c, i) => (
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
            </span>
          )}
          {digitalizado && <span className="fonte-camada fonte-digital">Digitalizado e revisado por pessoa</span>}
        </div>

        <div className="doc-acoes">
          {versoes.length > 1 && (
            <label className="doc-versao-seletor">
              Versão{' '}
              <select value={documento.versao} onChange={(e) => onMudarVersao(documento.codigo, e.target.value)} data-testid="select-versao">
                {versoes.map((v) => (
                  <option key={v.versao} value={v.versao}>
                    {v.versao}
                    {v.substituido ? ' (substituída)' : ' (vigente)'}
                  </option>
                ))}
              </select>
            </label>
          )}
          {COM_HISTORICO.includes(documento.codigo) && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navegar(url.comparar(documento.codigo))}>
              O que mudou
            </button>
          )}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navegar(url.mapa())}>
            Relações
          </button>
        </div>

        <div className="doc-metadados-grid">
          <div className="meta-item">
            <span className="meta-label">Versão:</span>
            <span className="meta-valor" data-testid="doc-versao-display">
              v{documento.versao}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Vigência:</span>
            <span className="meta-valor">{documento.vigencia}</span>
          </div>

          {documento.vinculado_a && (
            <div className="meta-item">
              <span className="meta-label">Vinculado a:</span>
              <button
                type="button"
                className="btn-link"
                onClick={() => onMudarVersao(documento.vinculado_a!, '')}
              >
                {documento.vinculado_a}
              </button>
            </div>
          )}

          {documento.referencia && (
            <div className="meta-item">
              <span className="meta-label">Referências:</span>
              <span className="meta-valor">{documento.referencia}</span>
            </div>
          )}
        </div>

        {documento.substituido && (
          <div
            className="alerta alerta-aviso documento-alerta-substituido"
            data-testid="alerta-doc-substituido"
          >
            <strong>Atenção:</strong> Este documento é uma versão substituída ou revogada. O uso
            de suas regras para novas decisões pode violar as diretrizes vigentes da ACME.
            {vigente && (
              <>
                {' '}Você está lendo a versão {documento.versao}; a vigente é a {vigente.versao}.{' '}
                <button type="button" className="btn btn-primary btn-sm" onClick={() => onMudarVersao(documento.codigo, vigente.versao)}>
                  Abrir vigente
                </button>
              </>
            )}
          </div>
        )}

        {secaoDestacada && (
          <div className="alerta alerta-info" data-testid="banner-secao-destacada">
            Exibindo citação referenciada na <strong>Seção {secaoDestacada}</strong>.
          </div>
        )}
      </header>

      <section className="documento-corpo">
        <h2 className="secoes-titulo">Seções do Documento ({documento.secoes.length})</h2>

        <div className="secoes-lista">
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
                className={`secao-card ${isDestacada ? 'secao-destacada' : ''}`}
              >
                <div className="secao-header">
                  <span className="secao-numero">Seção {secao.id}</span>
                  <h3 className="secao-nome">{secao.titulo}</h3>
                  {isDestacada && (
                    <span className="badge badge-destaque">Trecho Citado</span>
                  )}
                </div>
                <p className="secao-texto">{secao.texto}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
