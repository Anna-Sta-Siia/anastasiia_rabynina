// src/pages/Projects/index.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import styles from "./Projects.module.css";
import Filter from "../../components/Filter";
import ProjetCard from "../../components/ProjetCard";
import PageTitle from "../../components/PageTitle";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import { useUI } from "../../context";

import projectsFr from "../../assets/traduction/projet/projet.fr.json";
import projectsEn from "../../assets/traduction/projet/projet.en.json";
import projectsRu from "../../assets/traduction/projet/projet.ru.json";

/* ---------- Helpers ---------- */
const normalize = (s = "") =>
  s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// recherche par début de mot (séparateurs: espace, tiret, underscore)
const startsAtWord = (title, q) => {
  const t = normalize(title);
  const n = normalize(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex specials
  const re = new RegExp(`(^|[\\s-_])${n}`, "i");
  return re.test(t);
};

export default function Projects() {
  const { label, color } = usePageMeta();
  const { language } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();

  // Dataset par langue
  const allProjects = useMemo(() => {
    switch (language) {
      case "en":
        return projectsEn;
      case "ru":
        return projectsRu;
      default:
        return projectsFr;
    }
  }, [language]);

  // Si on arrive avec ?only=slug -> forcer l’affichage d’un seul projet
  const onlyFromUrl = searchParams.get("only") || "";

  // État UI
  const [query, setQuery] = useState({
    filters: [],
    search: "",
    sort: "",
    mode: "and", // AND par défaut sur "Projects"
  });
  const [only, setOnly] = useState(onlyFromUrl);

  // Sync si l’URL change (nav interne)
  useEffect(() => {
    setOnly(onlyFromUrl || "");
  }, [onlyFromUrl]);

  // Quand l’utilisateur agit sur la barre de filtres, on sort du mode "only"
  function handleFilterChange(payload) {
    if (only) {
      setOnly("");
      const next = new URLSearchParams(searchParams);
      next.delete("only");
      setSearchParams(next, { replace: true });
    }
    setQuery(payload);
  }

  // Texte localisé pour l'état vide
  const emptyUi = useMemo(
    () =>
      ({
        en: {
          title: "No project yet",
          hint: "There’s no project that combines these tools (for now).",
          showAll: "Show all projects",
        },
        fr: {
          title: "Aucun projet pour le moment",
          hint: "Aucun projet ne combine encore ces outils.",
          showAll: "Voir tous les projets",
        },
        ru: {
          title: "Пока ничего нет",
          hint: "Проекта, сочетающего эти инструменты, пока не существует.",
          showAll: "Показать все проекты",
        },
      }[language] || {
        title: "No project yet",
        hint: "There’s no project that combines these tools (for now).",
        showAll: "Show all projects",
      }),
    [language]
  );

  // Reset des filtres + suppression de ?only
  function resetFilters() {
    setOnly("");
    const next = new URLSearchParams(searchParams);
    next.delete("only");
    setSearchParams(next, { replace: true });
    setQuery({ filters: [], search: "", sort: "", mode: "and" });
  }

  // Liste filtrée
  const filteredProjects = useMemo(() => {
    const { filters, search, sort, mode } = query;

    // 1) Cas ?only=... -> on court-circuite tout
    if (only) {
      return allProjects.filter((p) => p.id === only);
    }

    let list = allProjects;

    // 2) Filtres par stack
    if (filters.length) {
      list =
        mode === "and"
          ? list.filter((p) => filters.every((f) => p.stack.includes(f)))
          : list.filter((p) => filters.some((f) => p.stack.includes(f)));
    }

    // 3) Recherche (début de mot)
    if (search.trim()) {
      list = list.filter((p) => startsAtWord(p.title, search));
    }

    // 4) Tri
    if (sort === "az") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, language));
    } else if (sort === "za") {
      list = [...list].sort((a, b) => b.title.localeCompare(a.title, language));
    }

    return list;
  }, [allProjects, query, language, only]);

  const hasResults = filteredProjects.length > 0;

  return (
    <section className={styles.projects}>
      <PageTitle text={label} color={color} />

      {/* AND par défaut ici */}
      <Filter onChange={handleFilterChange} defaultMode="and" />

      <div className={styles.projectslist}>
        {hasResults ? (
          filteredProjects.map((project) => <ProjetCard key={project.id} project={project} />)
        ) : (
          <div className={styles.empty}>
            <article className={styles.emptyEgg} aria-live="polite">
              <h3 className={styles.emptyEggTitle}>{emptyUi.title}</h3>
              <p className={styles.emptyEggText}>{emptyUi.hint}</p>
              <div className={styles.emptyEggActions}>
                <button type="button" className={styles.emptyEggBtn} onClick={resetFilters}>
                  {emptyUi.showAll}
                </button>
              </div>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
