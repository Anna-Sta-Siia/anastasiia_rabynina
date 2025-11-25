// src/components/Petal/PetalMenu.jsx
import { Link } from "react-router-dom";
import { forwardRef } from "react";
import styles from "../Petal.module.css";

const Petal = forwardRef(function PetalComponent(
  { name, path, color, isActive, onClick }, // 👈 добавили onClick
  ref
) {
  const isExternal = path.startsWith("http");
  const style = { "--bg": color };

  const className = `${styles.petal}${isActive ? " " + styles.active : ""}`;

  if (isExternal) {
    // 🌐 Внешние ссылки — без confirmLeaveIfDraft, чтобы не было двойного диалога
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

  // 🧭 Внутренние ссылки — сюда придёт наш guard через onClick
  return (
    <Link
      ref={ref}
      to={path}
      className={className}
      style={style}
      aria-pressed={isActive}
      onClick={onClick} // 👈 тут ловим confirmLeaveIfDraft
    >
      {name}
    </Link>
  );
});

export default Petal;
