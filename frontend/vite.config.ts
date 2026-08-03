import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      // Keep in sync with "paths" in tsconfig.app.json.
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      // Listen on every interface: a tunnel (cloudflared/ngrok) needs to reach the
      // dev server, and Telegram can only open the mini app over public https.
      host: true,
      // Vite rejects requests whose Host it does not know. Tunnel hostnames are
      // random, so the suffixes are allowed instead — a leading dot matches any
      // subdomain. DEV_ALLOWED_HOSTS adds more, comma separated.
      allowedHosts: [
        '.trycloudflare.com',
        '.ngrok-free.app',
        '.ngrok.io',
        ...(env.DEV_ALLOWED_HOSTS?.split(',')
          .map((host) => host.trim())
          .filter(Boolean) ?? []),
      ],
      // Through a tunnel the page is served over https, so HMR has to go the same
      // way or the browser blocks the websocket as mixed content. Plain localhost
      // needs the default instead, hence the flag: DEV_TUNNEL=1 npm run dev.
      ...(env.DEV_TUNNEL ? { hmr: { clientPort: 443, protocol: 'wss' as const } } : {}),
      // The backend allows http://localhost:5173 by default (app.cors.allowed-origins),
      // but the app talks to a relative /api so that dev and prod behave the same way.
      proxy: {
        '/api': {
          target: env.BACKEND_URL ?? 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})
