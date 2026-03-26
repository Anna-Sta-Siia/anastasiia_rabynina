import { useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./SkillCard.module.css";

/**
 * props:
 *  - skill: { name, cats: string[], level: 1..5, projects: string[] }
 *  - catsColors: { [catId: string]: string }
 *  - projectNames: { [projectId: string]: string }
 *  - catsLabels?: { [catId: string]: string }
 *  - lang?: "fr" | "en" | "ru"
 */
export default function SkillCard({ skill, catsColors, projectNames, catsLabels, lang = "fr" }) {
  const ALL =
    { fr: "Tous les projets", en: "All projects", ru: "Все проекты" }[lang] || "All projects";

  const { name, cats = [], level = 1, projects = [] } = skill;

  const background = useMemo(() => {
    if (!cats.length) return "#ddd";

    const c1 = catsColors[cats[0]] || "#ddd";
    const c2 = cats[1] ? catsColors[cats[1]] || c1 : c1;

    if (c1 === c2) return c1;

    return `linear-gradient(135deg, ${c1} 0 50%, ${c2} 50% 100%)`;
  }, [cats, catsColors]);

  const showAll = projects.length === 0;

  return (
    <article className={styles.card} style={{ background }} aria-label={name}>
      <h3 className={styles.title}>{name}</h3>

      <div className={styles.level} aria-label={`Level ${level}/4`}>
        {new Array(4).fill(0).map((_, i) => (
          <span key={i} className={`${styles.dot} ${i < level ? styles.full : ""}`} />
        ))}
      </div>

      {!!cats.length && (
        <ul className={styles.chips}>
          {cats.map((c) => (
            <li key={c} className={styles.chip}>
              {catsLabels?.[c]?.trim() || c}
            </li>
          ))}
        </ul>
      )}

      <ul className={styles.projects}>
        {showAll ? (
          <li>
            <Link className={styles.projectLink} to={`/${lang}/projects`}>
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
                  to={`/${lang}/projects?only=${encodeURIComponent(pid)}`}
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
