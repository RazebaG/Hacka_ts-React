import React, { useEffect, useState, useMemo } from 'react';
import { DocumentoResumo } from '../api/types';
import { fetchDocumentos } from '../api/client';
import { BadgeStatus } from './BadgeStatus';
import { camadaDe } from '../mocks/v2';
import { useEstado } from '../app/store';
import { CabecalhoTela, SemQuebra } from '../ui/componentes';
import { Icon } from '../ui/Icon';
import { semaforoDe } from '../mocks/ficha';
import { SemaforoSituacao } from './FichaView';
import { navegar, url } from '../app/rotas';

interface CatalogoViewProps {
  onNavegarDocumento: (codigo: string, versao?: string) => void;
  /** Tema vindo da rota /catalogo?tema= (Visão geral, lote). */
  temaInicial?: string;
}

const NOMES_CURTOS: Record<string, string> = { ferias: 'Pessoas', inovacao: 'Gestão', locacao: 'Jurídico' };

const NOMES_ASSUNTOS: Record<string, string> = {
  ferias: 'Férias (Gente e Cultura)',
  inovacao: 'Inovação e Programa Ideias em Campo',
  locacao: 'Locação de Espaço de Coworking'
};

export const CatalogoView: React.FC<CatalogoViewProps> = ({ onNavegarDocumento, temaInicial }) => {
  const [documentos, setDocumentos] = useState<DocumentoResumo[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'vigente' | 'substituido'>('todos');
  const digitalizados = useEstado((e) => e.digitalizados);
  const [filtroAssunto, setFiltroAssunto] = useState<string>(temaInicial || 'todos');
  const [marcados, setMarcados] = useState<string[]>([]);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    fetchDocumentos()
      .then((docs) => {
        if (ativo) {
          setDocumentos(docs);
          setCarregando(false);
        }
      })
      .catch((err) => {
        if (ativo) {
          setErro(err instanceof Error ? err.message : 'Falha ao listar catálogo');
          setCarregando(false);
        }
      });
    return () => {
      ativo = false;
    };
  }, []);

  const documentosFiltrados = useMemo(() => {
    return documentos.filter((doc) => {
      // Filtro de texto
      const termo = busca.toLowerCase().trim();
      const matchBusca =
        !termo ||
        doc.codigo.toLowerCase().includes(termo) ||
        doc.titulo.toLowerCase().includes(termo) ||
        doc.tipo_nome.toLowerCase().includes(termo);

      // Filtro de status
      const matchStatus =
        filtroStatus === 'todos' ||
        (filtroStatus === 'vigente' && !doc.substituido) ||
        (filtroStatus === 'substituido' && doc.substituido);

      // Filtro de assunto
      const matchAssunto = filtroAssunto === 'todos' || doc.assunto === filtroAssunto;

      return matchBusca && matchStatus && matchAssunto;
    });
  }, [documentos, busca, filtroStatus, filtroAssunto]);

  // Agrupamento por assunto
  const documentosPorAssunto = useMemo(() => {
    const mapa: Record<string, DocumentoResumo[]> = {};
    for (const doc of documentosFiltrados) {
      if (!mapa[doc.assunto]) {
        mapa[doc.assunto] = [];
      }
      mapa[doc.assunto].push(doc);
    }
    return mapa;
  }, [documentosFiltrados]);

  const total = documentos.length;
  const nVigentes = documentos.filter((d) => !d.substituido).length;
  const antigos = documentos.filter((d) => d.substituido);
  const comVariasVersoes = (codigo: string) => documentos.filter((d) => d.codigo === codigo).length > 1;
  const chave = (d: DocumentoResumo) => `${d.codigo}-${d.versao}`;
  const alternar = (k: string) => setMarcados((m) => (m.includes(k) ? m.filter((x) => x !== k) : [...m, k]));

  /** Exporta a lista (ou só os marcados) em CSV, que abre no Excel. */
  const exportar = () => {
    const linhas = documentosFiltrados.filter((d) => !marcados.length || marcados.includes(chave(d)));
    const csv = ['Código;Documento;Tipo;Área;Versão;Status;Vigência']
      .concat(
        linhas.map((d) =>
          [d.codigo, d.titulo, d.tipo_nome, NOMES_ASSUNTOS[d.assunto] ?? d.assunto, d.versao, d.substituido ? 'Versão antiga' : 'Vigente', d.vigencia].join(';')
        )
      )
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'documentos-arquivo-central.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="view-container catalogo-view" data-testid="catalogo-view">
      <CabecalhoTela
        titulo="Documentos e Normas"
        descricao="Consulte o acervo de contratos, normas gerais e notas técnicas vigentes."
        acoes={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={exportar} disabled={!documentosFiltrados.length}>
              <Icon nome="baixar" tamanho={16} /> Exportar
            </button>
            <a
              className="btn btn-primary btn-sm"
              href={url.enviar()}
              onClick={(e) => {
                e.preventDefault();
                navegar(url.enviar());
              }}
            >
              <Icon nome="mais" tamanho={16} /> Novo Documento
            </a>
          </>
        }
      />

      <div className="fg-grid-3 fg-stats">
        <div className="fg-card fg-stat">
          <span className="fg-icone" aria-hidden="true">
            <Icon nome="catalogo" tamanho={20} />
          </span>
          <div className="fg-stat-texto">
            <p className="fg-rotulo">Total de documentos</p>
            <p className="fg-valor">{total}</p>
          </div>
          <span />
        </div>
        <div className="fg-card fg-stat">
          <span className="fg-icone" aria-hidden="true">
            <Icon nome="marca" tamanho={20} />
          </span>
          <div className="fg-stat-texto">
            <p className="fg-rotulo">Plena vigência</p>
            <p className="fg-valor">{nVigentes}</p>
          </div>
          <span className="fg-pilula">Ativos</span>
        </div>
        <div className="fg-card fg-stat">
          <span className="fg-icone aviso" aria-hidden="true">
            <Icon nome="historico" tamanho={20} />
          </span>
          <div className="fg-stat-texto">
            <p className="fg-rotulo">Versões antigas</p>
            <p className="fg-valor">{antigos.length}</p>
            <p className="fg-sub">{[...new Set(antigos.map((d) => d.codigo))].join(' · ') || 'Nenhuma'}</p>
          </div>
          <span />
        </div>
      </div>

      <div className="fg-card fg-barra-filtros">
        <label className="fg-busca" htmlFor="busca-catalogo">
          <Icon nome="busca" tamanho={18} />
          <span className="sr-only">Buscar no catálogo</span>
          <input
            id="busca-catalogo"
            data-testid="busca-catalogo"
            type="search"
            placeholder="Buscar por código, título ou palavra-chave..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        <label className="sr-only" htmlFor="filtro-assunto">
          Área
        </label>
        <select id="filtro-assunto" className="fg-select" data-testid="filtro-assunto" value={filtroAssunto} onChange={(e) => setFiltroAssunto(e.target.value)}>
          <option value="todos">Área: Todas</option>
          <option value="ferias">Área: Pessoas (Férias)</option>
          <option value="inovacao">Área: Gestão (Inovação)</option>
          <option value="locacao">Área: Jurídico (Locação)</option>
        </select>
        <label className="sr-only" htmlFor="filtro-status">
          Status
        </label>
        <select
          id="filtro-status"
          className="fg-select"
          data-testid="filtro-status"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as 'todos' | 'vigente' | 'substituido')}
        >
          <option value="todos">Status: Todos</option>
          <option value="vigente">Status: Vigentes ({nVigentes})</option>
          <option value="substituido">Status: Versões antigas ({antigos.length})</option>
        </select>
        <span className="fg-sub" aria-live="polite">
          <strong>{documentosFiltrados.length}</strong> documentos
        </span>
      </div>

      {carregando && (
        <div className="loading-state" data-testid="loading-catalogo">
          <div className="spinner"></div>
          <p>Carregando documentos...</p>
        </div>
      )}

      {erro && (
        <div className="alerta alerta-erro" role="alert" data-testid="catalogo-erro">
          <strong>Erro:</strong> {erro}
        </div>
      )}

      {!carregando && !erro && documentosFiltrados.length === 0 && (
        <div className="fg-card empty-state" data-testid="empty-catalogo">
          <p>Nenhum documento encontrado para os filtros selecionados.</p>
        </div>
      )}

      {!carregando && !erro && documentosFiltrados.length > 0 && (
        <div className="fg-card fg-tabela-card">
          <div className="tabela-responsiva">
            <table className="tabela-documentos fg-tabela">
              <thead>
                <tr>
                  <th className="col-marcar">
                    <input
                      type="checkbox"
                      aria-label="Marcar todos"
                      checked={marcados.length > 0 && marcados.length === documentosFiltrados.length}
                      onChange={(e) => setMarcados(e.target.checked ? documentosFiltrados.map(chave) : [])}
                    />
                  </th>
                  <th>Identificador</th>
                  <th>Documento</th>
                  <th>Área</th>
                  <th>Status / Vigência</th>
                  <th>Versão</th>
                  <th>Ações</th>
                </tr>
              </thead>
              {Object.entries(documentosPorAssunto).map(([assunto, docs]) => (
                <tbody key={assunto} data-testid={`grupo-assunto-${assunto}`}>
                  <tr className="grupo-linha">
                    <th colSpan={7} scope="rowgroup">
                      {NOMES_ASSUNTOS[assunto] ?? assunto} <span className="fg-sub">· {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}</span>
                    </th>
                  </tr>
                  {docs.map((doc) => (
                    <tr
                      key={chave(doc)}
                      data-testid={`linha-doc-${doc.codigo}-${doc.versao}`}
                      className={`${doc.substituido ? 'linha-substituido' : 'linha-vigente'} ${marcados.includes(chave(doc)) ? 'linha-marcada' : ''}`}
                    >
                      <td className="col-marcar">
                        <input
                          type="checkbox"
                          aria-label={`Marcar ${doc.codigo} versão ${doc.versao}`}
                          checked={marcados.includes(chave(doc))}
                          onChange={() => alternar(chave(doc))}
                        />
                      </td>
                      <td className="col-codigo">
                        <a
                          className="fg-codigo fg-codigo-link"
                          href={url.ficha(doc.codigo, doc.versao)}
                          onClick={(e) => {
                            e.preventDefault();
                            navegar(url.ficha(doc.codigo, doc.versao));
                          }}
                          title="Abrir a ficha do documento"
                        >
                          <Icon nome="documento" tamanho={14} />
                          <SemQuebra texto={doc.codigo} />
                        </a>
                      </td>
                      <td className="col-titulo">
                        <strong className="fg-doc-titulo">{doc.titulo}</strong>
                        <span className="fg-doc-sub">
                          {doc.tipo_nome}
                          {camadaDe(doc.codigo).subordinado_a ? `, segue a ${camadaDe(doc.codigo).subordinado_a}` : ''}
                        </span>
                        {digitalizados.includes(doc.codigo) && <span className="fonte-camada fonte-digital">Lido de uma foto e conferido por uma pessoa</span>}
                      </td>
                      <td>
                        <span className="fg-pilula neutra">{NOMES_CURTOS[doc.assunto] ?? doc.assunto}</span>
                      </td>
                      <td>
                        <BadgeStatus substituido={doc.substituido} fase={doc.fase} />
                        {semaforoDe(doc.codigo, doc.versao)?.nivel === 'atencao' && (
                          <span className="catalogo-semaforo">
                            <SemaforoSituacao nivel="atencao" />
                          </span>
                        )}
                        <span className="fg-doc-sub col-vigencia">{doc.vigencia}</span>
                      </td>
                      <td className="col-versao">v{doc.versao}</td>
                      <td>
                        <div className="fg-acoes">
                          <a
                            className="fg-acao"
                            href={url.ficha(doc.codigo, doc.versao)}
                            onClick={(e) => {
                              e.preventDefault();
                              navegar(url.ficha(doc.codigo, doc.versao));
                            }}
                            aria-label={`Ficha de ${doc.titulo}, versão ${doc.versao}`}
                            title="Ficha do documento"
                            data-testid={`btn-ficha-${doc.codigo}-${doc.versao}`}
                          >
                            <Icon nome="resumo" tamanho={18} />
                          </a>
                          <button
                            type="button"
                            className="fg-acao"
                            onClick={() => onNavegarDocumento(doc.codigo, doc.versao)}
                            data-testid={`btn-abrir-${doc.codigo}-${doc.versao}`}
                            aria-label={`Ler ${doc.titulo}, versão ${doc.versao}`}
                            title="Ler documento"
                          >
                            <Icon nome="olho" tamanho={18} />
                          </button>
                          {comVariasVersoes(doc.codigo) && (
                            <a
                              className="fg-acao"
                              href={url.comparar(doc.codigo)}
                              onClick={(e) => {
                                e.preventDefault();
                                navegar(url.comparar(doc.codigo));
                              }}
                              aria-label={`Comparar versões de ${doc.codigo}`}
                              title="Comparar versões"
                            >
                              <Icon nome="historico" tamanho={18} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <div className="fg-paginacao">
            <span className="fg-sub">
              Registros 1–{documentosFiltrados.length} de {documentosFiltrados.length}
              {marcados.length > 0 && ` · ${marcados.length} marcados para exportar`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
