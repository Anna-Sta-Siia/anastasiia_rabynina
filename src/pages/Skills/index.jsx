import { useMemo, useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useUI } from "../../context";
import { SKILLS_GUARD_RULES } from "../../guards/page/skillsGuardRules";
import { resolveEffectiveLang } from "../../guards/core/resolveEffectiveLang";
import { useDisplayLang } from "../../hooks/useDisplayLang";

import PageTitle from "../../components/PageTitle";
import Filter from "../../components/Filter";
import LevelSlider from "../../components/LevelSlider";
import SkillCard from "../../components/SkillCard";

import { SKILLS, CATEGORIES, PROJECTS } from "../../assets/traduction/skills/data";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import styles from "./Skills.module.css";

// Content Skills
import skillsFR from "../../assets/traduction/skills/skills.fr.json";
import skillsEN from "../../assets/traduction/skills/skills.en.json";
import skillsRU from "../../assets/traduction/skills/skills.ru.json";

// General notices
import generalFr from "../../assets/traduction/general/general.fr.json";
import generalEn from "../../assets/traduction/general/general.en.json";
import generalRu from "../../assets/traduction/general/general.ru.json";

const SKILLS_BY_LANG = {
  fr: skillsFR,
  en: skillsEN,
  ru: skillsRU,
};

const SKILLS_UI_BY_LANG = {
  fr: skillsFR,
  en: skillsEN,
  ru: skillsRU,
};

const GENERAL_BY_LANG = {
  fr: generalFr,
  en: generalEn,
  ru: generalRu,
};

export default function Skills() {
  const { askedLang } = useUI();
  const displayLang = useDisplayLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const [minLevel, setMinLevel] = useState(1);
  const [showFilterHint, setShowFilterHint] = useState(false);

  // langue demandée avant fallback
  const requestedLang = searchParams.get("from") || displayLang;
  const showFallback = requestedLang !== displayLang;

  const noticeUi = GENERAL_BY_LANG[requestedLang] || GENERAL_BY_LANG.fr;

  /* ==================================================
     1) GUARD RESULT (sans redirect ici)
  ================================================== */
  const guardResult = useMemo(() => {
    return resolveEffectiveLang({
      askedLang: askedLang,
      contentByLang: SKILLS_BY_LANG,
      uiByLang: SKILLS_UI_BY_LANG,
      rules: SKILLS_GUARD_RULES,
      debugLabel: "Skills i18n",
    });
  }, [askedLang]);

  const { unavailable } = guardResult;

  const { label, color } = usePageMeta();

  const tPack = useMemo(() => {
    return SKILLS_BY_LANG[displayLang] || SKILLS_BY_LANG.fr;
  }, [displayLang]);

  const tSkills = useMemo(() => {
    return tPack.skills || {};
  }, [tPack]);

  /* ---------------- Libellés localisés des catégories ---------------- */
  const catsLabels = useMemo(() => tSkills.cats || {}, [tSkills]);

  /* ---------------- URL (?only=slug) ---------------- */
  const projectOnly = (searchParams.get("only") || "").trim();

  /* ---------------- Couleurs et noms humains ---------------- */
  const catsColors = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color])), []);

  const projectNames = useMemo(() => Object.fromEntries(PROJECTS.map((p) => [p.id, p.name])), []);

  /* ---------------- Sous-ensemble piloté par ?only= ---------------- */
  const usedByProject = useMemo(() => {
    if (!projectOnly) return SKILLS;

    return SKILLS.filter((s) => {
      const ps = Array.isArray(s.projects) ? s.projects : [];
      return ps.length === 0 || ps.includes(projectOnly);
    });
  }, [projectOnly]);

  /* ---------------- Catégories initiales si ?only= ---------------- */
  const initialCats = useMemo(() => {
    if (!projectOnly) return [];

    const set = new Set();

    for (const s of usedByProject) {
      (s.cats || []).forEach((c) => set.add(c));
    }

    return [...set];
  }, [projectOnly, usedByProject]);

  /* ---------------- État local des filtres ---------------- */
  const [query, setQuery] = useState({
    filters: initialCats,
    search: "",
    sort: "",
    mode: "or",
  });

  useEffect(() => {
    setQuery((q) => ({ ...q, filters: initialCats }));
  }, [initialCats]);

  /* ---------------- Liste finale ---------------- */
  const filteredSkills = useMemo(() => {
    const { filters, mode } = query;
    let list = usedByProject;

    if (filters.length) {
      list = list.filter((s) => {
        const has = (c) => (s.cats || []).includes(c);
        return mode === "and" ? filters.every(has) : filters.some(has);
      });
    }

    list = list.filter((s) => {
      const lvl = typeof s.level === "number" ? s.level : 1;
      return lvl >= minLevel;
    });

    return list;
  }, [query, usedByProject, minLevel]);

  /* ---------------- Callback Filter ---------------- */
  const handleFilterChange = useCallback(
    (payload) => {
      setQuery(payload);

      if (!payload.filters.length && !payload.search && !payload.sort && projectOnly) {
        const next = new URLSearchParams(searchParams);
        next.delete("only");
        setSearchParams(next, { replace: true });
      }
    },
    [projectOnly, searchParams, setSearchParams],
  );

  /* ---------------- Items de Filter ---------------- */
  const filterItems = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        key: c.id,
        color: c.color,
        label: catsLabels[c.id]?.trim() || c.id,
      })),
    [catsLabels],
  );

  function handleFirstFilterInteraction() {
    if (sessionStorage.getItem("skills-filters-hint-seen")) return;

    sessionStorage.setItem("skills-filters-hint-seen", "1");
    setShowFilterHint(true);
  }

  useEffect(() => {
    if (!showFilterHint) return;

    const timer = setTimeout(() => {
      setShowFilterHint(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showFilterHint]);

  /* ==================================================
     2) UNAVAILABLE STATE
  ================================================== */
  if (unavailable) {
    return (
      <section className={styles.skills}>
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
     3) NORMAL / FALLBACK RENDER
  ================================================== */
  return (
    <section className={styles.skills}>
      <PageTitle text={label} color={color} />

      {showFallback && (
        <div className={styles.notice} role="status" aria-live="polite">
          <strong>{noticeUi.pageFallbackTitle}</strong>
          <p>{noticeUi.pageFallbackText}</p>
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
          lang={displayLang}
          items={filterItems}
          defaultMode="or"
          onChange={handleFilterChange}
          defaultSelected={initialCats}
          searchToolsRow={false}
        />

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
            lang={displayLang}
            askedLang={askedLang}
          />
        ))}
      </div>
    </section>
  );
}
