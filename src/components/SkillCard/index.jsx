import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useUI } from "../../context";
import styles from "./SkillCard.module.css";

/**
 * props:
 *  - skill: { name, cats: string[], level: 1..5, projects: string[] }
 *  - catsColors: { [catId: string]: string }
 *  - projectNames: { [projectId: string]: string }
 *  - catsLabels?: { [catId: string]: string }
 */
export default function SkillCard({ skill, catsColors, projectNames, catsLabels }) {
  const { language } = useUI();

  const ALL =
    { fr: "Tous les projets", en: "All projects", ru: "Все проекты" }[language] || "All projects";

  const { name, cats = [], level = 1, projects = [] } = skill;

  /** Fond de l’œuf
   * - 0 cat  : gris clair
   * - 1 cat  : couleur unique
   * - ≥2 cat : dégradé 50/50 entre les 2 premières catégories
   */
  const background = useMemo(() => {
    if (!cats.length) return "#ddd";
    const c1 = catsColors[cats[0]] || "#ddd";
    const c2 = cats[1] ? catsColors[cats[1]] || c1 : c1;
    if (c1 === c2) return c1;
    // 135deg pour un joli split en diagonale; change en 90deg si tu veux un split vertical
    return `linear-gradient(135deg, ${c1} 0 50%, ${c2} 50% 100%)`;
  }, [cats, catsColors]);

  const showAll = projects.length === 0;

  return (
    <article className={styles.card} style={{ background }} aria-label={name}>
      {/* Titre */}
      <h3 className={styles.title}>{name}</h3>

      {/* Niveau (1–4) */}
      <div className={styles.level} aria-label={`Level ${level}/4`}>
        {new Array(4).fill(0).map((_, i) => (
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

      {/* Liens projets */}
      <ul className={styles.projects}>
        {showAll ? (
          <li>
            <Link className={styles.projectLink} to="/projects">
              {ALL}
            </Link>
          </li>
        ) : (
          projects.map((pid) => {
            const label = projectNames[pid] || pid;
            return (
              <li key={pid}>
                <Link
                  className={styles.projectLink}
                  to={`/projects?only=${encodeURIComponent(pid)}`}
                  title={label}
                  aria-label={label}
                >
                  {label}
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </article>
  );
}
