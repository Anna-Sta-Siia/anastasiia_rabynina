// src/context/UIProvider.jsx
import { useState, useEffect, useMemo } from "react";
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

  // thème
  useEffect(() => {
    localStorage.setItem("theme", theme);
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark", isDark);
  }, [theme]);

  // langue (attribut <html lang>)
  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  // ✅ fabriquer les guards ici, à partir de la langue
  const guards = useMemo(() => makeContentGuards({ lang: language }), [language]);

  const changeLanguage = (nextLang) => {
    localStorage.setItem("language", nextLang);
    const base = IS_GHPAGES ? REPO : "/";
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rest = location.pathname.replace(new RegExp(`^${esc(base)}(?:fr|en|ru)/`), "/");
    const target = `${base}${nextLang}/${rest.slice(1)}${location.search}${location.hash}`;
    if (!sameUrl(location.href, target)) location.replace(target);
  };

  const value = useMemo(
    () => ({ theme, setTheme, language, setLanguage, changeLanguage, guards }),
    [theme, language, guards]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
