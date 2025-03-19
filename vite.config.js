import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://maturita.onrender.com',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'], // Add pdfjs-dist to optimizeDeps
  },
});