import { describe, it, expect } from 'vitest';
import mesaCss from '../ui/mesa.css?raw';
import indexCss from '../index.css?raw';
import figmaCss from '../ui/figma.css?raw';
import popupTsx from '../components/PopupSecao.tsx?raw';
import mesaTsx from '../components/MesaDocumento.tsx?raw';
import resumoTs from '../ficha/resumoSecao.ts?raw';

/**
 * Regras do GUIA-IMPLEMENTACAO-FRONTEND-v1 §2: só os tokens do projeto, nada de cor literal nem token copiado
 * de protótipo (prefixo mk), e nada de comparação com código de documento fora dos mocks.
 */
const arquivos: Record<string, string> = { 'ui/mesa.css': mesaCss, 'components/PopupSecao.tsx': popupTsx, 'components/MesaDocumento.tsx': mesaTsx, 'ficha/resumoSecao.ts': resumoTs };
const semComentarios = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '');
const PREFIXO_PROTOTIPO = new RegExp('--' + 'mk-');
const TOKENS_DEFINIDOS = new Set([...(indexCss + figmaCss).matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]));

describe('Design system (pop-up da seção e Mesa)', () => {
  it('não usa token de protótipo nem cor literal', () => {
    for (const [nome, texto] of Object.entries(arquivos)) {
      expect(texto, nome).not.toMatch(PREFIXO_PROTOTIPO);
      if (nome.endsWith('.css') || nome.endsWith('.tsx')) expect(semComentarios(texto), nome).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/);
    }
  });

  it('todo var(--x) do pop-up existe em index.css ou figma.css', () => {
    const usados = [...mesaCss.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]);
    const faltam = [...new Set(usados)].filter((v) => !TOKENS_DEFINIDOS.has(v));
    expect(faltam).toEqual([]);
  });

  it('o código de um documento nunca é comparado fora dos mocks', () => {
    for (const nome of ['components/PopupSecao.tsx', 'components/MesaDocumento.tsx', 'ficha/resumoSecao.ts']) {
      expect(arquivos[nome], nome).not.toMatch(/===?\s*'(CTR|NG|PX|NT|RG)_/);
    }
  });
});
