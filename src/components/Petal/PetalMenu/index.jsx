// src/components/Petal/PetalMenu.jsx
import { Link } from "react-router-dom";
import { forwardRef } from "react";
import styles from "../Petal.module.css";
import { useUI } from "../../../context/useUI";
import { addLanguage } from "../../../utils/pathManager";
const Petal = forwardRef(function PetalComponent(
  { name, path, color, isActive, disabled, onClick },
  ref
) {
  //forwardRef
  const { language } = useUI(); // "fr" | "en" | "ru"
  const isExternal = path.startsWith("http");
  const style = { "--bg": color };

  const className = `${styles.petal}${isActive ? " " + styles.active : ""}`;
  if (disabled) {
    return (
      <span
        ref={ref}
        className={styles.petal}
        style={style}
        aria-disabled="true"
        tabIndex={-1}
        title="Lien temporairement indisponible"
      >
        {name}
      </span>
    );
  }
  if (isExternal) {
    return (
      <a
        ref={ref}
        href={path}
        target="_blank"
        rel="noopener noreferrer" //empêche le site ouvert dans un nouvel onglet d’avoir un accès ou des informations sur ta page
        className={styles.petal}
        style={style}
      >
        {name}
      </a>
    );
  }

  // Нормализуем внутренний путь
  // "/" -> "/fr/"
  // "/projects" -> "/fr/projects"
  const to = addLanguage(language, path);

  return (
    <Link
      ref={ref}
      to={to}
      className={className}
      style={style}
      aria-current={isActive ? "page" : undefined} // ca veut dire :"Ce lien correspond à la page actuelle"
      onClick={onClick}
    >
      {name}
    </Link>
  );
});

export default Petal;
