// src/context/UIProvider.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { UIContext } from "./UIContext";
import { makeContentGuards } from "../guards";
import { IS_GHPAGES, REPO } from "../utils/env.js";

function sameUrl(a, b) {
  const na = new URL(a, location.origin);
  const nb = new URL(b, location.origin);
  return na.pathname === nb.pathname && na.search === nb.search && na.hash === nb.hash;
}

function getInitialLang() {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (IS_GHPAGES) {
    const m = location.pathname.match(new RegExp(`^${esc(REPO)}(fr|en|ru)/`));
    if (m) return m[1];
  } else {
    const m = location.pathname.match(/^\/(fr|en|ru)\//);
    if (m) return m[1];
  }
  return localStorage.getItem("language") || "fr";
}

export function UIProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(getInitialLang);

  // ← наш новый флаг: есть незавершённый контакт-форм или нет
  const [hasContactDraft, setHasContactDraft] = useState(false);

  /* ========== THÈME ========== */
  useEffect(() => {
    localStorage.setItem("theme", theme);
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark", isDark);
  }, [theme]);

  /* ========== LANGUE (html[lang]) ========== */
  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  /* ========== GUARDS dépendants de la langue ========== */
  const guards = useMemo(() => makeContentGuards({ lang: language }), [language]);

  /* ========== CHANGE LANGUAGE (stable) ========== */
  const changeLanguage = useCallback((nextLang) => {
    localStorage.setItem("language", nextLang);

    const base = IS_GHPAGES ? REPO : "/";
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rest = location.pathname.replace(new RegExp(`^${esc(base)}(?:fr|en|ru)/`), "/");
    const target = `${base}${nextLang}/${rest.slice(1)}${location.search}${location.hash}`;

    if (!sameUrl(location.href, target)) {
      location.replace(target);
    }
  }, []);

  /* ========== VALUE du contexte ========== */
  const value = useMemo(
    () => ({
      theme,
      setTheme,
      language,
      setLanguage,
      changeLanguage,
      guards,
      hasContactDraft,
      setHasContactDraft,
    }),
    [theme, language, changeLanguage, guards, hasContactDraft]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
