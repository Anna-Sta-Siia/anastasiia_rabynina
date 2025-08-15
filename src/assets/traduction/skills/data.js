export const CATEGORIES = [
  { id: "markup", color: "#F8BBD0" },
  { id: "styles", color: "#B39DDB" },
  { id: "js", color: "#FFE082" },
  { id: "react", color: "#80DEEA" },
  { id: "state", color: "#CE93D8" },
  { id: "api", color: "#80CBC4" },
  { id: "a11y", color: "#A5D6A7" },
  { id: "tooling", color: "#B0BEC5" },
];

// Твои слоги проектов — чтобы связать навыки и сделать фильтр по проектам
export const PROJECTS = [
  { id: "ohmyfood", name: "OhMyFood" },
  { id: "kasa", name: "Kasa" },
  { id: "sophie-bluel", name: "Sophie Bluel" },
  { id: "mon-projet", name: "mon projet" },
  { id: "argentbank", name: "Argentbank" },
  { id: "nina-carducci", name: "Nina Carducci" },
];

export const SKILLS = [
  { name: "Semantic HTML", cats: ["markup"], level: 5, projects: ["ohmyfood"] },
  { name: "SASS / SCSS", cats: ["styles"], level: 5, projects: ["ohmyfood", "sophie-bluel"] },
  { name: "CSS Grid/Flex", cats: ["styles"], level: 5, projects: [] },
  {
    name: "ES Modules / Async",
    cats: ["js"],
    level: 4,
    projects: ["sophie-bluel", "argentbank", "kasa"],
  },
  {
    name: "React Hooks",
    cats: ["react"],
    level: 4,
    projects: ["argentbank", "kasa", "mon-projet"],
  },
  { name: "Redux Toolkit", cats: ["state", "react"], level: 4, projects: ["argentbank"] },
  { name: "react-hook-form", cats: ["state"], level: 4, projects: ["contact"] },
  {
    name: "REST / fetch",
    cats: ["api", "js"],
    level: 4,
    projects: ["sophie-bluel", "kasa", "argentbank"],
  },
  { name: "Auth (tokens)", cats: ["api"], level: 3, projects: ["sophie-bluel", "argentbank"] },
  { name: "i18next", cats: ["a11y"], level: 4, projects: ["mon-projet"] },
  { name: "SEO ", cats: ["a11y"], level: 3, projects: ["nina-carducci", "mon-projet"] },
  {
    name: "React Vite",
    cats: ["tooling"],
    level: 5,
    projects: ["mon-projet", "kasa", "argentbank"],
  },
  { name: "Git / GitHub", cats: ["tooling"], level: 5, projects: [] },
];
