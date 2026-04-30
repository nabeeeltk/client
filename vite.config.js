import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://server-c6du4omry-nabeel-tks-projects.vercel.app',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://server-c6du4omry-nabeel-tks-projects.vercel.app',
        changeOrigin: true,
      }
    }
  }    
})
