// src/components/SubjectSelect/index.jsx
import { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import styles from "./SubjectSelect.module.css";

export default function SubjectSelect({
  name = "subject",
  t,
  options = [],
  autoFocus = false,
  onChangeValue,
}) {
  const { watch, setValue, register } = useFormContext();
  const current = watch(name);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // 🔹 текущий «активный» пункт
  const wrapRef = useRef(null);
  const triggerRef = useRef(null); // 👈 ref на кнопку-триггер

  const { ref, ...field } = register(name, {
    required: t?.errors?.subjectRequired || "Le sujet est obligatoire",
  });

  const currentLabel =
    options.find((o) => o.value === current)?.label || t.subjectPlaceholder || "Choisir…";

  const toggleOpen = () => {
    setOpen((v) => {
      const next = !v;
      if (next) {
        const idx = options.findIndex((opt) => opt.value === current);
        setActiveIndex(idx >= 0 ? idx : 0);
      }
      return next;
    });
  };

  const selectOption = (val) => {
    setValue(name, val, { shouldDirty: true, shouldValidate: true });
    setOpen(false);
    setActiveIndex(-1);
    onChangeValue?.(val);
  };
  const handleTriggerKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // чтобы не стрелял submit формы
      setOpen((v) => !v); // открыть/закрыть меню
    }
    if (open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setActiveIndex((prev) => {
        const max = options.length - 1;
        if (e.key === "ArrowDown") return prev >= max ? 0 : prev + 1;
        if (e.key === "ArrowUp") return prev <= 0 ? max : prev - 1;
        return prev;
      });
    }

    if (open && e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) selectOption(options[activeIndex].value);
    }

    if (open && e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
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
  // автофокус на триггер при появлении шага
  useEffect(() => {
    if (autoFocus && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [autoFocus]);
  return (
    <div className={styles.wrap} ref={wrapRef} data-open={open ? "true" : "false"}>
      {/* Скрытый input для RHF */}
      <input type="hidden" {...field} ref={ref} value={current || ""} />

      {/* Красивая «пилюля» вместо <select> */}
      <button
        type="button"
        ref={triggerRef}
        className={styles.button}
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        id={name}
        aria-controls={`${name}-list`}
        aria-activedescendant={open && activeIndex >= 0 ? `${name}-opt-${activeIndex}` : undefined}
      >
        <span className={styles.buttonLabel}>{currentLabel}</span>
        <span className={styles.buttonIcon} aria-hidden="true">
          ▾
        </span>
      </button>

      {/* Выпадающий список */}
      {open && (
        <ul
          className={styles.menu}
          role="listbox"
          aria-label={t.subjectLabel || "Sujet"}
          id={`${name}-list`}
        >
          {options.map((opt, idx) => {
            const selected = current === opt.value;
            const active = idx === activeIndex;
            return (
              <li key={opt.value} role="option" aria-selected={selected} id={`${name}-opt-${idx}`}>
                <button
                  type="button"
                  className={`
                   ${styles.option}
                   ${selected ? styles.optionSelected : ""}
                   ${active ? styles.optionActive : ""}                 `}
                  onClick={() => selectOption(opt.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectOption(opt.value);
                    }
                  }}
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
