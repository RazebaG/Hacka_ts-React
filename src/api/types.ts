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

export type PerfilUsuario = 'empregado' | 'gestor' | 'ggc' | 'gfi' | 'gco' | null;

export interface PerguntaRequest {
  pergunta: string;
  perfil?: PerfilUsuario;
}

export interface SaudeResponse {
  status: string;
  documentos: number;
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
// Tipos de Radar e Simulação (Adendo v0.2 / Issue #5)
// ==========================================

export type RadarItemTipo = 'versao_substituida' | 'referencia_ausente';
export type RadarItemStatus = 'divergente' | 'atencao';
export type RadarItemSeveridade = 'alta' | 'media' | 'baixa';

export interface RadarItem {
  id: string;
  tipo: RadarItemTipo;
  status: RadarItemStatus;
  severidade: RadarItemSeveridade;
  titulo: string;
  explicacao: string;
  perspectivas: string[];
  codigo_ausente: string | null;
  citado_por?: string[];
  fontes: FonteCita[];
}

export interface RadarResumo {
  divergente: number;
  atencao: number;
}

export interface RadarResponse {
  gerado_em: string;
  resumo: RadarResumo;
  itens: RadarItem[];
}

export interface RegraItem {
  id: string;
  rotulo: string;
  valor: number;
  unidade: string;
  fonte: FonteCita;
}

export interface SimularRequest {
  regra: string;
  novo_valor: number;
  cenario?: string;
}

export interface MarcoLinhaDoTempo {
  marco: string;
  antes: string;
  depois: string;
  muda: boolean;
  fonte: FonteCita;
}

export type TipoImpacto = 'conflito_interno' | 'revisar_documento';

export interface ImpactoSimulacao {
  tipo: TipoImpacto;
  descricao: string;
  codigo?: string;
  versao?: string;
  fontes: FonteCita[];
}

export interface SimularResponse {
  regra: string;
  valor_atual: number;
  novo_valor: number;
  unidade: string;
  linha_do_tempo: MarcoLinhaDoTempo[];
  impactos: ImpactoSimulacao[];
  resumo: string[];
  aviso: string;
}


