import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
        'kmka.onrender.com',
        '.onrender.com'
      ]
    },
    plugins: [react()],
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
