import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Time Logger',
        short_name: 'TimeLog',
        description: 'Frictionless time logging app',
        theme_color: '#3b82f6',
        background_color: '#f8fafc',
        display: 'standalone',
      },
    }),
  ],
})
