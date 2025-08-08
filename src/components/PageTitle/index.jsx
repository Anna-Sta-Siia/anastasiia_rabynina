import styles from './PageTitle.module.css';

export default function PageTitle({ text, color }) {
  return (
    <h1 className={styles.title} style={{ backgroundColor: color }}>
      {text}
    </h1>
  );
}
