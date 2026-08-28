import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        assetFileNames: (asset) => asset.name?.endsWith('.css') ? 'assets/app.css' : 'assets/[name]-[hash][extname]'
      }
    }
  },
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' }
});
