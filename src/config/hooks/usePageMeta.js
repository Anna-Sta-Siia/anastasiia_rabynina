// src/config/hooks/usePageMeta.js
import { useLocation } from 'react-router-dom';
import { useUI } from '../../context';
import menuItems from '../menuConfig';

import menuEn from '../../assets/traduction/menu/menu.en.json';
import menuFr from '../../assets/traduction/menu/menu.fr.json';
import menuRu from '../../assets/traduction/menu/menu.ru.json';

const labels = { en: menuEn, fr: menuFr, ru: menuRu };

export function usePageMeta() {
  const { pathname } = useLocation();
  const { language } = useUI();

  // Ne garder que les routes internes
  const routeItems = menuItems.filter(it => typeof it.path === 'string' && it.path.startsWith('/'));

  // ====> le plus long préfixe gagnant
  const current =
    routeItems
      .slice()
      .sort((a, b) => b.path.length - a.path.length)
      .find(it => pathname === it.path || pathname.startsWith(`${it.path}/`))
    || routeItems.find(it => it.path === '/')
    || routeItems[0];

  const key   = current?.key ?? 'accueil';
  const color = current?.color ?? '#eee';
  const label = labels[language]?.[key] || key;

  return { key, color, label };
}
