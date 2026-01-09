export const CATEGORIES = [
  { id: "markup", color: "#F8BBD0" },
  { id: "styles", color: "#B39DDB" },
  { id: "js", color: "#FFE082" },
  { id: "react", color: "#80DEEA" },
  { id: "state", color: "#CE93D8" },
  { id: "api", color: "#80CBC4" },
  { id: "a11y", color: "#A5D6A7" }, // Accessibilité + i18n + SEO
  { id: "tooling", color: "#B0BEC5" },
];

// Slugs projets ↔ libellés (utilisés pour les liens/puces)
export const PROJECTS = [
  { id: "ohmyfood", name: "OhMyFood" },
  { id: "kasa", name: "Kasa" },
  { id: "sophie-bluel", name: "Sophie Bluel" },
  { id: "argentbank", name: "Argent Bank" },
  { id: "nina-carducci", name: "Nina Carducci" },
  { id: "mon-projet", name: "Anastasia R." },
];

// Compétences (level 1–5) + rattachement aux pétales + projets où c’est utilisé
export const SKILLS = [
  { name: "HTML", cats: ["markup"], level: 4, projects: [] },
  { name: "SASS / SCSS", cats: ["styles"], level: 5, projects: ["ohmyfood", "kasa"] },
  {
    name: "CSS",
    cats: ["styles"],
    level: 4,
    projects: ["mon-projet", "sophie-bluel", "argentbank"],
  },

  {
    name: "Async / Promises",
    cats: ["js"],
    level: 3,
    projects: ["sophie-bluel", "argentbank", "kasa"],
  },
  {
    name: "React Hooks",
    cats: ["react"],
    level: 2,
    projects: ["argentbank", "kasa", "mon-projet"],
  },
  { name: "Redux Toolkit", cats: ["state", "react"], level: 2, projects: ["argentbank"] },

  {
    name: "REST / fetch",
    cats: ["api", "js"],
    level: 3,
    projects: ["sophie-bluel", "kasa", "argentbank"],
  },
  {
    name: "Auth (tokens)",
    cats: ["api", "js"],
    level: 3,
    projects: ["sophie-bluel", "argentbank"],
  },
  { name: "Swagger / OpenAPI", cats: ["api"], level: 3, projects: ["argentbank"] },
  { name: "Postman", cats: ["api"], level: 3, projects: ["argentbank"] },

  { name: "SEO", cats: ["a11y"], level: 3, projects: ["nina-carducci", "mon-projet"] },

  {
    name: "Vite (React)",
    cats: ["tooling"],
    level: 3,
    projects: ["mon-projet", "kasa", "argentbank"],
  },
  { name: "Git / GitHub", cats: ["tooling"], level: 2, projects: [] },
  {
    name: "VS Code",
    cats: ["tooling"],
    level: 2,
    projects: [],
  },
  { name: "Terminal (WSL)", cats: ["tooling"], level: 3, projects: [] },
];
