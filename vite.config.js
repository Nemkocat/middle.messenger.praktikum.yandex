import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';

export default defineConfig({
  publicDir: 'public', 
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src/components'),
    })
  ],
  base: './',
  build: {
    // assetsDir: 'static', 
    // outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: { port: '3000' },
  css: {
    preprocessorOptions: {
      scss: {
       
      },
    },
  },
});

