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
  const petalRef = useRef(null); // pour mesurer un Petal

  // 🔄 défilement automatique
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

  // ↔️ gestion clics manuels
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

  // calcule combien de pétales peuvent tenir dans le container
  useEffect(() => {
    function updateVisibleCount() {
      const containerWidth = sliderRef.current?.offsetWidth;
      const petalWidth = petalRef.current?.offsetWidth;

      if (containerWidth && petalWidth) {
        const count = Math.floor(containerWidth / petalWidth);
        setVisibleCount(count || 1);
      }
    }

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  return (
    <div className={styles.wrapper}>
      <button className={styles.arrow} onClick={() => handleScroll('left')}>◀</button>
      
      <div ref={sliderRef} className={`${styles.slider} ${fade ? styles.fade : ''}`}>
        {Array(visibleCount).fill(0).map((_, i) => {
          const item = items[(index + i) % items.length];
          return (
            <Petal
              ref={i === 0 ? petalRef : null} // juste le premier pour mesurer
              key={item.key}
              name={translated[item.key] || item.key}
              path={item.path}
              color={item.color}
            />
          );
        })}
      </div>

      <button className={styles.arrow} onClick={() => handleScroll('right')}>▶</button>
    </div>
  );
}
