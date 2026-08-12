import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env': {},
    global: 'window',
  },
  resolve: {
    alias: {
      util: 'util',
    },
  },
});
