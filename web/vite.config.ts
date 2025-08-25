/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
          // Move transformers to be loaded dynamically instead of in a separate chunk
          // This will be loaded on-demand when embedding functionality is actually used
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@xenova/transformers'],
    exclude: ['@xenova/transformers/dist/ort-wasm-simd.wasm', 'sharp']
  },
  define: {
    global: 'globalThis'
  },
  worker: {
    format: 'es'
  },
  assetsInclude: ['**/*.onnx', '**/*.wasm']
});
