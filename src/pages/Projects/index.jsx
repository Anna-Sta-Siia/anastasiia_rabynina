// src/pages/Projects/index.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import styles from "./Projects.module.css";
import Filter from "../../components/Filter";
import ProjetCard from "../../components/ProjetCard";
import PageTitle from "../../components/PageTitle";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import { useUI } from "../../context";

// Données projets par langue
import projectsFr from "../../assets/traduction/projet/projet.fr.json";
import projectsEn from "../../assets/traduction/projet/projet.en.json";
import projectsRu from "../../assets/traduction/projet/projet.ru.json";

// UI (textes) par langue
import uiFr from "../../assets/traduction/projet/ui.fr.json";
import uiEn from "../../assets/traduction/projet/ui.en.json";
import uiRu from "../../assets/traduction/projet/ui.ru.json";

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
  const n = normalize(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[\\s_-])${n}`, "i");
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
  const onlyFromUrl = (searchParams.get("only") || "").trim();
  const [only, setOnly] = useState(onlyFromUrl);

  // Suivre l'URL si elle change (navigation interne)
  useEffect(() => {
    setOnly(onlyFromUrl);
  }, [onlyFromUrl]);

  // Trouver la stack du projet ciblé (pour entourer les bulles)
  const preselectedStack = useMemo(() => {
    if (!only) return [];
    const p = allProjects.find((x) => x.id === only);
    return Array.isArray(p?.stack) ? p.stack : [];
  }, [only, allProjects]);
  const stackSig = preselectedStack.join("|");

  // État de la requête courante (alimenté par le <Filter/>)
  const [query, setQuery] = useState({
    filters: [],
    search: "",
    sort: "",
    mode: "and",
  });

  // Valeurs par défaut injectées dans <Filter/> + "nonce" pour forcer un remount visuel
  const [filterDefaults, setFilterDefaults] = useState({
    selected: [],
    search: "",
    sort: "",
    mode: "and",
    nonce: 0,
  });

  // ⚠️ Remonter le Filter uniquement quand on *arrive* avec ?only=… (ou si la stack ciblée change)
  useEffect(() => {
    if (!only) return; // <-- ne pas remonter quand on quitte le mode "only"
    setFilterDefaults((d) => ({
      selected: preselectedStack,
      search: "",
      sort: "",
      mode: "and",
      nonce: d.nonce + 1,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stackSig, only]);

  // Textes localisés pour l'état vide
  const emptyUi = useMemo(() => {
    const pack = { fr: uiFr, en: uiEn, ru: uiRu }[language] || uiEn;
    return (
      pack?.empty || {
        title: "No project yet",
        hint: "There’s no project that combines these tools (for now).",
        showAll: "Show all projects",
      }
    );
  }, [language]);

  // Interaction avec la barre de filtres.
  // Au 1er clic, on sort du mode "only" *sans* remonter le Filter.
  function handleFilterChange(payload) {
    if (only) {
      const next = new URLSearchParams(searchParams);
      next.delete("only");
      setSearchParams(next, { replace: true });
      setOnly("");
    }
    setQuery(payload);
  }

  // Reset (bouton dans l’état vide)
  function resetFilters() {
    const next = new URLSearchParams(searchParams);
    next.delete("only");
    setSearchParams(next, { replace: true });

    setOnly("");
    setQuery({ filters: [], search: "", sort: "", mode: "and" });
    setFilterDefaults((d) => ({
      selected: [],
      search: "",
      sort: "",
      mode: "and",
      nonce: d.nonce + 1,
    }));
  }

  // Liste filtrée
  const filteredProjects = useMemo(() => {
    // 1) Cas ?only=... -> on court-circuite tout
    if (only) {
      return allProjects.filter((p) => p.id === only);
    }

    const { filters, search, sort, mode } = query;
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

      {/* AND par défaut. Quand on arrive avec ?only, on *n’émet pas* onChange au montage */}
      <Filter
        key={filterDefaults.nonce}
        onChange={handleFilterChange}
        defaultMode={filterDefaults.mode}
        defaultSelected={filterDefaults.selected}
        defaultSearch={filterDefaults.search}
        defaultSort={filterDefaults.sort}
        fireOnMount={!only}
      />

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
