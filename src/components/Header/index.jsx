import { forwardRef } from "react";
import { useUI } from "../../context";
import { useLocation, Link } from "react-router-dom";
import menuItems from "../../config/menuConfig";

import luna from "../../assets/images/luna.svg";
import solnyshko from "../../assets/images/solnyshko.svg";
import styles from "./Header.module.css";
import Menu from "../Menu";

/* === UI localisée pour les tooltips === */
import uiEN from "../../assets/traduction/header/ui.en.json";
import uiFR from "../../assets/traduction/header/ui.fr.json";
import uiRU from "../../assets/traduction/header/ui.ru.json";

const Header = forwardRef(function Header({ className = "", style }, ref) {
  const { theme, setTheme, language, setLanguage } = useUI();
  const location = useLocation();
  const currentPath = location.pathname;

  const logoText = language === "ru" ? "Анастасия Р. " : "Anastasia R.";
  const matched = menuItems.find((item) => item.path === currentPath);
  const bgColor = matched?.color || "#FFFFFF";

  // Pack UI localisé (fallback EN)
  const ui = { en: uiEN, fr: uiFR, ru: uiRU }[language] || uiEN;

  return (
    <header
      ref={ref}
      className={`${styles.header} ${className}`}
      style={{ backgroundColor: bgColor, ...style }}
    >
      <div className={styles.header_up}>
        {/* Gauche : logo */}
        <div className={styles.left}>
          <Link to="/" className={`${styles.logo} logo`}>
            {logoText}
          </Link>
        </div>

        {/* Droite : contrôles */}
        <div className={styles.right}>
          {/* Sélecteur de langue */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            title={ui.tooltips.lang} // tooltip natif
            aria-label={ui.tooltips.lang} // accessibilité
            className={`${styles.control} ${styles.langSelect}`}
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="ru">RU</option>
          </select>

          {/* Bouton thème */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title={ui.tooltips.theme}
            aria-label={ui.tooltips.theme}
            className={`${styles.control} ${styles.buttonControl} ${styles.themeButton}`}
            type="button"
          >
            <img
              src={theme === "light" ? luna : solnyshko}
              alt={theme === "light" ? "Moon icon" : "Sun icon"}
              className={styles.icon}
            />
          </button>
        </div>
      </div>

      {/* Centre : le slider de pétales */}
      <div className={styles.header_bottom}>
        <Menu />
      </div>
    </header>
  );
});

export default Header;
