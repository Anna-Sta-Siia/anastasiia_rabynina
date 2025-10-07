const host = location.hostname;

export const IS_GHPAGES = host.endsWith("github.io");
export const REPO = "/anastasiia_rabynina/";
export const LANGS = ["fr", "en", "ru"];

// Construit le préfixe d’URL pour une langue
export function langBase(lang) {
  const base = IS_GHPAGES ? REPO : "/";
  return `${base}${lang}/`;
}
