import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AcaoFicha, FichaDocumento, FonteFicha, ItemFicha } from '../api/types';
import { fetchFicha } from '../api/client';
import { navegar, url } from '../app/rotas';
import { DATA_REFERENCIA } from '../mocks/v2';
import { SemaforoSituacao, SeloOrigem } from './FichaView';
import { Icon } from '../ui/Icon';

/**
 * T16 · Modo apresentação (RF58, P1): o "pitch do documento" em até 8 cartões e 5 minutos.
 * Os cartões são montados a partir da ficha, sem nova chamada de IA (FLUXO-DE-TELAS-FICHA §3).
 */

type TipoCartao = 'capa' | 'frase' | 'decidir' | 'numeros' | 'prazos' | 'riscos' | 'quem' | 'fontes';

interface LinhaCartao {
  texto: string;
  valor?: string | null;
  detalhe?: string | null;
  origem?: ItemFicha['origem'];
  fontes: FonteFicha[];
  hoje?: boolean;
}

export interface Cartao {
  tipo: TipoCartao;
  titulo: string;
  tempo_s: number;
  linhas: LinhaCartao[];
}

const dataBR = (iso: string) => iso.split('-').reverse().join('/');
const deItem = (i: ItemFicha): LinhaCartao => ({ texto: i.titulo, valor: i.valor, detalhe: i.calculo ?? i.texto, origem: i.origem, fontes: i.fontes });
const deAcao = (a: AcaoFicha): LinhaCartao => ({
  texto: a.acao,
  valor: a.prazo?.data ? `até ${dataBR(a.prazo.data)}` : a.prazo?.regra ?? null,
  detalhe: a.quem,
  origem: a.origem,
  fontes: a.fontes
});

/** Monta os cartões a partir da ficha. Cartões sem conteúdo ficam de fora (exceto capa e fontes). */
export function montarCartoes(f: FichaDocumento): Cartao[] {
  const id = f.identidade;
  const cartoes: Cartao[] = [];

  cartoes.push({
    tipo: 'capa',
    titulo: id.titulo,
    tempo_s: 15,
    linhas: [
      { texto: `${f.codigo} · v${f.versao} · ${id.camada.tipo_nome}`, fontes: [] },
      { texto: id.substituido ? `Versão substituída${id.vigente_em ? ` pela ${id.vigente_em.versao}` : ''}` : `Vigência: ${id.vigencia.texto}`, fontes: [] },
      ...(['elaborado_por', 'aprovado_por'] as const)
        .filter((k) => f.governanca[k].valor)
        .map((k) => ({ texto: `${k === 'elaborado_por' ? 'Elaborado por' : 'Aprovado por'}: ${f.governanca[k].valor}`, fontes: [] }))
    ]
  });

  if (f.bluf) cartoes.push({ tipo: 'frase', titulo: 'Em uma frase', tempo_s: 30, linhas: [deItem({ ...f.bluf, titulo: f.bluf.texto ?? f.bluf.titulo })] });

  const decidir = f.acoes.length ? f.acoes.slice(0, 3).map(deAcao) : f.pontos.obrigacoes.slice(0, 3).map(deItem);
  if (decidir.length) cartoes.push({ tipo: 'decidir', titulo: f.acoes.length ? 'O que decidir' : 'O que o documento exige', tempo_s: 60, linhas: decidir });

  const numeros = [...f.numeros, ...f.pontos.valores.filter((v) => !f.numeros.some((n) => n.valor === v.valor))].slice(0, 4);
  if (numeros.length) cartoes.push({ tipo: 'numeros', titulo: 'Números que importam', tempo_s: 45, linhas: numeros.map(deItem) });

  // Linha do tempo: datas das ações e dos prazos, em ordem, com "hoje" marcado
  const comData: { iso: string; linha: LinhaCartao }[] = [];
  f.acoes.forEach((a) => a.prazo?.data && comData.push({ iso: a.prazo.data, linha: { ...deAcao(a), valor: dataBR(a.prazo.data) } }));
  [...f.numeros, ...f.pontos.prazos].forEach((p) => {
    const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(p.valor ?? '');
    if (m && !comData.some((c) => c.iso === `${m[3]}-${m[2]}-${m[1]}`)) comData.push({ iso: `${m[3]}-${m[2]}-${m[1]}`, linha: deItem(p) });
  });
  if (comData.length) {
    const linhas = [...comData.sort((a, b) => a.iso.localeCompare(b.iso)).map((c) => c.linha)];
    const posHoje = comData.findIndex((c) => c.iso > DATA_REFERENCIA);
    linhas.splice(posHoje < 0 ? linhas.length : posHoje, 0, { texto: 'Hoje', valor: dataBR(DATA_REFERENCIA), fontes: [], hoje: true });
    cartoes.push({ tipo: 'prazos', titulo: 'Linha do tempo', tempo_s: 45, linhas });
  } else if (f.pontos.prazos.length) {
    cartoes.push({ tipo: 'prazos', titulo: 'Prazos', tempo_s: 45, linhas: f.pontos.prazos.slice(0, 4).map(deItem) });
  }

  const riscos = [
    ...f.pontos.riscos.slice(0, 3).map(deItem),
    ...f.alertas.slice(0, 2).map((a) => ({ texto: a.titulo, detalhe: a.explicacao, fontes: a.fontes }))
  ];
  if (riscos.length) cartoes.push({ tipo: 'riscos', titulo: 'Riscos e alertas', tempo_s: 45, linhas: riscos });

  const quem = [...f.pontos.responsaveis.map(deItem), ...f.acoes.filter((a) => a.quem).map((a) => ({ texto: a.quem!, detalhe: a.acao, origem: a.origem, fontes: a.fontes }))].slice(0, 4);
  if (quem.length) cartoes.push({ tipo: 'quem', titulo: 'Quem faz o quê', tempo_s: 45, linhas: quem });

  const usadas = new Map<string, FonteFicha>();
  cartoes.forEach((c) => c.linhas.forEach((l) => l.fontes.forEach((x) => usadas.set(`${x.codigo}|${x.secao}`, x))));
  cartoes.push({
    tipo: 'fontes',
    titulo: 'De onde vem',
    tempo_s: 15,
    linhas: [
      { texto: `${usadas.size} ${usadas.size === 1 ? 'trecho citado' : 'trechos citados'} nesta apresentação`, fontes: [...usadas.values()] },
      {
        texto: `Cobertura: ${f.cobertura.secoes_lidas}/${f.cobertura.secoes_total} seções · ${f.cobertura.itens_verificados} itens verificados · ${f.cobertura.itens_descartados} descartados`,
        fontes: []
      },
      { texto: `Modo: ${f.modo.ia === 'extrativo' ? 'extrativo (sem IA)' : `IA${f.modo.modelo ? ` (${f.modo.modelo})` : ''}`}`, fontes: [] }
    ]
  });
  return cartoes;
}

const fmtTempo = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export const ApresentacaoView: React.FC<{ codigo: string; versao?: string; cartaoInicial?: number }> = ({ codigo, versao, cartaoInicial }) => {
  const [ficha, setFicha] = useState<FichaDocumento | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [atual, setAtual] = useState(Math.max(0, (cartaoInicial ?? 1) - 1));
  const [restante, setRestante] = useState<number | null>(null);
  const [fonteAberta, setFonteAberta] = useState<FonteFicha | null>(null);
  const palco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFicha(codigo, versao)
      .then(setFicha)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Não conseguimos abrir a apresentação.'));
  }, [codigo, versao]);

  const cartoes = ficha ? montarCartoes(ficha) : [];
  const total = cartoes.length;
  const sair = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => undefined);
    navegar(url.ficha(codigo, versao));
  }, [codigo, versao]);

  const ir = useCallback(
    (i: number) => {
      if (!total) return;
      const n = Math.min(total - 1, Math.max(0, i));
      setAtual(n);
      setFonteAberta(null);
      navegar(url.apresentar(codigo, versao, n + 1), true);
    },
    [total, codigo, versao]
  );

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        ir(atual + 1);
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        ir(atual - 1);
      } else if (e.key === 'Home') ir(0);
      else if (e.key === 'End') ir(total - 1);
      else if (e.key === 'Escape') {
        if (fonteAberta) setFonteAberta(null);
        else if (!document.fullscreenElement) sair();
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [atual, total, ir, sair, fonteAberta]);

  // Cronômetro opcional de 5:00
  useEffect(() => {
    if (restante === null || restante <= 0) return;
    const t = setTimeout(() => setRestante((r) => (r === null ? r : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [restante]);

  useEffect(() => {
    palco.current?.focus();
  }, [atual]);

  if (erro)
    return (
      <div className="apresentacao" data-testid="apresentacao-erro">
        <div className="apresentacao-cartao">
          <h1>{erro}</h1>
          <button type="button" className="btn btn-primary" onClick={() => navegar(url.catalogo())}>
            Ir para Documentos
          </button>
        </div>
      </div>
    );
  if (!ficha)
    return (
      <div className="apresentacao loading-state" aria-busy="true">
        <div className="spinner"></div>
        <p>Montando a apresentação…</p>
      </div>
    );

  return (
    <div className="apresentacao" data-testid="apresentacao" role="region" aria-roledescription="apresentação" aria-label={`Apresentação de ${ficha.identidade.titulo}`}>
      <header className="apresentacao-topo print-hidden">
        <span className="fg-codigo">{ficha.codigo}</span>
        <span className="apresentacao-indicador" data-testid="apresentacao-indicador" aria-live="polite">
          {atual + 1} de {total}
        </span>
        <div className="apresentacao-controles">
          {restante === null ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setRestante(300)}>
              <Icon nome="historico" tamanho={15} /> Cronômetro 5:00
            </button>
          ) : (
            <button
              type="button"
              className={`btn btn-sm apresentacao-relogio ${restante <= 60 ? 'fim' : ''}`}
              onClick={() => setRestante(null)}
              aria-label={`Tempo restante ${fmtTempo(Math.max(0, restante))}. Parar o cronômetro.`}
              data-testid="apresentacao-relogio"
            >
              {fmtTempo(Math.max(0, restante))}
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => (document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.())?.catch?.(() => undefined)}
          >
            Tela cheia
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Icon nome="baixar" tamanho={15} /> Exportar PDF
          </button>
          <button type="button" className="btn btn-escuro btn-sm" onClick={sair} data-testid="apresentacao-sair">
            <Icon nome="fechar" tamanho={15} /> Sair
          </button>
        </div>
      </header>

      {/* Na tela, um cartão por vez; na impressão, todos */}
      {cartoes.map((k, i) => (
        <section
          key={k.tipo}
          ref={i === atual ? palco : undefined}
          tabIndex={-1}
          className={`apresentacao-cartao cartao-${k.tipo} ${i === atual ? 'ativo' : ''}`}
          aria-hidden={i !== atual}
          data-testid={i === atual ? 'apresentacao-cartao' : undefined}
        >
          <p className="apresentacao-tempo print-hidden">
            Cartão {i + 1} · ~{k.tempo_s} s
          </p>
          {k.tipo === 'capa' && <SemaforoSituacao nivel={ficha.semaforo.nivel} />}
          <h1 className="apresentacao-titulo">{k.titulo}</h1>
          <ul className={`apresentacao-linhas ${k.tipo === 'numeros' ? 'em-grade' : ''}`}>
            {k.linhas.map((l, j) => (
              <li key={j} className={l.hoje ? 'hoje' : ''}>
                {l.valor && k.tipo !== 'capa' && <strong className="apresentacao-valor">{l.valor}</strong>}
                <span className="apresentacao-texto">{l.texto}</span>
                {l.detalhe && <span className="apresentacao-detalhe">{l.detalhe}</span>}
                {(l.origem || l.fontes.length > 0) && (
                  <span className="apresentacao-fontes">
                    {l.origem && <SeloOrigem origem={l.origem} />}
                    {l.fontes.slice(0, k.tipo === 'fontes' ? 12 : 2).map((x, n) => (
                      <button key={n} type="button" className="fonte-link" onClick={() => setFonteAberta(x)} aria-label={`Ver o trecho de ${x.codigo}, ${x.secao}`}>
                        <Icon nome="documento" tamanho={14} /> {x.codigo} · {x.secao}
                      </button>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {k.tipo === 'capa' && ficha.bluf === null && <p className="apresentacao-detalhe">Sem resumo da IA: esta apresentação usa só trechos do documento.</p>}
        </section>
      ))}

      {fonteAberta && (
        <aside className="apresentacao-fonte print-hidden" role="dialog" aria-label="Trecho da fonte" data-testid="apresentacao-fonte">
          <div className="fg-cabeca-card">
            <strong>
              {fonteAberta.codigo} · {fonteAberta.secao}
            </strong>
            <button type="button" className="fg-acao" onClick={() => setFonteAberta(null)} aria-label="Fechar o trecho">
              <Icon nome="fechar" tamanho={16} />
            </button>
          </div>
          <blockquote className="fg-trecho">{fonteAberta.trecho}</blockquote>
          <a
            className="fg-link"
            href={url.documento(fonteAberta.codigo, fonteAberta.versao, fonteAberta.secao)}
            onClick={(e) => {
              e.preventDefault();
              navegar(url.documento(fonteAberta.codigo, fonteAberta.versao, fonteAberta.secao));
            }}
          >
            Abrir no texto completo
          </a>
        </aside>
      )}

      <nav className="apresentacao-navegacao print-hidden" aria-label="Navegar entre os cartões">
        <button type="button" className="btn btn-outline" onClick={() => ir(atual - 1)} disabled={atual === 0} aria-label="Cartão anterior" data-testid="apresentacao-anterior">
          <Icon nome="recolher" tamanho={18} /> Anterior
        </button>
        <div className="apresentacao-pontos" role="tablist" aria-label="Cartões">
          {cartoes.map((k, i) => (
            <button key={k.tipo} type="button" role="tab" aria-selected={i === atual} aria-label={`Cartão ${i + 1}: ${k.titulo}`} className={i === atual ? 'ativo' : ''} onClick={() => ir(i)} />
          ))}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => ir(atual + 1)} disabled={atual === total - 1} aria-label="Próximo cartão" data-testid="apresentacao-proximo">
          Próximo <Icon nome="seta" tamanho={18} />
        </button>
      </nav>
      <p className="apresentacao-dica print-hidden">Use as setas do teclado para avançar e voltar. Esc sai da apresentação.</p>
    </div>
  );
};
