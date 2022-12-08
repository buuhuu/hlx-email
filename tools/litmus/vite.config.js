import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: './dist',
    rollupOptions: {
      external: [
        'node-fetch', 'fetch-blob'
      ]
    }
  },
  base: '/tools/litmus/dist/'
})
