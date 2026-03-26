export const PROJECTS_GUARD_RULES = {
  criticalContent: ["id", "title", "description", "stack", "image", "link"],
  nonCriticalContent: ["titleLogo", "color", "imageEffect", "slogan", "imageAlt"],

  criticalUI: [
    "preview",
    "tools",
    "visit",
    "seeMore",
    "seeSkills",
    "close",
    "flip",
    "flipBack",
    "empty.title",
    "empty.hint",
    "empty.showAll",
  ],
  nonCriticalUI: [],
};
