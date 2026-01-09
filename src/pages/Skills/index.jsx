import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import Filter from "../../components/Filter";
import LevelSlider from "../../components/LevelSlider";
import SkillCard from "../../components/SkillCard";
import { SKILLS, CATEGORIES, PROJECTS } from "../../assets/traduction/skills/data";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import { useUI } from "../../context";
import styles from "./Skills.module.css";

// Libellés localisés des catégories (skills.*.json)
import skillsFR from "../../assets/traduction/skills/skills.fr.json";
import skillsEN from "../../assets/traduction/skills/skills.en.json";
import skillsRU from "../../assets/traduction/skills/skills.ru.json";

export default function Skills() {
  const { label, color } = usePageMeta();
  const { language } = useUI();
  const [minLevel, setMinLevel] = useState(1);
  const tSkills = useMemo(() => {
    const pack = { fr: skillsFR, en: skillsEN, ru: skillsRU }[language] ?? skillsEN;
    return pack.skills ?? {};
  }, [language]);
  const [showFilterHint, setShowFilterHint] = useState(false);
  /* ---------------- Libellés localisés des catégories ---------------- */
  const catsLabels = useMemo(() => tSkills.cats || {}, [tSkills]);
  /* ---------------- URL (?only=slug) ---------------- */
  const [searchParams, setSearchParams] = useSearchParams();
  const projectOnly = (searchParams.get("only") || "").trim(); // ex: "ohmyfood" | ""

  /* ---------------- Couleurs et noms humains ---------------- */
  const catsColors = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color])), []);
  const projectNames = useMemo(() => Object.fromEntries(PROJECTS.map((p) => [p.id, p.name])), []);

  /* ---------------- Sous-ensemble piloté par ?only= ----------------
     - Compétences transversales (projects: []) -> visibles pour tous
     - Compétences liées au projet -> s.projects inclut projectOnly
  ------------------------------------------------------------------- */
  const usedByProject = useMemo(() => {
    if (!projectOnly) return SKILLS;
    return SKILLS.filter((s) => {
      const ps = Array.isArray(s.projects) ? s.projects : [];
      return ps.length === 0 || ps.includes(projectOnly);
    });
  }, [projectOnly]);

  /* ---------------- Catégories à surligner quand ?only= est présent 
     (pure déco: pour pré-sélectionner visuellement des bulles) ------ */
  const initialCats = useMemo(() => {
    if (!projectOnly) return [];
    const set = new Set();
    for (const s of usedByProject) (s.cats || []).forEach((c) => set.add(c));
    return [...set];
  }, [projectOnly, usedByProject]);

  /* ---------------- État local des filtres ---------------- */
  const [query, setQuery] = useState({
    filters: initialCats,
    search: "",
    sort: "",
    mode: "or",
  });

  // Si l’URL change (autre projet ciblé), on resynchronise juste l’aspect visuel
  useEffect(() => {
    setQuery((q) => ({ ...q, filters: initialCats }));
  }, [initialCats]);

  /* ---------------- Liste finale ---------------- */
  const filteredSkills = useMemo(() => {
    const { filters, mode } = query;
    let list = usedByProject; // on part déjà du sous-ensemble ciblé par ?only=

    // 1)filtres catégories
    if (filters.length) {
      list = list.filter((s) => {
        const has = (c) => (s.cats || []).includes(c);
        return mode === "and" ? filters.every(has) : filters.some(has);
      });
    }
    // 2) фильтр по уровню skills
    list = list.filter((s) => {
      const lvl = typeof s.level === "number" ? s.level : 1;
      return lvl >= minLevel; // показываем только навыки с уровнем ≥ выбранного
    });
    return list;
  }, [query, usedByProject, minLevel]);

  /* ---------------- Callback Filter ----------------
     Si l’utilisateur clique sur “All” (tout vide), on enlève ?only
  --------------------------------------------------- */
  function handleFilterChange(payload) {
    setQuery(payload);

    if (!payload.filters.length && !payload.search && !payload.sort && projectOnly) {
      const next = new URLSearchParams(searchParams);
      next.delete("only");
      setSearchParams(next, { replace: true });
    }
  }

  /* ---------------- Items de Filter = catégories (localisées) ------ */
  const filterItems = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        key: c.id,
        color: c.color,
        label: catsLabels[c.id] ?? c.id,
      })),
    [catsLabels]
  );

  function handleFirstFilterInteraction() {
    if (sessionStorage.getItem("skills-filters-hint-seen")) return;

    sessionStorage.setItem("skills-filters-hint-seen", "1"); // <-- сразу
    setShowFilterHint(true);
  }
  useEffect(() => {
    if (!showFilterHint) return;

    const timer = setTimeout(() => {
      setShowFilterHint(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showFilterHint]);

  return (
    <section className={styles.skills}>
      <PageTitle text={label} color={color} />

      <div
        className={styles.filterZone}
        aria-describedby="skills-filter-hint"
        onMouseEnter={handleFirstFilterInteraction}
        onFocusCapture={handleFirstFilterInteraction}
      >
        {showFilterHint && (
          <div className={styles.filterHint} role="status" aria-live="polite">
            {tSkills?.info ?? "Можно выбрать один или несколько фильтров."}
          </div>
        )}

        <div
          className={styles.filterZone}
          aria-describedby="skills-filter-hint"
          onMouseEnter={handleFirstFilterInteraction}
          onFocusCapture={handleFirstFilterInteraction}
          onPointerDown={handleFirstFilterInteraction}
        >
          {showFilterHint && (
            <div className={styles.filterHint} role="status" aria-live="polite">
              {tSkills?.info ?? "Можно выбрать один или несколько фильтров."}
            </div>
          )}

          <Filter
            items={filterItems}
            defaultMode="or"
            onChange={handleFilterChange}
            defaultSelected={initialCats}
            showToolsRow={false}
          />

          <p id="skills-filter-hint" className={styles.srOnly}>
            {tSkills?.info ?? ""}
          </p>
        </div>

        {/* Доступно для скринридеров всегда */}
        <p id="skills-filter-hint" className={styles.srOnly}>
          {tSkills?.info ?? ""}
        </p>
      </div>

      <LevelSlider value={minLevel} onChange={setMinLevel} t={tSkills} />

      <div className={styles.list}>
        {filteredSkills.map((s) => (
          <SkillCard
            key={s.name}
            skill={s}
            catsColors={catsColors}
            projectNames={projectNames}
            catsLabels={catsLabels}
          />
        ))}
      </div>
    </section>
  );
}
