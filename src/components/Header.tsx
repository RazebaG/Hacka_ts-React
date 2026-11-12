import React from 'react';
import { isMockMode, getApiBaseUrl } from '../api/client';

export type AbaAtiva = 'perguntar' | 'catalogo' | 'documento';

interface HeaderProps {
  abaAtiva: AbaAtiva;
  onSelecionarAba: (aba: AbaAtiva) => void;
  documentoAtivoCodigo?: string;
}

export const Header: React.FC<HeaderProps> = ({
  abaAtiva,
  onSelecionarAba,
  documentoAtivoCodigo
}) => {
  const mockAtivo = isMockMode();
  const apiBase = getApiBaseUrl();

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <div className="brand-logo">ACME</div>
          <div>
            <h1 className="brand-title">Assistente do Arquivo Central de Normas</h1>
            <p className="brand-subtitle">
              Inteligência Empresarial com Citação Confiável e Rastreabilidade
            </p>
          </div>
        </div>

        <div className="header-status">
          {mockAtivo ? (
            <span
              className="badge-modo badge-mock"
              data-testid="status-modo-mock"
              title="Operando com mock sintético idêntico ao contrato da API"
            >
              ● Modo Mock (Offline)
            </span>
          ) : (
            <span
              className="badge-modo badge-api"
              data-testid="status-modo-api"
              title={`Conectado à API em ${apiBase}`}
            >
              ● API Conectada ({apiBase})
            </span>
          )}
        </div>
      </div>

      <nav className="header-nav" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={abaAtiva === 'perguntar'}
          className={`nav-tab ${abaAtiva === 'perguntar' ? 'active' : ''}`}
          onClick={() => onSelecionarAba('perguntar')}
          data-testid="tab-perguntar"
        >
          Perguntar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={abaAtiva === 'catalogo'}
          className={`nav-tab ${abaAtiva === 'catalogo' ? 'active' : ''}`}
          onClick={() => onSelecionarAba('catalogo')}
          data-testid="tab-catalogo"
        >
          Catálogo ({13} docs)
        </button>
        {documentoAtivoCodigo && (
          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === 'documento'}
            className={`nav-tab ${abaAtiva === 'documento' ? 'active' : ''}`}
            onClick={() => onSelecionarAba('documento')}
            data-testid="tab-documento"
          >
            Leitor: {documentoAtivoCodigo}
          </button>
        )}
      </nav>
    </header>
  );
};
