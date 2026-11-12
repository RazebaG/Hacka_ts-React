import React, { useEffect, useState, useRef } from 'react';
import { DocumentoDetalhe } from '../api/types';
import { fetchDocumentoDetalhe } from '../api/client';
import { BadgeStatus } from './BadgeStatus';

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

  // Efeito para rolar suavemente até a seção citada
  useEffect(() => {
    if (!carregando && documento && secaoDestacada) {
      const el = secaoRefs.current[secaoDestacada];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [carregando, documento, secaoDestacada]);

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
        <div className="alerta alerta-erro mt-4">
          <strong>Não foi possível exibir o documento:</strong> {erro || 'Documento não encontrado'}
        </div>
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
            const isDestacada = secaoDestacada === secao.id;
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
