import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js?v=74',
        chunkFileNames: 'assets/[name]-[hash].js?v=74',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
