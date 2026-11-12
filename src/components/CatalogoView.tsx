import React, { useEffect, useState, useMemo } from 'react';
import { DocumentoResumo } from '../api/types';
import { fetchDocumentos } from '../api/client';
import { BadgeStatus } from './BadgeStatus';

interface CatalogoViewProps {
  onNavegarDocumento: (codigo: string, versao?: string) => void;
  onNavegarDecodificador?: (codigo: string) => void;
}

const NOMES_ASSUNTOS: Record<string, string> = {
  ferias: 'Férias (Gente e Cultura)',
  inovacao: 'Inovação e Programa Ideias em Campo',
  locacao: 'Locação de Espaço de Coworking'
};

export const CatalogoView: React.FC<CatalogoViewProps> = ({
  onNavegarDocumento,
  onNavegarDecodificador
}) => {
  const [documentos, setDocumentos] = useState<DocumentoResumo[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'vigente' | 'substituido'>('todos');
  const [filtroAssunto, setFiltroAssunto] = useState<string>('todos');

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

  return (
    <div className="view-container catalogo-view" data-testid="catalogo-view">
      <div className="view-header">
        <h2>Catálogo do Arquivo Central de Normas</h2>
        <p className="subtitle">
          Acervo corporativo da ACME contendo normas gerais, procedimentos, formulários e notas
          técnicas com rastreabilidade entre versões vigentes e substituídas.
        </p>
      </div>

      <div className="catalogo-filtros-bar">
        <div className="filtro-campo busca-input">
          <label htmlFor="busca-catalogo">Buscar no catálogo:</label>
          <input
            id="busca-catalogo"
            data-testid="busca-catalogo"
            type="search"
            placeholder="Filtrar por código, título ou tipo (ex: NG_111, Férias)..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="filtro-campo">
          <label htmlFor="filtro-assunto">Assunto:</label>
          <select
            id="filtro-assunto"
            data-testid="filtro-assunto"
            value={filtroAssunto}
            onChange={(e) => setFiltroAssunto(e.target.value)}
          >
            <option value="todos">Todos os assuntos</option>
            <option value="ferias">Férias</option>
            <option value="inovacao">Inovação</option>
            <option value="locacao">Locação</option>
          </select>
        </div>

        <div className="filtro-campo">
          <label htmlFor="filtro-status">Status de Vigência:</label>
          <select
            id="filtro-status"
            data-testid="filtro-status"
            value={filtroStatus}
            onChange={(e) =>
              setFiltroStatus(e.target.value as 'todos' | 'vigente' | 'substituido')
            }
          >
            <option value="todos">Todos ({documentos.length})</option>
            <option value="vigente">
              Vigentes ({documentos.filter((d) => !d.substituido).length})
            </option>
            <option value="substituido">
              Substituídos ({documentos.filter((d) => d.substituido).length})
            </option>
          </select>
        </div>
      </div>

      {carregando && (
        <div className="loading-state" data-testid="loading-catalogo">
          <div className="spinner"></div>
          <p>Carregando acervo do catálogo...</p>
        </div>
      )}

      {erro && (
        <div className="alerta alerta-erro" role="alert" data-testid="catalogo-erro">
          <strong>Erro:</strong> {erro}
        </div>
      )}

      {!carregando && !erro && documentosFiltrados.length === 0 && (
        <div className="empty-state" data-testid="empty-catalogo">
          <p>Nenhum documento encontrado para os filtros selecionados.</p>
        </div>
      )}

      {!carregando &&
        !erro &&
        Object.entries(documentosPorAssunto).map(([assunto, docs]) => (
          <div key={assunto} className="assunto-grupo" data-testid={`grupo-assunto-${assunto}`}>
            <h3 className="assunto-titulo">
              {NOMES_ASSUNTOS[assunto] || assunto.toUpperCase()} ({docs.length})
            </h3>

            <div className="tabela-responsiva">
              <table className="tabela-documentos">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Título</th>
                    <th>Tipo</th>
                    <th>Versão</th>
                    <th>Status</th>
                    <th>Vigência</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr
                      key={`${doc.codigo}-${doc.versao}`}
                      data-testid={`linha-doc-${doc.codigo}-${doc.versao}`}
                      className={doc.substituido ? 'linha-substituido' : 'linha-vigente'}
                    >
                      <td className="col-codigo">
                        <strong>{doc.codigo}</strong>
                      </td>
                      <td className="col-titulo">{doc.titulo}</td>
                      <td>
                        <span className="tipo-tag">{doc.tipo_nome}</span>
                      </td>
                      <td className="col-versao">v{doc.versao}</td>
                      <td>
                        <BadgeStatus substituido={doc.substituido} fase={doc.fase} />
                      </td>
                      <td className="col-vigencia">{doc.vigencia}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => onNavegarDocumento(doc.codigo, doc.versao)}
                          data-testid={`btn-abrir-${doc.codigo}-${doc.versao}`}
                        >
                          Ler Documento
                        </button>
                        {onNavegarDecodificador && (
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            style={{ marginLeft: '0.4rem' }}
                            onClick={() => onNavegarDecodificador(doc.codigo)}
                            data-testid={`btn-decodificar-${doc.codigo}-${doc.versao}`}
                            title={`Decodificar metadados de ${doc.codigo}`}
                          >
                            Decodificar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  );
};
