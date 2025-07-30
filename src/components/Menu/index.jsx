import { useEffect, useRef, useState } from 'react';
import { useUI } from '../../context/UIContext';
import LapotImg from '../LapotImg';
import styles from './Menu.module.css';

import menuEn from '../../assets/traduction/menu/menu.en.json';
import menuFr from '../../assets/traduction/menu/menu.fr.json';
import menuRu from '../../assets/traduction/menu/menu.ru.json';

const labels = { en: menuEn, fr: menuFr, ru: menuRu };

const items = [
  { key: 'projects', path: '/projects' },
  { key: 'services', path: '/services' },
  { key: 'formation', path: '/formation' },
  { key: 'contact', path: '/contact' },
  { key: 'linkedin', path: 'https://www.linkedin.com/in/anastasia-rabynina-139992312/' },
  { key: 'github', path: 'https://github.com/Anna-Sta-Siia' },
  { key: 'cv', path: '/cv' }
];

export default function Menu() {
  const { language } = useUI();
  const translated = labels[language] || labels.en;

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);   // триггер «шажка»
  const [visibleCount, setVisibleCount] = useState(3);
  const [dir, setDir] = useState('right');   // 'left' | 'right'

  const sliderRef = useRef(null);

  // параметры адаптации
  const MIN_TAB = 150;
  const MAX_TAB = 280;
  const GAP = 14;

  // автопрокрутка — по умолчанию вправо
  useEffect(() => {
    const interval = setInterval(() => {
      setDir('right');
      setFade(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setFade(false);
      }, 240);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // клики по стрелкам
  const handleScroll = (direction) => {
    setDir(direction);
    setFade(true);
    setTimeout(() => {
      setIndex((prev) =>
        direction === 'right'
          ? (prev + 1) % items.length
          : (prev - 1 + items.length) % items.length
      );
      setFade(false);
    }, 220);
  };

  // расчёт количества и размеров (без дублей)
  useEffect(() => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;

    const update = () => {
      const W = el.clientWidth;
      if (!W) return;

      const countByMin = Math.floor((W + GAP) / (MIN_TAB + GAP));
      const count = Math.max(1, Math.min(countByMin, items.length));
      setVisibleCount(count);

      const tabW = Math.min(MAX_TAB, Math.floor((W - GAP * (count - 1)) / count));
      const tabH = Math.round(Math.max(46, Math.min(76, tabW * 0.36)));

      el.style.setProperty('--tab-w', `${tabW}px`);
      el.style.setProperty('--tab-h', `${tabH}px`);
      el.style.setProperty('--tab-gap', `${GAP}px`);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={styles.wrapper}>
      <button className={styles.arrow} onClick={() => handleScroll('left')} aria-label="Назад">◀</button>

      <div
        ref={sliderRef}
        className={`${styles.slider} ${fade ? styles.fade : ''}`}
        role="list"
        aria-label="Главное меню"
      >
        {Array.from({ length: visibleCount }).map((_, i) => {
          const item = items[(index + i) % items.length];
          const name = translated[item.key] || item.key;
          const pose = ((index + i) % 2 === 0) ? 'up' : 'down'; // чередуем базовый наклон
          return (
            <LapotImg
              key={`${item.key}-${i}`}
              name={name}
              path={item.path}
              dir={dir}        // направление шага/взгляда
              pose={pose}      // базовый наклон
              stepping={fade}  // короткий «шажок»
            />
          );
        })}
      </div>

      <button className={styles.arrow} onClick={() => handleScroll('right')} aria-label="Вперёд">▶</button>
    </div>
  );
}
