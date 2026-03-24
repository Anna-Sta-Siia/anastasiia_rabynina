// src/components/Petal/PetalMenu.jsx
import { Link } from "react-router-dom";
import { forwardRef } from "react";
import styles from "../Petal.module.css";
import { useDisplayLang } from "../../../hooks/useDisplayLang";

import generalEn from "../../../assets/traduction/general/general.en.json";
import generalFr from "../../../assets/traduction/general/general.fr.json";
import generalRu from "../../../assets/traduction/general/general.ru.json";

const GENERAL_DICTS = { fr: generalFr, en: generalEn, ru: generalRu };

const Petal = forwardRef(function PetalComponent(
  { name, path, color, isActive, disabled, onClick },
  ref,
) {
  const displayLang = useDisplayLang();
  const general = GENERAL_DICTS[displayLang] || GENERAL_DICTS.fr;

  const isExternal = typeof path === "string" && path.startsWith("http");
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
        title={general.disabledTitle}
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
        rel="noopener noreferrer"
        className={className}
        style={style}
      >
        {name}
      </a>
    );
  }

  return (
    <Link
      ref={ref}
      to={path}
      className={className}
      style={style}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
    >
      {name}
    </Link>
  );
});

export default Petal;
