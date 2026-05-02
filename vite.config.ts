import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const finnhubApiKey =
    env.VITE_FINNHUB_API_KEY || env.FINNHUB_API_KEY || ''

  return {
  define: {
    'import.meta.env.VITE_FINNHUB_API_KEY': JSON.stringify(finnhubApiKey),
  },
  plugins: [
    react(),
    {
      name: 'debug-ingest-parse-sage-script',
      configureServer() {
        // #region agent log
        const p = resolve(__dirname, 'public/sage_script.json')
        try {
          JSON.parse(readFileSync(p, 'utf8'))
          fetch(
            'http://127.0.0.1:7938/ingest/3ed84fb0-c8c5-4544-8113-5d2d9a7daa81',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Debug-Session-Id': '99c9e3',
              },
              body: JSON.stringify({
                sessionId: '99c9e3',
                runId: 'post-fix-verify',
                hypothesisId: 'H-parse',
                location: 'vite.config.ts:sage-script-parse',
                message: 'sage_script.json parse',
                data: { ok: true, path: p },
                timestamp: Date.now(),
              }),
            }
          ).catch(() => {})
        } catch (e) {
          fetch(
            'http://127.0.0.1:7938/ingest/3ed84fb0-c8c5-4544-8113-5d2d9a7daa81',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Debug-Session-Id': '99c9e3',
              },
              body: JSON.stringify({
                sessionId: '99c9e3',
                runId: 'verify',
                hypothesisId: 'H-parse',
                location: 'vite.config.ts:sage-script-parse',
                message: 'sage_script.json parse',
                data: {
                  ok: false,
                  err: e instanceof Error ? e.message : String(e),
                  path: p,
                },
                timestamp: Date.now(),
              }),
            }
          ).catch(() => {})
        }
        // #endregion
      },
    },
  ],
}
})
