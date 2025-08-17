import { Link } from "react-router-dom";
import { useUI } from "../../context";
import styles from "./NotFound.module.css";

// localized labels (fallback EN)
import uiEN from "../../assets/traduction/error/ui.en.json";
import uiFR from "../../assets/traduction/error/ui.fr.json";
import uiRU from "../../assets/traduction/error/ui.ru.json";

// decorative icon
import brokenEgg from "../../assets/images/brokenegg.svg";

export default function NotFound() {
  const { language } = useUI();
  const ui = { en: uiEN, fr: uiFR, ru: uiRU }[language] || uiEN;

  return (
    <section className={styles.notfound} aria-labelledby="nf-code">
      {/* Decorative visual */}
      <img
        src={brokenEgg}
        alt="" // decorative: no duplication for screen readers
        aria-hidden="true"
        className={styles.egg}
      />

      {/* Error code */}
      <h1 id="nf-code" className={styles.code}>
        {ui.title}
      </h1>

      {/* Message + action */}
      <p className={`${styles.pill} ${styles.text}`} aria-label="Error message">
        {ui.message}
      </p>
      <Link to="/" className={`${styles.pill} ${styles.homeLink}`}>
        {ui.home}
      </Link>
    </section>
  );
}
