export const LANGS = ["fr", "en", "ru"];
export const DEFAULT_LANG = "fr";
export const LANGUAGE_STORAGE_KEY = "language";

export const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const LANG_GROUP = LANGS.join("|");

// uniquement la langue, sans BASE_URL
const LANG_ONLY_PREFIX_RE = new RegExp(`^\\/(?:${LANG_GROUP})(?=\\/|$)`);

// uniquement la base
const BASE_PREFIX_RE = BASE_URL ? new RegExp(`^${esc(BASE_URL)}(?=\\/|$)`) : null;

export const normalizePath = (s) => {
  if (s == null) return "/";
  const str = String(s).trim();
  if (str === "" || str === "/") return "/";
  return str.startsWith("/") ? str : `/${str}`;
};

export const isSupportedLang = (lang) => LANGS.includes(lang);

export const getSavedLang = () => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLang(saved) ? saved : null;
};

export const getDefaultLang = () => getSavedLang() || DEFAULT_LANG;

export const addLanguage = (language, path = "/") => {
  const p = normalizePath(path);
  const out = `${BASE_URL}/${language}${p}`;
  return out.replace(/\/{2,}/g, "/");
};

export const removeBaseUrl = (pathname = location.pathname) => {
  const p = normalizePath(pathname);
  if (!BASE_PREFIX_RE) return p;

  const stripped = p.replace(BASE_PREFIX_RE, "");
  return stripped === "" ? "/" : stripped.startsWith("/") ? stripped : `/${stripped}`;
};

export const removeLanguage = (pathname = location.pathname) => {
  const withoutBase = removeBaseUrl(pathname);
  const stripped = withoutBase.replace(LANG_ONLY_PREFIX_RE, "");
  return stripped === "" ? "/" : stripped.startsWith("/") ? stripped : `/${stripped}`;
};

export const getLangFromPathname = (pathname = location.pathname) => {
  const withoutBase = removeBaseUrl(pathname);
  const match = withoutBase.match(new RegExp(`^\\/(${LANG_GROUP})(?=\\/|$)`));
  return match ? match[1] : null;
};

export const buildLangUrl = (
  nextLang,
  { pathname = location.pathname, search = location.search, hash = location.hash } = {},
) => {
  const logical = removeLanguage(pathname);
  const targetPath = addLanguage(nextLang, logical);
  return `${targetPath}${search}${hash}`;
};

export const buildInternalLangPath = (nextLang, path = "/") => {
  const logical = normalizePath(path);
  const out = `/${nextLang}${logical}`;
  return out.replace(/\/{2,}/g, "/");
};

export const saveLang = (lang) => {
  if (LANGS.includes(lang)) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }
};
