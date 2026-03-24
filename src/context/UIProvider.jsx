// src/context/UIProvider.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { UIContext } from "./UIContext";
import { makeContentGuards } from "../guards/lexical";
import { getLangFromPathname, buildLangUrl, getDefaultLang, saveLang } from "../utils/pathManager";

//pour éviter de recharger la page si l’URL cible est déjà la même
function sameUrl(a, b) {
  const na = new URL(a, location.origin);
  const nb = new URL(b, location.origin);
  return na.pathname === nb.pathname && na.search === nb.search && na.hash === nb.hash;
}

export function UIProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const [requestedLang, setRequestedLang] = useState(() => {
    return (
      localStorage.getItem("lang") || getLangFromPathname(location.pathname) || getDefaultLang()
    );
  });

  const [hasContactDraft, setHasContactDraft] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark", isDark);
  }, [theme]);

  useEffect(() => {
    saveLang(requestedLang);
  }, [requestedLang]);

  const guards = useMemo(() => makeContentGuards({ lang: requestedLang }), [requestedLang]);

  const changeLanguage = useCallback((nextLang) => {
    setRequestedLang(nextLang);
    saveLang(nextLang);

    const target = buildLangUrl(nextLang);
    if (!sameUrl(location.href, target)) {
      location.replace(target);
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      requestedLang,
      setRequestedLang,
      changeLanguage,
      guards,
      hasContactDraft,
      setHasContactDraft,
    }),
    [theme, requestedLang, changeLanguage, guards, hasContactDraft],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
