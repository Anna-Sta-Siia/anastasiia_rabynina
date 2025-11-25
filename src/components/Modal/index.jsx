// src/components/Modal/index.jsx
import { useEffect, useRef, useId, useCallback } from "react";
import styles from "./Modal.module.css";

export default function Modal({
  open,
  title,
  onClose,
  children,
  describedById,
  initialFocus = "close",
  initialFocusRef = null,
  closeLabel = "Close",
  showCloseButton = true,
}) {
  const closeRef = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => e.key === "Escape" && onCloseRef.current?.();
    window.addEventListener("keydown", onKey);

    const t = setTimeout(() => {
      if (initialFocus === "element" && initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (initialFocus === "close") {
        closeRef.current?.focus();
      }
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, initialFocus, initialFocusRef]);

  const trapTab = useCallback((e) => {
    if (e.key !== "Tab") return;
    const root = e.currentTarget;
    const f = root.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={describedById}
      onClick={() => onCloseRef.current?.()}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} onKeyDown={trapTab}>
        <h3 id={titleId} className={styles.modalTitle}>
          {title}
        </h3>

        {children}
        {showCloseButton && (
          <button
            className={styles.modalClose}
            onClick={() => onCloseRef.current?.()}
            ref={closeRef}
            type="button"
          >
            {closeLabel}
          </button>
        )}
      </div>
    </div>
  );
}
