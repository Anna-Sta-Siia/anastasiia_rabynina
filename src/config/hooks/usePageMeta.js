import { useLocation } from "react-router-dom";
import { menuItems } from "../menuConfig";
import { normalizePath, removeLanguage } from "../../utils/pathManager";

import menuEn from "../../assets/traduction/menu/menu.en.json";
import menuFr from "../../assets/traduction/menu/menu.fr.json";
import menuRu from "../../assets/traduction/menu/menu.ru.json";

const labels = { en: menuEn, fr: menuFr, ru: menuRu };

export function usePageMeta(lang = "fr") {
  const { pathname } = useLocation();

  const p = normalizePath(removeLanguage(pathname));

  const routeItems = menuItems.filter(
    (it) => typeof it.path === "string" && !it.path.startsWith("http"),
  );

  const current =
    routeItems
      .slice()
      .sort((a, b) => normalizePath(b.path).length - normalizePath(a.path).length)
      .find((it) => {
        const ip = normalizePath(it.path);
        return p === ip || (ip !== "/" && p.startsWith(`${ip}/`));
      }) ||
    routeItems.find((it) => normalizePath(it.path) === "/") ||
    routeItems[0];

  const key = current?.key ?? "accueil";
  console.log(current.key);
  const color = current?.color ?? "#fff5e1";
  const label = labels[lang]?.[key] || key;

  return { key, color, label };
}
