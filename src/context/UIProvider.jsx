import { useState, useEffect } from "react";
import { UIContext } from "./UIContext";
export function UIProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.className = theme;
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);
  const value = { theme, setTheme, language, setLanguage };
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
