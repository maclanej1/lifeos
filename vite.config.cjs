const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    }
  },
  base: '/lifeos/',
  build: {
    outDir: 'docs'
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
