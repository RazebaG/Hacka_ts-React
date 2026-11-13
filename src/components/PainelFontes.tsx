import React from 'react';
import { DocumentoConsultado, RespostaPerguntar } from '../api/types';
import { navegar, url } from '../app/rotas';
import { Icon } from '../ui/Icon';

/**
 * Fontes em evidência (adendo v0.4, RF64–RF68).
 * - `RespondidoCom`: cabeçalho de toda resposta, "Respondido com n documentos" + chips.
 * - `PainelFontes`: um cartão por documento, distinguindo citado de consultado e não usado,
 *   com destaque âmbar para fonte substituída.
 */

const ir = (destino: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  navegar(destino);
};

const selo = (d: DocumentoConsultado) =>
  d.substituido ? <span className="fg-pilula aviso ponto">Substituída</span> : <span className="fg-pilula ok ponto">Vigente</span>;

export const RespondidoCom: React.FC<{ resposta: RespostaPerguntar; testId?: string }> = ({ resposta, testId }) => {
  const citados = (resposta.consultados ?? []).filter((d) => d.citado);
  if (!resposta.consta || !citados.length) return null;
  return (
    <div className="respondido-com" data-testid={testId}>
      <span className="respondido-com-rotulo">
        <Icon nome="documento" tamanho={14} /> Respondido com {citados.length} {citados.length === 1 ? 'documento' : 'documentos'}
      </span>
      {citados.map((d) => (
        <a key={`${d.codigo}-${d.versao}`} className="respondido-chip" href={url.ficha(d.codigo, d.versao)} onClick={ir(url.ficha(d.codigo, d.versao))} title={`Ver a ficha de ${d.titulo}`}>
          {d.codigo} · v{d.versao} · {d.substituido ? 'substituída' : 'vigente'}
        </a>
      ))}
    </div>
  );
};

const CartaoFonte: React.FC<{ d: DocumentoConsultado }> = ({ d }) => (
  <li className={`fonte-cartao ${d.citado ? 'fonte-citada' : 'fonte-consultada'} ${d.substituido ? 'fonte-substituida' : ''}`} data-testid={`fonte-${d.codigo}-${d.versao}`}>
    <div className="fonte-cartao-topo">
      <strong>
        {d.codigo} · v{d.versao}
      </strong>
      {selo(d)}
    </div>
    <p className="fonte-cartao-titulo">{d.titulo}</p>
    <p className="fonte-cartao-uso">
      <span className={`fonte-marcador ${d.citado ? 'cheio' : 'vazio'}`} aria-hidden="true" />
      {d.citado ? 'Citado na resposta' : 'Consultado, não usado'}
    </p>
    {d.substituido && d.vigente_em && (
      <p className="fonte-cartao-aviso">
        Esta fonte foi substituída pela v{d.vigente_em.versao}.{' '}
        <a className="fg-link" href={url.ficha(d.vigente_em.codigo, d.vigente_em.versao)} onClick={ir(url.ficha(d.vigente_em.codigo, d.vigente_em.versao))}>
          Abrir a vigente
        </a>
      </p>
    )}
    {d.citado && d.trechos && d.trechos.length > 0 && (
      <ul className="fonte-trechos">
        {d.trechos.map((t, i) => (
          <li key={i}>
            <span className="fg-rotulo">{/^\d/.test(t.secao) ? `Item ${t.secao}` : t.secao}</span>
            <q>{t.trecho}</q>
          </li>
        ))}
      </ul>
    )}
    <div className="fonte-cartao-acoes">
      <a
        className="btn btn-outline btn-sm"
        href={url.documento(d.codigo, d.versao, d.secoes_usadas[0])}
        onClick={ir(url.documento(d.codigo, d.versao, d.secoes_usadas[0]))}
      >
        Abrir
      </a>
      <a className="btn btn-outline btn-sm" href={url.ficha(d.codigo, d.versao)} onClick={ir(url.ficha(d.codigo, d.versao))}>
        Ficha
      </a>
    </div>
  </li>
);

export const PainelFontes: React.FC<{ resposta: RespostaPerguntar; onFixar: (codigos: string[]) => void }> = ({ resposta, onFixar }) => {
  const lista = resposta.consultados ?? [];
  const citados = lista.filter((d) => d.citado);
  const outros = lista.filter((d) => !d.citado);
  return (
    <section className="fg-card painel-fontes" aria-labelledby="t-fontes" data-testid="painel-fontes">
      <div className="fg-cabeca-card">
        <h2 id="t-fontes">
          <Icon nome="escudo" tamanho={18} /> Fontes consultadas ({lista.length})
        </h2>
      </div>
      {!resposta.consta && (
        <p className="fg-sub" data-testid="fontes-nao-achei">
          Procurei em {resposta.documentos_pesquisados ?? 0} {resposta.documentos_pesquisados === 1 ? 'documento' : 'documentos'}
          {resposta.escopo?.fixado ? ` (${resposta.escopo.documentos.join(', ')})` : ''} e não achei um trecho que responda.
        </p>
      )}
      {citados.length > 0 && (
        <ul className="fontes-lista">
          {citados.map((d) => (
            <CartaoFonte key={`${d.codigo}-${d.versao}`} d={d} />
          ))}
        </ul>
      )}
      {outros.length > 0 && (
        <details className="fontes-outras" open={outros.some((d) => d.substituido)}>
          <summary>Consultados e não usados ({outros.length})</summary>
          <ul className="fontes-lista">
            {outros.map((d) => (
              <CartaoFonte key={`${d.codigo}-${d.versao}`} d={d} />
            ))}
          </ul>
        </details>
      )}
      {citados.length > 0 && (
        <button type="button" className="btn btn-outline btn-sm fg-largo" onClick={() => onFixar([...new Set(citados.map((d) => d.codigo))])}>
          <Icon nome="busca" tamanho={15} /> Perguntar só nestes documentos
        </button>
      )}
    </section>
  );
};

/** "Baseado em" (RF67): faixa com os documentos que sustentam a tela. Cada chip abre a ficha. */
export const FontesBase: React.FC<{ fontes: { codigo: string; versao: string }[]; testId?: string }> = ({ fontes, testId }) => {
  const unicas = [...new Map(fontes.filter((f) => f.codigo).map((f) => [`${f.codigo}@${f.versao}`, f])).values()];
  if (!unicas.length) return null;
  return (
    <div className="fontes-base" data-testid={testId ?? 'fontes-base'}>
      <span className="fontes-base-rotulo">
        <Icon nome="escudo" tamanho={14} /> Baseado em
      </span>
      {unicas.map((f) => (
        <a key={`${f.codigo}@${f.versao}`} className="respondido-chip" href={url.ficha(f.codigo, f.versao)} onClick={ir(url.ficha(f.codigo, f.versao))} title="Ver a ficha do documento">
          {f.codigo} v{f.versao}
        </a>
      ))}
    </div>
  );
};
