import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: false,
    allowedHosts: ["stale-pillows-help.loca.lt", ".loca.lt"],
  },
})
