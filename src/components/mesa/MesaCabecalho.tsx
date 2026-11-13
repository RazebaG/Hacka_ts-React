import React from 'react';
import { FichaDocumento } from '../../api/types';
import { url } from '../../app/rotas';
import { fraseExtrativa } from '../../ficha/frase';
import { SemaforoSituacao } from '../FichaPecas';
import { VarianteMesa, dataBR, ir } from './comum';

const ORIGEM_TEXTO = { literal: 'Trecho literal', resumo: 'Resumo da IA', calculado: 'Calculado' } as const;

/** Fonte da frase em uma linha discreta: origem e seções clicáveis (todo número e frase com fonte). */
const FonteDaFrase: React.FC<{ origem: keyof typeof ORIGEM_TEXTO; fontes: { codigo: string; versao: string; secao: string }[] }> = ({ origem, fontes }) => (
  <span className="mesa-frase-fonte">
    {ORIGEM_TEXTO[origem]}
    {fontes.map((x, i) => (
      <React.Fragment key={i}>
        {' · '}
        <a href={url.documento(x.codigo, x.versao, x.secao)} onClick={ir(url.documento(x.codigo, x.versao, x.secao))}>
          {x.secao}
        </a>
      </React.Fragment>
    ))}
  </span>
);

/** Sigla entre parênteses no fim ("Diretoria Administrativa (DIRAF)" → "DIRAF"); sem valor, "não consta". */
const gov = (c: { valor: string | null }) => (c.valor ? /\(([A-Z]{2,6})\)\s*$/.exec(c.valor)?.[1] ?? c.valor : 'não consta');

/**
 * Cabeçalho do documento (protótipo de 13/11): situação, governança, tempo de leitura e a frase-resumo.
 * `children` é a faixa "Precisa de você", entre o topo e a frase.
 * Na variante completa o título não aparece aqui: a Ficha já mostra o nome do documento no próprio cabeçalho.
 */
export const MesaCabecalho: React.FC<{ ficha: FichaDocumento; variante: VarianteMesa; children?: React.ReactNode }> = ({ ficha, variante, children }) => {
  const id = ficha.identidade;
  const gerando = ficha.estado === 'gerando' || ficha.estado === 'parcial';
  // Frase: resumo da IA ou, sem IA, a frase copiada do documento
  const fraseDoc = ficha.bluf ? null : fraseExtrativa(ficha);
  const situacaoCurta = id.substituido ? 'versão substituída' : id.vigencia.fim ? `vigente até ${dataBR(id.vigencia.fim)}` : `v${ficha.versao} vigente`;
  const meta = [id.camada.tipo_nome, situacaoCurta, id.classificacao].filter(Boolean).join(' · ');

  return (
    <div className="mesa-cab">
      <div className="mesa-cab-topo">
        <div className="mesa-cab-id">
          {variante === 'completa' && <SemaforoSituacao nivel={ficha.semaforo.nivel} />}
          <p className="mesa-cab-meta">{meta}</p>
          {variante === 'compacta' ? (
            <h2 className="mesa-titulo">{id.titulo}</h2>
          ) : (
            <p className="mesa-situacao">
              {id.substituido
                ? `Versão substituída${id.vigente_em ? `: a que vale hoje é a ${id.vigente_em.versao}` : ''}`
                : id.vigencia.fim
                ? `Em vigor até ${dataBR(id.vigencia.fim)}${id.vigencia.dias_restantes !== null && id.vigencia.dias_restantes >= 0 ? ` (faltam ${id.vigencia.dias_restantes} dias)` : ''}`
                : `Vigência: ${id.vigencia.texto}`}
            </p>
          )}
        </div>
        <div className="mesa-cab-gov">
          <span>
            Elaborado: {gov(ficha.governanca.elaborado_por)} · Aprovado: {gov(ficha.governanca.aprovado_por)} · Assinada em: {gov(ficha.governanca.assinada_em)}
          </span>
          <span data-testid="ficha-tempo">
            Leitura {id.metricas.leitura_integral_min} min →{' '}
            {variante === 'compacta' ? (
              <a className="mesa-cab-ficha" href={url.ficha(ficha.codigo, ficha.versao)} onClick={ir(url.ficha(ficha.codigo, ficha.versao))} data-testid="mesa-abrir-ficha" title="Abrir ficha completa">
                ficha {id.metricas.leitura_ficha_min} min
              </a>
            ) : (
              <strong className="mesa-cab-ficha">ficha {id.metricas.leitura_ficha_min} min</strong>
            )}
          </span>
        </div>
      </div>

      {children}

      {ficha.bluf ? (
        <p className="mesa-frase" data-testid="ficha-bluf">
          {ficha.bluf.texto} <FonteDaFrase origem={ficha.bluf.origem} fontes={ficha.bluf.fontes} />
        </p>
      ) : fraseDoc ? (
        <p className="mesa-frase" data-testid="mesa-frase-documento">
          {fraseDoc.titulo} <FonteDaFrase origem="literal" fontes={fraseDoc.fontes.slice(0, 1)} />
        </p>
      ) : (
        <p className="mesa-frase mesa-frase-vazia">{gerando ? 'Resumo da IA a caminho…' : 'Sem frase-resumo: os blocos abaixo vêm direto do texto, com a fonte de cada um.'}</p>
      )}
    </div>
  );
};
