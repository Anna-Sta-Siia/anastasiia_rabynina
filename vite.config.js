// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr(), react()],   // ⬅️ SVGR en premier
  base: '/mon_projet/',         // garde-le si tu déploies sous ce sous-dossier (GitHub Pages)
});
