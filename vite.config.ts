/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // CSS lido como texto (?raw) nos testes de design system; sem isto o Vitest devolve string vazia
    css: { include: [/\.css\?raw$/] },
  },
});
