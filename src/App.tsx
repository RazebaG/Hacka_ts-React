import { useState } from 'react';
import { Header, AbaAtiva } from './components/Header';
import { PerguntarView } from './components/PerguntarView';
import { CatalogoView } from './components/CatalogoView';
import { DocumentoView } from './components/DocumentoView';
import './App.css';

export function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('perguntar');
  const [abaAnterior, setAbaAnterior] = useState<AbaAtiva>('perguntar');

  // Estado do documento em visualização
  const [docCodigo, setDocCodigo] = useState<string>('NG_111');
  const [docVersao, setDocVersao] = useState<string | undefined>('3.0.0');
  const [secaoDestacada, setSecaoDestacada] = useState<string | undefined>(undefined);

  const handleNavegarDocumento = (codigo: string, versao?: string, secaoId?: string) => {
    setAbaAnterior(abaAtiva === 'documento' ? abaAnterior : abaAtiva);
    setDocCodigo(codigo);
    setDocVersao(versao);
    setSecaoDestacada(secaoId);
    setAbaAtiva('documento');
  };

  const handleVoltar = () => {
    setSecaoDestacada(undefined);
    setAbaAtiva(abaAnterior === 'documento' ? 'catalogo' : abaAnterior);
  };

  const handleMudarVersao = (novoCodigo: string, novaVersao: string) => {
    setDocCodigo(novoCodigo);
    setDocVersao(novaVersao || undefined);
    setSecaoDestacada(undefined);
  };

  return (
    <div className="app-layout">
      <Header
        abaAtiva={abaAtiva}
        onSelecionarAba={setAbaAtiva}
        documentoAtivoCodigo={docCodigo}
      />

      <main className="app-main">
        {abaAtiva === 'perguntar' && (
          <PerguntarView onNavegarDocumento={handleNavegarDocumento} />
        )}

        {abaAtiva === 'catalogo' && (
          <CatalogoView onNavegarDocumento={handleNavegarDocumento} />
        )}

        {abaAtiva === 'documento' && (
          <DocumentoView
            codigo={docCodigo}
            versao={docVersao}
            secaoDestacada={secaoDestacada}
            onVoltar={handleVoltar}
            onMudarVersao={handleMudarVersao}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          HACKA/TS 2026 · Desafio 2 — Assistente de Inteligência do Arquivo Central de Normas (ACME)
        </p>
      </footer>
    </div>
  );
}

export default App;
