import type { FichaDocumento } from '../api/types';
import type { Cartao, LinhaCartao } from './cartoes';

/**
 * Notas do apresentador (MODO-APRESENTACAO-v1 §4): roteiro falado de cada cartão,
 * montado por modelo de texto a partir dos mesmos dados da ficha (sem IA).
 * Limite de palavras = tempo × 2,5 palavras por segundo (≈ 150 por minuto).
 */
export const PALAVRAS_POR_SEGUNDO = 2.5;

export const limitePalavras = (tempo_s: number) => Math.floor(tempo_s * PALAVRAS_POR_SEGUNDO);

/** Corta no limite de palavras, terminando a frase com reticências quando corta. */
export function cortarPalavras(texto: string, limite: number): string {
  const palavras = texto.trim().split(/\s+/);
  if (palavras.length <= limite) return texto.trim();
  return palavras.slice(0, limite).join(' ').replace(/[,;:.]$/, '') + '…';
}

const semPonto = (t: string) => t.trim().replace(/[.;:]+$/, '');

/** Honestidade na nota: diz quando o item é resumo da IA ou cálculo (§4). */
const ressalva = (l: LinhaCartao) => (l.origem === 'resumo' ? ' (resumo da IA, confira o trecho)' : l.origem === 'calculado' ? ' (valor calculado sobre o documento)' : '');

const comValor = (l: LinhaCartao) => `${semPonto(l.texto)}${l.valor ? `: ${l.valor}` : ''}${ressalva(l)}`;

const juntar = (partes: string[]) =>
  partes.length <= 1 ? partes.join('') : `${partes.slice(0, -1).join('; ')}; e ${partes[partes.length - 1]}`;

const NUMERAIS = ['', 'Uma coisa', 'Duas coisas', 'Três coisas', 'Quatro coisas'];

export function notaDoCartao(c: Omit<Cartao, 'notas'>, f: FichaDocumento): string {
  const id = f.identidade;
  const linhas = c.linhas.filter((l) => !l.hoje);
  let texto = '';
  switch (c.tipo) {
    case 'capa': {
      const gov = [f.governanca.elaborado_por.valor && `Foi elaborado por ${f.governanca.elaborado_por.valor}`, f.governanca.aprovado_por.valor && `aprovado por ${f.governanca.aprovado_por.valor}`]
        .filter(Boolean)
        .join(' e ');
      const vig = id.substituido ? 'Esta versão foi substituída.' : `Vigência: ${id.vigencia.texto}.`;
      texto = `Este documento é ${id.titulo} (${f.codigo}, versão ${f.versao}). ${vig}${gov ? ` ${gov}.` : ''}`;
      break;
    }
    case 'frase': {
      const l = linhas[0];
      texto = f.bluf ? `Em resumo: ${semPonto(l.texto)}${ressalva(l)}.` : `Nas palavras do documento: ${semPonto(l.texto)}. A frase foi copiada do texto, sem resumo da IA.`;
      break;
    }
    case 'decidir':
      texto = `${c.titulo === 'O que decidir' ? NUMERAIS[linhas.length] ?? `${linhas.length} coisas` : c.titulo}: ${juntar(
        linhas.map((l) => `${semPonto(l.texto)}${l.detalhe && c.titulo === 'O que decidir' ? `, com ${semPonto(l.detalhe)}` : ''}${l.valor ? `, ${l.valor}` : ''}${ressalva(l)}`)
      )}.`;
      break;
    case 'numeros':
      texto = `Os números: ${juntar(linhas.map(comValor))}.`;
      break;
    case 'prazos':
      texto = `${juntar(linhas.map((l) => (l.valor ? `${l.valor}: ${semPonto(l.texto)}` : semPonto(l.texto))))}.`;
      break;
    case 'riscos':
      texto = `Onde pode dar problema: ${juntar(linhas.map(comValor))}.`;
      break;
    case 'quem':
      texto = `Quem faz o quê: ${juntar(linhas.map((l) => `${semPonto(l.texto)}${l.detalhe ? ` (${semPonto(l.detalhe)})` : ''}`))}.`;
      break;
    case 'fontes': {
      const cob = f.cobertura;
      const desc = cob.itens_descartados ? `${cob.itens_descartados} ${cob.itens_descartados === 1 ? 'item foi deixado' : 'itens foram deixados'} de fora por falta de trecho que o sustente.` : 'Nada foi descartado.';
      texto = `Tudo isto foi lido de ${cob.secoes_lidas} das ${cob.secoes_total} seções do documento, com fonte em cada número. ${desc}${f.modo.ia === 'extrativo' ? ' Sem IA: só o que se extrai por regra.' : ''}`;
      break;
    }
  }
  return cortarPalavras(texto, limitePalavras(c.tempo_s));
}
