import { useEffect, useRef, useState } from 'react';
import { useUI } from '../../context/UIContext';
import Petal from '../Petal';
import styles from './Menu.module.css';

import menuEn from '../../assets/traduction/menu/menu.en.json';
import menuFr from '../../assets/traduction/menu/menu.fr.json';
import menuRu from '../../assets/traduction/menu/menu.ru.json';

const labels = { en: menuEn, fr: menuFr, ru: menuRu };

const items = [
  { key: 'projects', path: '/projects', color: '#F8BBD0' },
  { key: 'services', path: '/services', color: '#FFF9C4' },
  { key: 'formation', path: '/formation', color: '#FFCC80' },
  { key: 'contact', path: '/contact', color: '#B0BEC5' },
  { key: 'linkedin', path: 'https://www.linkedin.com/in/anastasia-rabynina-139992312/', color: '#81D4FA' },
  { key: 'github', path: 'https://github.com/Anna-Sta-Siia', color: '#D1C4E9' },
  { key: 'cv', path: '/cv', color: '#bbf8c5' }
];

export default function Menu() {
  const { language } = useUI();
  const translated = labels[language] || labels.en;

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  const sliderRef = useRef(null);

  // Paramètres responsives (ajuste si besoin)
  const MIN_PETAL = 140;  // largeur mini souhaitée (px)
  const MAX_PETAL = 220;  // largeur maxi (px)
  const GAP = 16;         // espace horizontal entre pétales (px)

  // 🔄 Défilement automatique (carrousel infini)
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setFade(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ↔️ Clics manuels
  const handleScroll = (direction) => {
    setFade(true);
    setTimeout(() => {
      setIndex((prev) =>
        direction === 'right'
          ? (prev + 1) % items.length
          : (prev - 1 + items.length) % items.length
      );
      setFade(false);
    }, 300);
  };

  // 📏 Calcule nb de pétales + largeur/hauteur exactes (sans doublons)
  useEffect(() => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;

    const update = () => {
      const W = el.clientWidth;
      if (!W) return;

      // Combien tiennent si on respecte MIN_PETAL (gaps compris) ?
      const countByMin = Math.floor((W + GAP) / (MIN_PETAL + GAP));
      // ❗️Pas plus que le nombre d’items pour éviter les doublons
      const count = Math.max(1, Math.min(countByMin, items.length));
      setVisibleCount(count);

      // Largeur exacte pour remplir la ligne proprement
      const petalW = Math.min(
        MAX_PETAL,
        Math.floor((W - GAP * (count - 1)) / count)
      );
      // Hauteur proportionnelle à la largeur → évite l’effet “galette”
      const petalH = Math.round(Math.max(40, Math.min(64, petalW * 0.38)));

      el.style.setProperty('--petal-w', `${petalW}px`);
      el.style.setProperty('--petal-h', `${petalH}px`);
      el.style.setProperty('--petal-gap', `${GAP}px`);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.arrow}
        onClick={() => handleScroll('left')}
        aria-label="Précédent"
      >
        ◀
      </button>

      <div
        ref={sliderRef}
        className={`${styles.slider} ${fade ? styles.fade : ''}`}
        role="list"
        aria-label="Menu principal"
      >
        {Array.from({ length: visibleCount }).map((_, i) => {
          const item = items[(index + i) % items.length];
          return (
            <Petal
              key={`${item.key}-${i}`} // clé unique dans la fenêtre rendue
              name={translated[item.key] || item.key}
              path={item.path}
              color={item.color}
            />
          );
        })}
      </div>

      <button
        className={styles.arrow}
        onClick={() => handleScroll('right')}
        aria-label="Suivant"
      >
        ▶
      </button>
    </div>
  );
}
