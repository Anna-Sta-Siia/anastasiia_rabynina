import { createContext, useState, useEffect, useContext } from 'react';

// 1. Crée le contexte
const UIContext = createContext();

// 2. Provider qui enveloppe toute lʼapp
export function UIProvider({ children }) {
  // Tu peux pré‑remplir depuis le localStorage si tu veux persister
  const [theme,    setTheme]    = useState(() => localStorage.getItem('theme')    || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

  // Sauvegarde automatique à chaque changement
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme;        // applique la classe .light/.dark
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Les valeurs et setters quʼon expose au reste de lʼapp
  const value = {
    theme,
    setTheme,
    language,
    setLanguage
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// 3. Hook pour lʼutiliser
export function useUI() {
  return useContext(UIContext);
}
