import React, { useEffect, useState } from 'react';
import { FichaDocumento, TriagemResposta } from '../api/types';
import { fetchFicha, fetchTriagem } from '../api/client';
import { navegar, url } from '../app/rotas';
import { useEstado } from '../app/store';
import { CabecalhoTela } from '../ui/componentes';
import { Icon, NomeIcone } from '../ui/Icon';
import { MesaDocumento } from './MesaDocumento';
import { PERFIS } from './perfis';

/**
 * T1 Início (decisão da equipe, 13/11): só o topo, os 4 atalhos, a lista de documentos que pedem atenção
 * e a Mesa de decisão. O radar, o resumo por área, os assuntos, o próximo prazo e as dúvidas frequentes
 * saíram do conteúdo da tela inicial (o menu lateral não muda; essas telas continuam pelo menu).
 */
const ATALHOS: { titulo: string; descricao: string; icone: NomeIcone; destino: string }[] = [
  { titulo: 'Tirar Dúvida', descricao: 'Consulta inteligente', icone: 'perguntar', destino: url.perguntar() },
  { titulo: 'Regras que Mudaram', descricao: 'Comparação de vigências', icone: 'regras', destino: url.radar() },
  { titulo: 'Consultar Acervo', descricao: 'Normas e contratos', icone: 'catalogo', destino: url.catalogo() },
  { titulo: 'Montar Relatório', descricao: 'Síntese com fontes', icone: 'relatorio', destino: url.relatorio() }
];

const ir = (destino: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  navegar(destino);
};

export const VisaoGeralView: React.FC<{ docSelecionado?: string }> = ({ docSelecionado }) => {
  const perfil = useEstado((e) => e.perfil);
  const [fila, setFila] = useState<TriagemResposta | null>(null);

  const [fichaMesa, setFichaMesa] = useState<FichaDocumento | null>(null);
  const [erroMesa, setErroMesa] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  // RF71: lista curta (até 5) ordenada por urgência e pelo perfil escolhido
  useEffect(() => {
    fetchTriagem({ limite: 5, perfil }).then(setFila).catch(() => setFila({ total: 0, pagina: 1, tamanho: 5, pedem_acao: 0, itens: [] }));
  }, [perfil]);

  // A Mesa abre sozinha no primeiro chip; ?doc= escolhe outro (link compartilhável)
  const escolhido = docSelecionado ?? fila?.itens[0]?.codigo;
  useEffect(() => {
    if (!escolhido) return;
    let vivo = true;
    setErroMesa(false);
    fetchFicha(escolhido, undefined, { perfil })
      .then((f) => vivo && setFichaMesa(f))
      .catch(() => vivo && setErroMesa(true));
    return () => {
      vivo = false;
    };
  }, [escolhido, perfil, tentativa]);

  return (
    <div className="view-container visao-geral" data-testid="visao-geral">
      <CabecalhoTela titulo="Arquivo Central de Normas" descricao="Acesse normas, consulte regras e acompanhe prazos institucionais." />

      <nav className="fg-atalhos" aria-label="Atalhos">
        {ATALHOS.map((t) => (
          <a key={t.titulo} className="fg-card fg-atalho" href={t.destino} onClick={ir(t.destino)}>
            <span className="fg-icone" aria-hidden="true">
              <Icon nome={t.icone} tamanho={20} />
            </span>
            <span className="fg-atalho-texto">
              <strong>{t.titulo}</strong>
              <span>{t.descricao}</span>
            </span>
            <Icon nome="seta" tamanho={16} className="fg-atalho-seta" />
          </a>
        ))}
      </nav>

      {/* Revisão 13/11 (RF71/RF72): documentos que pedem atenção + Mesa de decisão */}
      <section className="inicio-mesa" aria-labelledby="t-atencao" data-testid="inicio-atencao">
        <div className="inicio-mesa-titulo">
          <h2 id="t-atencao">Documentos que pedem sua atenção</h2>
          <span className="fg-sub">
            Perfil: {perfil ? PERFIS.find((p) => p.id === perfil)?.nome ?? perfil : 'todos'} · escolha um para abrir aqui embaixo
          </span>
        </div>
        {!fila ? (
          <div className="mesa-chips" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="mesa-chip triagem-esqueleto" />
            ))}
          </div>
        ) : fila.itens.length === 0 ? (
          <p className="fg-card">Nada pede sua atenção agora.</p>
        ) : (
          <>
            <div className="mesa-chips" role="tablist" aria-label="Documentos que pedem sua atenção">
              {fila.itens.map((i) => (
                <button
                  key={i.codigo}
                  type="button"
                  role="tab"
                  aria-selected={i.codigo === escolhido}
                  className={`mesa-chip nivel-${i.semaforo.nivel}`}
                  onClick={() => navegar(url.inicio(i.codigo), true)}
                  data-testid={`chip-${i.codigo}`}
                >
                  <span className={`mesa-chip-ponto nivel-${i.semaforo.nivel}`} aria-hidden="true" />
                  {i.codigo} · {i.motivo_curto ?? i.semaforo.motivos[0] ?? 'em dia'}
                </button>
              ))}
            </div>
            {fichaMesa ? (
              <MesaDocumento ficha={fichaMesa} variante="compacta" />
            ) : erroMesa ? (
              <div className="alerta alerta-erro" role="alert">
                Não conseguimos abrir este documento agora.{' '}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setTentativa((t) => t + 1)}>
                  Tentar de novo
                </button>
              </div>
            ) : (
              <div className="fg-card triagem-esqueleto mesa-carregando" aria-busy="true" />
            )}
          </>
        )}
      </section>
    </div>
  );
};
