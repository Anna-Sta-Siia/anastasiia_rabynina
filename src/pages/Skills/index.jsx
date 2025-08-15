import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import PageTitle from "../../components/PageTitle";
import PetalFilter from "../../components/Petal/PetalFilter";

import { usePageMeta } from "../../config/hooks/usePageMeta";
import { useUI } from "../../context";

import { CATEGORIES, SKILLS, PROJECTS } from "../../assets/traduction/skills/data";

import ru from "../../assets/traduction/skills/skills.ru.json";
import fr from "../../assets/traduction/skills/skills.fr.json";
import en from "../../assets/traduction/skills/skills.en.json";

import styles from "./Skills.module.css";

const T = { ru, fr, en };

export default function Skills() {
  const { label, color } = usePageMeta();
  const { language } = useUI();
  const t = T[language]?.skills ?? T.ru.skills;

  const [params, setParams] = useSearchParams();
  const project = params.get("project"); // ex: "kasa"
  const [selected, setSelected] = useState(new Set());

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const clearProject = () => {
    params.delete("project");
    setParams(params, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = SKILLS;

    // 1) Contexte projet (quand on vient de /projects -> "Voir mes compétences")
    if (project) list = list.filter((s) => s.projects.includes(project));

    // 2) Filtres pétales (OU)
    if (selected.size > 0) {
      const ids = [...selected];
      list = list.filter((s) => ids.some((id) => s.cats.includes(id)));
    }
    return list;
  }, [project, selected]);

  return (
    <section className={styles.skills}>
      <PageTitle text={label} color={color} />

      <p className={styles.hint}>{t.hint}</p>

      <div className={styles.toolbar}>
        {project ? (
          <>
            <span className={styles.scope}>
              {t.fromProject}{" "}
              <strong>{PROJECTS.find((p) => p.id === project)?.name ?? project}</strong>
            </span>
            <button className={styles.btn} onClick={clearProject}>
              {t.showAll}
            </button>
            <Link className={styles.link} to="/projects">
              {t.backToProjects}
            </Link>
          </>
        ) : (
          <>
            <span className={styles.scope}>{t.allSkills}</span>
            <Link className={styles.link} to="/projects">
              {t.goToProjects}
            </Link>
          </>
        )}
      </div>

      <div className={styles.petals}>
        {CATEGORIES.map((c) => (
          <PetalFilter
            key={c.id}
            name={t.cats[c.id] ?? c.id}
            color={c.color}
            active={selected.has(c.id)}
            onClick={() => toggle(c.id)}
          />
        ))}
      </div>

      <ul className={styles.grid}>
        {filtered.map((s) => (
          <li key={s.name} className={styles.card}>
            <strong className={styles.title}>{s.name}</strong>
            <div className={styles.meta}>
              <span className={styles.cats}>
                {s.cats.map((id) => t.cats[id] ?? id).join(" · ")}
              </span>
              <span className={styles.level} aria-label={`level ${s.level}`}>
                {"★".repeat(s.level)}
              </span>
            </div>

            {!!s.projects?.length && (
              <div className={styles.projects}>
                {s.projects.map((pid) => (
                  <Link
                    key={pid}
                    className={styles.projectChip}
                    to={`/projects?focus=${pid}`}
                    title={t.openProject}
                  >
                    {PROJECTS.find((p) => p.id === pid)?.name ?? pid}
                  </Link>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
