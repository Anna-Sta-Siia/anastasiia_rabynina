import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '../../context';
import menuItems from '../../config/menuConfig';
import styles from './ProjetCard.module.css';

// UI (projet)
import uiFr from '../../assets/traduction/projet/ui.fr.json';
import uiEn from '../../assets/traduction/projet/ui.en.json';
import uiRu from '../../assets/traduction/projet/ui.ru.json';

// Labels des filtres (pour afficher les noms humains des stacks)
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

  // on essaie d’abord “skills”, sinon “formation”
  const skillsItem = useMemo(
    () => menuItems.find(i => i.key === 'skills') ?? menuItems.find(i => i.key === 'formation'),
    []
  );
  const skillsPath = skillsItem?.path || '/formation';

  const {
    title,
    titleLogo,          // <- nouveau (ex: "images/logos/ohmyfood.svg")
    image,              // "images/ohmyfood.png"
    link,               // URL externe
    description,
    stack = [],
    color               // peut être une couleur (#FF79DA) ou un gradient("linear-gradient(...)")
  } = project;

  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className={styles.card}>
      <div className={`${styles.inner} ${isFlipped ? styles.flipped : ''}`}>
        {/* Face avant */}
        <div className={styles.front} style={{ background: color }}>
          {titleLogo ? (
            <img
              className={styles.titleLogo}
              src={`${import.meta.env.BASE_URL}${titleLogo}`}
              alt={title}
              width={180}
              height="auto"
              decoding="async"
            />
          ) : (
            <h3 className={styles.title}>{title}</h3>
          )}

          {image && (
            <img
              src={`${import.meta.env.BASE_URL}${image}`}
              alt={title}
              className={styles.image}
              decoding="async"
            />
          )}
        <div className={styles.projectcardbottom}>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={styles.skillsrefer}
            >
              {ui.visit}
            </a>
          )}

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
        </div>

        {/* Face arrière */}
        <div className={styles.back}>
          <h4>{ui.description}</h4>
          <p>{description}</p>

          {!!stack.length && (
            <>
              <h4>{ui.tools}</h4>
              <ul>
                {stack.map((toolKey) => (
                  <li key={toolKey}>{filterLabels[toolKey] ?? toolKey}</li>
                ))}
              </ul>
            </>
          )}

          {/* CTA vers la page Compétences */}
          <div className={styles.skillsCta}>
            <Link
              to={skillsPath}
              className={styles.skillsLink}
              onClick={(e) => e.stopPropagation()}
              aria-label={ui.seeSkills}
              title={ui.seeSkills}
            >
              {ui.seeSkills}
            </Link>
          </div>

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
