export interface DocumentoResumo {
  codigo: string;
  titulo: string;
  tipo: string;
  tipo_nome: string;
  versao: string;
  fase: string;
  vigencia: string;
  vinculado_a: string | null;
  referencia: string | null;
  assunto: string;
  substituido: boolean;
}

export interface SecaoDocumento {
  id: string;
  titulo: string;
  texto: string;
}

export interface DocumentoDetalhe extends DocumentoResumo {
  secoes: SecaoDocumento[];
}

export interface Citacao {
  codigo: string;
  versao: string;
  secao: string;
  trecho: string;
}

export interface RespostaPerguntar {
  resposta: string;
  consta: boolean;
  citacoes: Citacao[];
  avisos: string[];
}

/** Perfis do fluxo v2 (C1). ggc/gfi/gco seguem aceitos como apelidos da v0. */
export type PerfilUsuario =
  | 'empregado'
  | 'gestor'
  | 'diretoria'
  | 'financeiro'
  | 'juridico'
  | 'rh'
  | 'ggc'
  | 'gfi'
  | 'gco'
  | null;

export interface PerguntaRequest {
  pergunta: string;
  perfil?: PerfilUsuario;
}

export interface SaudeResponse {
  status: string;
  documentos: number;
  /** Modo de IA (RF22): "bedrock" ou "extrativo". */
  ia?: string;
  /** Data de referência do acervo (C4), AAAA-MM-DD. */
  data_referencia?: string;
}

export interface CodigoInfo {
  codigo: string;
  tipo: string;
  tipo_nome: string;
  vinculado_a: string | null;
  serie: string;
  serie_nome: string;
  vigencia_regra: string;
  existe_no_acervo: boolean;
  observacao: string;
}

// ==========================================
// Tipos de Inteligência (Issue #3 / Adendo v0.1)
// ==========================================

export interface FonteCita {
  codigo: string;
  versao: string;
  secao: string;
  trecho: string;
}

export interface DestaqueItem {
  titulo: string;
  valor: string;
  fonte: FonteCita;
  fonte_anterior?: FonteCita;
  aviso?: string;
}

export interface ValorItem {
  rotulo: string;
  numero: number;
  unidade: string;
  fonte: FonteCita;
}

export interface PrazoItem {
  data: string;
  evento: string;
  marco?: string | null;
  cenario?: string | null;
  fonte: FonteCita;
}

export interface ResponsavelItem {
  papel: string;
  responsabilidade: string;
  fonte: FonteCita;
}

export interface RiscoItem {
  descricao: string;
  fonte: FonteCita;
}

export interface PerspectivaResumo {
  id: string;
  nome: string;
}

export interface PerspectivaDetalhe {
  id: string;
  nome: string;
  destaques: DestaqueItem[];
  valores: ValorItem[];
  prazos: PrazoItem[];
  responsaveis: ResponsavelItem[];
  riscos: RiscoItem[];
}

export interface GrafoNo {
  id: string;
  codigo: string;
  tipo: string;
  versao: string;
  substituido: boolean;
  existe_no_acervo: boolean;
}

export type GrafoArestaTipo = 'vinculado_a' | 'referencia' | 'substitui';

export interface GrafoAresta {
  de: string;
  para: string;
  tipo: GrafoArestaTipo;
}

export interface GrafoAcervo {
  nos: GrafoNo[];
  arestas: GrafoAresta[];
}

export type TipoMudanca = 'alterado' | 'incluido' | 'removido';

export interface MudancaSecao {
  secao: string;
  tipo: TipoMudanca;
  antes?: string;
  depois?: string;
}

export interface CompararResultado {
  codigo: string;
  de: string;
  para: string;
  mudancas: MudancaSecao[];
  resumo: string[];
}

export interface RelatorioItem {
  texto: string;
  fonte: FonteCita;
}

export interface RelatorioSecao {
  titulo: string;
  itens: RelatorioItem[];
}

export interface RelatorioExecutivo {
  titulo: string;
  gerado_em: string;
  secoes: RelatorioSecao[];
}


// ==========================================
// Fluxo de telas v2 (adendos v0.2 e v0.3)
// ==========================================

/** Camada da norma (C15): grupo do catálogo e pai direto pelo "Vinculado a". */
export interface Camada {
  sigla: string;
  tipo_nome: string;
  grupo: string;
  subordinado_a: string | null;
}

export interface FonteRadar extends FonteCita {
  situacao: 'vigente' | 'substituida';
}

export interface RadarItem {
  id: string;
  tipo: 'versao_substituida' | 'divergencia' | 'referencia_ausente';
  severidade: 'divergente' | 'atencao';
  tema: string[];
  titulo: string;
  explicacao: string;
  fontes: FonteRadar[];
  codigo_ausente?: string;
  citado_por?: FonteCita[];
  precedencia?: FonteCita;
  proxima_acao: string;
  responsavel: string;
  regra_simulavel?: string;
}

export interface RegraSimulavel {
  id: string;
  nome: string;
  unidade: string;
  valor_atual: number;
  minimo: number;
  maximo: number;
  fonte: FonteCita;
}

export interface LinhaTempoSimulada {
  etapa: string;
  atual: string;
  simulado: string;
  muda: boolean;
  conflito: boolean;
}

export interface ImpactoSimulacao {
  tipo: 'conflito_interno' | 'conflito_aviso' | 'conflito_decisao_gestor' | 'conflito_assinatura' | 'revisar_documento';
  descricao: string;
  fonte: FonteCita;
}

export interface SimulacaoResultado {
  regra: string;
  valor: number;
  exemplo: string;
  linha_do_tempo: LinhaTempoSimulada[];
  impactos: ImpactoSimulacao[];
  resumo: string;
  aviso: string[];
  proxima_acao: string;
}

export interface ArquivoLote {
  id: string;
  nome: string;
  tipo: 'digital' | 'foto' | 'desconhecido';
  estado: 'enviando' | 'classificado' | 'sem-tema' | 'revisar' | 'publicado' | 'erro';
  tema: string;
  motivo: string;
  erro: string;
}
