import React, { useEffect, useState } from 'react';
import { FiltrosTriagem, TriagemItem, TriagemResposta } from '../api/types';
import { fetchTriagem } from '../api/client';
import { navegar, url } from '../app/rotas';
import { DATA_REFERENCIA, TEMAS } from '../mocks/v2';
import { CabecalhoTela } from '../ui/componentes';
import { Icon } from '../ui/Icon';
import { SemaforoSituacao } from './FichaView';

/** T17 · Fila de atenção (RF69/RF70, P1): ninguém abre todas as fichas, abre as que importam hoje. */

const TIPOS: [string, string][] = [
  ['NG', 'Norma geral'],
  ['PX', 'Procedimento'],
  ['FM', 'Formulário'],
  ['TB', 'Tabela'],
  ['FL', 'Fluxograma'],
  ['RG', 'Regulamento'],
  ['NT', 'Nota técnica'],
  ['CTR', 'Contrato']
];
const SINAIS: [string, string][] = [
  ['prazo_30d', 'Prazo em até 30 dias'],
  ['multa', 'Com multa'],
  ['divergencia', 'Com versão substituída']
];
const DIA = 864e5;
const diasAte = (iso: string) => Math.round((Date.parse(iso) - Date.parse(DATA_REFERENCIA)) / DIA);
const dataBR = (iso: string) => iso.split('-').reverse().join('/');

/** Cartão compacto da triagem (CartaoTriagem). */
export const CartaoTriagem: React.FC<{ item: TriagemItem }> = ({ item }) => {
  const dias = item.proximo_prazo ? diasAte(item.proximo_prazo.data) : null;
  return (
    <article className={`fg-card triagem-cartao nivel-${item.semaforo.nivel}`} data-testid={`triagem-${item.codigo}`}>
      <div className="triagem-topo">
        <SemaforoSituacao nivel={item.semaforo.nivel} />
        <a
          className="fg-codigo fg-codigo-link"
          href={url.ficha(item.codigo, item.versao)}
          onClick={(e) => {
            e.preventDefault();
            navegar(url.ficha(item.codigo, item.versao));
          }}
        >
          {item.codigo}
        </a>
        <strong className="triagem-titulo">{item.titulo}</strong>
      </div>
      {item.bluf_curto ? <p className="triagem-bluf">“{item.bluf_curto}”</p> : item.semaforo.motivos.length > 0 && <p className="triagem-bluf">{item.semaforo.motivos.join(' · ')}</p>}
      <div className="triagem-meta">
        {item.proximo_prazo && (
          <span className={dias !== null && dias <= 30 ? 'triagem-prazo-perto' : ''}>
            <Icon nome="calendario" tamanho={14} /> {item.proximo_prazo.evento}: {dataBR(item.proximo_prazo.data)}
            {dias !== null && ` (${dias === 0 ? 'hoje' : `em ${dias} dias`})`}
          </span>
        )}
        <span>
          <Icon nome="alerta" tamanho={14} /> {item.alertas} {item.alertas === 1 ? 'alerta' : 'alertas'}
        </span>
        <span>
          <Icon nome="historico" tamanho={14} /> leitura {item.leitura_integral_min} → {item.leitura_ficha_min} min
        </span>
        <a
          className="btn btn-outline btn-sm triagem-abrir"
          href={url.ficha(item.codigo, item.versao)}
          onClick={(e) => {
            e.preventDefault();
            navegar(url.ficha(item.codigo, item.versao));
          }}
        >
          Abrir ficha
        </a>
      </div>
    </article>
  );
};

export const FilaAtencaoView: React.FC<{ filtros: FiltrosTriagem }> = ({ filtros }) => {
  const [dados, setDados] = useState<TriagemResposta | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const chave = JSON.stringify(filtros);

  useEffect(() => {
    setDados(null);
    fetchTriagem(filtros)
      .then(setDados)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Não conseguimos carregar a fila.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const mudar = (novo: Partial<FiltrosTriagem>) => navegar(url.atencao({ ...filtros, ...novo }), true);

  return (
    <div className="view-container fila-view" data-testid="fila-atencao">
      <CabecalhoTela
        etiqueta="Triagem do acervo"
        titulo="Fila de atenção"
        descricao={
          dados
            ? `${dados.total} ${dados.total === 1 ? 'documento' : 'documentos'} · ${dados.pedem_acao === 0 ? 'nenhum pede' : dados.pedem_acao === 1 ? '1 pede' : `${dados.pedem_acao} pedem`} ação esta semana. Ordenada pelo que é mais urgente.`
            : 'Os documentos que pedem atenção primeiro.'
        }
      />

      <div className="fg-card fg-barra-filtros" role="group" aria-label="Filtros da fila">
        <label className="sr-only" htmlFor="fila-tema">
          Assunto
        </label>
        <select id="fila-tema" className="fg-select" value={filtros.tema ?? ''} onChange={(e) => mudar({ tema: e.target.value })}>
          <option value="">Assunto: Todos</option>
          {Object.entries(TEMAS).map(([id, nome]) => (
            <option key={id} value={id}>
              Assunto: {nome}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="fila-tipo">
          Tipo
        </label>
        <select id="fila-tipo" className="fg-select" value={filtros.tipo ?? ''} onChange={(e) => mudar({ tipo: e.target.value })}>
          <option value="">Tipo: Todos</option>
          {TIPOS.map(([id, nome]) => (
            <option key={id} value={id}>
              Tipo: {nome}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="fila-situacao">
          Situação
        </label>
        <select id="fila-situacao" className="fg-select" value={filtros.situacao ?? ''} onChange={(e) => mudar({ situacao: e.target.value })} data-testid="fila-situacao">
          <option value="">Situação: Todas</option>
          <option value="critico">Situação: Não usar para decidir</option>
          <option value="atencao">Situação: Pede atenção</option>
          <option value="ok">Situação: Em vigor</option>
        </select>
        <label className="sr-only" htmlFor="fila-ordenar">
          Ordenar
        </label>
        <select id="fila-ordenar" className="fg-select" value={filtros.ordenar ?? 'urgencia'} onChange={(e) => mudar({ ordenar: e.target.value === 'urgencia' ? '' : e.target.value })}>
          <option value="urgencia">Ordenar: Urgência</option>
          <option value="vigencia">Ordenar: Próximo prazo</option>
          <option value="tema">Ordenar: Assunto</option>
          <option value="tipo">Ordenar: Tipo</option>
        </select>
      </div>
      <div className="fila-sinais" role="group" aria-label="Filtrar por sinal">
        {SINAIS.map(([id, nome]) => (
          <button key={id} type="button" className="fg-pilula fila-sinal" aria-pressed={filtros.sinal === id} onClick={() => mudar({ sinal: filtros.sinal === id ? '' : id })} data-testid={`fila-sinal-${id}`}>
            {filtros.sinal === id && <Icon nome="check" tamanho={13} />} {nome}
          </button>
        ))}
      </div>

      {erro ? (
        <div className="alerta alerta-erro" role="alert">
          {erro}
        </div>
      ) : !dados ? (
        <div className="fila-lista" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="fg-card triagem-esqueleto" />
          ))}
        </div>
      ) : dados.itens.length === 0 ? (
        <div className="fg-card" data-testid="fila-vazia">
          <p>Nada pede sua atenção com estes filtros.</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navegar(url.atencao(), true)}>
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="fila-lista">
          {dados.itens.map((i) => (
            <CartaoTriagem key={`${i.codigo}-${i.versao}`} item={i} />
          ))}
        </div>
      )}
    </div>
  );
};
