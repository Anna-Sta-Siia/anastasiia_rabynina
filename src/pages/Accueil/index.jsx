import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../../context/UIContext';

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
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🎬 Contrôle de l’animation
  useEffect(() => {
    const alreadyPlayed = sessionStorage.getItem('hasPlayedOnce') === 'true';
    setHasPlayedOnce(alreadyPlayed);

    if (phase === 'medallion' && !alreadyPlayed) {
      setTimeout(() => setFlipped(true), 500);
      setTimeout(() => {
        onFinish?.();
        setHasPlayedOnce(true);
        sessionStorage.setItem('hasPlayedOnce', 'true');
      }, 2500);
    } else if (phase === 'medallion' && alreadyPlayed) {
      onFinish?.(); // déjà joué — on enchaîne
    }
  }, [phase, onFinish]);

  // 🌀 Rotation adaptée à l’écran
  const animate = isMobile
    ? { rotateX: flipped || hasPlayedOnce || phase === 'app' ? 180 : 0 }
    : { rotateY: flipped || hasPlayedOnce || phase === 'app' ? -180 : 0 };

  return (
    <section className={styles.accueil}>
      <motion.div
        className={styles.medallion}
        animate={animate}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
      >
        <div className={styles.front}>
          <img src={medallionBack} alt={about.alt.medallionBack} />
        </div>
        <div className={styles.back}>
          <img src={portrait} alt={about.alt.portrait} />
        </div>
      </motion.div>
      <About />
    </section>
  );
}
