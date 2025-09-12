// src/components/Modal/index.jsx
import { useEffect, useRef, useId, useCallback } from "react";
import styles from "./Modal.module.css";

export default function Modal({
  open,
  title,
  onClose,
  children,
  describedById,
  initialFocus = "close", // "close" | "element" | "none"
  initialFocusRef = null, // ref d'un élément à focus
}) {
  const closeRef = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);

  // garder la dernière version d'onClose sans relancer l'effet
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => e.key === "Escape" && onCloseRef.current?.();
    window.addEventListener("keydown", onKey);

    // ➜ focus initial, une seule fois à l’ouverture
    const t = setTimeout(() => {
      if (initialFocus === "element" && initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (initialFocus === "close") {
        closeRef.current?.focus();
      }
      // "none" -> on ne force rien
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, initialFocus, initialFocusRef]);

  // Piège Tab pour rester dans la modale
  const trapTab = useCallback((e) => {
    if (e.key !== "Tab") return;
    const root = e.currentTarget;
    const f = root.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!f.length) return;
    const first = f[0],
      last = f[f.length - 1];
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
        <button className={styles.modalClose} onClick={() => onCloseRef.current?.()} ref={closeRef}>
          Close
        </button>
      </div>
    </div>
  );
}
