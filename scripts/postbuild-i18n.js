// scripts/postbuild-i18n.js
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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

console.log("[postbuild] START");

moveToFolder("fr", "fr");
moveToFolder("en", "en");
moveToFolder("ru", "ru");

// --- LOGS UTILES POUR DEBUG ---
console.log("[postbuild] Tree after move:");
try {
  // Affiche l’arborescence de dist/ (fonctionne dans Actions Linux)
  execSync("ls -R dist", { stdio: "inherit" });
} catch {
  // fallback Windows si jamais
  const list = (dir, prefix = "") => {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      const stat = fs.statSync(p);
      console.log(prefix + f + (stat.isDirectory() ? "/" : ""));
      if (stat.isDirectory()) list(p, prefix + "  ");
    }
  };
  list(dist);
}

console.log("[postbuild] DONE");
