import React from 'react';
import { AcaoFicha, BlocoDecisao, FichaDocumento, ItemFicha } from '../../api/types';
import { url } from '../../app/rotas';
import { MOCK_DOCUMENTOS } from '../../mocks/documentos';
import { Icon } from '../../ui/Icon';
import { dataBR, ir } from './comum';

type Item = ItemFicha | AcaoFicha;

/** Acha os itens com fonte que sustentam o bloco (ids de ações, números e pontos). */
function itensDoBloco(f: FichaDocumento, b: BlocoDecisao): Item[] {
  const todos: Item[] = [...f.numeros, ...f.acoes, ...Object.values(f.pontos).flat()];
  return b.itens.map((id) => todos.find((i) => i.id === id)).filter(Boolean) as Item[];
}
const textoItem = (i: Item) => ('acao' in i ? i.acao : i.titulo);
const valorItem = (i: Item) => ('acao' in i ? (i.prazo?.data ? `até ${dataBR(i.prazo.data)}` : i.prazo?.regra ?? null) : i.valor);
const CODIGO = /[A-Z]{2,3}_\d+(?:-\d+)?/g;
const codigosCitados = (b: BlocoDecisao): string[] => [...(b.destaque.match(CODIGO) ?? []), ...(b.apoio?.match(CODIGO) ?? [])];

const Trecho: React.FC<{ x: { codigo: string; versao: string; secao: string; trecho: string } }> = ({ x }) => (
  <div className="mesa-trecho">
    <q>{x.trecho}</q>
    <span className="mesa-trecho-pe">
      {x.secao} ·{' '}
      <a className="fg-link" href={url.documento(x.codigo, x.versao, x.secao)} onClick={ir(url.documento(x.codigo, x.versao, x.secao))}>
        Abrir no texto completo
      </a>
    </span>
  </div>
);

/** Detalhe com a fonte (RF76): sempre à vista; vazio até escolher um bloco. */
export const DetalheBloco: React.FC<{ ficha: FichaDocumento; ativo: BlocoDecisao | null; onFechar: () => void }> = ({ ficha, ativo, onFechar }) => {
  if (!ativo) {
    return (
      <div className="mesa-detalhe mesa-detalhe-vazio" data-testid="mesa-detalhe-vazio">
        <span className="mesa-detalhe-topo">Detalhe</span>
        <p>Escolha um bloco para ver o trecho exato e onde ele fica.</p>
      </div>
    );
  }
  const itens = itensDoBloco(ficha, ativo);
  const alerta = ativo.alerta !== undefined ? ficha.alertas[ativo.alerta] : undefined;
  const origem =
    ativo.alerta !== undefined
      ? 'Alerta do radar'
      : ativo.id === 'b-versao'
      ? 'Comparado'
      : itens[0]?.origem === 'calculado'
      ? 'Calculado'
      : itens[0]?.origem === 'resumo'
      ? 'Resumo da IA'
      : itens.length
      ? 'Trecho literal'
      : 'Cabeçalho do documento';

  return (
    <div id="mesa-detalhe" className="mesa-detalhe" role="region" aria-label={`Detalhe: ${ativo.titulo}`} data-testid="mesa-detalhe">
      <div className="mesa-detalhe-topo">
        <span>{ativo.titulo} · de onde vem</span>
        <span className="mesa-detalhe-origem">{origem}</span>
        <button type="button" className="fg-acao" onClick={onFechar} aria-label="Fechar o detalhe">
          <Icon nome="fechar" tamanho={15} />
        </button>
      </div>
      <ul className="mesa-detalhe-itens">
        {itens.map((it) => (
          <li key={it.id}>
            <p className="mesa-detalhe-item">
              {valorItem(it) && <strong>{valorItem(it)} · </strong>}
              {textoItem(it)}
              {'calculo' in it && it.calculo && <span className="fg-sub"> · conta: {it.calculo}</span>}
            </p>
            {it.fontes.map((x, n) => (
              <Trecho key={n} x={x} />
            ))}
          </li>
        ))}
        {alerta && (
          <li>
            <p className="mesa-detalhe-item">
              <strong>{alerta.titulo}</strong> <span className="fg-sub">{alerta.explicacao}</span>
            </p>
            {alerta.fontes.map((x, n) => (
              <Trecho key={n} x={x} />
            ))}
          </li>
        )}
        {ativo.itens.length === 0 && ativo.alerta === undefined && (
          <li>
            {ativo.id === 'b-versao' && ficha.delta ? (
              <>
                <ul className="ficha-delta-lista">
                  {ficha.delta.resumo.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <a className="fg-link" href={url.comparar(ficha.codigo, ficha.delta.de, ficha.delta.para)} onClick={ir(url.comparar(ficha.codigo, ficha.delta.de, ficha.delta.para))}>
                  Comparar a v{ficha.delta.de} e a v{ficha.delta.para}, lado a lado
                </a>
              </>
            ) : (
              <p className="mesa-detalhe-item">
                {[...new Set(codigosCitados(ativo))].map((c, n) => (
                  <React.Fragment key={c}>
                    {n > 0 && ' · '}
                    {MOCK_DOCUMENTOS.some((d) => d.codigo === c) ? (
                      <a className="fg-link" href={url.ficha(c)} onClick={ir(url.ficha(c))}>
                        {c}
                      </a>
                    ) : (
                      <span>
                        {c} <span className="fg-pilula aviso">ausente no acervo</span>
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};
