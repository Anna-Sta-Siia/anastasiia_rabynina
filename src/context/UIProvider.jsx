// src/context/UIProvider.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { UIContext } from "./UIContext";
import { makeContentGuards } from "../guards";
import {
  getLangFromPathname,
  LANGUAGE_STORAGE_KEY,
  buildLangUrl,
  getDefaultLang,
} from "../utils/pathManager";

//pour éviter de recharger la page si l’URL cible est déjà la même
function sameUrl(a, b) {
  const na = new URL(a, location.origin);
  const nb = new URL(b, location.origin);
  return na.pathname === nb.pathname && na.search === nb.search && na.hash === nb.hash;
}

function getInitialLang() {
  return getLangFromPathname(location.pathname) || getDefaultLang();
}

export function UIProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(getInitialLang);

  const [hasContactDraft, setHasContactDraft] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark", isDark);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const guards = useMemo(() => makeContentGuards({ lang: language }), [language]);

  const changeLanguage = useCallback((nextLang) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);

    const target = buildLangUrl(nextLang);
    if (!sameUrl(location.href, target)) {
      location.replace(target);
    }
  }, []);

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
