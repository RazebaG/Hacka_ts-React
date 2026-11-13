import React, { useState } from 'react';
import { isMockMode, getApiBaseUrl } from '../api/client';
import { PerfilUsuario } from '../api/types';
import { navegar, Tela, url } from '../app/rotas';
import { acoes, TamanhoTexto, useEstado } from '../app/store';
import { Icon, NomeIcone } from '../ui/Icon';
import { PERFIS } from './perfis';

/** Mantido por compatibilidade: as telas agora são as do roteador. */
export type AbaAtiva = Tela;

interface ItemNav {
  id: Tela;
  rotulo: string;
  icone: NomeIcone;
  destino: string;
}

/**
 * Menu em linguagem simples (Lei 15.263/2025): o nome diz o que a pessoa vai fazer,
 * não o nome técnico da tela. Agrupado pelo fluxo começar → consultar → decidir.
 */
const GRUPOS: { titulo: string; itens: ItemNav[] }[] = [
  {
    titulo: 'Começar',
    itens: [
      { id: 'inicio', rotulo: 'Início', icone: 'inicio', destino: url.inicio() },
      { id: 'perguntar', rotulo: 'Tirar uma dúvida', icone: 'duvida', destino: url.perguntar() }
    ]
  },
  {
    titulo: 'Consultar',
    itens: [
      { id: 'catalogo', rotulo: 'Documentos', icone: 'documento', destino: url.catalogo() },
      { id: 'atencao', rotulo: 'Fila de atenção', icone: 'raio', destino: url.atencao() },
      { id: 'radar', rotulo: 'Regras que mudaram', icone: 'regras', destino: url.radar() },
      { id: 'comparar', rotulo: 'Comparar versões', icone: 'comparar', destino: url.comparar() },
      { id: 'perspectivas', rotulo: 'Resumo por área', icone: 'resumo', destino: url.painel() },
      { id: 'grafo', rotulo: 'Ligações entre documentos', icone: 'mapa', destino: url.mapa() }
    ]
  },
  {
    titulo: 'Decidir e registrar',
    itens: [
      { id: 'ese', rotulo: 'Simular uma mudança', icone: 'simular', destino: url.ese() },
      { id: 'relatorio', rotulo: 'Montar relatório', icone: 'relatorio', destino: url.relatorio() },
      { id: 'enviar', rotulo: 'Enviar documentos', icone: 'enviar', destino: url.enviar() }
    ]
  }
];

export const TITULOS: Record<Tela, string> = {
  inicio: 'Início',
  perguntar: 'Tirar uma dúvida',
  perspectivas: 'Resumo por área',
  radar: 'Regras que mudaram',
  ese: 'Simular uma mudança',
  catalogo: 'Documentos',
  documento: 'Documento',
  ficha: 'Ficha do documento',
  atencao: 'Fila de atenção',
  comparar: 'Comparar versões',
  grafo: 'Ligações entre documentos',
  relatorio: 'Montar relatório',
  enviar: 'Enviar documentos',
  revisar: 'Conferir documento lido',
  lote: 'Lote enviado',
  'nao-encontrada': 'Página não encontrada'
};

const MAPA_ATIVO: Partial<Record<Tela, Tela>> = { revisar: 'enviar', lote: 'enviar', ficha: 'catalogo', documento: 'catalogo' };

interface SidebarProps {
  telaAtiva: Tela;
  documentoAtivoCodigo?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ telaAtiva, documentoAtivoCodigo }) => {
  const ativa = MAPA_ATIVO[telaAtiva] ?? telaAtiva;
  const aberto = useEstado((e) => e.menuAberto);
  const ir = (destino: string) => {
    acoes.abrirMenu(false);
    navegar(destino);
  };
  const link = (item: ItemNav) => (
    <li key={item.id}>
      <a
        href={item.destino}
        className="side-link"
        aria-current={ativa === item.id ? 'page' : undefined}
        title={item.rotulo}
        onClick={(e) => {
          e.preventDefault();
          ir(item.destino);
        }}
        data-testid={`tab-${item.id}`}
      >
        <Icon nome={item.icone} />
        <span>{item.rotulo}</span>
        {item.id === 'catalogo' && <span className="side-count" aria-label="13 documentos">13</span>}
      </a>
    </li>
  );

  return (
    <>
      <div className={`menu-fundo ${aberto ? 'aberto' : ''}`} onClick={() => acoes.abrirMenu(false)} aria-hidden="true" />
      <aside
        id="menu-principal"
        className={`app-sidebar print-hidden ${aberto ? 'aberto' : ''}`}
        data-testid="menu-lateral"
        onKeyDown={(e) => e.key === 'Escape' && acoes.abrirMenu(false)}
      >
        <a
          href="/"
          className="side-brand"
          onClick={(e) => {
            e.preventDefault();
            ir('/');
          }}
          aria-label="Arquivo Central de Normas, ir para o início"
        >
          <span className="side-logo" aria-hidden="true">
            A
          </span>
          <span className="side-brand-text">
            <strong>ACME</strong>
          </span>
        </a>

        <nav className="side-nav" aria-label="Menu principal">
          {GRUPOS.map((g) => (
            <div className="side-group" key={g.titulo}>
              <p className="side-group-title">{g.titulo}</p>
              <ul>{g.itens.map(link)}</ul>
            </div>
          ))}
          {documentoAtivoCodigo && (
            <div className="side-group">
              <p className="side-group-title">Último documento aberto</p>
              <ul>
                {link({ id: 'documento', rotulo: documentoAtivoCodigo, icone: 'documento', destino: url.documento(documentoAtivoCodigo) })}
              </ul>
            </div>
          )}
        </nav>

      </aside>
    </>
  );
};

const TAMANHOS: { id: TamanhoTexto; rotulo: string; descricao: string }[] = [
  { id: 'normal', rotulo: 'A', descricao: 'Texto normal' },
  { id: 'grande', rotulo: 'A+', descricao: 'Texto grande' },
  { id: 'maior', rotulo: 'A++', descricao: 'Texto maior' }
];

export const Topbar: React.FC<{ telaAtiva: Tela }> = ({ telaAtiva }) => {
  const perfil = useEstado((e) => e.perfil);
  const nSelecao = useEstado((e) => e.selecao.length);
  const tamanho = useEstado((e) => e.tamanhoTexto);
  const menuAberto = useEstado((e) => e.menuAberto);
  const [pergunta, setPergunta] = useState('');

  return (
    <header className="app-topbar print-hidden">
      <button
        type="button"
        className="btn-menu"
        onClick={() => acoes.abrirMenu(!menuAberto)}
        aria-expanded={menuAberto}
        aria-controls="menu-principal"
        data-testid="btn-abrir-menu"
      >
        <Icon nome="menu" tamanho={18} /> Menu
      </button>

      <span className="sr-only" aria-live="polite">
        Você está em {TITULOS[telaAtiva]}
      </span>

      {/* T0: pergunta rápida (FLUXO v2). Enter abre a dúvida já respondida. */}
      <form
        className="pergunta-rapida"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (!pergunta.trim()) return;
          navegar(url.perguntar(pergunta.trim()));
          setPergunta('');
        }}
      >
        <label htmlFor="pergunta-rapida" className="sr-only">
          Pergunta rápida
        </label>
        <Icon nome="busca" tamanho={16} />
        <input
          id="pergunta-rapida"
          type="search"
          placeholder="Pergunte ao acervo…"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          data-testid="pergunta-rapida"
        />
      </form>

      <div className="topbar-actions">
        <div className="tamanho-texto" role="group" aria-label="Tamanho do texto">
          {TAMANHOS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tamanho === t.id}
              aria-label={t.descricao}
              title={t.descricao}
              onClick={() => acoes.definirTamanhoTexto(t.id)}
              data-testid={`tamanho-${t.id}`}
            >
              {t.rotulo}
            </button>
          ))}
        </div>

        <label className="perfil-topo">
          <span className="sr-only">Mostrar as respostas para</span>
          <select
            value={perfil ?? ''}
            onChange={(e) => acoes.definirPerfil((e.target.value || null) as PerfilUsuario)}
            data-testid="select-perfil-global"
            title="Muda a ordem da resposta para a sua função. O conteúdo e as fontes são os mesmos."
          >
            <option value="">Sou: qualquer pessoa</option>
            {PERFIS.map((p) => (
              <option key={p.id} value={p.id}>
                Sou: {p.nome}
              </option>
            ))}
          </select>
        </label>

        <a
          href={url.relatorio({ selecao: true })}
          className="selecao-topo"
          onClick={(e) => {
            e.preventDefault();
            navegar(url.relatorio({ selecao: true }));
          }}
          aria-label={`Meu relatório: ${nSelecao} ${nSelecao === 1 ? 'item guardado' : 'itens guardados'}`}
          data-testid="contador-selecao"
        >
          <Icon nome="relatorio" tamanho={16} /> Meu relatório <span className="selecao-n">{nSelecao}</span>
        </a>

        <span className="avatar-topo" role="img" aria-label="Seu perfil" title="Seu perfil">
          <Icon nome="usuario" tamanho={16} />
        </span>
      </div>
    </header>
  );
};

/** Rodapé: de onde vêm as respostas e a data dos documentos (RF31, RNF08). */
export const Rodape: React.FC<{ ia?: string; dataReferencia: string }> = ({ ia, dataReferencia }) => (
  <footer className="app-footer print-hidden">
    {isMockMode() ? (
      <span className="status-pill status-mock" data-testid="status-modo-mock">
        Dados de exemplo
      </span>
    ) : (
      <span className="status-pill status-api" data-testid="status-modo-api" title={`Conectado à API em ${getApiBaseUrl()}`}>
        Conectado ao sistema
      </span>
    )}
    <span>
      {ia === 'bedrock'
        ? 'Respostas escritas com inteligência artificial, sempre a partir dos documentos.'
        : 'As respostas usam só trechos copiados dos documentos.'}
    </span>
    <span>Documentos atualizados em {dataReferencia}</span>
  </footer>
);
