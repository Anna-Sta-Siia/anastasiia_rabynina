// src/pages/Skills/index.jsx
import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import Filter from "../../components/Filter";
import SkillCard from "../../components/SkillCard";
import { SKILLS, CATEGORIES, PROJECTS } from "../../assets/traduction/skills/data";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import { useUI } from "../../context";
import styles from "./Skills.module.css";

// libellés localisés des catégories (skills.*.json)
import skillsFR from "../../assets/traduction/skills/skills.fr.json";
import skillsEN from "../../assets/traduction/skills/skills.en.json";
import skillsRU from "../../assets/traduction/skills/skills.ru.json";

export default function Skills() {
  const { label, color } = usePageMeta();
  const { language } = useUI();

  // ---------- libellés localisés pour les catégories ----------
  const catsLabels = useMemo(() => {
    const pack = ({ fr: skillsFR, en: skillsEN, ru: skillsRU }[language] ?? skillsEN)?.skills ?? {};
    return pack.cats ?? {}; // { markup: "HTML", styles: "STYLE", ... }
  }, [language]);

  // ---------- URL sync ----------
  const [searchParams, setSearchParams] = useSearchParams();
  const projectOnly = (searchParams.get("only") || "").trim(); // ex: "ohmyfood"

  // couleurs catégories & noms projets
  const catsColors = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color])), []);
  const projectNames = useMemo(() => Object.fromEntries(PROJECTS.map((p) => [p.id, p.name])), []);

  // Catégories à surligner quand ?only=… est présent (purement visuel)
  const initialCats = useMemo(() => {
    if (!projectOnly) return [];
    const set = new Set();
    for (const s of SKILLS) {
      if ((s.projects || []).includes(projectOnly)) (s.cats || []).forEach((c) => set.add(c));
    }
    return [...set];
  }, [projectOnly]);

  // état du filtre (propre à la page)
  const [query, setQuery] = useState({
    filters: initialCats,
    search: "",
    sort: "",
    mode: "or",
  });

  // si on change de projet via l’URL, on resynchronise la sélection visuelle
  useEffect(() => {
    setQuery((q) => ({ ...q, filters: initialCats }));
  }, [initialCats]);

  // Liste finale
  const filteredSkills = useMemo(() => {
    const { filters, search, sort, mode } = query;
    let list = SKILLS;

    // 1) restriction par projet (clé du problème)
    if (projectOnly) {
      list = list.filter((s) => (s.projects || []).includes(projectOnly));
    }

    // 2) filtres de catégories
    if (filters.length) {
      list = list.filter((s) => {
        const has = (c) => (s.cats || []).includes(c);
        return mode === "and" ? filters.every(has) : filters.some(has);
      });
    }

    // 3) recherche simple sur le nom
    if (search.trim()) {
      const n = search.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(n));
    }

    // 4) tri
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") list = [...list].sort((a, b) => b.name.localeCompare(a.name));

    return list;
  }, [query, projectOnly]);

  // callback Filter (et reset “All”)
  function handleFilterChange(payload) {
    setQuery(payload);

    // si l’utilisateur clique sur “All” (tout vide), on enlève ?only
    if (!payload.filters.length && !payload.search && !payload.sort && projectOnly) {
      const next = new URLSearchParams(searchParams);
      next.delete("only");
      setSearchParams(next, { replace: true });
    }
  }

  // items (pills) du Filter = catégories (avec libellés localisés)
  const filterItems = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        key: c.id,
        color: c.color,
        label: catsLabels[c.id] ?? c.id,
      })),
    [catsLabels]
  );

  return (
    <section className={styles.skills}>
      <PageTitle text={label} color={color} />

      <Filter
        items={filterItems}
        defaultMode="or"
        onChange={handleFilterChange}
        defaultSelected={initialCats}
      />

      <div className={styles.list}>
        {filteredSkills.map((s) => (
          <SkillCard
            key={s.name}
            skill={s}
            catsColors={catsColors}
            projectNames={projectNames}
            /** Optionnel : afficher aussi les libellés traduits dans les “chips” de la carte */
            catsLabels={catsLabels}
          />
        ))}
      </div>
    </section>
  );
}
