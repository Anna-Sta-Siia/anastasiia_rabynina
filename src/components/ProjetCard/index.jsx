import { useState } from 'react';
import styles from './ProjetCard.module.css';

export default function ProjetCard({ project }) {
  const {
    title,
    image,
    link,
    description,
    stack,
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
            alt={`aperçu ${title}`}
            className={styles.image}
          />

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            Visiter le site
          </a>

          <div className={styles.arrowContainer}>
            <p>Tourner la carte</p>
            <button
              className={styles.flipArrow}
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true); // aller vers l'arrière
              }}
              aria-label="Retourner la carte"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Face arrière */}
        <div className={styles.back}>
          <h4>Description</h4>
          <p>{description}</p>
          <h4>Outils</h4>
          <ul>
            {stack.map(tool => <li key={tool}>{tool}</li>)}
          </ul>
          <h4>Compétences développées</h4>
          <p>{competences}</p>

          <div className={styles.arrowContainer}>
            <p>Retourner la carte</p>
            <button
              type="button"
              className={`${styles.flipArrow} ${styles.flipBack}`}
              aria-label="Retourner à la face avant du projet"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false); // retour à la face avant
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
