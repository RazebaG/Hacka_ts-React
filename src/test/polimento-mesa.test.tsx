import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FichaView } from '../components/FichaView';
import { MesaDocumento } from '../components/MesaDocumento';
import { mockFicha } from '../mocks/ficha';
import secoesReais from '../mocks/secoes-reais.json';
import figmaCss from '../ui/figma.css?raw';
import mesaCss from '../ui/mesa.css?raw';
import mesaTsx from '../components/MesaDocumento.tsx?raw';

/** Pendências da PR #25 (issue #27): Ficha sem cartão dentro de cartão, CSS, divisão da Mesa, selo e pop-up acessível. */

const partesMesa = import.meta.glob<string>('../components/mesa/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true });
const ficha = () => mockFicha('CTR_2026-012')!;
const abrirSecao = (nome: RegExp) => {
  const celula = within(screen.getByRole('list', { name: /Seções do documento/ })).getByRole('listitem', { name: nome });
  celula.focus();
  fireEvent.click(celula);
  return celula;
};

afterEach(() => window.history.replaceState(null, '', '/'));

describe('#27 · Ficha completa', () => {
  it('a Mesa não é cartão dentro de cartão e o título do documento aparece uma vez', async () => {
    const { container } = render(<FichaView codigo="CTR_2026-012" />);
    const mesa = await screen.findByTestId('ficha-relance');
    expect(mesa).not.toHaveClass('fg-card');
    expect(mesa.closest('.fg-card')).toBeNull();
    expect(mesa.querySelector('.fg-card')).toBeNull();
    const titulo = ficha().identidade.titulo;
    const comTitulo = Array.from(container.querySelectorAll('*')).filter((el) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent!.includes(titulo)));
    expect(comTitulo.map((el) => el.tagName)).toEqual(['H1']);
    // Nem o rótulo da região repete o título (o leitor de tela já ouviu o h1)
    expect(mesa).toHaveAttribute('aria-label', 'Mesa de decisão');
  });

  it('na tela inicial (compacta) o título continua na Mesa', () => {
    render(<MesaDocumento ficha={ficha()} variante="compacta" />);
    expect(screen.getByRole('heading', { level: 2, name: ficha().identidade.titulo })).toBeInTheDocument();
  });
});

describe('#27 · Selo de relevância', () => {
  it('o motivo inteiro fica no selo (sem encurtar o dado) e o selo cabe em duas linhas nos blocos estreitos', () => {
    const f = ficha();
    render(<MesaDocumento ficha={f} variante="compacta" />);
    for (const b of f.blocos!) {
      const selo = screen.getByTestId(`relevancia-${b.id}`);
      expect(selo).toHaveTextContent(`${b.relevancia.posicao}º · ${b.relevancia.motivo}`);
      expect(selo).toHaveAttribute('title', `${b.relevancia.posicao}º · ${b.relevancia.motivo}`);
    }
    // Quebra só quando não cabe ao lado do título; até duas linhas, sem reticências
    expect(mesaCss).toMatch(/\.mesa-bloco-topo \{ flex-wrap: wrap; \}/);
    const selo = [...mesaCss.matchAll(/\.mesa-bloco-relevancia \{([^}]*)\}/g)].pop()![1];
    expect(selo).toMatch(/-webkit-line-clamp: 2;/);
    expect(selo).toMatch(/white-space: normal;/);
    expect(selo).not.toMatch(/text-overflow: ellipsis/);
  });
});

describe('#27 · CSS e divisão da Mesa', () => {
  it('figma.css sem restos da apresentação; estilos da Mesa e do início em mesa.css', () => {
    expect(figmaCss).not.toMatch(/apresenta/i);
    expect(figmaCss).not.toMatch(/\.mesa-|\.inicio-mesa|\.visao-geral/);
    expect(mesaCss).not.toMatch(/apresenta|\.mesa-rodape \.btn/i);
    for (const seletor of ['.visao-geral {', '.inicio-mesa {', '.mesa-chip {', '.mesa {', '.mesa-bloco {', '.mesa-celula {', '.popup {']) expect(mesaCss).toContain(seletor);
  });

  it('MesaDocumento dividido em partes de até ~150 linhas', () => {
    const nomes = Object.keys(partesMesa).map((k) => k.split('/').pop());
    expect(nomes).toEqual(expect.arrayContaining(['MesaCabecalho.tsx', 'FaixaPrecisaDeVoce.tsx', 'MapaCalor.tsx', 'GradeBlocos.tsx', 'DetalheBloco.tsx']));
    for (const [nome, texto] of Object.entries({ MesaDocumento: mesaTsx, ...partesMesa })) expect(texto.split('\n').length, nome).toBeLessThanOrEqual(150);
  });
});

describe('#27 · Seções reais no mock', () => {
  it('todo documento com texto real tem id de seção único', () => {
    for (const [codigo, d] of Object.entries(secoesReais as Record<string, { secoes: { id: string }[] }>)) {
      const ids = d.secoes.map((s) => s.id);
      expect(new Set(ids).size, codigo).toBe(ids.length);
    }
  });
});

describe('#27 · Pop-up acessível', () => {
  it('ao abrir: foco no diálogo, aria-modal, título completo anunciado já antes de o texto chegar', async () => {
    render(<MesaDocumento ficha={ficha()} variante="compacta" />);
    abrirSecao(/Cláusula Décima Terceira/);
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(document.activeElement).toBe(dialogo);
    const titulo = ficha().mapa_calor.find((c) => c.secao_id === 'Cláusula Décima Terceira')!.titulo;
    // Nome acessível = o h2 do pop-up, com o título da seção (do mapa) mesmo enquanto carrega
    expect(screen.getByRole('dialog', { name: `Cláusula Décima Terceira · ${titulo}` })).toBe(dialogo);
    expect(dialogo).toHaveAccessibleDescription(/CTR_2026-012/);
    await within(dialogo).findByText(/Principais trechos/);
    expect(dialogo).toHaveAccessibleDescription(/seção \d+ de \d+/);
  });

  it('trocar de seção anuncia o novo título; na última seção o foco não se perde', async () => {
    render(<MesaDocumento ficha={ficha()} variante="compacta" />);
    const celulas = ficha().mapa_calor;
    abrirSecao(/Cláusula Décima Terceira/);
    const dialogo = screen.getByRole('dialog');
    await within(dialogo).findByText(/Principais trechos/);
    // Ao abrir, quem anuncia é o próprio diálogo (nome acessível); a região viva fica vazia
    expect(screen.getByTestId('popup-anuncio')).toHaveTextContent('');
    const proxima = screen.getByTestId('popup-proxima');
    // Próxima pula para a seção seguinte com sinal; segue até a última e o botão fica desativado
    let passos = 0;
    while (!(proxima as HTMLButtonElement).disabled && passos++ < celulas.length) {
      proxima.focus();
      fireEvent.click(proxima);
      await waitFor(() => expect(screen.getByTestId('popup-anuncio')).toHaveTextContent(/^Seção aberta: /));
    }
    expect(passos).toBeGreaterThan(0);
    expect(proxima).toBeDisabled();
    expect(document.activeElement).toBe(dialogo);
    const titulo = within(dialogo).getByRole('heading', { level: 2 }).textContent;
    expect(screen.getByTestId('popup-anuncio')).toHaveTextContent(`Seção aberta: ${titulo}`);
  });

  it('ao fechar, o foco volta à célula que abriu', async () => {
    render(<MesaDocumento ficha={ficha()} variante="compacta" />);
    const celula = abrirSecao(/Cláusula Sétima/);
    await within(screen.getByRole('dialog')).findByText(/Principais trechos/);
    fireEvent.click(screen.getByTestId('popup-fechar'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.activeElement).toBe(celula);
  });

  it('aberto por ?secao= (sem célula de origem), ao fechar o foco vai para a célula da seção', async () => {
    window.history.replaceState(null, '', '/?secao=' + encodeURIComponent('Cláusula Sétima'));
    render(<MesaDocumento ficha={ficha()} variante="compacta" />);
    const dialogo = await screen.findByRole('dialog');
    await within(dialogo).findByText(/Principais trechos/);
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.activeElement).toHaveAttribute('data-secao', 'Cláusula Sétima');
  });
});
