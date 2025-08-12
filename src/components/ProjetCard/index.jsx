import { useState, useMemo } from 'react';
import { useUI } from '../../context';
import styles from './ProjetCard.module.css';

import uiFr from '../../assets/traduction/projet/ui.fr.json';
import uiEn from '../../assets/traduction/projet/ui.en.json';
import uiRu from '../../assets/traduction/projet/ui.ru.json';

import labelsFr from '../../assets/traduction/filters/filters.fr.json';
import labelsEn from '../../assets/traduction/filters/filters.en.json';
import labelsRu from '../../assets/traduction/filters/filters.ru.json';

export default function ProjetCard({ project }) {
  const { language } = useUI();
  const ui = useMemo(() => {
    switch (language) {
      case 'en': return uiEn;
      case 'ru': return uiRu;
      default:   return uiFr;
    }
  }, [language]);

  const filterLabels = useMemo(() => {
    switch (language) {
      case 'en': return labelsEn;
      case 'ru': return labelsRu;
      default:   return labelsFr;
    }
  }, [language]);

  const {
    title,
    image,
    link,
    description,
    stack = [],
    competences,
    color
  } = project;

  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className={styles.card}>
      <div className={`${styles.inner} ${isFlipped ? styles.flipped : ''}`}>
        {/* Face avant */}
        <div className={styles.front} style={{ backgroundColor: color }}>
          <h3>{title}</h3>

          <img
            src={`${import.meta.env.BASE_URL}${image}`}
            alt={title}
            className={styles.image}
          />

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            {ui.visit}
          </a>

          <div className={styles.arrowContainer}>
            <p>{ui.flip}</p>
            <button
              className={styles.flipArrow}
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              aria-label={ui.flip}
              title={ui.flip}
            >
              ▶
            </button>
          </div>
        </div>

        {/* Face arrière */}
        <div className={styles.back}>
          <h4>{ui.description}</h4>
          <p>{description}</p>

          <h4>{ui.tools}</h4>
          <ul>
            {stack.map(toolKey => (
              <li key={toolKey}>{filterLabels[toolKey] ?? toolKey}</li>
            ))}
          </ul>

          <h4>{ui.skills}</h4>
          <p>{competences}</p>

          <div className={styles.arrowContainer}>
            <p>{ui.flipBack}</p>
            <button
              type="button"
              className={`${styles.flipArrow} ${styles.flipBack}`}
              aria-label={ui.flipBack}
              title={ui.flipBack}
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              ◀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
