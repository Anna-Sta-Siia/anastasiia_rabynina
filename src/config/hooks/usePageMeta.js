// src/config/hooks/usePageMeta.js
import { useLocation } from "react-router-dom";
import { useUI } from "../../context";
import { menuItems } from "../menuConfig";
import { normalizePath, removeLanguage } from "../../utils/pathManager";

import menuEn from "../../assets/traduction/menu/menu.en.json";
import menuFr from "../../assets/traduction/menu/menu.fr.json";
import menuRu from "../../assets/traduction/menu/menu.ru.json";

const labels = { en: menuEn, fr: menuFr, ru: menuRu };

export function usePageMeta() {
  const { pathname } = useLocation();
  const { language } = useUI();

  let p = removeLanguage(pathname);

  // on ne laisse que les routes internes
  const routeItems = menuItems.filter(
    (it) => typeof it.path === "string" && !it.path.startsWith("http")
  );

  const current =
    routeItems
      .slice()
      .sort((a, b) => normalizePath(b.path).length - normalizePath(a.path).length) //on trie selon le niveau de la specificité/imrification/actuellment on n'en pas besoin, car toutes les routes sont de niveau , mais pour la perspective c'est indispensable
      .find((it) => {
        const ip = normalizePath(it.path);
        return p === ip || p.startsWith(`${ip}/`);
      }) ||
    routeItems.find((it) => normalizePath(it.path) === "/") || //le cas de la page d'accueil
    routeItems[0]; //le cas de la page d'accueil

  const key = current?.key ?? "accueil";
  const color = current?.color ?? "#fff5e1";
  const label = labels[language]?.[key] || key;

  return { key, color, label };
}
