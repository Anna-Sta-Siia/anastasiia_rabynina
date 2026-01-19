// src/utils/pathManager.js

export const LANGS = ["fr", "en", "ru"];
export const DEFAULT_LANG = "fr";
export const LANGUAGE_STORAGE_KEY = "language";

// "/" en dev, "/anastasiia_rabynina" en prod
export const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

// pour transformer la BASE_URL dans une version lisible par regex
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// La langue est soit fr, soit en, soit ru
const LANG_GROUP = LANGS.join("|");

// pour trouver et retirer la langue
const LANG_CAPTURE_RE = new RegExp(`^${esc(BASE_URL)}\\/(${LANG_GROUP})(?=\\/|$)`);
const LANG_PREFIX_RE = new RegExp(`^${esc(BASE_URL)}\\/(?:${LANG_GROUP})(?=\\/|$)`);

export const normalizePath = (s) => {
  if (s == null) return "/";
  const str = String(s).trim();
  if (str === "" || str === "/") return "/";
  return str.startsWith("/") ? str : `/${str}`;
};

// ✅ utilitaire: valider une langue
export const isSupportedLang = (lang) => LANGS.includes(lang);

// ✅ lire la langue sauvegardée (ou null)
export const getSavedLang = () => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLang(saved) ? saved : null;
};

// ✅ la “langue par défaut” de ton app (saved -> fallback)
export const getDefaultLang = () => getSavedLang() || DEFAULT_LANG;

export const addLanguage = (language, path = "/") => {
  const p = normalizePath(path);
  const lp = p === "/" ? "/" : p; // garde "/" pour home
  const out = `${BASE_URL}/${language}${lp}`;
  return out.replace(/\/{2,}/g, "/");
};

export const removeLanguage = (pathname = location.pathname) => {
  const p = normalizePath(pathname);
  const stripped = p.replace(LANG_PREFIX_RE, "");
  return stripped === "" ? "/" : stripped.startsWith("/") ? stripped : `/${stripped}`;
};

// lire la langue actuelle depuis l'URL
export const getLangFromPathname = (pathname = location.pathname) => {
  const p = normalizePath(pathname);
  const m = p.match(LANG_CAPTURE_RE);
  return m ? m[1] : null;
};

// changer de langue (URL complète)
export const buildLangUrl = (
  nextLang,
  { pathname = location.pathname, search = location.search, hash = location.hash } = {}
) => {
  const logical = removeLanguage(pathname);
  const targetPath = addLanguage(nextLang, logical);
  return `${targetPath}${search}${hash}`;
};
