import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // USDA slim index is intentionally inlined for offline parse (~200KB gzip).
    chunkSizeWarningLimit: 1200,
  },
})
