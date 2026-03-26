import { Link } from "react-router-dom";
import { useDisplayLang } from "../../hooks/useDisplayLang";
import styles from "./NotFound.module.css";

import uiEN from "../../assets/traduction/error/ui.en.json";
import uiFR from "../../assets/traduction/error/ui.fr.json";
import uiRU from "../../assets/traduction/error/ui.ru.json";

import brokenEgg from "../../assets/images/brokenegg.svg";

export default function NotFound() {
  const language = useDisplayLang();
  const ui = { en: uiEN, fr: uiFR, ru: uiRU }[language] || uiEN;

  return (
    <section className={styles.notfound} aria-labelledby="nf-code">
      <img src={brokenEgg} alt="" aria-hidden="true" className={styles.egg} />

      <h1 id="nf-code" className={styles.code}>
        {ui.title}
      </h1>

      <p className={`${styles.pill} ${styles.text}`} aria-label="Error message">
        {ui.message}
      </p>

      <Link to={`/${language}/`} className={`${styles.pill} ${styles.homeLink}`}>
        {ui.home}
      </Link>
    </section>
  );
}
