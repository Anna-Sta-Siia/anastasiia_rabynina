import { IS_GHPAGES, REPO } from "./utils/env.js";

export function detectRouterBase() {
  const repo = IS_GHPAGES ? REPO : "/";

  // PROD : /<repo>/(fr|en|ru)/...
  const m = location.pathname.match(
    new RegExp(`^${repo.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(fr|en|ru)/`)
  );
  if (m) return `${repo}${m[1]}/`;

  // DEV : *.html
  if (location.pathname.endsWith("fr.html")) return "/fr/";
  if (location.pathname.endsWith("en.html")) return "/en/";
  if (location.pathname.endsWith("ru.html")) return "/ru/";

  // Défaut raisonnable
  return "/fr/";
}
