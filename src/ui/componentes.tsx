import React, { useState } from 'react';
import { FonteCita, PerfilUsuario } from '../api/types';
import { postAvaliacao } from '../api/client';
import { acoes, ItemSelecao, useEstado } from '../app/store';
import { navegar, url } from '../app/rotas';
import { camadaDe } from '../mocks/v2';
import { MOCK_DOCUMENTOS } from '../mocks/documentos';
import { Icon } from './Icon';

type Fonte = Pick<FonteCita, 'codigo' | 'versao' | 'secao'>;

/**
 * Texto em que códigos de documento (FL_1111-001), marcos (D-35) e datas (05/04/2027)
 * nunca são partidos no hífen ou na barra ao quebrar a linha.
 */
const INTEIROS = /([A-Z]{2,3}_\d+(?:-\d+)?|\(?D-\d+\)?[.,;]?|\d{2}\/\d{2}\/\d{4})/g;
export const SemQuebra: React.FC<{ texto: string }> = ({ texto }) => (
  <>
    {texto.split(INTEIROS).map((parte, i) =>
      i % 2 === 1 ? (
        <span key={i} className="sem-quebra">
          {parte}
        </span>
      ) : (
        parte
      )
    )}
  </>
);

/** Cabeçalho comum das telas: etiqueta, título, descrição e ações. */
export const CabecalhoTela: React.FC<{
  etiqueta?: string;
  titulo: string;
  descricao?: string;
  acoes?: React.ReactNode;
}> = ({ etiqueta, titulo, descricao, acoes: botoes }) => (
  <header className="view-header">
    <div className="header-meta">
      {etiqueta && <span className="badge-tag">{etiqueta}</span>}
      <h1 className="view-title">{titulo}</h1>
    </div>
    {descricao && <p className="view-description">{descricao}</p>}
    {botoes && <div className="view-actions">{botoes}</div>}
  </header>
);

/** Nome do documento para pessoas: "Férias", "Locação de Espaço de Coworking"… */
export const nomeDoDocumento = (codigo: string) =>
  (MOCK_DOCUMENTOS.find((d) => d.codigo === codigo && !d.substituido) ?? MOCK_DOCUMENTOS.find((d) => d.codigo === codigo))?.titulo ?? codigo;
const versaoVigente = (codigo: string) => MOCK_DOCUMENTOS.find((d) => d.codigo === codigo && !d.substituido)?.versao;
/** "4.3" → "item 4.3"; "Cláusula Sétima" e "Anexo C" ficam como estão. */
export const secaoLegivel = (secao: string) => (/^\d/.test(secao) ? `item ${secao}` : secao);

/**
 * Chip de citação (RNF14 + RF42), escrito para pessoas: nome do documento e item primeiro,
 * código e versão menores ao lado. A versão só aparece quando é antiga.
 * `curto` esconde a camada da norma (usada só onde ela ajuda, como no documento).
 */
export const FonteChip: React.FC<{ fonte: Fonte; curto?: boolean; testId?: string }> = ({ fonte, curto, testId }) => {
  const c = camadaDe(fonte.codigo);
  const camada = `${c.tipo_nome}${c.subordinado_a ? `, segue a ${c.subordinado_a}` : ''}`;
  const digitalizado = useEstado((e) => e.digitalizados.includes(fonte.codigo));
  const antiga = versaoVigente(fonte.codigo) && versaoVigente(fonte.codigo) !== fonte.versao;
  const nome = nomeDoDocumento(fonte.codigo);
  return (
    <span className="fonte-chip">
      <button
        type="button"
        className="fonte-chip-btn"
        onClick={() => navegar(url.documento(fonte.codigo, fonte.versao, fonte.secao))}
        aria-label={`Abrir ${nome} (${fonte.codigo}, versão ${fonte.versao})${fonte.secao ? `, ${secaoLegivel(fonte.secao)}` : ''}`}
        title="Abrir o trecho no documento"
        data-testid={testId}
      >
        <Icon nome="arquivo" tamanho={14} />
        <span className="fonte-nome">
          {nome}
          {fonte.secao ? ` · ${secaoLegivel(fonte.secao)}` : ''}
        </span>
        <span className="fonte-codigo">
          <SemQuebra texto={`${fonte.codigo}${antiga ? ` · versão antiga ${fonte.versao}` : ''}`} />
        </span>
      </button>
      {!curto && (
        <span className="fonte-camada" title={camada}>
          <SemQuebra texto={camada} />
        </span>
      )}
      {digitalizado && <span className="fonte-camada fonte-digital">Lido de uma foto e conferido por uma pessoa</span>}
    </span>
  );
};

/** Ajuda curta no topo de cada tela: o que dá para fazer aqui, em até 3 passos. */
const AJUDA: Partial<Record<string, string[]>> = {
  inicio: [
    'Escolha uma das tarefas abaixo, como tirar uma dúvida ou ver o que mudou.',
    'Os avisos em vermelho mostram regras que mudaram e pedem atenção.',
    'Se a letra estiver pequena, use os botões A+ no alto da tela.'
  ],
  perguntar: [
    'Escreva sua dúvida com suas palavras, por exemplo: “Até quando peço minhas férias?”.',
    'A resposta mostra de qual documento e de qual item veio a informação.',
    'Toque na fonte para ler o texto original do documento.'
  ],
  perspectivas: [
    'Escolha a área: Pessoas, Financeiro, Jurídico ou Gestão.',
    'Cada número mostra de onde veio. Toque na fonte para conferir.',
    'Use os filtros para ver só um tema ou só os próximos prazos.'
  ],
  radar: [
    'Aqui aparecem as regras que mudaram de uma versão para outra.',
    'Toque em “Comparar lado a lado” para ver o texto antigo e o novo.',
    'Se precisar de ação de outra área, use “Encaminhar”.'
  ],
  ese: [
    'Mude o número de dias para ver o que aconteceria com os prazos.',
    'Nada muda nos documentos: é só uma simulação.',
    'As linhas em vermelho mostram prazos que entrariam em conflito.'
  ],
  catalogo: [
    'Aqui estão todos os documentos do Arquivo Central.',
    'Procure pelo nome ou pelo código, por exemplo “férias” ou “NG_111”.',
    'Toque em “Ler documento” para abrir o texto completo.'
  ],
  documento: [
    'O item que você procurava aparece destacado em azul.',
    'Se for uma versão antiga, um aviso indica onde está a versão em vigor.'
  ],
  comparar: [
    'Escolha um documento para ver o que mudou entre a versão antiga e a nova.',
    'O texto antigo aparece primeiro e o novo logo abaixo.'
  ],
  grafo: [
    'Este desenho mostra quais documentos dependem de outros.',
    'Prefere uma lista? Toque em “Ver como tabela”.'
  ],
  relatorio: [
    'Monte um resumo para levar a uma reunião.',
    'Os itens marcados com “Guardar no meu relatório” aparecem em “Meu relatório”, no alto da tela.'
  ],
  enviar: [
    'Escolha os arquivos no computador ou use o lote de exemplo.',
    'O sistema sugere o tema de cada documento; você pode trocar.',
    'Fotos passam por uma conferência antes de virarem documento.'
  ],
  revisar: [
    'Compare a foto com o texto lido.',
    'Corrija as linhas marcadas como incertas e marque “Conferi”.',
    'Preencha a versão e toque em “Publicar”.'
  ]
};

export const AjudaTela: React.FC<{ tela: string }> = ({ tela }) => {
  const passos = AJUDA[tela];
  if (!passos) return null;
  return (
    <details className="ajuda-tela print-hidden" data-testid="ajuda-tela">
      <summary>
        <Icon nome="perguntar" tamanho={18} /> Como usar esta tela
      </summary>
      <ol>
        {passos.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>
    </details>
  );
};

/** "Incluir no relatório" (RF41): guarda o item na seleção deste navegador. */
export const IncluirRelatorio: React.FC<{ item: ItemSelecao }> = ({ item }) => {
  const marcado = useEstado((e) => e.selecao.some((x) => x.id === item.id));
  const id = `incl-${item.id.replace(/[^\w-]/g, '-')}`;
  return (
    <label className="incluir-relatorio" htmlFor={id}>
      <input id={id} type="checkbox" checked={marcado} onChange={() => acoes.alternarSelecao(item)} />
      Guardar no meu relatório
    </label>
  );
};

/** Próxima ação no fim da tela (RF32). */
export const ProximaAcao: React.FC<{ texto?: string; children?: React.ReactNode }> = ({ texto, children }) => (
  <div className="proxima-acao">
    <span className="proxima-acao-rotulo">O que fazer agora</span>
    {texto && <span>{texto}</span>}
    {children}
  </div>
);

const MOTIVOS = ['Fonte errada', 'Faltou informação', 'Difícil de entender', 'Outro'];

/** Avaliar resposta (RF39): Sim/Não, motivo opcional no Não; cada clique = 1 registro. */
export const AvaliarResposta: React.FC<{ respostaId: string; perfil?: PerfilUsuario }> = ({ respostaId, perfil }) => {
  const [etapa, setEtapa] = useState<'pergunta' | 'motivo' | 'enviado' | 'erro'>('pergunta');
  const [motivo, setMotivo] = useState('');
  const [comentario, setComentario] = useState('');

  const enviar = async (util: boolean) => {
    try {
      await postAvaliacao({ resposta_id: respostaId, util, motivo: util ? undefined : motivo, comentario: util ? undefined : comentario, canal: 'web', perfil });
      acoes.registrarAvaliacao({ resposta_id: respostaId, util, motivo, comentario, canal: 'web' });
      setEtapa('enviado');
    } catch {
      setEtapa('erro');
    }
  };

  if (etapa === 'enviado')
    return (
      <p className="avaliacao-ok" role="status" data-testid="avaliacao-ok">
        <Icon nome="check" tamanho={16} /> Obrigado. Sua avaliação ajuda a melhorar as respostas.
      </p>
    );

  return (
    <div className="avaliacao" data-testid="avaliacao">
      {etapa === 'erro' && (
        <p className="alerta alerta-erro" role="alert">
          Não conseguimos registrar agora. Tente de novo em alguns segundos.
        </p>
      )}
      <div className="avaliacao-linha">
        <span>Esta resposta foi útil?</span>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => enviar(true)} data-testid="btn-util-sim">
          Sim
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEtapa('motivo')} data-testid="btn-util-nao">
          Não
        </button>
      </div>
      {etapa === 'motivo' && (
        <form
          className="avaliacao-motivo"
          onSubmit={(e) => {
            e.preventDefault();
            enviar(false);
          }}
        >
          <fieldset>
            <legend>O que faltou? (opcional)</legend>
            {MOTIVOS.map((m) => (
              <label key={m} className="avaliacao-opcao">
                <input type="radio" name={`motivo-${respostaId}`} value={m} checked={motivo === m} onChange={() => setMotivo(m)} />
                {m}
              </label>
            ))}
          </fieldset>
          <label htmlFor={`coment-${respostaId}`}>Comentário (até 200 caracteres)</label>
          <input id={`coment-${respostaId}`} type="text" maxLength={200} value={comentario} onChange={(e) => setComentario(e.target.value)} />
          <div>
            <button type="submit" className="btn btn-primary btn-sm" data-testid="btn-enviar-avaliacao">
              Enviar avaliação
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/** Faixa de aviso com ícone + texto (status nunca só por cor). */
export const Aviso: React.FC<{ tipo?: 'aviso' | 'info' | 'erro' | 'ok'; children: React.ReactNode; testId?: string }> = ({
  tipo = 'aviso',
  children,
  testId
}) => (
  <div className={`aviso-faixa aviso-${tipo}`} role={tipo === 'erro' ? 'alert' : 'note'} data-testid={testId}>
    <Icon nome={tipo === 'ok' ? 'check' : 'alerta'} tamanho={16} />
    <div>{children}</div>
  </div>
);
