import { useSyncExternalStore } from 'react';

/**
 * Rotas profundas (FLUXO-DE-TELAS-v2 §1), sem dependência externa: History API.
 * Cada tela tem um endereço próprio, usado pelos links do Slack/Teams e pelas citações.
 */

export type Tela =
  | 'inicio'
  | 'perguntar'
  | 'perspectivas'
  | 'radar'
  | 'ese'
  | 'catalogo'
  | 'documento'
  | 'ficha'
  | 'atencao'
  | 'comparar'
  | 'grafo'
  | 'relatorio'
  | 'enviar'
  | 'revisar'
  | 'lote'
  | 'nao-encontrada';

export interface Rota {
  tela: Tela;
  params: Record<string, string>;
  query: URLSearchParams;
  hash: string;
}

const ROTAS: [RegExp, Tela, string[]][] = [
  [/^\/$/, 'inicio', []],
  [/^\/perguntar\/?$/, 'perguntar', []],
  [/^\/painel(?:\/([\w-]+))?\/?$/, 'perspectivas', ['perspectiva']],
  [/^\/radar\/?$/, 'radar', []],
  [/^\/e-se\/?$/, 'ese', []],
  [/^\/catalogo\/?$/, 'catalogo', []],
  [/^\/documento\/([^/]+)\/ficha\/?$/, 'ficha', ['codigo']],
  [/^\/atencao\/?$/, 'atencao', []],
  [/^\/documento\/([^/]+)\/?$/, 'documento', ['codigo']],
  [/^\/comparar\/?$/, 'comparar', []],
  [/^\/mapa\/?$/, 'grafo', []],
  [/^\/relatorio\/?$/, 'relatorio', []],
  [/^\/enviar\/?$/, 'enviar', []],
  [/^\/enviar\/lote\/([\w-]+)\/?$/, 'lote', ['id']],
  [/^\/enviar\/([\w-]+)\/?$/, 'revisar', ['id']]
];

export function lerRota(loc: Pick<Location, 'pathname' | 'search' | 'hash'> = window.location): Rota {
  const query = new URLSearchParams(loc.search);
  const hash = decodeURIComponent(loc.hash.replace(/^#/, ''));
  for (const [re, tela, nomes] of ROTAS) {
    const m = re.exec(loc.pathname);
    if (m) {
      const params: Record<string, string> = {};
      nomes.forEach((n, i) => {
        if (m[i + 1]) params[n] = decodeURIComponent(m[i + 1]);
      });
      return { tela, params, query, hash };
    }
  }
  return { tela: 'nao-encontrada', params: {}, query, hash };
}

const ouvintes = new Set<() => void>();
let atual = typeof window !== 'undefined' ? window.location.href : '';
const notificar = () => {
  atual = window.location.href;
  ouvintes.forEach((f) => f());
};
if (typeof window !== 'undefined') window.addEventListener('popstate', notificar);

export function navegar(url: string, substituir = false) {
  if (substituir) window.history.replaceState(null, '', url);
  else window.history.pushState(null, '', url);
  notificar();
  // Trocar de tela começa no topo. Atualizar a própria tela (filtro, valor da simulação)
  // usa `substituir` e mantém a pessoa onde ela está.
  if (!substituir && !url.includes('#')) window.scrollTo?.({ top: 0 });
}

export function useRota(): Rota {
  const href = useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => atual,
    () => atual
  );
  return lerRota(new URL(href || window.location.href));
}

/** Construtores de endereço, para não espalhar strings pelo código. */
export const url = {
  inicio: (doc?: string, bloco?: string) => {
    const qs = new URLSearchParams();
    if (doc) qs.set('doc', doc);
    if (bloco) qs.set('bloco', bloco);
    const t = qs.toString();
    return `/${t ? '?' + t : ''}`;
  },
  perguntar: (q?: string, documentos?: string[]) => {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    if (documentos && documentos.length) qs.set('doc', documentos.join(','));
    const t = qs.toString();
    return `/perguntar${t ? '?' + t : ''}`;
  },
  ficha: (codigo: string, versao?: string, bloco?: string) => {
    const qs = new URLSearchParams();
    if (versao) qs.set('versao', versao);
    if (bloco) qs.set('bloco', bloco);
    const t = qs.toString();
    return `/documento/${encodeURIComponent(codigo)}/ficha${t ? '?' + t : ''}`;
  },
  atencao: (filtros: { tema?: string; tipo?: string; situacao?: string; sinal?: string; ordenar?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v) as [string, string][]).toString();
    return `/atencao${qs ? '?' + qs : ''}`;
  },
  painel: (p?: string, filtros: { tema?: string; prazo?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v) as [string, string][]).toString();
    return `/painel${p ? '/' + p : ''}${qs ? '?' + qs : ''}`;
  },
  radar: (opc: { item?: string; tema?: string; codigo?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(opc).filter(([, v]) => v) as [string, string][]).toString();
    return `/radar${qs ? '?' + qs : ''}`;
  },
  ese: (regra?: string, valor?: number) =>
    `/e-se${regra ? `?regra=${regra}${valor !== undefined ? `&valor=${valor}` : ''}` : ''}`,
  catalogo: (tema?: string) => (tema ? `/catalogo?tema=${tema}` : '/catalogo'),
  documento: (codigo: string, versao?: string, secao?: string) =>
    `/documento/${encodeURIComponent(codigo)}${versao ? `?versao=${versao}` : ''}${secao ? `#secao-${encodeURIComponent(secao)}` : ''}`,
  comparar: (codigo?: string, de?: string, para?: string) =>
    codigo ? `/comparar?codigo=${codigo}${de ? `&de=${de}` : ''}${para ? `&para=${para}` : ''}` : '/comparar',
  mapa: () => '/mapa',
  relatorio: (opc: { perspectiva?: string; selecao?: boolean } = {}) =>
    opc.selecao ? '/relatorio?selecao=1' : opc.perspectiva ? `/relatorio?perspectiva=${opc.perspectiva}` : '/relatorio',
  enviar: () => '/enviar',
  revisar: (id: string) => `/enviar/${id}`,
  lote: (id: string) => `/enviar/lote/${id}`
};
