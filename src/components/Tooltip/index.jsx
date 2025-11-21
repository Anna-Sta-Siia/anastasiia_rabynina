// src/components/Tooltip/index.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./Tooltip.module.css";

export default function Tooltip({
  id,
  content,
  children,
  lines = 4,
  onMore,
  onEdit,
  options,
  currentOption,
  lang,
  wide = false,
  variant,
  labelMore,
  labelEdit,
  labelChoose,
}) {
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const tipRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // petits utils
  const isNode = (x) => !!x && typeof x === "object" && "nodeType" in x;
  const classes = (...xs) => xs.filter(Boolean).join(" ");

  // ---------- Ouverture / Fermeture ----------
  const onEnter = () => setOpen(true);

  const stillInside = (t) => !!wrapRef.current && isNode(t) && wrapRef.current.contains(t);

  const onLeave = (e) => {
    const next = e?.relatedTarget;
    if (stillInside(next)) return;
    setTimeout(() => {
      const a = document.activeElement;
      if (stillInside(a)) return;
      setOpen(false);
      setMenuOpen(false);
    }, 0);
  };

  const onFocus = () => setOpen(true);

  const onBlur = (e) => {
    if (!stillInside(e?.relatedTarget)) {
      setOpen(false);
      setMenuOpen(false);
    }
  };

  // ---------- Mesure overflow (clamp visuel) ----------
  const isClamped = !!lines && lines > 0;
  const hasOptions = Array.isArray(options) && options.length > 0;

  const measureOverflow = () => {
    if (!isClamped || !textRef.current) {
      setIsOverflowing(false);
      return;
    }
    const el = textRef.current;
    setIsOverflowing(el.scrollHeight - 1 > el.clientHeight);
  };

  useLayoutEffect(() => {
    measureOverflow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, lines, open]);

  useEffect(() => {
    const ro = new ResizeObserver(measureOverflow);
    if (textRef.current) ro.observe(textRef.current);
    if (tipRef.current) ro.observe(tipRef.current);

    const onWin = () => measureOverflow();
    window.addEventListener("resize", onWin);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Actions ----------
  const showEdit = !!onEdit; // Nom/Prénom/Email/Company + Sujet custom
  const showMore = !!onMore && isOverflowing; // seulement si overflow ET callback fourni
  const showOptionsList = hasOptions; // Sujet

  // когда меню открыто и есть options → показываем ТОЛЬКО список
  const showDropdownOnly = menuOpen && hasOptions;

  const selectOption = (opt) => {
    opt?.onSelect?.(opt.value);
    setMenuOpen(false);
    setOpen(false);
  };

  // 👇 fallback'ы на случай, если label не передали
  const moreLabel = labelMore || "Voir plus";
  const editLabel = labelEdit || "Éditer";
  const chooseLabel = labelChoose || "Choisir…";

  return (
    <span
      ref={wrapRef}
      className={styles.tipWrap}
      data-wide={wide ? "true" : "false"}
      data-variant={variant || ""}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}

      <span
        id={id}
        ref={tipRef}
        role="tooltip"
        lang={lang}
        className={classes(styles.tip, isClamped && styles.isClamped)}
        data-open={open ? "true" : "false"}
        data-clamped={isClamped ? "true" : "false"}
        data-lines={String(lines)}
        data-overflow={isOverflowing ? "true" : "false"}
        data-has-options={hasOptions ? "true" : "false"}
        data-menu={menuOpen ? "true" : "false"}
        aria-hidden={!open}
        inert={open ? undefined : true}
      >
        {/* Текст содержимого — не показываем, если меню открыто */}
        {!(menuOpen && hasOptions) && (
          <span ref={textRef} className={styles.tipText}>
            {content}
          </span>
        )}

        {/* Zone actions */}
        {open && (
          <div className={styles.tipActions} role="group" aria-label="Actions">
            {/* 1. Если меню открыто → ТОЛЬКО список опций */}
            {showDropdownOnly && (
              <ul className={styles.tipMenu} role="listbox" aria-label="Presets de sujet">
                {options.map((opt) => {
                  const selected = currentOption === opt.value;
                  return (
                    <li key={opt.value} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        className={classes(styles.tipOption, selected && styles.tipOptionSelected)}
                        onClick={() => selectOption(opt)}
                      >
                        {opt.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* 2. Если меню ЗАКРЫТО */}
            {!showDropdownOnly && (
              <>
                {/* EDIT + MORE — только если ты их передала (для custom) */}
                {(showEdit || showMore) && (
                  <div className={styles.tipPrimary}>
                    {showEdit && (
                      <button type="button" className={styles.tipBtn} onClick={onEdit}>
                        {editLabel}
                      </button>
                    )}

                    {showMore && (
                      <button type="button" className={styles.tipBtn} onClick={onMore}>
                        {moreLabel}
                      </button>
                    )}
                  </div>
                )}

                {/* Кнопка открытия списка опций */}
                {showOptionsList && (
                  <button
                    type="button"
                    className={styles.tipToggle}
                    aria-haspopup="listbox"
                    aria-expanded={menuOpen ? "true" : "false"}
                    onClick={() => setMenuOpen((v) => !v)}
                  >
                    {chooseLabel}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </span>
    </span>
  );
}
