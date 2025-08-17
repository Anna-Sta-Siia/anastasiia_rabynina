// vite.config.js (simple et suffisant)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => ({
  plugins: [svgr(), react()],
  base: mode === "production" ? "/mon_projet/" : "/", // <-- adapter au nom du repo
}));
