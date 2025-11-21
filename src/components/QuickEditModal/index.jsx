// src/components/QuickEditModal.jsx
import { useEffect, useRef, useState } from "react";
import Modal from "../Modal";
import styles from "../ContactForm/ContactForm.module.css";

/**
 * Быстрая правка коротких полей (input).
 * props:
 *  - open, onClose
 *  - label: "Prénom"
 *  - value: текущее значение
 *  - type: "text" | "email" (по умолч. text)
 *  - onSave(nextValue: string)
 *  - placeholder? (опционально)
 *  - t: словарь переводов (contact.xx.json)
 */
export default function QuickEditModal({
  open,
  onClose,
  label,
  value = "",
  type = "text",
  onSave,
  placeholder = "",
  t, // 👈 добавили
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setDraft(value || "");
  }, [open, value]);

  useEffect(() => {
    if (!open || !inputRef.current) return;
    const el = inputRef.current;
    el.focus();
    const end = el.value.length;
    requestAnimationFrame(() => el.setSelectionRange(end, end));
  }, [open]);

  const handleSave = () => {
    const v = draft.trim();
    onSave?.(v);
    onClose?.();
  };

  // небольшие страховки, если вдруг t не передали
  const closeLabel = t?.close || "Close";
  const cancelLabel = t?.confirmCancel || "Cancel";
  const saveLabel = t?.save || "Save";

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeLabel={closeLabel}
      initialFocus="element"
      initialFocusRef={inputRef}
      title={label}
    >
      <div className={styles.modalEditor}>
        <label htmlFor="quick-edit-input" className={styles.srOnly}>
          {label}
        </label>
        <input
          id="quick-edit-input"
          ref={inputRef}
          className={styles.editorText}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder || label}
        />
        <div className={styles.modalBar}>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btn} onClick={onClose}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSave}
              disabled={!draft.trim()}
            >
              {saveLabel}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
