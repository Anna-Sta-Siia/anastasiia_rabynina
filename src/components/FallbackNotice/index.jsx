import styles from "./FallbackNotice.module.css";

export default function FallbackNotice({ title, text, children }) {
  return (
    <div className={styles.notice} role="status" aria-live="polite">
      <strong>{title}</strong>
      <p>{text}</p>
      {children && <p className={styles.hint}>{children}</p>}
    </div>
  );
}
