import { PerfilUsuario } from '../api/types';

/** Os 6 perfis do fluxo v2 (C1). O perfil muda a forma e a ordem da resposta, nunca o conteúdo nem as fontes. */
export const PERFIS: { id: Exclude<PerfilUsuario, null>; nome: string }[] = [
  { id: 'empregado', nome: 'Empregado' },
  { id: 'gestor', nome: 'Gestor' },
  { id: 'diretoria', nome: 'Diretoria' },
  { id: 'financeiro', nome: 'Financeiro' },
  { id: 'juridico', nome: 'Jurídico e Contratos' },
  { id: 'rh', nome: 'RH' }
];

export const nomePerfil = (p: PerfilUsuario) => PERFIS.find((x) => x.id === p)?.nome ?? 'Geral';

const FERIAS = 'Qual a antecedência mínima para solicitar férias?';
const FRACIONAR = 'Como funciona o fracionamento de férias?';
const COWORKING = 'Qual o valor global do contrato de coworking e a multa por inexecução?';
const IDEIAS = 'Qual a premiação máxima prevista para o Programa Ideias em Campo?';
const NAO_CONSTA = 'Uma mesma pessoa pode elaborar, revisar e aprovar um documento?';

export const SUGESTOES_POR_PERFIL: Record<string, string[]> = {
  empregado: [FERIAS, FRACIONAR, IDEIAS],
  gestor: [FERIAS, FRACIONAR, NAO_CONSTA],
  diretoria: [COWORKING, IDEIAS, NAO_CONSTA],
  financeiro: [COWORKING, IDEIAS, FERIAS],
  juridico: [COWORKING, NAO_CONSTA, FERIAS],
  rh: [FERIAS, FRACIONAR, NAO_CONSTA]
};
