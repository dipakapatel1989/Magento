import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    proxy: {
      '/graphql': {
        target: 'http://magento248.test',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})