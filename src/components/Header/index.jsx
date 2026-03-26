import { forwardRef } from "react";
import { useUI } from "../../context";
import { useLocation, Link } from "react-router-dom";
import { menuItems } from "../../config/menuConfig";
import { removeLanguage, buildInternalLangPath } from "../../utils/pathManager";
import { useDisplayLang } from "../../hooks/useDisplayLang";

import luna from "../../assets/images/luna.svg";
import solnyshko from "../../assets/images/solnyshko.svg";
import styles from "./Header.module.css";
import Menu from "../Menu";
import LangPicker from "../LangPicker";

import uiEN from "../../assets/traduction/header/ui.en.json";
import uiFR from "../../assets/traduction/header/ui.fr.json";
import uiRU from "../../assets/traduction/header/ui.ru.json";

const Header = forwardRef(function Header({ className = "", style }, ref) {
  const { theme, setTheme } = useUI();
  const location = useLocation();
  const displayLang = useDisplayLang();

  const currentPath = removeLanguage(location.pathname);

  const logoText = displayLang === "ru" ? "Анастасия Р." : "Anastasia R.";

  const matched = menuItems.find((item) => item.path === currentPath);
  const bgColor = matched?.color || "#FFFFFF";

  const ui = { en: uiEN, fr: uiFR, ru: uiRU }[displayLang] || uiEN;

  return (
    <header
      ref={ref}
      className={`${styles.header} ${className}`}
      style={{ backgroundColor: bgColor, ...style }}
    >
      <div className={styles.header_up}>
        <div className={styles.left}>
          <Link to={buildInternalLangPath(displayLang, "/")} className={`${styles.logo} logo`}>
            {logoText}
          </Link>
        </div>

        <div className={styles.right}>
          <LangPicker />

          <button
            type="button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title={ui.tooltips?.theme || "Toggle theme"}
            aria-label={ui.tooltips?.theme || "Toggle theme"}
            className={`${styles.control} ${styles.buttonControl} ${styles.themeButton}`}
          >
            <img
              src={theme === "light" ? luna : solnyshko}
              alt={theme === "light" ? "Moon icon" : "Sun icon"}
              className={styles.icon}
            />
          </button>
        </div>
      </div>

      <div className={styles.header_bottom}>
        <Menu />
      </div>
    </header>
  );
});

export default Header;
