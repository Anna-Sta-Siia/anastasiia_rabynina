import { useUI } from '../../context/UIContext';
import styles from './About.module.css';
import aboutFr from '../../assets/traduction/about/about.fr.json';
import aboutEn from '../../assets/traduction/about/about.en.json';
import aboutRu from '../../assets/traduction/about/about.ru.json';

export default function About() {
  const { language } = useUI();

  const translations = {
    fr: aboutFr,
    en: aboutEn,
    ru: aboutRu
  };

  const { title, paragraphs } = translations[language] || aboutEn;
  return(
        <div className={styles.about}>
          <h2>{title}</h2>
        {paragraphs.map((p, i) => (
  <p key={i} className={i === 0 ? styles.first : ''}>
    {p}
  </p>
))}
        </div>
  );
}
