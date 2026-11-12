import React from 'react';
import { isMockMode, getApiBaseUrl } from '../api/client';

export type AbaAtiva =
  | 'perspectivas'
  | 'grafo'
  | 'comparar'
  | 'relatorio'
  | 'perguntar'
  | 'catalogo'
  | 'documento';

interface HeaderProps {
  abaAtiva: AbaAtiva;
  onSelecionarAba: (aba: AbaAtiva) => void;
  documentoAtivoCodigo?: string;
  onAtalhoDemo?: (cena: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  abaAtiva,
  onSelecionarAba,
  documentoAtivoCodigo,
  onAtalhoDemo
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
              ● Modo Mock (Dados de fixture)
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

      <nav className="header-nav" role="tablist" aria-label="Navegação Principal">
        <button
          type="button"
          role="tab"
          aria-selected={abaAtiva === 'perspectivas'}
          className={`nav-tab ${abaAtiva === 'perspectivas' ? 'active' : ''}`}
          onClick={() => onSelecionarAba('perspectivas')}
          data-testid="tab-perspectivas"
        >
          Perspectivas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={abaAtiva === 'grafo'}
          className={`nav-tab ${abaAtiva === 'grafo' ? 'active' : ''}`}
          onClick={() => onSelecionarAba('grafo')}
          data-testid="tab-grafo"
        >
          Mapa do Acervo
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={abaAtiva === 'comparar'}
          className={`nav-tab ${abaAtiva === 'comparar' ? 'active' : ''}`}
          onClick={() => onSelecionarAba('comparar')}
          data-testid="tab-comparar"
        >
          O Que Mudou
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={abaAtiva === 'relatorio'}
          className={`nav-tab ${abaAtiva === 'relatorio' ? 'active' : ''}`}
          onClick={() => onSelecionarAba('relatorio')}
          data-testid="tab-relatorio"
        >
          Relatório Executivo
        </button>
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
          Catálogo (13 docs)
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

      {onAtalhoDemo && (
        <div className="demo-shortcuts-bar" role="toolbar" aria-label="Atalhos das Cenas da Demo">
          <span className="demo-shortcuts-label">Cenas do Pitch (2 min):</span>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => onAtalhoDemo(1)}
              title="Cena 1: Armadilha da versão (Pessoas / 45 dias vs 30 dias na v2)"
            >
              1. Pessoas (45d ⚠)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => onAtalhoDemo(2)}
              title="Cena 2: Financeiro (R$ 18.250,00 e Multa R$ 912,50 no Apêndice B)"
            >
              2. Financeiro (Multa CTR)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => onAtalhoDemo(3)}
              title="Cena 3: O que mudou (NG_111 v2 → v3)"
            >
              3. O Que Mudou (NG_111)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => onAtalhoDemo(4)}
              title="Cena 4: Pergunte ao acervo (Abstenção e rigor)"
            >
              4. Perguntar (Abstenção)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => onAtalhoDemo(5)}
              title="Cena 5: Relatório executivo exportável/imprimível com fontes"
            >
              5. Relatório Executivo
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
