// frontend/vite.config.js
export default {
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: ['frontend-dashboard-fyjc.onrender.com']
  }
}

