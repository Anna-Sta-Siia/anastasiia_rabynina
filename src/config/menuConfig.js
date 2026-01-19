// src/config/menuConfig.js
import { validateMenuConfig } from "./validateMenuConfig";

export const menuItems = [
  { key: "accueil", path: "/", color: "#fff5e1", showInMenu: false }, //il y a une route, mais pas visble en tant que Petal de la menu

  { key: "projects", path: "projects", color: "#F8BBD0" },
  { key: "skills", path: "skills", color: "#FFCC80" },
  { key: "contact", path: "contact", color: "#B0BEC5" },

  {
    key: "linkedin",
    path: "https://www.linkedin.com/in/anastasia-rabynina-139992312/",
    color: "#81D4FA",
  },
  {
    key: "github",
    path: "https://github.com/Anna-Sta-Siia",
    color: "#D1C4E9",
  },

  { key: "cv", path: "cv", color: "#bbf8c5" },
];
if (import.meta.env.DEV) {
  validateMenuConfig(menuItems, { mode: "warn" });
}
