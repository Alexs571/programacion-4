import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // alias @/ -> src/ (también declarado en tsconfig.app.json)
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // el bundle con React + TanStack pesa un poco más de 500 kB
    chunkSizeWarningLimit: 700,
  },
})
