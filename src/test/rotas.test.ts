import { describe, it, expect, vi, afterEach } from 'vitest';
import { navegar } from '../app/rotas';

describe('navegar e a posição da página', () => {
  afterEach(() => vi.restoreAllMocks());

  it('trocar de tela volta para o topo', () => {
    const rolar = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    navegar('/catalogo');
    expect(rolar).toHaveBeenCalledWith({ top: 0 });
  });

  it('atualizar a própria tela (simulação, filtro) mantém a posição', () => {
    const rolar = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    navegar('/e-se?regra=ferias_antecedencia_dias&valor=31', true);
    navegar('/radar?tema=ferias', true);
    expect(rolar).not.toHaveBeenCalled();
  });
});
