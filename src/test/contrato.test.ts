import { describe, it, expect } from 'vitest';
import { perfilParaContrato, radarDoContrato, simulacaoDoContrato } from '../api/client';

/** Exemplos copiados do CONTRATO-API-ADENDO-v0.2.md (backend). */
describe('Compatibilidade com o contrato da API', () => {
  it('perfis novos viram os equivalentes da v0 (empregado|gestor|ggc|gfi|gco|null)', () => {
    expect(perfilParaContrato('rh')).toBe('ggc');
    expect(perfilParaContrato('financeiro')).toBe('gfi');
    expect(perfilParaContrato('juridico')).toBe('gco');
    expect(perfilParaContrato('diretoria')).toBeNull();
    expect(perfilParaContrato('gestor')).toBe('gestor');
    expect(perfilParaContrato(null)).toBeNull();
  });

  it('GET /api/radar (v0.2): versão substituída vira coluna antiga + vigente', () => {
    const item = radarDoContrato({
      id: 'versao-NG_111-antecedencia',
      tipo: 'versao_substituida',
      status: 'divergente',
      severidade: 'alta',
      titulo: 'Antecedência de férias: v2 dizia 30 dias, v3 exige 45',
      explicacao: 'A versão vigente prevalece; a 2.0.0 foi substituída.',
      perspectivas: ['pessoas'],
      codigo_ausente: null,
      fontes: [
        { codigo: 'NG_111', versao: '3.0.0', secao: '4.3.1', trecho: '…' },
        { codigo: 'NG_111', versao: '2.0.0', secao: '2.3', trecho: '…' }
      ]
    });
    expect(item.severidade).toBe('divergente');
    expect(item.fontes.map((f) => `${f.versao}:${f.situacao}`)).toEqual(['2.0.0:substituida', '3.0.0:vigente']);
    expect(item.tema).toEqual(['ferias']);
    expect(item.regra_simulavel).toBe('ferias_antecedencia_dias');
  });

  it('GET /api/radar (v0.2): referência ausente usa as fontes como "citado por"', () => {
    const item = radarDoContrato({
      id: 'ausente-NG_012',
      tipo: 'referencia_ausente',
      status: 'atencao',
      titulo: 'NG_012 citada, não está no acervo',
      explicacao: 'Base das alçadas na NT_2026-018.',
      codigo_ausente: 'NG_012',
      fontes: [{ codigo: 'NT_2026-018', versao: '1.0.0', secao: '10', trecho: '…' }]
    });
    expect(item.fontes).toEqual([]);
    expect(item.citado_por).toHaveLength(1);
    expect(item.responsavel).toBe('GCO');
  });

  it('POST /api/simular (v0.2): marcos, conflitos e resumo em lista', () => {
    const r = simulacaoDoContrato({
      regra: 'ferias_antecedencia_dias',
      valor_atual: 45,
      novo_valor: 30,
      unidade: 'dias',
      linha_do_tempo: [
        { marco: 'Solicitação', antes: '2027-03-21', depois: '2027-04-05', muda: true, fonte: { codigo: 'NG_111', versao: '3.0.0', secao: '4.5.1', trecho: '' } },
        { marco: 'Aviso da GGC (D-35)', antes: '2027-03-31', depois: '2027-03-31', muda: false, fonte: { codigo: 'NG_111', versao: '3.0.0', secao: '4.5.3', trecho: '' } }
      ],
      impactos: [
        { tipo: 'conflito_interno', descricao: 'O aviso D-35 ficaria antes do fim do prazo de solicitação (D-30).', fontes: [{ codigo: 'NG_111', versao: '3.0.0', secao: '4.5.3', trecho: '' }] },
        { tipo: 'revisar_documento', codigo: 'PX_1111-001', versao: '1.0.0', descricao: 'Cita o marco D-45', fontes: [{ codigo: 'PX_1111-001', versao: '1.0.0', secao: '8.2', trecho: '' }] }
      ],
      resumo: ['A solicitação passa para D-30 (05/04/2027 no exemplo).', 'O D-35 do aviso fica incompatível.'],
      aviso: 'Simulação hipotética: não altera os documentos.'
    });
    expect(r.valor).toBe(30);
    expect(r.linha_do_tempo[0]).toMatchObject({ etapa: 'Solicitação', atual: '21/03/2027', simulado: '05/04/2027', muda: true, conflito: false });
    expect(r.linha_do_tempo[1].conflito).toBe(true);
    expect(r.impactos.filter((i) => i.tipo === 'revisar_documento')).toHaveLength(1);
    expect(r.resumo).toBe('A solicitação passa para D-30 (05/04/2027 no exemplo). O D-35 do aviso fica incompatível.');
    expect(r.aviso).toEqual(['Simulação hipotética: não altera os documentos.']);
  });
});
