import { useState, useEffect, useMemo } from "react";
import { UIContext } from "./UIContext";
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

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const changeLanguage = (nextLang) => {
    setLanguage(nextLang);
    localStorage.setItem("language", nextLang);

    const base = IS_GHPAGES ? REPO : "/"; // ✅ utilisé
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // garde ce qui suit /<lang>/
    const rest = location.pathname.replace(new RegExp(`^${esc(base)}(?:fr|en|ru)/`), "/");

    const target = `${base}${nextLang}/${rest.slice(1)}${location.search}${location.hash}`;

    if (!sameUrl(location.href, target)) {
      location.replace(target);
    }
  };
  const value = useMemo(
    () => ({ theme, setTheme, language, setLanguage, changeLanguage }),
    [theme, language]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
