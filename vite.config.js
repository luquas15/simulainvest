import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separa vendors grandes em chunks independentes (lazy loading automático)
        manualChunks: (id) => {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'chart-vendor';
          }
          if (id.includes('node_modules/lightweight-charts')) {
            return 'trading-vendor';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
})
