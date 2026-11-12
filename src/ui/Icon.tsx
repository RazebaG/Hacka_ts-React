import React from 'react';

/**
 * Ícones de traço (24×24, stroke = currentColor). Substituem os emojis usados como ícone.
 * Decorativos por padrão (aria-hidden); passe `label` quando o ícone for o único conteúdo.
 */
const PATHS: Record<string, React.ReactNode> = {
  painel: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  mapa: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8.2 7.3 10.6 16M15.8 7.3 13.4 16M8.5 6h7" />
    </>
  ),
  comparar: (
    <>
      <rect x="3" y="4" width="7" height="16" rx="1.5" />
      <rect x="14" y="4" width="7" height="16" rx="1.5" />
      <path d="M6 9h1M6 13h1M17 9h1M17 13h1" />
    </>
  ),
  relatorio: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  perguntar: (
    <>
      <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
      <path d="M9 9h6M9 12h4" />
    </>
  ),
  catalogo: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  documento: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8 8h8M8 11h6" />
    </>
  ),
  alerta: (
    <>
      <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arquivo: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </>
  ),
  pessoas: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </>
  ),
  financeiro: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9v.01M18 15v.01" />
    </>
  ),
  juridico: (
    <>
      <path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z" />
    </>
  ),
  gestao: (
    <>
      <path d="M3 20h18M6 16V11M11 16V7M16 16v-6M21 4l-5 5-3-3-5 5" />
    </>
  ),
  olho: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  tabela: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M3 15h18M9 4v16" />
    </>
  ),
  imprimir: (
    <>
      <path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="14" width="10" height="7" rx="1" />
    </>
  ),
  livro: (
    <>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </>
  ),
  play: <path d="M7 4.5v15l12-7.5z" />,
  enviar: <path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />,
  simular: (
    <>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  seta: <path d="m9 6 6 6-6 6" />,
  recolher: <path d="m15 6-6 6 6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  // Ícones do layout do Figma (traço 1.75, mesmo estilo)
  inicio: <path d="M4 11.5 12 5l8 6.5M6 10v9a1 1 0 0 0 1 1h3.5v-5h3v5H17a1 1 0 0 0 1-1v-9" />,
  duvida: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9.8 9.6a2.3 2.3 0 1 1 3.3 2.1c-.7.3-1.1.9-1.1 1.6M12 16.5h.01" />
    </>
  ),
  regras: <path d="M19 8a7.5 7.5 0 0 0-13.3-1.5M5 4v3h3M5 16a7.5 7.5 0 0 0 13.3 1.5M19 20v-3h-3" />,
  resumo: (
    <>
      <rect x="9.5" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="16" width="5" height="5" rx="1" />
      <rect x="16" y="16" width="5" height="5" rx="1" />
      <path d="M12 8v4M5.5 16v-2a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  busca: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  baixar: <path d="M12 4v11M7 10l5 5 5-5M4 19h16" />,
  historico: <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 4v4h4M12 8v4.5l3 2" />,
  calendario: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </>
  ),
  mais: <path d="M12 5v14M5 12h14" />,
  copiar: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  atualizar: <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" />,
  util: <path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.3 20H7" />,
  escudo: <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6zM9 12l2 2 4-4" />,
  tendencia: <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />,
  raio: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  trocar: <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />,
  apresentacao: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="m10 8.5 4.5 2.5-4.5 2.5z" />
    </>
  ),
  marca: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  )
};

export type NomeIcone = keyof typeof PATHS;

interface IconProps {
  nome: NomeIcone;
  tamanho?: number;
  label?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ nome, tamanho = 18, label, className }) => (
  <svg
    className={`ui-icon ${className ?? ''}`}
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    focusable="false"
  >
    {PATHS[nome]}
  </svg>
);
