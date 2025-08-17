// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// ✅ équivalent ESM de __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [svgr(), react()],
  base: mode === "production" ? "/mon_projet/" : "/",
  build: {
    rollupOptions: {
      input: { main: resolve(__dirname, "index.html") },
    },
  },
}));
