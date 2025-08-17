// src/components/SkillCard/index.jsx
import { Link } from "react-router-dom";
import { useUI } from "../../context";
import styles from "./SkillCard.module.css";

/**
 * props:
 *  - skill: { name, cats: string[], level: 1|2|3|4|5, projects: string[] }
 *  - catsColors: { [catId: string]: string }   // couleur par catégorie (pour le fond de l'œuf)
 *  - projectNames: { [projectId: string]: string } // libellé humain pour les liens projets
 *  - catsLabels?: { [catId: string]: string }  // libellé localisé des catégories (optionnel)
 */
export default function SkillCard({ skill, catsColors, projectNames, catsLabels }) {
  const { language } = useUI();

  // libellé “Tous les projets” selon la langue
  const ALL =
    { fr: "Tous les projets", en: "All projects", ru: "Все проекты" }[language] || "All projects";

  const { name, cats = [], level = 1, projects = [] } = skill;

  // Couleur de fond basée sur la 1ère catégorie
  const bg = cats.length ? catsColors[cats[0]] || "#ddd" : "#ddd";

  const showAll = projects.length === 0;

  return (
    <article className={styles.card} style={{ background: bg }} aria-label={name}>
      {/* Titre */}
      <h3 className={styles.title}>{name}</h3>

      {/* Niveau (1–5) */}
      <div className={styles.level} aria-label={`Level ${level}/5`}>
        {new Array(5).fill(0).map((_, i) => (
          <span key={i} className={`${styles.dot} ${i < level ? styles.full : ""}`} />
        ))}
      </div>

      {/* Catégories (chips) */}
      {!!cats.length && (
        <ul className={styles.chips}>
          {cats.map((c) => (
            <li key={c} className={styles.chip}>
              {catsLabels?.[c] ?? c}
            </li>
          ))}
        </ul>
      )}

      {/* Projets liés (ou lien “Tous les projets”) */}
      <ul className={styles.projects}>
        {showAll ? (
          <li>
            <Link className={styles.projectLink} to="/projects">
              {ALL}
            </Link>
          </li>
        ) : (
          projects.map((pid) => (
            <li key={pid}>
              <Link
                className={styles.projectLink}
                to={`/projects?only=${encodeURIComponent(pid)}`}
                title={projectNames[pid] || pid}
              >
                {projectNames[pid] || pid}
              </Link>
            </li>
          ))
        )}
      </ul>
    </article>
  );
}
