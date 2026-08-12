import { defineConfig } from "vite";
import { Buffer } from "buffer";

export default defineConfig({
  define: {
    "process.env": {},
    global: "window",
  },
  resolve: {
    alias: {
      buffer: "buffer/",
    },
  },
});
