// UIProvider.jsx
import { useState, useEffect } from "react";
import { UIContext } from "./UIContext";

// Déduit la langue initiale: URL > flag HTML > localStorage > 'en'
function getInitialLang() {
  const m = location.pathname.match(/^\/(fr|en|ru)(?:\/|$)/);
  if (m) return m[1];
  if (window.INIT_LANG) return window.INIT_LANG; // défini dans fr.html/en.html/ru.html
  return localStorage.getItem("language") || "en";
}

export function UIProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(getInitialLang);

  // Thème
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.dataset.theme = theme; // évite d’écraser d’autres classes
  }, [theme]);

  // Langue
  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.setAttribute("lang", language);
    // Décommente si un jour tu as des langues RTL :
    // document.documentElement.setAttribute('dir', ['ar','he','fa','ur'].includes(language) ? 'rtl' : 'ltr');
  }, [language]);

  const value = { theme, setTheme, language, setLanguage };
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
