const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');

module.exports = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    }
  },
  base: '/lifeos/',
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        callback: path.resolve(__dirname, 'callback.html')
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
