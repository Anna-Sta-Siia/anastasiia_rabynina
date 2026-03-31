import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useUI } from "../../context";
import { useDisplayLang } from "../../hooks/useDisplayLang";

import styles from "./Projects.module.css";
import Filter from "../../components/Filter";
import ProjetCard from "../../components/ProjetCard";
import PageTitle from "../../components/PageTitle";
import { usePageMeta } from "../../config/hooks/usePageMeta";

// Projects base + localized content
import projectsBase from "../../assets/traduction/projet/projects.base.json";
import projectsContentFr from "../../assets/traduction/projet/projects.content.fr.json";
import projectsContentEn from "../../assets/traduction/projet/projects.content.en.json";
import projectsContentRu from "../../assets/traduction/projet/projects.content.ru.json";

// UI projects
import uiFr from "../../assets/traduction/projet/ui.fr.json";
import uiEn from "../../assets/traduction/projet/ui.en.json";
import uiRu from "../../assets/traduction/projet/ui.ru.json";

// General
import generalFr from "../../assets/traduction/general/general.fr.json";
import generalEn from "../../assets/traduction/general/general.en.json";
import generalRu from "../../assets/traduction/general/general.ru.json";

/* ---------- Merge helper ---------- */
const mergeProjects = (base = [], content = {}) =>
  base.map((project) => ({
    ...project,
    ...(content?.[project.id] || {}),
  }));

/* ---------- Lang maps ---------- */
const PROJECTS_BY_LANG = {
  fr: mergeProjects(projectsBase, projectsContentFr),
  en: mergeProjects(projectsBase, projectsContentEn),
  ru: mergeProjects(projectsBase, projectsContentRu),
};

const PROJECTS_UI_BY_LANG = {
  fr: uiFr,
  en: uiEn,
  ru: uiRu,
};

const GENERAL_BY_LANG = {
  fr: generalFr,
  en: generalEn,
  ru: generalRu,
};

/* ---------- Helpers ---------- */
const normalize = (s = "") =>
  s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const escapeRegExp = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const startsAtWord = (title, q) => {
  const t = normalize(title);
  const n = escapeRegExp(normalize(q));

  if (!n) return true;

  const re = new RegExp(`(^|[\\s_-])${n}`, "i");
  return re.test(t);
};

export default function Projects() {
  const { askedLang } = useUI();
  const displayLang = useDisplayLang();
  const [searchParams, setSearchParams] = useSearchParams();

  // langue réellement demandée par l’utilisateur avant fallback
  const requestedLang = searchParams.get("from") || askedLang;

  // si from=en et URL=/fr/projects => notice visible en anglais
  const showFallback = searchParams.has("from");
  const noticeUi = GENERAL_BY_LANG[requestedLang] || GENERAL_BY_LANG.fr;

  /* ==================================================
     1) PAGE GUARD RESULT (sans redirect ici)
  ================================================== */

  const { label, color } = usePageMeta();

  const allProjects = useMemo(() => {
    return PROJECTS_BY_LANG[displayLang] || [];
  }, [displayLang]);

  const pageUi = useMemo(() => {
    return PROJECTS_UI_BY_LANG[displayLang] || PROJECTS_UI_BY_LANG.fr;
  }, [displayLang]);

  const emptyUi = pageUi?.empty ?? {
    title: "Aucun projet pour le moment",
    hint: "Aucun projet ne correspond actuellement à cette combinaison d’outils.",
    showAll: "Afficher tous les projets",
  };

  /* ==================================================
     2) URL / ONLY
  ================================================== */
  const onlyFromUrl = (searchParams.get("only") || "").trim();
  const [only, setOnly] = useState(onlyFromUrl);

  useEffect(() => {
    setOnly(onlyFromUrl);
  }, [onlyFromUrl]);

  const preselectedStack = useMemo(() => {
    if (!only) return [];
    const p = allProjects.find((x) => x.id === only);
    return Array.isArray(p?.stack) ? p.stack : [];
  }, [only, allProjects]);

  const stackSig = preselectedStack.join("|");

  /* ==================================================
     3) FILTER STATE
  ================================================== */
  const [query, setQuery] = useState({
    filters: [],
    search: "",
    sort: "",
    mode: "and",
  });

  const [filterDefaults, setFilterDefaults] = useState({
    selected: [],
    search: "",
    sort: "",
    mode: "and",
    nonce: 0,
  });

  useEffect(() => {
    if (!only) return;

    setFilterDefaults((d) => ({
      selected: preselectedStack,
      search: "",
      sort: "",
      mode: "and",
      nonce: d.nonce + 1,
    }));
  }, [stackSig, only, preselectedStack]);

  const handleFilterChange = (payload) => {
    if (only) {
      const next = new URLSearchParams(searchParams);
      next.delete("only");
      setSearchParams(next, { replace: true });
      setOnly("");
    }

    setQuery(payload);
  };

  function resetFilters() {
    const next = new URLSearchParams(searchParams);
    next.delete("only");
    setSearchParams(next, { replace: true });

    setOnly("");
    setQuery({
      filters: [],
      search: "",
      sort: "",
      mode: "and",
    });

    setFilterDefaults((d) => ({
      selected: [],
      search: "",
      sort: "",
      mode: "and",
      nonce: d.nonce + 1,
    }));
  }

  /* ==================================================
     4) FILTERED PROJECTS
  ================================================== */
  const filteredProjects = useMemo(() => {
    if (only) {
      return allProjects.filter((p) => p.id === only);
    }

    const { filters, search, sort, mode } = query;
    let list = allProjects;

    if (filters.length) {
      list =
        mode === "and"
          ? list.filter((p) => filters.every((f) => p.stack.includes(f)))
          : list.filter((p) => filters.some((f) => p.stack.includes(f)));
    }

    if (search.trim()) {
      list = list.filter((p) => startsAtWord(p.title, search));
    }

    if (sort === "az") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, displayLang || "fr"));
    } else if (sort === "za") {
      list = [...list].sort((a, b) => b.title.localeCompare(a.title, displayLang || "fr"));
    }

    return list;
  }, [allProjects, query, displayLang, only]);

  const hasResults = filteredProjects.length > 0;

  /* ==================================================
     5) NORMAL RENDER
  ================================================== */
  return (
    <section className={styles.projects}>
      <PageTitle text={label} color={color} />

      {showFallback && (
        <div className={styles.notice} role="status" aria-live="polite">
          <strong>{noticeUi.pageFallbackTitle}</strong>
          <p>{noticeUi.pageFallbackText}</p>
        </div>
      )}

      <Filter
        lang={displayLang}
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
          filteredProjects.map((project) => (
            <ProjetCard
              key={project.id}
              project={project}
              lang={displayLang}
              askedLang={askedLang}
            />
          ))
        ) : (
          <div className={styles.empty}>
            <article className={styles.emptyEgg} aria-live="polite">
              <h3 className={styles.emptyEggTitle}>{emptyUi.title}</h3>
              <p className={styles.emptyEggText}>{emptyUi.hint}</p>

              <div className={styles.emptyEggActions}>
                <button type="button" onClick={resetFilters} className={styles.emptyEggBtn}>
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
