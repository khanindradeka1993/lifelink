// vite.config.js
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills({
      // Includes polyfills for Buffer and Global objects needed by Circle SDK
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
});

