import { useSyncExternalStore } from 'react';
import { FonteCita, PerfilUsuario } from '../api/types';

/**
 * Estado global do app (perfil, seleção para relatório, avaliações, decisões, modal M1).
 * Store de módulo com useSyncExternalStore: funciona com ou sem o App em volta,
 * o que mantém as telas testáveis isoladamente.
 */

export interface ItemSelecao {
  id: string;
  texto: string;
  fonte: Pick<FonteCita, 'codigo' | 'versao' | 'secao'>;
  hipotetico?: boolean;
}

export interface Avaliacao {
  resposta_id: string;
  util: boolean;
  motivo?: string;
  comentario?: string;
  canal: 'web' | 'slack' | 'teams';
  registrado_em: string;
}

export interface Decisao {
  id: string;
  item: string;
  fontes: Pick<FonteCita, 'codigo' | 'versao' | 'secao'>[];
  acao: 'encaminhar' | 'aceitar' | 'descartar';
  responsavel: string;
  nota: string;
  registrado_em: string;
}

export interface OrigemDecisao {
  item: string;
  fontes: Pick<FonteCita, 'codigo' | 'versao' | 'secao'>[];
  responsavel: string;
}

interface Estado {
  perfil: PerfilUsuario;
  selecao: ItemSelecao[];
  avaliacoes: Avaliacao[];
  decisoes: Decisao[];
  decisaoAberta: OrigemDecisao | null;
  digitalizados: string[]; // códigos publicados pela digitalização (T13)
  menuRecolhido: boolean; // menu lateral só com ícones, escolhido pela pessoa
  menuAberto: boolean; // gaveta do menu no celular
  tamanhoTexto: TamanhoTexto; // A−, A, A+
}

export type TamanhoTexto = 'normal' | 'grande' | 'maior';

const ler = <T,>(chave: string, padrao: T): T => {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
};
const gravar = (chave: string, valor: unknown) => {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* navegador sem armazenamento: segue só em memória */
  }
};

let estado: Estado = {
  perfil: ler<PerfilUsuario>('ac.perfil', null),
  selecao: ler<ItemSelecao[]>('ac.selecao', []),
  avaliacoes: [],
  decisoes: [],
  decisaoAberta: null,
  digitalizados: [],
  menuRecolhido: ler<boolean>('ac.menuRecolhido', false),
  menuAberto: false,
  tamanhoTexto: ler<TamanhoTexto>('ac.tamanhoTexto', 'normal')
};

const ouvintes = new Set<() => void>();
const definir = (parcial: Partial<Estado>) => {
  estado = { ...estado, ...parcial };
  ouvintes.forEach((f) => f());
};
const assinar = (f: () => void) => {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
};

export function useEstado<T>(seletor: (e: Estado) => T): T {
  return useSyncExternalStore(assinar, () => seletor(estado), () => seletor(estado));
}

export const acoes = {
  definirPerfil(perfil: PerfilUsuario) {
    gravar('ac.perfil', perfil);
    definir({ perfil });
  },
  alternarSelecao(item: ItemSelecao) {
    const existe = estado.selecao.some((x) => x.id === item.id);
    const selecao = existe ? estado.selecao.filter((x) => x.id !== item.id) : [...estado.selecao, item];
    gravar('ac.selecao', selecao);
    definir({ selecao });
  },
  moverSelecao(indice: number, direcao: -1 | 1) {
    const s = [...estado.selecao];
    const j = indice + direcao;
    if (j < 0 || j >= s.length) return;
    [s[indice], s[j]] = [s[j], s[indice]];
    gravar('ac.selecao', s);
    definir({ selecao: s });
  },
  removerSelecao(id: string) {
    const selecao = estado.selecao.filter((x) => x.id !== id);
    gravar('ac.selecao', selecao);
    definir({ selecao });
  },
  limparSelecao() {
    gravar('ac.selecao', []);
    definir({ selecao: [] });
  },
  registrarAvaliacao(a: Omit<Avaliacao, 'registrado_em'>) {
    // Cada clique gera 1 registro (canal compartilhado: várias pessoas avaliam a mesma resposta)
    definir({ avaliacoes: [...estado.avaliacoes, { ...a, registrado_em: new Date().toISOString() }] });
  },
  abrirDecisao(origem: OrigemDecisao) {
    definir({ decisaoAberta: origem });
  },
  fecharDecisao() {
    definir({ decisaoAberta: null });
  },
  registrarDecisao(d: Omit<Decisao, 'id' | 'registrado_em'>): Decisao {
    const nova: Decisao = { ...d, id: `dec-${estado.decisoes.length + 1}`, registrado_em: new Date().toISOString() };
    definir({ decisoes: [nova, ...estado.decisoes] });
    return nova;
  },
  definirTamanhoTexto(tamanhoTexto: TamanhoTexto) {
    gravar('ac.tamanhoTexto', tamanhoTexto);
    definir({ tamanhoTexto });
  },
  abrirMenu(menuAberto: boolean) {
    definir({ menuAberto });
  },
  alternarMenu() {
    gravar('ac.menuRecolhido', !estado.menuRecolhido);
    definir({ menuRecolhido: !estado.menuRecolhido });
  },
  publicarDigitalizado(codigo: string) {
    if (!estado.digitalizados.includes(codigo)) definir({ digitalizados: [...estado.digitalizados, codigo] });
  }
};

/** Para testes: volta ao estado inicial. */
export function reiniciarEstado() {
  estado = { perfil: null, selecao: [], avaliacoes: [], decisoes: [], decisaoAberta: null, digitalizados: [], menuRecolhido: false, menuAberto: false, tamanhoTexto: 'normal' };
  ouvintes.forEach((f) => f());
}
