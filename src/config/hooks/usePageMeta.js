// src/hooks/usePageMeta.js
import { useLocation } from 'react-router-dom';
import { useUI } from '../../context'
import menuItems from '../menuConfig';

import menuEn from '../../assets/traduction/menu/menu.en.json';
import menuFr from '../../assets/traduction/menu/menu.fr.json';
import menuRu from '../../assets/traduction/menu/menu.ru.json';

const labels = { en: menuEn, fr: menuFr, ru: menuRu };

export function usePageMeta() {
  const { pathname } = useLocation();
  const { language } = useUI();

  const current = menuItems.find(item =>
    !item.path.startsWith('http') && pathname.startsWith(item.path)
  );

  const key = current?.key;
  const color = current?.color || '#eee';
  const label = labels[language]?.[key] || key || '...';

  return { key, color, label };
}
