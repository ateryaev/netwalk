import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
  VitePWA({
    //registerType: 'autoUpdate',
    registerType: 'prompt',
    workbox: {
      maximumFileSizeToCacheInBytes: 7000000, // Increase limit for larger files
      globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,ttf}'], // Precache these files
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'audio',
          handler: 'CacheFirst',
          options: {
            cacheName: 'audio-cache',
            rangeRequests: true, // Crucial for MP3 background music
          },
        },
      ],
    },
    manifest: {
      "short_name": "Netwalk",
      "name": "Netwalk Prime",
      "icons": [
        {
          "src": "netwalk.svg",
          "type": "image/svg+xml",
          "sizes": "64x64 32x32 24x24 16x16 192x192 512x512",
          "purpose": "maskable any"
        }
      ],
      "orientation": "portrait",
      "start_url": ".",
      "display": "standalone",
      "theme_color": "#007744",
      "background_color": "#007744"
    }
  })
  ],
})
