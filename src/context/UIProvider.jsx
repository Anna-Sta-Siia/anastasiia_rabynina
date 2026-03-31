// src/context/UIProvider.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { UIContext } from "./UIContext";
import { makeContentGuards } from "../guards/lexical";
import { getLangFromPathname, getDefaultLang, saveLang } from "../utils/pathManager";

export function UIProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const [askedLang, setAskedLang] = useState(() => {
    return getLangFromPathname(location.pathname) || getDefaultLang();
  });

  const [hasContactDraft, setHasContactDraft] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark", isDark);
  }, [theme]);

  useEffect(() => {
    saveLang(askedLang);
  }, [askedLang]);

  const guards = useMemo(() => makeContentGuards({ lang: askedLang }), [askedLang]);

  const changeLanguage = useCallback((nextLang) => {
    setAskedLang(nextLang);
    saveLang(nextLang);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      askedLang,
      setAskedLang,
      changeLanguage,
      guards,
      hasContactDraft,
      setHasContactDraft,
    }),
    [theme, askedLang, changeLanguage, guards, hasContactDraft],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
