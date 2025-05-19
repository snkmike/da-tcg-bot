import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import envCompatible from 'vite-plugin-env-compatible';

export default defineConfig({
  plugins: [
    react({
      // Inclure les fichiers .js comme contenant potentiellement du JSX
      include: '**/*.{jsx,js,ts,tsx}',
      // Activer le Fast Refresh pour une meilleure DX
      fastRefresh: true,
    }),
    envCompatible()
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'dev.tcgbot.local-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'dev.tcgbot.local.pem')),
    },
    host: 'dev.tcgbot.local',
    port: 3000,
    proxy: { // Ajout de la configuration du proxy
      '/api': {
        target: 'http://localhost:3001', // Votre serveur apiServer.mjs
        changeOrigin: true,
        // secure: false, // Décommentez si votre backend n'est pas en HTTPS (ce qui est le cas ici)
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'src': path.resolve(__dirname, './src'),
      'public': path.resolve(__dirname, './public')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  define: {
    // Utiliser des variables spécifiques au lieu de tout process.env
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_SITE_URL': JSON.stringify(process.env.VITE_SITE_URL),
    'process.env.JUSTTCG_API_KEY': JSON.stringify(process.env.JUSTTCG_API_KEY),
    'process.env.LORCAST_API_KEY': JSON.stringify(process.env.LORCAST_API_KEY)
  },
  build: {
    outDir: 'build',
    assetsDir: 'static'
  }, // Ajout d'une virgule ici si optimizeDeps suit
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      loader: {
        '.js': 'jsx', // Traiter les fichiers .js comme du JSX
      }
    }
  }
});