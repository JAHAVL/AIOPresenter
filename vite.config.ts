import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const rendererDevServerPort = 9871;

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),

  plugins: [
    electron([ 
      {
        entry: path.resolve(__dirname, 'src/main/main.ts'),
        onstart(options) {
          options.startup(); 
        },
        vite: {
          build: {
            sourcemap: 'inline',
            outDir: path.resolve(__dirname, 'dist/main'),
            rollupOptions: {
              external: ['electron', 'path', 'electron-squirrel-startup'],
            },
          },
          define: {
            'VITE_DEV_SERVER_URL': JSON.stringify(`http://localhost:${rendererDevServerPort}`),
          },
        },
      },
      {
        entry: path.resolve(__dirname, 'src/preload/preload.ts'), 
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            sourcemap: 'inline',
            outDir: path.resolve(__dirname, 'dist/preload'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      {
        entry: path.resolve(__dirname, 'src/renderer/index.html'), 
        vite: {
          build: {
            sourcemap: 'inline',
            outDir: path.resolve(__dirname, 'dist/renderer'), 
            rollupOptions: {},
          },
        },
      },
    ]),
    react(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@main': path.resolve(__dirname, './src/main'),
      '@renderer': path.resolve(__dirname, './src/renderer'),
      '@preload': path.resolve(__dirname, './src/preload'),
      '@common': path.resolve(__dirname, './src/common'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: rendererDevServerPort, 
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['electron'],
  },
});
