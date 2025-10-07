// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import history from "connect-history-api-fallback";

export default defineConfig(({ mode }) => ({
  plugins: [
    {
      name: "i18n-spa-fallback",
      configureServer(server) {
        const fallback = history({
          rewrites: [
            { from: /^\/fr(\/.*)?$/, to: "/fr.html" },
            { from: /^\/en(\/.*)?$/, to: "/en.html" },
            { from: /^\/ru(\/.*)?$/, to: "/ru.html" },
          ],
          // important : ne pas retomber sur index.html pour tout
          index: false,
          disableDotRule: true,
          htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
        });

        server.middlewares.use((req, res, next) => {
          const u = req.url || "";
          // laissez passer les fichiers Vite et le code source
          if (u.startsWith("/@vite") || u.startsWith("/@react-refresh") || u.startsWith("/src/")) {
            return next();
          }
          return fallback(req, res, next);
        });
      },
    },
    svgr(),
    react(),
  ],
  base: mode === "production" ? "/anastasiia_rabynina/" : "/",
  build: {
    rollupOptions: {
      input: {
        fr: "fr.html",
        en: "en.html",
        ru: "ru.html",
      },
    },
  },
}));
