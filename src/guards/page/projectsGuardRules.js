export const PROJECTS_GUARD_RULES = {
  content: {
    critical: ["id", "title", "description", "stack", "image", "link"],
    nonCritical: ["titleLogo", "color", "imageEffect", "slogan", "imageAlt"],
  },

  ui: {
    critical: [
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
    nonCritical: [],
  },
};
