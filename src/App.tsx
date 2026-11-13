import { useEffect, useState } from 'react';
import { Sidebar, Topbar, Rodape } from './components/Header';
import { VisaoGeralView } from './components/VisaoGeralView';
import { PerguntarView } from './components/PerguntarView';
import { CatalogoView } from './components/CatalogoView';
import { DocumentoView } from './components/DocumentoView';
import { PerspectivasView } from './components/PerspectivasView';
import { GrafoView } from './components/GrafoView';
import { CompararView } from './components/CompararView';
import { RelatorioView } from './components/RelatorioView';
import { RadarView } from './components/RadarView';
import { ESeView } from './components/ESeView';
import { EnviarView } from './components/EnviarView';
import { RevisarView } from './components/RevisarView';
import { DecisaoModal } from './components/DecisaoModal';
import { CabecalhoTela } from './ui/componentes';
import { navegar, url, useRota } from './app/rotas';
import { acoes, useEstado } from './app/store';
import { fetchSaude } from './api/client';
import { SaudeResponse } from './api/types';
import './App.css';
import './ui/shell.css';
import './ui/telas-v2.css';
import './ui/leitura.css';
import './ui/figma.css';

const dataBR = (iso?: string) => (iso ? iso.split('-').reverse().join('/') : '12/11/2026');

export function App() {
  const rota = useRota();
  const [saude, setSaude] = useState<SaudeResponse | null>(null);
  const [ultimoDocumento, setUltimoDocumento] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchSaude().then(setSaude).catch(() => setSaude(null));
  }, []);

  useEffect(() => {
    if (rota.tela === 'documento' && rota.params.codigo) setUltimoDocumento(rota.params.codigo);
  }, [rota.tela, rota.params.codigo]);

  // Tamanho do texto escolhido no topo (A, A+, A++): vale para todo o app
  const tamanhoTexto = useEstado((e) => e.tamanhoTexto);
  useEffect(() => {
    document.documentElement.dataset.tamanho = tamanhoTexto;
  }, [tamanhoTexto]);

  // Ao trocar de tela, a gaveta do menu (celular) fecha
  useEffect(() => {
    acoes.abrirMenu(false);
  }, [rota.tela]);

  // Navegação comum das telas: abrir um documento numa seção vira uma rota profunda
  const abrirDocumento = (codigo: string, versao?: string, secao?: string) => navegar(url.documento(codigo, versao, secao));

  const q = rota.query;
  const secaoDoHash = rota.hash.startsWith('secao-') ? rota.hash.slice('secao-'.length) : undefined;

  let conteudo: JSX.Element;
  switch (rota.tela) {
    case 'inicio':
      conteudo = <VisaoGeralView />;
      break;
    case 'perguntar':
      conteudo = <PerguntarView key={q.get('q') ?? ''} onNavegarDocumento={abrirDocumento} perguntaInicial={q.get('q') ?? undefined} />;
      break;
    case 'perspectivas':
      conteudo = (
        <PerspectivasView
          key={rota.params.perspectiva ?? 'pessoas'}
          onNavegarDocumento={abrirDocumento}
          perspectivaInicial={rota.params.perspectiva ?? 'pessoas'}
          tema={q.get('tema') ?? ''}
          prazo={q.get('prazo') ?? ''}
        />
      );
      break;
    case 'radar':
      conteudo = <RadarView itemId={q.get('item') ?? undefined} tema={q.get('tema') ?? ''} />;
      break;
    case 'ese':
      conteudo = <ESeView valorInicial={Number(q.get('valor')) || 30} />;
      break;
    case 'catalogo':
      conteudo = <CatalogoView onNavegarDocumento={abrirDocumento} temaInicial={q.get('tema') ?? undefined} />;
      break;
    case 'documento':
      conteudo = (
        <DocumentoView
          codigo={rota.params.codigo}
          versao={q.get('versao') ?? undefined}
          secaoDestacada={secaoDoHash}
          onVoltar={() => (window.history.length > 1 ? window.history.back() : navegar(url.catalogo()))}
          onMudarVersao={(codigo, versao) => navegar(url.documento(codigo, versao || undefined))}
        />
      );
      break;
    case 'comparar':
      conteudo = <CompararView key={q.get('codigo') ?? ''} onNavegarDocumento={abrirDocumento} codigoInicial={q.get('codigo') ?? undefined} />;
      break;
    case 'grafo':
      conteudo = <GrafoView onNavegarDocumento={abrirDocumento} />;
      break;
    case 'relatorio':
      conteudo = (
        <RelatorioView
          key={q.toString()}
          onNavegarDocumento={abrirDocumento}
          modoSelecao={q.get('selecao') === '1'}
          perspectivaInicial={q.get('perspectiva') ?? undefined}
        />
      );
      break;
    case 'enviar':
      conteudo = <EnviarView />;
      break;
    case 'revisar':
      conteudo = <RevisarView arquivoId={rota.params.id} />;
      break;
    default:
      conteudo = (
        <div className="view-container">
          <CabecalhoTela etiqueta="Endereço inválido" titulo="Não encontramos esta página." />
          <a
            className="btn btn-primary"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navegar('/');
            }}
          >
            Ir para a visão geral
          </a>
        </div>
      );
  }

  return (
    <div className="app-layout">
      <a className="pular-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Sidebar telaAtiva={rota.tela} documentoAtivoCodigo={ultimoDocumento} />

      <div className="app-body">
        <Topbar telaAtiva={rota.tela} />
        <main className="app-main" id="conteudo" tabIndex={-1}>
          {conteudo}
        </main>
        <Rodape ia={saude?.ia} dataReferencia={dataBR(saude?.data_referencia)} />
      </div>

      <DecisaoModal />
    </div>
  );
}

export default App;
