import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isNode18 = process.version.startsWith('v18')

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '../../utils/financials': path.resolve(__dirname, './src/utils/financials.js'),
      '../../store/useAppStore': path.resolve(__dirname, './src/store/useAppStore.js'),
      '../../services/githubService': path.resolve(__dirname, './src/services/githubService.js'),
      '../../services/geminiService': path.resolve(__dirname, './src/services/geminiService.js'),
      '../../../utils/financials': path.resolve(__dirname, './src/utils/financials.js'),
      '../../../store/useAppStore': path.resolve(__dirname, './src/store/useAppStore.js'),
      '../../../services/githubService': path.resolve(__dirname, './src/services/githubService.js'),
      '../../../services/geminiService': path.resolve(__dirname, './src/services/geminiService.js'),
    },
  },
  build: {
    chunkSizeWarningLimit: 2500,
  },
  plugins: [
    react(),
    VitePWA({
      disable: isNode18, // Clean build on Node 18 locally; active on Vercel Node 20+
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Apex Business OS',
        short_name: 'ApexOS',
        description: 'Sistema de Inteligencia de Negocios y Control Financiero',
        theme_color: '#181818',
        background_color: '#181818',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
