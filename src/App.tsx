import { useState } from 'react';
import { Header, AbaAtiva } from './components/Header';
import { PerguntarView } from './components/PerguntarView';
import { CatalogoView } from './components/CatalogoView';
import { DocumentoView } from './components/DocumentoView';
import { PerspectivasView } from './components/PerspectivasView';
import { RadarView } from './components/RadarView';
import { SimularView } from './components/SimularView';
import { GrafoView } from './components/GrafoView';
import { CompararView } from './components/CompararView';
import { RelatorioView } from './components/RelatorioView';
import { DecodificadorView } from './components/DecodificadorView';
import './App.css';

export function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('perspectivas');
  const [abaAnterior, setAbaAnterior] = useState<AbaAtiva>('perspectivas');

  // Estado do documento em visualização
  const [docCodigo, setDocCodigo] = useState<string>('NG_111');
  const [docVersao, setDocVersao] = useState<string | undefined>('3.0.0');
  const [secaoDestacada, setSecaoDestacada] = useState<string | undefined>(undefined);

  // Estados de controle para atalhos da demo
  const [perspectivaSelecionada, setPerspectivaSelecionada] = useState<string>('pessoas');
  const [codigoParaDecodificar, setCodigoParaDecodificar] = useState<string>('PX_1111-001');

  const handleNavegarDocumento = (codigo: string, versao?: string, secaoId?: string) => {
    setAbaAnterior(abaAtiva === 'documento' ? abaAnterior : abaAtiva);
    setDocCodigo(codigo);
    setDocVersao(versao);
    setSecaoDestacada(secaoId);
    setAbaAtiva('documento');
  };

  const handleNavegarDecodificador = (codigo: string) => {
    setCodigoParaDecodificar(codigo);
    setAbaAtiva('decodificador');
  };

  const handleVoltar = () => {
    setSecaoDestacada(undefined);
    setAbaAtiva(abaAnterior === 'documento' ? 'perspectivas' : abaAnterior);
  };

  const handleMudarVersao = (novoCodigo: string, novaVersao: string) => {
    setDocCodigo(novoCodigo);
    setDocVersao(novaVersao || undefined);
    setSecaoDestacada(undefined);
  };

  // Suporte a atalhos rápidos das 5 cenas do Pitch da demo (≤ 2 min)
  const handleAtalhoDemo = (cena: number) => {
    switch (cena) {
      case 1:
        // Cena 1: Armadilha da versão (Pessoas / 45 dias vs 30 dias na v2)
        setPerspectivaSelecionada('pessoas');
        setAbaAtiva('perspectivas');
        break;
      case 2:
        // Cena 2: Financeiro (R$ 18.250,00, alçada e multa R$ 912,50 no Apêndice B)
        setPerspectivaSelecionada('financeiro');
        setAbaAtiva('perspectivas');
        break;
      case 3:
        // Cena 3: O que mudou (NG_111 v2 → v3)
        setAbaAtiva('comparar');
        break;
      case 4:
        // Cena 4: Pergunte ao acervo (abstenção "não consta nas fontes")
        setAbaAtiva('perguntar');
        break;
      case 5:
        // Cena 5: Relatório executivo da perspectiva Jurídico/Contratos
        setAbaAtiva('relatorio');
        break;
      default:
        setAbaAtiva('perspectivas');
    }
  };

  return (
    <div className="app-layout">
      <Header
        abaAtiva={abaAtiva}
        onSelecionarAba={setAbaAtiva}
        documentoAtivoCodigo={docCodigo}
        onAtalhoDemo={handleAtalhoDemo}
      />

      <main className="app-main">
        {abaAtiva === 'perspectivas' && (
          <PerspectivasView
            onNavegarDocumento={handleNavegarDocumento}
            perspectivaInicial={perspectivaSelecionada}
          />
        )}

        {abaAtiva === 'radar' && (
          <RadarView
            onNavegarDocumento={handleNavegarDocumento}
            onNavegarSimular={() => setAbaAtiva('simular')}
          />
        )}

        {abaAtiva === 'simular' && (
          <SimularView
            onNavegarDocumento={handleNavegarDocumento}
            onNavegarRadar={() => setAbaAtiva('radar')}
          />
        )}

        {abaAtiva === 'grafo' && (
          <GrafoView onNavegarDocumento={handleNavegarDocumento} />
        )}

        {abaAtiva === 'comparar' && (
          <CompararView onNavegarDocumento={handleNavegarDocumento} />
        )}

        {abaAtiva === 'relatorio' && (
          <RelatorioView onNavegarDocumento={handleNavegarDocumento} />
        )}

        {abaAtiva === 'perguntar' && (
          <PerguntarView onNavegarDocumento={handleNavegarDocumento} />
        )}

        {abaAtiva === 'decodificador' && (
          <DecodificadorView
            onNavegarDocumento={handleNavegarDocumento}
            codigoInicial={codigoParaDecodificar}
          />
        )}

        {abaAtiva === 'catalogo' && (
          <CatalogoView
            onNavegarDocumento={handleNavegarDocumento}
            onNavegarDecodificador={handleNavegarDecodificador}
          />
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

      <footer className="app-footer print-hidden">
        <p>
          HACKA/TS 2026 · Desafio 2 — Assistente de Inteligência do Arquivo Central de Normas (ACME)
        </p>
      </footer>
    </div>
  );
}

export default App;
