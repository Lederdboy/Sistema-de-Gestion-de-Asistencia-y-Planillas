import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ content: [], offline: true, error: 'Backend offline' }))
            }
          })
        },
      },
    },
  },
})
