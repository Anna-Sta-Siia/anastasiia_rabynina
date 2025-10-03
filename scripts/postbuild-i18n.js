// scripts/postbuild-i18n.js
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");

function moveToFolder(htmlName, folderName) {
  const from = path.join(dist, `${htmlName}.html`);
  const folder = path.join(dist, folderName);
  const to = path.join(folder, "index.html");

  if (!fs.existsSync(from)) {
    console.warn(`[postbuild] Skipped: ${htmlName}.html not found`);
    return;
  }
  fs.mkdirSync(folder, { recursive: true });
  fs.renameSync(from, to);
  console.log(`[postbuild] Moved: ${htmlName}.html -> ${folderName}/index.html`);
}

moveToFolder("fr", "fr");
moveToFolder("en", "en");
moveToFolder("ru", "ru");

// Optionnel: garder index.html (redirect) à la racine dist/
// Rien à faire: Vite l'a déjà écrit en dist/index.html
console.log("[postbuild] Done.");
