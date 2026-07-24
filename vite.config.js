import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Plugin to copy pdfjs worker to dist
function pdfWorkerPlugin() {
  return {
    name: 'pdf-worker-plugin',
    writeBundle() {
      const workerSrc = join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
      const workerDest = join(__dirname, 'dist', 'pdf.worker.min.mjs');
      if (existsSync(workerSrc)) {
        copyFileSync(workerSrc, workerDest);
        console.log('✅ PDF worker copied to dist/');
      }
    }
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  },
  plugins: [pdfWorkerPlugin()]
});
