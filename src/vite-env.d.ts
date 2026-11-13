/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do backend. Vazia = modo de exemplo (mocks). */
  readonly VITE_API_URL?: string;
  /** Enviada como X-API-Key. Fica visível no bundle: não é segredo de verdade. */
  readonly VITE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
