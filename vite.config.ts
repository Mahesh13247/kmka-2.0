import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      allowedHosts: [
        'kmka-2-0-1.onrender.com',
        '.onrender.com'
      ]
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: '18+ studymaterial',
          short_name: '18+ Study',
          description: 'Premium Video Explorer by Mahesh',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    base: isGitHubPages ? "/kmka-2.0" : "/",
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
