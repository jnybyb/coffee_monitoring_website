import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'admin', // Set root to admin folder
  build: {
    outDir: '../../dist/admin', // Output to separate admin build folder
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'admin/index.html')
      }
    }
  },
  server: {
    port: 3001, // Admin website port
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
