import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    global: 'window',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.SENTRY_ENABLED': JSON.stringify(process.env.NODE_ENV === 'production')
  },
  css: {
    modules: {
      localsConvention: "camelCase"
    }
  }
})
