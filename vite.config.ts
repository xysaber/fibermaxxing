import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Local meal I/O log server (npm run meal-log:dev)
      '/api': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
      },
    },
  },
  build: {
    // USDA slim index is intentionally inlined for offline parse (~200KB gzip).
    chunkSizeWarningLimit: 1200,
  },
})
