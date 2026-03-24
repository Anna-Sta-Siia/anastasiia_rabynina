import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PROJECTS_GUARD_RULES } from "../../guards/page/projectsGuardRules";
import styles from "./Projects.module.css";
import Filter from "../../components/Filter";
import ProjetCard from "../../components/ProjetCard";
import PageTitle from "../../components/PageTitle";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import { useUI } from "../../context";

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

// Guard page
import { useResolvedPageLanguage } from "../../hooks/useResolvedPageLanguage";
import { resolveEffectiveLang } from "../../guards/core/resolveEffectiveLang";

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

const startsAtWord = (title, q) => {
  const t = normalize(title);
  const n = normalize(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[\\s_-])${n}`, "i");
  return re.test(t);
};

export default function Projects() {
  const { requestedLang: askedLang } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ==================================================
     1) LANG RESOLUTION
     ================================================== */

  const resolveGuard = useCallback(() => {
    return resolveEffectiveLang({
      askedLang,
      contentByLang: PROJECTS_BY_LANG,
      uiByLang: PROJECTS_UI_BY_LANG,
      rules: PROJECTS_GUARD_RULES,
      debugLabel: "Projects i18n",
    });
  }, [askedLang]);

  const { effectiveLang, hasFallback, unavailable, noticeUi } = useResolvedPageLanguage({
    askedLang,
    resolveGuard,
    generalByLang: GENERAL_BY_LANG,
  });
  const { label, color } = usePageMeta(effectiveLang || askedLang);
  const allProjects = useMemo(() => {
    return PROJECTS_BY_LANG[effectiveLang] || [];
  }, [effectiveLang]);

  const pageUi = useMemo(() => {
    return PROJECTS_UI_BY_LANG[effectiveLang] || PROJECTS_UI_BY_LANG.fr;
  }, [effectiveLang]);

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

  const handleFilterChange = useCallback(
    (payload) => {
      if (only) {
        const next = new URLSearchParams(searchParams);
        next.delete("only");
        setSearchParams(next, { replace: true });
        setOnly("");
      }
      setQuery(payload);
    },
    [only, searchParams, setSearchParams],
  );

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
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, effectiveLang || "fr"));
    } else if (sort === "za") {
      list = [...list].sort((a, b) => b.title.localeCompare(a.title, effectiveLang || "fr"));
    }

    return list;
  }, [allProjects, query, effectiveLang, only]);

  const hasResults = filteredProjects.length > 0;

  /* ==================================================
     5) UNAVAILABLE STATE
     ================================================== */

  if (unavailable) {
    return (
      <section className={styles.projects}>
        <PageTitle text={label} color={color} />

        <div className={styles.empty}>
          <article className={styles.emptyEgg} aria-live="polite">
            <h3 className={styles.emptyEggTitle}>{noticeUi.pageUnavailableTitle}</h3>
            <p className={styles.emptyEggText}>{noticeUi.pageUnavailableText}</p>

            <div className={styles.emptyEggActions}>
              <Link to="/" className={styles.emptyEggBtn}>
                {noticeUi.backHome}
              </Link>
            </div>
          </article>
        </div>
      </section>
    );
  }

  /* ==================================================
     6) NORMAL / FALLBACK RENDER
     ================================================== */

  return (
    <section className={styles.projects}>
      <PageTitle text={label} color={color} />

      {hasFallback && (
        <div className={styles.notice} role="status" aria-live="polite">
          <strong>{noticeUi.pageFallbackTitle}</strong>
          <p>{noticeUi.pageFallbackText}</p>
        </div>
      )}

      <Filter
        lang={effectiveLang || askedLang}
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
            <ProjetCard key={project.id} project={project} lang={effectiveLang || askedLang} />
          ))
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
