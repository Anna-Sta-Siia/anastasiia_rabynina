import { useMemo, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useUI } from "../../context";
import { useDisplayLang } from "../../hooks/useDisplayLang";

import PageTitle from "../../components/PageTitle";
import Filter from "../../components/Filter";
import LevelSlider from "../../components/LevelSlider";
import SkillCard from "../../components/SkillCard";
import FallbackNotice from "../../components/FallbackNotice";

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

  // Язык, который реально хотел пользователь
  // Если страница открыта через fallback, берём from
  const requestedLang = searchParams.get("from") || askedLang;

  // fallback есть, если в URL присутствует from
  const showFallback = searchParams.has("from");

  // notice показываем на языке запроса пользователя
  const noticeUi = GENERAL_BY_LANG[requestedLang] || GENERAL_BY_LANG.fr;

  const { label, color } = usePageMeta();

  const tPack = useMemo(() => {
    return SKILLS_BY_LANG[displayLang] || SKILLS_BY_LANG.fr;
  }, [displayLang]);

  const tSkills = useMemo(() => {
    return tPack.skills || {};
  }, [tPack]);

  /* ---------------- Локализованные названия категорий ---------------- */
  const catsLabels = useMemo(() => tSkills.cats || {}, [tSkills]);

  /* ---------------- URL (?only=slug) ---------------- */
  const projectOnly = (searchParams.get("only") || "").trim();

  /* ---------------- Цвета и человеческие названия ---------------- */
  const catsColors = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color])), []);

  const projectNames = useMemo(() => Object.fromEntries(PROJECTS.map((p) => [p.id, p.name])), []);

  /* ---------------- Подмножество по ?only= ---------------- */
  const usedByProject = useMemo(() => {
    if (!projectOnly) return SKILLS;

    return SKILLS.filter((s) => {
      const ps = Array.isArray(s.projects) ? s.projects : [];
      return ps.length === 0 || ps.includes(projectOnly);
    });
  }, [projectOnly]);

  /* ---------------- Начальные категории, если есть ?only= ---------------- */
  const initialCats = useMemo(() => {
    if (!projectOnly) return [];

    const set = new Set();

    for (const s of usedByProject) {
      (s.cats || []).forEach((c) => set.add(c));
    }

    return [...set];
  }, [projectOnly, usedByProject]);

  /* ---------------- Локальное состояние фильтров ---------------- */
  const [query, setQuery] = useState({
    filters: initialCats,
    search: "",
    sort: "",
    mode: "or",
  });

  useEffect(() => {
    setQuery((q) => ({ ...q, filters: initialCats }));
  }, [initialCats]);

  /* ---------------- Финальный список ---------------- */
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

  /* ---------------- Items для Filter ---------------- */
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

  return (
    <section className={styles.skills}>
      <PageTitle text={label} color={color} />

      {showFallback && (
        <FallbackNotice title={noticeUi.pageFallbackTitle} text={noticeUi.pageFallbackText}>
          {noticeUi.pageFallbackHint}
        </FallbackNotice>
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
