// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// équivalent ESM de __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [svgr(), react()],
  // En prod (GH Pages project) le site vit sous /anastasiia_rabynina/
  // En dev on reste à la racine /
  base: mode === "production" ? "/anastasiia_rabynina/" : "/",

  build: {
    rollupOptions: {
      // ⚠️ multi-entrées : index (redir), + fr/en/ru
      input: {
        index: resolve(__dirname, "index.html"), // redirection vers /fr/
        fr: resolve(__dirname, "fr.html"),
        en: resolve(__dirname, "en.html"),
        ru: resolve(__dirname, "ru.html"),
      },
    },
  },
}));
