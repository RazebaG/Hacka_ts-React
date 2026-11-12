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
      { id: 'inicio', rotulo: 'Início', icone: 'painel', destino: url.inicio() },
      { id: 'perguntar', rotulo: 'Tirar uma dúvida', icone: 'perguntar', destino: url.perguntar() }
    ]
  },
  {
    titulo: 'Consultar',
    itens: [
      { id: 'catalogo', rotulo: 'Documentos', icone: 'catalogo', destino: url.catalogo() },
      { id: 'radar', rotulo: 'Regras que mudaram', icone: 'alerta', destino: url.radar() },
      { id: 'comparar', rotulo: 'Comparar versões', icone: 'comparar', destino: url.comparar() },
      { id: 'perspectivas', rotulo: 'Resumo por área', icone: 'gestao', destino: url.painel() },
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
  comparar: 'Comparar versões',
  grafo: 'Ligações entre documentos',
  relatorio: 'Montar relatório',
  enviar: 'Enviar documentos',
  revisar: 'Conferir documento lido',
  'nao-encontrada': 'Página não encontrada'
};

const MAPA_ATIVO: Partial<Record<Tela, Tela>> = { revisar: 'enviar' };

interface SidebarProps {
  telaAtiva: Tela;
  documentoAtivoCodigo?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ telaAtiva, documentoAtivoCodigo }) => {
  const ativa = MAPA_ATIVO[telaAtiva] ?? telaAtiva;
  const recolhido = useEstado((e) => e.menuRecolhido);
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
        className={`app-sidebar print-hidden ${recolhido ? 'recolhido' : ''} ${aberto ? 'aberto' : ''}`}
        data-testid="menu-lateral"
        onKeyDown={(e) => e.key === 'Escape' && acoes.abrirMenu(false)}
      >
        <button
          type="button"
          className="side-toggle"
          onClick={() => acoes.alternarMenu()}
          aria-expanded={!recolhido}
          aria-label={recolhido ? 'Mostrar os nomes do menu' : 'Esconder os nomes do menu'}
          title={recolhido ? 'Mostrar os nomes do menu' : 'Esconder os nomes do menu'}
          data-testid="btn-recolher-menu"
        >
          <Icon nome={recolhido ? 'seta' : 'recolher'} tamanho={16} />
        </button>
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
            ACME
          </span>
          <span className="side-brand-text">
            <strong>Arquivo Central</strong>
            <small>de Normas</small>
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

        <p className="side-foot">HACKA/TS 2026 · Desafio 2</p>
      </aside>
    </>
  );
};

/** Roteiro da apresentação (6 passos, ≈ 2 min). */
const CENAS: { rotulo: string; destino: string }[] = [
  { rotulo: 'Enviar a foto de um documento', destino: url.enviar() },
  { rotulo: 'Perguntar o que mudou nas férias', destino: url.perguntar('Qual a antecedência mínima para solicitar férias?') },
  { rotulo: 'Ver a regra antiga e a nova lado a lado', destino: url.radar({ item: 'ferias-antecedencia' }) },
  { rotulo: 'Resumo financeiro: R$ 18.250,00', destino: url.painel('financeiro') },
  { rotulo: 'Simular: e se forem 30 dias?', destino: url.ese('ferias_antecedencia_dias', 30) },
  { rotulo: 'Montar o relatório', destino: url.relatorio({ selecao: true }) }
];

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

      <nav className="crumbs" aria-label="Você está em">
        <span>Arquivo Central</span>
        <Icon nome="seta" tamanho={14} />
        <span aria-current="page">{TITULOS[telaAtiva]}</span>
      </nav>

      <form
        className="busca-topo"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (!pergunta.trim()) return;
          navegar(url.perguntar(pergunta.trim()));
          setPergunta('');
        }}
      >
        <label htmlFor="busca-topo" className="sr-only">
          Escreva sua dúvida
        </label>
        <input id="busca-topo" type="search" placeholder="Escreva sua dúvida e tecle Enter" value={pergunta} onChange={(e) => setPergunta(e.target.value)} />
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
          Meu relatório <span className="selecao-n">{nSelecao}</span>
        </a>

        <details className="demo-menu">
          <summary aria-label="Roteiro da apresentação" title="Roteiro da apresentação">
            <Icon nome="play" tamanho={14} />
            <span className="demo-label">Apresentação</span>
          </summary>
          <ol className="demo-list" aria-label="Passos da apresentação">
            {CENAS.map((c, i) => (
              <li key={c.rotulo}>
                <a
                  href={c.destino}
                  onClick={(e) => {
                    e.preventDefault();
                    navegar(c.destino);
                    e.currentTarget.closest('details')?.removeAttribute('open');
                  }}
                >
                  <span className="demo-n">{i + 1}</span>
                  {c.rotulo}
                </a>
              </li>
            ))}
          </ol>
        </details>
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
