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

/* ===== Helpers stables ===== */
const normalize = (s = "") =>
  s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// début de mot (séparateurs: espace, tiret, underscore)
const startsAtWord = (title, q) => {
  const t = normalize(title);
  const n = normalize(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex
  const re = new RegExp(`(^|[\\s-_])${n}`, "i");
  return re.test(t);
};

export default function Projects() {
  const { label, color } = usePageMeta();
  const { language } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();

  // Jeu de données par langue
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

  // Quand on arrive avec ?only=slug on force l’affichage d’un seul projet
  const onlyFromUrl = searchParams.get("only") || "";

  // État UI (AND par défaut)
  const [query, setQuery] = useState({
    filters: [],
    search: "",
    sort: "",
    mode: "and",
  });
  const [only, setOnly] = useState(onlyFromUrl); // string | ""

  // Si l’URL change (navi interne), on synchronise
  useEffect(() => {
    setOnly(onlyFromUrl || "");
  }, [onlyFromUrl]);

  // Callback depuis <Filter/>
  function handleFilterChange(payload) {
    // dès qu’on touche les filtres/recherche/tri, on sort du mode "only"
    if (only) {
      setOnly("");
      const next = new URLSearchParams(searchParams);
      next.delete("only");
      setSearchParams(next, { replace: true });
    }
    setQuery(payload);
  }

  // Calcul liste filtrée
  const filteredProjects = useMemo(() => {
    const { filters, search, sort, mode } = query;

    // 1) cas ?only=…  -> on court-circuite tout
    if (only) {
      return allProjects.filter((p) => p.id === only);
    }

    let list = allProjects;

    // 2) filtres par stack (ET par défaut)
    if (filters.length) {
      if (mode === "and") {
        list = list.filter((p) => filters.every((f) => p.stack.includes(f)));
      } else {
        list = list.filter((p) => filters.some((f) => p.stack.includes(f)));
      }
    }

    // 3) recherche par début de mot sur le titre
    if (search.trim()) {
      list = list.filter((p) => startsAtWord(p.title, search));
    }

    // 4) tri
    if (sort === "az") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, language));
    } else if (sort === "za") {
      list = [...list].sort((a, b) => b.title.localeCompare(a.title, language));
    }

    return list;
  }, [allProjects, query, language, only]);

  return (
    <section className={styles.projects}>
      <PageTitle text={label} color={color} />

      {/* AND par défaut ici */}
      <Filter onChange={handleFilterChange} defaultMode="and" />

      <div className={styles.projectslist}>
        {filteredProjects.map((project) => (
          <ProjetCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
