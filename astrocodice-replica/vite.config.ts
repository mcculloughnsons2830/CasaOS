// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // The astrology + AI engine runs on the Express server (server/).
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
