// src/components/Modal/index.jsx
import { useEffect, useRef, useId, useCallback } from "react";
import styles from "./Modal.module.css";

export default function Modal({ open, title, onClose, children, describedById }) {
  const closeRef = useRef(null);
  const titleId = useId();

  // Les hooks sont appelés tout le temps.
  useEffect(() => {
    if (!open) return; // ne fait rien si la modale est fermée

    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);

    const t = setTimeout(() => closeRef.current?.focus(), 0);

    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  // Petit piège Tab pour rester dans la modale
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
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} onKeyDown={trapTab}>
        <h3 id={titleId} className={styles.modalTitle}>
          {title}
        </h3>
        {children}
        <button className={styles.modalClose} onClick={onClose} ref={closeRef}>
          Close
        </button>
      </div>
    </div>
  );
}
