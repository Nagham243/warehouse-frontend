import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // This configures the development server to proxy API requests
    proxy: {
      // Option 1: Simple proxy to another server
      '/api': {
        target: 'http://localhost:8000', // Change to your API server address
        changeOrigin: true,
        secure: false
      },
      
      // Option 2: Proxy with path rewriting (if your API doesn't expect /api prefix)
      // '/api': {
      //   target: 'http://localhost:8000',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  }
});