import { useEffect, useRef, useState } from "react";
import { useUI } from "../../context";
import styles from "./LangPicker.module.css";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ru", label: "RU" },
];

const T = {
  en: { change: "Change language" },
  fr: { change: "Changer la langue" },
  ru: { change: "Сменить язык" },
};

export default function LangPicker() {
  const { language, setLanguage, changeLanguage } = useUI();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  const i18n = T[language] || T.en;
  const currentIndex = Math.max(
    0,
    LANGS.findIndex((l) => l.code === language)
  );

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDocClick);
    return () => document.removeEventListener("pointerdown", onDocClick);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.querySelector(`[data-idx="${currentIndex}"]`)?.focus();
    }
  }, [open, currentIndex]);

  return (
    <div className={styles.langRoot} ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.ctrl} ${styles.btn}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={i18n.change}
        onClick={() => setOpen((o) => !o)}
      >
        {LANGS[currentIndex]?.label ?? language.toUpperCase()}
        <span className={styles.caret} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className={styles.menu}
          aria-label={i18n.change}
          onKeyDown={(e) => {
            if (!open) return;
            const items = Array.from(listRef.current.querySelectorAll("[role=option]"));
            const idx = items.findIndex((n) => n === document.activeElement);
            if (e.key === "Escape") {
              setOpen(false);
              btnRef.current?.focus();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              (items[Math.min(items.length - 1, idx + 1)] || items[0]).focus();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              (items[Math.max(0, idx - 1)] || items[items.length - 1]).focus();
            } else if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.activeElement?.click();
            }
          }}
        >
          {LANGS.map((l, i) => (
            <li
              key={l.code}
              role="option"
              tabIndex={0}
              data-idx={i}
              aria-selected={l.code === language}
              className={`${styles.item} ${l.code === language ? styles.active : ""}`}
              onClick={() => {
                setLanguage(l.code);
                setOpen(false);
                requestAnimationFrame(() => changeLanguage(l.code));
              }}
            >
              {l.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
