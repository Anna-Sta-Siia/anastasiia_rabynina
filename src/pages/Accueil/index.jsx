import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useUI } from '../../context';


import medallionBack from '../../assets/images/medaillon_back.webp';
import portrait from '../../assets/images/AnastasiaGirard.png';
import aboutFr from '../../assets/traduction/about/about.fr.json';
import aboutEn from '../../assets/traduction/about/about.en.json';
import aboutRu from '../../assets/traduction/about/about.ru.json';

import About from '../../components/About';
import styles from './Accueil.module.css';

export default function Accueil({ phase, onFinish }) {
  const { language } = useUI();
  const [flipped, setFlipped] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const translations = { fr: aboutFr, en: aboutEn, ru: aboutRu };
  const about = translations[language] || aboutEn;

  // 🔁 Détection responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🎬 Lecture unique de l’anim
  useEffect(() => {
    const alreadyPlayed = sessionStorage.getItem('hasPlayedOnce') === 'true';
    setHasPlayedOnce(alreadyPlayed);

    if (phase === 'medallion' && !alreadyPlayed) {
      const t1 = setTimeout(() => setFlipped(true), 500);
      const t2 = setTimeout(() => {
        onFinish?.();
        setHasPlayedOnce(true);
        sessionStorage.setItem('hasPlayedOnce', 'true');
      }, 2500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (phase === 'medallion' && alreadyPlayed) onFinish?.();
  }, [phase, onFinish]);

  // ✅ Осмысленные состояния анимации
  const opened = flipped || hasPlayedOnce || phase === 'app';
  const animate = isMobile
    ? { rotateX: opened ? 180 : 0 }
    : { rotateY: opened ? -180 : 0 };

  // ✅ initial = 0 на нужной оси, чтобы не было «вспышки задника»
  const initial = isMobile ? { rotateX: 0 } : { rotateY: 0 };

  // ✅ Класс для выбора правильной оси в CSS (см. чек‑лист ниже)
  const axisClass = isMobile ? styles.mobile : styles.desktop;

  return (
    <section className={styles.accueil}>
      <Motion.div
        className={`${styles.medallion} ${axisClass}`}
        initial={initial}
        animate={animate}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
      >
        <div className={styles.front}>
          <img src={medallionBack} alt={about.alt.medallionBack} />
        </div>
        <div className={styles.back}>
          <img src={portrait} alt={about.alt.portrait} />
        </div>
      </Motion.div>

      <About />
    </section>
  );
}