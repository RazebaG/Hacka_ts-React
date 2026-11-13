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
  /** C23 (adendo v0.4): fontes em evidência e escopo. Opcionais até o backend entregar. */
  consultados?: DocumentoConsultado[];
  escopo?: { fixado: boolean; documentos: string[] };
  documentos_pesquisados?: number;
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

/* ---------- Adendo v0.4: Ficha do Documento (C22) e Fontes em evidência (C23) ---------- */
export type OrigemItem = 'literal' | 'resumo' | 'calculado';

export interface FonteFicha {
  codigo: string;
  versao: string;
  secao: string;
  trecho: string;
  camada: unknown;
}

export interface ItemFicha {
  id: string;
  titulo: string;
  valor: string | null;
  texto: string | null;
  origem: OrigemItem;
  fontes: FonteFicha[];
  calculo?: string;
}

export interface AcaoFicha {
  id: string;
  acao: string;
  quem: string | null;
  prazo: { data: string | null; regra: string | null } | null;
  consequencia: string | null;
  urgencia: 'alta' | 'media' | 'baixa';
  origem: OrigemItem;
  fontes: FonteFicha[];
}

export interface CelulaMapa {
  secao_id: string;
  titulo: string;
  ordem: number;
  peso: number;
  sinais: { prazo: number; valor: number; obrigacao: number; risco: number };
  intensidade: number;
}

export interface AlertaFicha {
  tipo: 'versao_substituida' | 'referencia_ausente' | 'divergencia' | 'vigencia_proxima';
  titulo: string;
  explicacao: string;
  radar_id: string | null;
  fontes: FonteFicha[];
}

export interface CampoGov {
  valor: string | null;
  fonte: { campo: string; trecho: string } | null;
}

export interface FichaDocumento {
  codigo: string;
  versao: string;
  gerada_em: string;
  perfil: string | null;
  linguagem: string;
  estado: 'gerando' | 'parcial' | 'pronta' | 'erro';
  progresso?: { etapa: string; feito: number; total: number };
  modo: { ia: 'bedrock' | 'extrativo'; modelo: string | null };
  identidade: {
    titulo: string;
    tipo: string;
    tipo_nome: string;
    camada: { sigla: string; tipo_nome: string; grupo: string; subordinado_a: string | null };
    tema: { assunto: string };
    fase: string;
    substituido: boolean;
    vigente_em: { codigo: string; versao: string } | null;
    vigencia: { texto: string; inicio: string | null; fim: string | null; dias_restantes: number | null };
    origem: 'acervo' | 'upload' | 'digitalizado';
    classificacao: string | null;
    metricas: { secoes: number; palavras: number; paginas_estimadas: number; leitura_integral_min: number; leitura_ficha_min: number };
  };
  semaforo: { nivel: 'ok' | 'atencao' | 'critico'; motivos: string[] };
  governanca: {
    elaborado_por: CampoGov;
    aprovado_por: CampoGov;
    aprovado_em: CampoGov;
    assinada_em: CampoGov;
    vinculado_a: CampoGov;
    referencias: string[];
    cadeia: string[];
  };
  bluf: ItemFicha | null;
  numeros: ItemFicha[];
  acoes: AcaoFicha[];
  pontos: {
    obrigacoes: ItemFicha[];
    prazos: ItemFicha[];
    valores: ItemFicha[];
    riscos: ItemFicha[];
    responsaveis: ItemFicha[];
    condicoes: ItemFicha[];
  };
  mapa_calor: CelulaMapa[];
  alertas: AlertaFicha[];
  perguntas_sugeridas: string[];
  cobertura: { secoes_lidas: number; secoes_total: number; itens_verificados: number; itens_descartados: number; motivos_descarte: string[] };
  /** Revisão 13/11 (RF73/RF74): família pela taxonomia e blocos ordenados por relevância. */
  familia?: FamiliaDocumento;
  blocos?: BlocoDecisao[];
  /** C26 (P1): o que mudou desde a versão anterior. */
  delta?: { de: string; para: string; resumo: string[]; mudancas: number } | null;
}

/** C23: documento consultado para responder (citado ou só recuperado). */
export interface DocumentoConsultado {
  codigo: string;
  versao: string;
  titulo: string;
  fase: string;
  substituido: boolean;
  vigente_em: { codigo: string; versao: string } | null;
  aprovado_por?: string | null;
  citado: boolean;
  secoes_usadas: string[];
  trechos?: { secao: string; trecho: string }[];
  relevancia?: number;
}

/** C25: Fila de atenção (triagem). Usa só o relance; nunca gera ficha na hora. */
export interface TriagemItem {
  codigo: string;
  versao: string;
  titulo: string;
  tipo: string;
  tema: string;
  semaforo: { nivel: 'ok' | 'atencao' | 'critico'; motivos: string[] };
  bluf_curto: string | null;
  proximo_prazo: { data: string; evento: string } | null;
  alertas: number;
  leitura_integral_min: number;
  leitura_ficha_min: number;
  ficha: 'pronta' | 'gerando' | 'sem_ficha';
  sinais?: { multa: boolean; divergencia: boolean };
  /** Revisão 13/11 (RF71): motivo curto do chip, ex.: "vistoria em 13 dias". */
  motivo_curto?: string;
  familia?: FamiliaDocumento;
}

export interface TriagemResposta {
  total: number;
  pagina: number;
  tamanho: number;
  pedem_acao: number;
  itens: TriagemItem[];
}

export interface FiltrosTriagem {
  /** RF71: lista curta da tela inicial (1 a 20, padrão 5 na T1). */
  limite?: number;
  perfil?: string | null;
  tema?: string;
  tipo?: string;
  situacao?: string;
  sinal?: string;
  ordenar?: string;
}

/* ---------- Revisão 13/11: Mesa de decisão e blocos por família (C22/C25) ---------- */
export type FamiliaDocumento = 'contrato' | 'norma' | 'procedimento' | 'nota_tecnica';
export type SinalBloco = 'valor' | 'prazo' | 'responsavel' | 'risco' | 'regra' | 'alerta';

export interface BlocoDecisao {
  id: string;
  titulo: string;
  destaque: string;
  apoio: string | null;
  relevancia: { posicao: number; motivo: string; pontuacao: number };
  sinal: SinalBloco;
  secoes_mapa: string[];
  itens: string[];
  alerta?: number;
}
