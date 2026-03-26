import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { buildLangUrl, removeLanguage } from "../utils/pathManager";
import { resolveEffectiveLang } from "../guards/core/resolveEffectiveLang";

// ===== PROJECTS =====
import { PROJECTS_GUARD_RULES } from "../guards/page/projectsGuardRules";
import projectsBase from "../assets/traduction/projet/projects.base.json";
import projectsContentFr from "../assets/traduction/projet/projects.content.fr.json";
import projectsContentEn from "../assets/traduction/projet/projects.content.en.json";
import projectsContentRu from "../assets/traduction/projet/projects.content.ru.json";
import projectsUiFr from "../assets/traduction/projet/ui.fr.json";
import projectsUiEn from "../assets/traduction/projet/ui.en.json";
import projectsUiRu from "../assets/traduction/projet/ui.ru.json";

// ===== SKILLS =====
import { SKILLS_GUARD_RULES } from "../guards/page/skillsGuardRules";
import skillsFr from "../assets/traduction/skills/skills.fr.json";
import skillsEn from "../assets/traduction/skills/skills.en.json";
import skillsRu from "../assets/traduction/skills/skills.ru.json";

/* ---------- merge helper for projects ---------- */
const mergeById = (base = [], content = {}) =>
  base.map((item) => ({
    ...item,
    ...(content?.[item.id] || {}),
  }));

/* ---------- projects maps ---------- */
const PROJECTS_BY_LANG = {
  fr: mergeById(projectsBase, projectsContentFr),
  en: mergeById(projectsBase, projectsContentEn),
  ru: mergeById(projectsBase, projectsContentRu),
};

const PROJECTS_UI_BY_LANG = {
  fr: projectsUiFr,
  en: projectsUiEn,
  ru: projectsUiRu,
};

/* ---------- skills maps ---------- */
/*
  Pour Skills, chez toi il n’y a pas de séparation base/content/ui.
  Le même JSON sert à la fois de source content + UI pour le guard.
*/
const SKILLS_BY_LANG = {
  fr: skillsFr,
  en: skillsEn,
  ru: skillsRu,
};

const SKILLS_UI_BY_LANG = {
  fr: skillsFr,
  en: skillsEn,
  ru: skillsRu,
};

/* ---------- guard config ---------- */
const PAGE_GUARDS = {
  "/projects": {
    rules: PROJECTS_GUARD_RULES,
    contentByLang: PROJECTS_BY_LANG,
    uiByLang: PROJECTS_UI_BY_LANG,
    debugLabel: "Projects i18n",
  },
  "/skills": {
    rules: SKILLS_GUARD_RULES,
    contentByLang: SKILLS_BY_LANG,
    uiByLang: SKILLS_UI_BY_LANG,
    debugLabel: "Skills i18n",
  },
};

export default function ResolvedPageGuard() {
  const { lang } = useParams();
  const location = useLocation();

  // ex: "/fr/projects" -> "/projects"
  const logicalPath = removeLanguage(location.pathname);
  const pageGuard = PAGE_GUARDS[logicalPath];

  // pages sans règles spéciales
  if (!pageGuard) {
    return <Outlet />;
  }

  const result = resolveEffectiveLang({
    askedLang: lang,
    contentByLang: pageGuard.contentByLang,
    uiByLang: pageGuard.uiByLang,
    rules: pageGuard.rules,
    debugLabel: pageGuard.debugLabel,
  });

  const { effectiveLang, unavailable } = result;

  // on laisse la page afficher son propre état unavailable
  if (unavailable) {
    return <Outlet />;
  }

  // redirect AVANT le render de la page
  if (effectiveLang && effectiveLang !== lang) {
    const params = new URLSearchParams(location.search);
    params.set("from", lang);

    return (
      <Navigate
        to={buildLangUrl(effectiveLang, {
          pathname: location.pathname,
          search: `?${params.toString()}`,
          hash: location.hash,
        })}
        replace
      />
    );
  }

  return <Outlet />;
}
