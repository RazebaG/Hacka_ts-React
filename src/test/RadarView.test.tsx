import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RadarView } from '../components/RadarView';

describe('RadarView (Radar de Contradições · Issue #5)', () => {
  it('renderiza contadores por status e selo de fixture', async () => {
    const onNavegar = vi.fn();
    render(<RadarView onNavegarDocumento={onNavegar} />);

    await waitFor(() => {
      expect(screen.getByText('Radar de Contradições e Divergências')).toBeInTheDocument();
    });

    // Selo de fixture
    expect(screen.getByTestId('selo-dados-fixture')).toHaveTextContent(/dados de fixture/i);

    // Contadores por status
    expect(screen.getByTestId('contador-divergente')).toHaveTextContent('2');
    expect(screen.getByTestId('contador-atencao')).toHaveTextContent('1');
  });

  it('renderiza o item do radar com 2 fontes clicáveis (vigente vs substituída)', async () => {
    const onNavegar = vi.fn();
    const onSimular = vi.fn();
    render(
      <RadarView
        onNavegarDocumento={onNavegar}
        onNavegarSimular={onSimular}
        perspectivaInicial="pessoas"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Antecedência de férias: v2 dizia 30 dias, v3 exige 45/i)
      ).toBeInTheDocument();
    });

    // Item com as 2 fontes lado a lado
    expect(
      screen.getByTestId('lado-a-lado-fontes-versao-NG_111-antecedencia')
    ).toBeInTheDocument();

    // Fonte 1 (Vigente NG_111 v3.0.0 · 4.3.1)
    const btnFonteVigente = screen.getByTestId(
      'btn-fonte-vigente-versao-NG_111-antecedencia'
    );
    expect(btnFonteVigente).toBeInTheDocument();
    fireEvent.click(btnFonteVigente);
    expect(onNavegar).toHaveBeenCalledWith('NG_111', '3.0.0', '4.3.1');

    // Fonte 2 (Substituída NG_111 v2.0.0 · 2.3)
    const btnFonteSubstituida = screen.getByTestId(
      'btn-fonte-substituida-versao-NG_111-antecedencia'
    );
    expect(btnFonteSubstituida).toBeInTheDocument();
    fireEvent.click(btnFonteSubstituida);
    expect(onNavegar).toHaveBeenCalledWith('NG_111', '2.0.0', '2.3');

    // Atalho para simular
    const btnSimular = screen.getByTestId('btn-simular-radar');
    expect(btnSimular).toBeInTheDocument();
    fireEvent.click(btnSimular);
    expect(onSimular).toHaveBeenCalled();
  });

  it('renderiza o selo NG_012 ("citada, não está no acervo") e a fonte citante clicável', async () => {
    const onNavegar = vi.fn();
    render(<RadarView onNavegarDocumento={onNavegar} perspectivaInicial="financeiro" />);

    await waitFor(() => {
      expect(
        screen.getByText(/Norma NG_012 citada como base das alçadas na NT_2026-018 mas ausente/i)
      ).toBeInTheDocument();
    });

    // Selo "citada, não está no acervo"
    const seloAusente = screen.getByTestId('selo-referencia-ausente');
    expect(seloAusente).toBeInTheDocument();
    expect(seloAusente).toHaveTextContent(/citada, não está no acervo/i);

    // Documento citante clicável
    const btnCitante = screen.getByTestId('btn-fonte-citante-ausente-NG_012');
    expect(btnCitante).toBeInTheDocument();
    fireEvent.click(btnCitante);
    expect(onNavegar).toHaveBeenCalledWith('NT_2026-018', '1.0.0', '3');
  });

  it('renderiza o estado vazio ("nenhuma divergência") quando a perspectiva filtrada não possui itens', async () => {
    const onNavegar = vi.fn();
    render(<RadarView onNavegarDocumento={onNavegar} perspectivaInicial="todos" />);

    await waitFor(() => {
      expect(screen.getByTestId('filtro-perspectiva-gestao')).toBeInTheDocument();
    });

    // Alterna para perspectiva que possui divergência (gestao tem FM_1111-001)
    fireEvent.click(screen.getByTestId('filtro-perspectiva-gestao'));
    await waitFor(() => {
      expect(screen.getByText(/Formulário de férias: v1 previa 30 dias/i)).toBeInTheDocument();
    });

    // Mockando retorno vazio para testar explicitamente o estado vazio "nenhuma divergência"
    // Simulando filtro para uma perspectiva sem divergências (ou quando o radar retorna lista vazia)
    const spy = vi.spyOn(await import('../api/client'), 'fetchRadar').mockResolvedValueOnce({
      gerado_em: '2026-11-12T15:00:00-03:00',
      resumo: { divergente: 0, atencao: 0 },
      itens: []
    });

    // Re-render com radar vazio
    const { unmount } = render(<RadarView onNavegarDocumento={onNavegar} perspectivaInicial="juridico" />);
    await waitFor(() => {
      expect(screen.getByTestId('radar-vazio')).toBeInTheDocument();
    });

    expect(screen.getByText(/nenhuma divergência/i)).toBeInTheDocument();
    spy.mockRestore();
    unmount();
  });
});
