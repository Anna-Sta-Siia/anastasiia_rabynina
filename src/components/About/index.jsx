import styles from "./About.module.css";

import aboutFr from "../../assets/traduction/about/about.fr.json";
import aboutEn from "../../assets/traduction/about/about.en.json";
import aboutRu from "../../assets/traduction/about/about.ru.json";

const TRANSLATIONS = { fr: aboutFr, en: aboutEn, ru: aboutRu };
const LANG_ATTR = { fr: "fr-FR", en: "en-US", ru: "ru-RU" };

export default function About({ lang = "fr" }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const langAttr = LANG_ATTR[lang] || "fr-FR";
  const paragraphs = Array.isArray(t.paragraphs) ? t.paragraphs : [];

  return (
    <div className={styles.about} lang={langAttr}>
      <h2>{t.title || "..."}</h2>
      <h3 className={styles.salut}>{t.salut || "..."}</h3>

      {paragraphs.map((p, i) => (
        <p key={i} className={i === 0 ? styles.first : ""}>
          {p}
        </p>
      ))}
    </div>
  );
}
