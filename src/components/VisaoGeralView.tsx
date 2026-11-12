import React, { useEffect, useState } from 'react';
import { RadarItem } from '../api/types';
import { fetchRadar } from '../api/client';
import { navegar, url } from '../app/rotas';
import { useEstado } from '../app/store';
import { TEMAS } from '../mocks/v2';
import { CabecalhoTela, FonteChip, ProximaAcao } from '../ui/componentes';
import { Icon, NomeIcone } from '../ui/Icon';
import { SUGESTOES_POR_PERFIL } from './perfis';

/** T1 Visão geral: em 10 s, o que pede atenção e por onde começar. */
const CARTOES = [
  { id: 'juridico', nome: 'Jurídico', rotulo: 'Coworking vigente até', valor: '29/04/2027', fonte: { codigo: 'CTR_2026-012', versao: '1.0.0', secao: 'Cláusula Primeira' } },
  { id: 'financeiro', nome: 'Financeiro', rotulo: 'Valor global do coworking', valor: 'R$ 18.250,00', fonte: { codigo: 'CTR_2026-012', versao: '1.0.0', secao: 'Cláusula Sétima' } },
  { id: 'pessoas', nome: 'Pessoas', rotulo: 'Pedir férias com', valor: '45 dias de antecedência', fonte: { codigo: 'NG_111', versao: '3.0.0', secao: '4.3' } },
  { id: 'gestao', nome: 'Gestão', rotulo: 'Orçamento Ideias em Campo 2027', valor: 'R$ 96.000,00', fonte: { codigo: 'NT_2026-021', versao: '1.0.0', secao: '2' } }
];

/** As 4 tarefas mais comuns, em palavras do dia a dia. */
const TAREFAS: { titulo: string; descricao: string; icone: NomeIcone; destino: string }[] = [
  { titulo: 'Tirar uma dúvida sobre uma regra', descricao: 'Pergunte com suas palavras, como “até quando peço férias?”.', icone: 'perguntar', destino: url.perguntar() },
  { titulo: 'Ver o que mudou nas regras', descricao: 'Regras antigas e novas, lado a lado.', icone: 'alerta', destino: url.radar() },
  { titulo: 'Procurar um documento', descricao: 'Normas, contratos e formulários do Arquivo Central.', icone: 'catalogo', destino: url.catalogo() },
  { titulo: 'Montar um relatório', descricao: 'Um resumo com as fontes, para levar à reunião.', icone: 'relatorio', destino: url.relatorio() }
];

export const VisaoGeralView: React.FC = () => {
  const [radar, setRadar] = useState<RadarItem[] | null>(null);
  const [erro, setErro] = useState(false);
  const perfil = useEstado((e) => e.perfil);
  const avaliacoes = useEstado((e) => e.avaliacoes);

  useEffect(() => {
    fetchRadar().then(setRadar).catch(() => setErro(true));
  }, []);

  const sugestoes = SUGESTOES_POR_PERFIL[perfil ?? 'diretoria'] ?? SUGESTOES_POR_PERFIL.diretoria;

  return (
    <div className="view-container visao-geral" data-testid="visao-geral">
      <CabecalhoTela
        titulo="O que você quer fazer?"
        descricao="Escolha uma tarefa. Toda informação mostra de qual documento ela veio."
      />

      <nav className="tarefas" aria-label="Tarefas principais">
        {TAREFAS.map((t) => (
          <a
            key={t.titulo}
            className="tarefa"
            href={t.destino}
            onClick={(e) => {
              e.preventDefault();
              navegar(t.destino);
            }}
          >
            <span className="tarefa-icone" aria-hidden="true">
              <Icon nome={t.icone} tamanho={24} />
            </span>
            <strong>{t.titulo}</strong>
            <span>{t.descricao}</span>
          </a>
        ))}
      </nav>

      <h2 className="secao-titulo-inicio">Avisos importantes</h2>

      {erro ? (
        <div className="alerta alerta-erro" role="alert">
          Não conseguimos carregar os avisos agora. Tente de novo em alguns segundos.
        </div>
      ) : !radar ? (
        <div className="loading-state" aria-busy="true">
          <div className="spinner"></div>
          <p>Buscando nos documentos…</p>
        </div>
      ) : radar.length === 0 ? (
        <div className="painel-secao">Nenhuma regra em conflito nos documentos em vigor.</div>
      ) : (
        <section className="destaque-radar" aria-labelledby="t-radar">
          <Icon nome="alerta" tamanho={22} />
          <div>
            <h3 id="t-radar">{radar.length} pontos pedem sua atenção.</h3>
            <p>
              {radar.filter((i) => i.tipo !== 'referencia_ausente').length} regras mudaram de uma versão para outra, e{' '}
              {radar.filter((i) => i.tipo === 'referencia_ausente').length} documento é citado mas não está no arquivo.
            </p>
          </div>
          <a className="btn btn-primary" href={url.radar()} onClick={(e) => { e.preventDefault(); navegar(url.radar()); }}>
            Ver o que mudou
          </a>
        </section>
      )}

      <div className="grade-cartoes">
        {CARTOES.map((c) => (
          <article key={c.id} className="cartao-resumo">
            <span className="badge-tag">{c.nome}</span>
            <p className="cartao-rotulo">{c.rotulo}</p>
            <p className="cartao-valor">{c.valor}</p>
            <FonteChip fonte={c.fonte} curto />
            <a className="btn btn-outline btn-sm" href={url.painel(c.id)} onClick={(e) => { e.preventDefault(); navegar(url.painel(c.id)); }}>
              Ver resumo de {c.nome}
            </a>
          </article>
        ))}
      </div>

      {radar && radar.length > 0 && (
        <div className="grade-cartoes grade-3">
          {Object.entries(TEMAS).map(([id, nome]) => {
            const n = radar.filter((i) => i.tema.includes(id)).length;
            return (
              <article key={id} className="cartao-resumo">
                <span className="badge-tag">Assunto</span>
                <p className="cartao-valor cartao-valor-sm">
                  {nome}: {n} {n === 1 ? 'aviso' : 'avisos'}
                </p>
                <div className="linha-botoes">
                  <a className="btn btn-outline btn-sm" href={url.radar({ tema: id })} onClick={(e) => { e.preventDefault(); navegar(url.radar({ tema: id })); }}>
                    Ver avisos
                  </a>
                  <a className="btn btn-outline btn-sm" href={url.catalogo(id)} onClick={(e) => { e.preventDefault(); navegar(url.catalogo(id)); }}>
                    Documentos
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="grade-cartoes grade-2">
        <section className="cartao-resumo">
          <span className="badge-tag">Próximo prazo</span>
          <p>
            <strong>25/11/2026</strong>, vistoria do coworking.
          </p>
          <FonteChip fonte={{ codigo: 'CTR_2026-012', versao: '1.0.0', secao: 'Apêndice B' }} curto />
        </section>
        <section className="cartao-resumo">
          <span className="badge-tag">Dúvidas comuns</span>
          <ul className="lista-sugestoes">
            {sugestoes.map((s) => (
              <li key={s}>
                <a href={url.perguntar(s)} onClick={(e) => { e.preventDefault(); navegar(url.perguntar(s)); }}>
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section className="cartao-resumo">
          <span className="badge-tag">Respostas avaliadas</span>
          <p data-testid="resumo-avaliacoes">
            Respostas avaliadas: <strong>{avaliacoes.length}</strong> · úteis:{' '}
            <strong>{avaliacoes.filter((a) => a.util).length}</strong>
          </p>
        </section>
      </div>

      <ProximaAcao texto="Comece pelos avisos importantes acima." />
    </div>
  );
};
