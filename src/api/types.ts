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
