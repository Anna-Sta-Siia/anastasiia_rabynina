// src/components/Tooltip/index.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./Tooltip.module.css";

export default function Tooltip({
  id,
  content,
  children,
  lines = 5, // nb de lignes clampées visuellement
  onMore,
  onEdit,
  options,
  currentOption,
  lang,
  wide = false,
}) {
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const tipRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // petit util
  const isNode = (x) => !!x && typeof x === "object" && "nodeType" in x;
  const classes = (...xs) => xs.filter(Boolean).join(" ");

  // ---------- Ouverture/Fermeture ----------
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
  const hasAnyOptions = Array.isArray(options) && options.length > 0;

  const measureOverflow = () => {
    if (!isClamped || !textRef.current) {
      setIsOverflowing(false);
      return;
    }
    const el = textRef.current;
    // marge -1px anti-glitch
    setIsOverflowing(el.scrollHeight - 1 > el.clientHeight);
  };

  useLayoutEffect(() => {
    measureOverflow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, lines, open]);

  useEffect(() => {
    const ro = new ResizeObserver(measureOverflow);
    textRef.current && ro.observe(textRef.current);
    tipRef.current && ro.observe(tipRef.current);
    const onWin = () => measureOverflow();
    window.addEventListener("resize", onWin);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Options / actions ----------
  const showPrimaryActions = open && isOverflowing && (onMore || onEdit);
  const showOptionsList = hasAnyOptions;

  const selectOption = (opt) => {
    opt?.onSelect?.(opt.value);
    setMenuOpen(false);
    setOpen(false);
  };

  return (
    <span
      ref={wrapRef}
      className={styles.tipWrap}
      data-wide={wide ? "true" : "false"}
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
        data-overflow={isOverflowing ? "true" : "false"}
        data-has-options={hasAnyOptions ? "true" : "false"}
        aria-hidden={!open}
        inert={open ? undefined : true}
      >
        <span ref={textRef} className={styles.tipText}>
          {content}
        </span>
        {open && (showPrimaryActions || showOptionsList) && (
          <div className={styles.tipActions} role="group" aria-label="Actions">
            {showPrimaryActions && (
              <div className={styles.tipPrimary}>
                {onMore && (
                  <button type="button" className={styles.tipBtn} onClick={onMore}>
                    Voir plus
                  </button>
                )}
                {onEdit && (
                  <button type="button" className={styles.tipBtn} onClick={onEdit}>
                    Éditer
                  </button>
                )}
              </div>
            )}

            {showOptionsList && (
              <div className={styles.tipDropdown}>
                <button
                  type="button"
                  className={styles.tipToggle}
                  aria-haspopup="listbox"
                  aria-expanded={menuOpen ? "true" : "false"}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {menuOpen ? "Fermer" : "Choisir…"}
                </button>

                {menuOpen && (
                  <ul className={styles.tipMenu} role="listbox" aria-label="Presets de sujet">
                    {options.map((opt) => {
                      const selected = currentOption === opt.value;
                      return (
                        <li key={opt.value} role="option" aria-selected={selected}>
                          <button
                            type="button"
                            className={classes(
                              styles.tipOption,
                              selected && styles.tipOptionSelected
                            )}
                            onClick={() => selectOption(opt)}
                          >
                            {opt.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </span>
    </span>
  );
}
