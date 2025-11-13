/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), legacy()],
  base: '/eNanayCare/', // ✅ for GitHub Pages

  build: {
    emptyOutDir: true,
    rollupOptions: {
      // ✅ Exclude heavy PDF libraries from build bundle
      external: ['jspdf', 'jspdf-autotable'],
    },
  },

  optimizeDeps: {
    // ✅ Prevent Vite from trying to pre-bundle these during build
    exclude: ['jspdf', 'jspdf-autotable'],
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
