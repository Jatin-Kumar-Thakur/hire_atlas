import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function replacePublicEnvPlugin(env) {
  return {
    name: 'replace-public-env',
    closeBundle() {
      const outDir = path.resolve('dist');
      for (const file of ['robots.txt', 'sitemap.xml']) {
        const filePath = path.join(outDir, file);
        if (fs.existsSync(filePath)) {
          const updated = fs.readFileSync(filePath, 'utf-8')
            .replace(/%VITE_APP_URL%/g, env.VITE_APP_URL || '');
          fs.writeFileSync(filePath, updated);
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), replacePublicEnvPlugin(env)],
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            dnd: ['@dnd-kit/core', '@dnd-kit/sortable'],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
