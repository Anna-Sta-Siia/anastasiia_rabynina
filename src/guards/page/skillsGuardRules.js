// src/guards/page/skillsGuardRules.js
import { CATEGORIES } from "../../assets/traduction/skills/data";

const categoryKeys = CATEGORIES.map((c) => `skills.cats.${c.id}`);

export const SKILLS_GUARD_RULES = {
  criticalContent: [
    "skills.title",
    "skills.info",
    "skills.levelFilterLabel",
    "skills.chooseLevelHint",
    "skills.screenreader",
    "skills.levels.beginner",
    "skills.levels.intermediate",
    "skills.levels.advanced",
    "skills.levels.expert",
    ...categoryKeys,
  ],
};
