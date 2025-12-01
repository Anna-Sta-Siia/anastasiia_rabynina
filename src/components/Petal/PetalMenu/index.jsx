// src/components/Petal/PetalMenu.jsx
import { Link } from "react-router-dom";
import { forwardRef } from "react";
import styles from "../Petal.module.css";

const Petal = forwardRef(function PetalComponent({ name, path, color, isActive, onClick }, ref) {
  const isExternal = path.startsWith("http");
  const style = { "--bg": color };

  const className = `${styles.petal}${isActive ? " " + styles.active : ""}`;

  if (isExternal) {
    // 🌐 Внешние ссылки — просто ссылка
    return (
      <a
        ref={ref}
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.petal}
        style={style}
      >
        {name}
      </a>
    );
  }

  // 🧭 Внутренние ссылки — навигация, НЕТ aria-pressed
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
