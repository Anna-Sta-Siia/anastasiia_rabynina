// src/components/SubjectSelect/index.jsx
import { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import styles from "./SubjectSelect.module.css";

export default function SubjectSelect({ name = "subject", t, options = [] }) {
  const { watch, setValue, register } = useFormContext();
  const current = watch(name);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const { ref, ...field } = register(name, {
    required: true,
  });

  const currentLabel =
    options.find((o) => o.value === current)?.label || t.subjectPlaceholder || "Choisir…";

  const toggleOpen = () => setOpen((v) => !v);

  const selectOption = (val) => {
    setValue(name, val, { shouldDirty: true, shouldValidate: true });
    setOpen(false);
  };

  // 🔹 Закрыть при клике вне и по Escape
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target)) {
        setOpen(false); // просто закрываем, значение НЕ трогаем
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={wrapRef} data-open={open ? "true" : "false"}>
      {/* Скрытый input для RHF */}
      <input type="hidden" {...field} ref={ref} value={current || ""} />

      {/* Красивая «пилюля» вместо <select> */}
      <button
        type="button"
        className={styles.button}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        id={name}
      >
        <span className={styles.buttonLabel}>{currentLabel}</span>
        <span className={styles.buttonIcon} aria-hidden="true">
          ▾
        </span>
      </button>

      {/* Выпадающий список */}
      {open && (
        <ul className={styles.menu} role="listbox" aria-label={t.subjectLabel || "Sujet"}>
          {options.map((opt) => {
            const selected = current === opt.value;
            return (
              <li key={opt.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`${styles.option} ${selected ? styles.optionSelected : ""}`}
                  onClick={() => selectOption(opt.value)}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
