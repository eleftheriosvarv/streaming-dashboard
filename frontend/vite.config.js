import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ["frontend-dashboard-fyjc.onrender.com"]
  },
  preview: {
    host: true,
    port: 4173
  }
})
