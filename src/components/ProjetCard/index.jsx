import styles from './ProjetCard.module.css';

export default function ProjetCard({ project }) {
  const {
    title,
    image,
    link,
    description,
    stack,
    competences,
  } = project;

  return (
    <div className={styles.card}>
      <div className={styles.inner}>
        {/* Face avant */}
        <div className={styles.front} style={{ backgroundColor: color }}>
          <img
            src={`/assets/images/projects/${image}`}
            alt={`aperçu ${title}`}
            className={styles.image}
          />
          <h3>{title}</h3>
          <a href={link} target="_blank" rel="noopener noreferrer">
            Voir le site
          </a>
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
        </div>
      </div>
    </div>
  );
}
