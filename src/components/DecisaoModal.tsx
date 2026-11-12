import React, { useEffect, useRef, useState } from 'react';
import { postDecisao } from '../api/client';
import { acoes, Decisao, useEstado } from '../app/store';
import { Aviso, FonteChip } from '../ui/componentes';

const RESPONSAVEIS = ['GGC', 'GCO', 'GFI', 'GOC', 'DIRAF'];
const ACOES: { id: Decisao['acao']; rotulo: string }[] = [
  { id: 'encaminhar', rotulo: 'Enviar para a área revisar' },
  { id: 'aceitar', rotulo: 'Aceitar' },
  { id: 'descartar', rotulo: 'Descartar' }
];

/** M1 Registrar decisão (RF22, RF29): fecha o ciclo com responsável, nota e data. */
export const DecisaoModal: React.FC = () => {
  const origem = useEstado((e) => e.decisaoAberta);
  const [acao, setAcao] = useState<Decisao['acao']>('encaminhar');
  const [resp, setResp] = useState('GGC');
  const [nota, setNota] = useState('');
  const [ok, setOk] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const anterior = useRef<Element | null>(null);

  useEffect(() => {
    if (!origem) return;
    anterior.current = document.activeElement;
    setAcao('encaminhar');
    setResp(origem.responsavel);
    setNota('');
    setOk(null);
    setErro(null);
    setTimeout(() => caixa.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus(), 0);
  }, [origem]);

  if (!origem) return null;

  const fechar = () => {
    acoes.fecharDecisao();
    (anterior.current as HTMLElement | null)?.focus?.();
  };

  const prenderFoco = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return fechar();
    if (e.key !== 'Tab' || !caixa.current) return;
    const f = [...caixa.current.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]')].filter((x) => !x.hasAttribute('disabled'));
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
      e.preventDefault();
      f[0].focus();
    }
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await postDecisao({ item: origem.item, acao, responsavel: resp, nota });
      const d = acoes.registrarDecisao({ item: origem.item, fontes: origem.fontes, acao, responsavel: resp, nota });
      const quando = new Date(d.registrado_em);
      const data = quando.toLocaleDateString('pt-BR');
      const hora = `${String(quando.getHours()).padStart(2, '0')}h${String(quando.getMinutes()).padStart(2, '0')}`;
      setOk(
        acao === 'encaminhar'
          ? `Enviado para a ${resp} em ${data}, ${hora}. Você pode acompanhar em “Regras que mudaram”.`
          : `${acao === 'aceitar' ? 'Item aceito' : 'Item descartado'} em ${data}, ${hora}.`
      );
    } catch {
      setErro('Não conseguimos registrar agora. Sua nota continua aqui; tente de novo em alguns segundos.');
    }
  };

  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && fechar()}>
      <div className="modal-caixa" role="dialog" aria-modal="true" aria-labelledby="m1-titulo" ref={caixa} onKeyDown={prenderFoco} data-testid="modal-decisao">
        <div className="modal-topo">
          <h2 id="m1-titulo">Registrar decisão</h2>
          <button type="button" className="btn btn-outline btn-sm" onClick={fechar}>
            Fechar
          </button>
        </div>

        <section className="painel-secao modal-origem">
          <span className="badge-tag">Assunto</span>
          <p>{origem.item}</p>
          <div className="linha-fontes">
            {origem.fontes.map((f) => (
              <FonteChip key={`${f.codigo}-${f.versao}-${f.secao}`} fonte={f} curto />
            ))}
          </div>
        </section>

        {ok ? (
          <Aviso tipo="ok" testId="decisao-ok">
            {ok}
          </Aviso>
        ) : (
          <form onSubmit={registrar} className="modal-form">
            <fieldset>
              <legend>Ação</legend>
              {ACOES.map((a) => (
                <label key={a.id} className="avaliacao-opcao">
                  <input type="radio" name="acao-decisao" value={a.id} checked={acao === a.id} onChange={() => setAcao(a.id)} />
                  {a.rotulo}
                </label>
              ))}
            </fieldset>
            <div className="campo">
              <label htmlFor="m1-resp">Área que vai cuidar</label>
              <select id="m1-resp" value={resp} onChange={(e) => setResp(e.target.value)}>
                {RESPONSAVEIS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="m1-nota">Nota</label>
              <textarea id="m1-nota" rows={3} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ex.: revisar os documentos que ainda citam 30 dias" />
            </div>
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
            <div className="linha-botoes linha-botoes-fim">
              <button type="button" className="btn btn-outline" onClick={fechar}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" data-testid="btn-registrar-decisao">
                Registrar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
