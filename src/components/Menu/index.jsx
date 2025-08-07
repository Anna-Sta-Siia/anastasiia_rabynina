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
  const [visibleCount, setVisibleCount] = useState(2);

  const sliderRef = useRef(null);// pour mesurer le Slider
  const petalRef = useRef(null); // pour mesurer un Petal

  // 🔁 sens de l'auto-défilement: +1 = suivant (par défaut), -1 = précédent
  const [dir, setDir] = useState(+1);
  const dirRef = useRef(dir);
  useEffect(() => { dirRef.current = dir; }, [dir]);

  // 🔒 anti-chevauchement + timers
  const isAnimatingRef = useRef(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const resumeTimeoutRef = useRef(null); // ← nouveau: timer de reprise différée

  const FADE_MS = 400;     // durée du fondu
  const AUTO_MS = 6000;    // période souhaitée entre deux steps automatiques
  const RESUME_AFTER = 2000; // ← reprise 2s après avoir quitté le slider ou aprés le clicl manuel

   function startAuto() {
  clearInterval(intervalRef.current);
  intervalRef.current = setInterval(() => step(dirRef.current), AUTO_MS);
}

function stopAuto() {
  clearInterval(intervalRef.current);
  intervalRef.current = null;
}

function pauseAuto() {
  // stop net, et on annule une reprise déjà programmée
  stopAuto();
  clearTimeout(resumeTimeoutRef.current);
}

function resumeAutoDelayed() {
  // programme une reprise dans 2s (ou annule/reprogramme si re‑entrée)
  clearTimeout(resumeTimeoutRef.current);
  resumeTimeoutRef.current = setTimeout(() => {
    startAuto();
  }, RESUME_AFTER);
}

  // —— STEP unique (utilisé par auto + clics)
  function step(delta) {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setFade(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIndex(prev => (prev + delta + items.length) % items.length);
      setFade(false);
      isAnimatingRef.current = false;
    }, FADE_MS); 
  }
   
  // 🔄 auto-défilement — démarre au chargement, suit le dernier sens choisi
  useEffect(() => {
    function start() {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => step(dirRef.current), AUTO_MS);
    }
    function stop() {
      clearInterval(intervalRef.current);
    }
    start();
    return () => { stop(); clearTimeout(resumeTimeoutRef.current);clearTimeout(timeoutRef.current);};
  }, []);

  // ↔️ clics manuels : on change le sens, on step tout de suite, puis on relance l’auto
  const handleScroll = (which) => {
  const delta = which === 'right' ? +1 : -1;
  setDir(delta);
  pauseAuto();          // on stoppe net
  step(delta);          // on bouge tout de suite
  resumeAutoDelayed();  // et on re-programme la reprise (2s)
};

  // calcule combien de pétales peuvent tenir dans le container
  useEffect(() => {
    function updateVisibleCount() {
    const container = sliderRef.current;
    const petal = petalRef.current;
    if (!container || !petal) return;

    const containerWidth = container.clientWidth; // largeur utile (padding inclus)
    const petalRect = petal.getBoundingClientRect();
    const petalWidth = petalRect.width; // sans marges (normal, on est au gap)

    const styles = window.getComputedStyle(container);
    // pour flex en row, la distance horizontale = column-gap (et gap)
    const gap =
      parseFloat(styles.columnGap || styles.gap || '0') || 0;

    // N éléments ont (N-1) gaps -> on fait l'astuce (W + gap) / (w + gap)
    const count = Math.max(1, Math.floor((containerWidth + gap) / (petalWidth + gap)));
    setVisibleCount(count);
  }

  updateVisibleCount();
  const ro = new ResizeObserver(updateVisibleCount);
  if (sliderRef.current) ro.observe(sliderRef.current);
  window.addEventListener('resize', updateVisibleCount);
  return () => {
    ro.disconnect();
    window.removeEventListener('resize', updateVisibleCount);
    
  };
}, []);
// ✅ Détection des capacités du pointeur (souris vs tactile)
// (protégé pour éviter les erreurs si jamais SSR)
  const canHover =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  return (
    <div className={styles.wrapper}>
      {/* ⬅️ = SUIVANT (+1) → et l’auto continue ensuite dans ce sens */}
      <button className={styles.arrow} onClick={() => handleScroll('right')}>◀</button>

      <div
  ref={sliderRef}
  className={`${styles.slider} ${fade ? styles.fade : ''}`}

  // 🖱️ Souris uniquement (évite le yoyo côté touch)
  onMouseEnter={canHover ? pauseAuto : undefined}
  onMouseLeave={canHover ? resumeAutoDelayed : undefined}

  // 👆 Tactile / pointeur générique : arrêt au contact, reprise différée
  onPointerDown={!canHover ? pauseAuto : undefined}
  onPointerUp={!canHover ? resumeAutoDelayed : undefined}

  // ⌨️ Clavier (accessibilité)
  onFocus={pauseAuto}
  onBlur={resumeAutoDelayed}
>
        {Array(visibleCount).fill(0).map((_, i) => {
          const item = items[(index + i) % items.length];
          return (
            <Petal
              ref={i === 0 ? petalRef : null} // juste le premier pour mesurer
              key={`${item.key}-${i}`}        // clé plus stable
              name={translated[item.key] || item.key}
              path={item.path}
              color={item.color}
            />
          );
        })}
      </div>

      {/* ➡️ = PRÉCÉDENT (-1) → et l’auto continue ensuite dans ce sens */}
      <button className={styles.arrow} onClick={() => handleScroll('left')}>▶</button>
    </div>
  );
}
