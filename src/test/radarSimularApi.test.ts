import { describe, it, expect } from 'vitest';
import { fetchRadar, fetchRegras, postSimular, isMockMode } from '../api/client';

describe('API de Radar e Simulação (Adendo v0.2 / Issue #5)', () => {
  it('está em modo mock por padrão no ambiente de teste', () => {
    expect(isMockMode()).toBe(true);
  });

  it('fetchRadar retorna itens divergentes e de atenção com contadores no resumo', async () => {
    const radar = await fetchRadar();
    expect(radar).toBeDefined();
    expect(radar.gerado_em).toBeDefined();
    expect(radar.resumo.divergente).toBe(2);
    expect(radar.resumo.atencao).toBe(1);
    expect(radar.itens.length).toBe(3);

    const itemAntecedencia = radar.itens.find((i) => i.id === 'versao-NG_111-antecedencia');
    expect(itemAntecedencia).toBeDefined();
    expect(itemAntecedencia?.tipo).toBe('versao_substituida');
    expect(itemAntecedencia?.status).toBe('divergente');
    expect(itemAntecedencia?.fontes.length).toBe(2);

    const itemAusente = radar.itens.find((i) => i.id === 'ausente-NG_012');
    expect(itemAusente).toBeDefined();
    expect(itemAusente?.tipo).toBe('referencia_ausente');
    expect(itemAusente?.codigo_ausente).toBe('NG_012');
  });

  it('fetchRadar com filtro por perspectiva filtra itens e atualiza contadores', async () => {
    const radarPessoas = await fetchRadar('pessoas');
    expect(radarPessoas.itens.every((i) => i.perspectivas.includes('pessoas'))).toBe(true);
    expect(radarPessoas.resumo.divergente).toBe(2);
    expect(radarPessoas.resumo.atencao).toBe(0);

    const radarFinanceiro = await fetchRadar('financeiro');
    expect(radarFinanceiro.itens.length).toBe(1);
    expect(radarFinanceiro.itens[0].codigo_ausente).toBe('NG_012');
    expect(radarFinanceiro.resumo.atencao).toBe(1);
  });

  it('fetchRegras retorna a lista de regras disponíveis para simulação', async () => {
    const regras = await fetchRegras();
    expect(regras.length).toBeGreaterThan(0);
    const regraFerias = regras.find((r) => r.id === 'ferias_antecedencia_dias');
    expect(regraFerias).toBeDefined();
    expect(regraFerias?.valor).toBe(45);
    expect(regraFerias?.unidade).toBe('dias');
    expect(regraFerias?.fonte.codigo).toBe('NG_111');
  });

  it('postSimular com novo_valor=30 retorna linha do tempo com muda=true e conflito D-35', async () => {
    const res = await postSimular({
      regra: 'ferias_antecedencia_dias',
      novo_valor: 30
    });

    expect(res.regra).toBe('ferias_antecedencia_dias');
    expect(res.valor_atual).toBe(45);
    expect(res.novo_valor).toBe(30);
    expect(res.aviso).toBe('Simulação hipotética: não altera os documentos.');

    // Linha do tempo
    const marcoSolicitacao = res.linha_do_tempo.find((m) => m.marco === 'Solicitação');
    expect(marcoSolicitacao).toBeDefined();
    expect(marcoSolicitacao?.antes).toBe('2027-03-21');
    expect(marcoSolicitacao?.depois).toBe('2027-04-05');
    expect(marcoSolicitacao?.muda).toBe(true);

    const marcoAviso = res.linha_do_tempo.find((m) => m.marco.includes('D-35'));
    expect(marcoAviso).toBeDefined();
    expect(marcoAviso?.muda).toBe(false);

    // Conflito interno com D-35
    const conflitoD35 = res.impactos.find((imp) => imp.tipo === 'conflito_interno');
    expect(conflitoD35).toBeDefined();
    expect(conflitoD35?.descricao).toContain('D-35');

    // Documentos vigentes a revisar
    const revisarDocs = res.impactos.filter((imp) => imp.tipo === 'revisar_documento');
    expect(revisarDocs.length).toBe(5);
    expect(revisarDocs.some((d) => d.codigo === 'PX_1111-001')).toBe(true);
  });

  it('postSimular com novo_valor fora de 1-90 lança erro 422', async () => {
    await expect(
      postSimular({
        regra: 'ferias_antecedencia_dias',
        novo_valor: 100
      })
    ).rejects.toThrow(/fora do intervalo/i);
  });
});
