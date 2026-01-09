// src/pages/Accueil/index.jsx
import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useUI } from "../../context";

import medallionBack from "../../assets/images/medaillon_back.webp";
import portrait from "../../assets/images/AnastasiaGirard.webp";
import aboutFr from "../../assets/traduction/about/about.fr.json";
import aboutEn from "../../assets/traduction/about/about.en.json";
import aboutRu from "../../assets/traduction/about/about.ru.json";

import About from "../../components/About";
import styles from "./Accueil.module.css";

export default function Accueil({ phase, onFinish }) {
  const { language } = useUI();

  const about = useMemo(
    () => ({ fr: aboutFr, en: aboutEn, ru: aboutRu }[language] ?? aboutEn),
    [language]
  );

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  // 1 раз за сессию
  const [played, setPlayed] = useState(() => sessionStorage.getItem("hasPlayedOnce") === "true");
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const already = sessionStorage.getItem("hasPlayedOnce") === "true";
    setPlayed(already);

    if (phase === "medallion" && already) {
      setFlipped(true);
      onFinish?.();
      return;
    }

    if (phase === "medallion" && !already) {
      const t1 = setTimeout(() => setFlipped(true), 500);
      const t2 = setTimeout(() => {
        sessionStorage.setItem("hasPlayedOnce", "true");
        setPlayed(true);
        onFinish?.();
      }, 2500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    if (phase === "app") setFlipped(true);
  }, [phase, onFinish]);

  const shouldAnimate = phase === "medallion" && !played;
  const opened = phase === "app" || played || flipped;

  // Поза "закрыто" и "открыто" — строго под текущую ось
  const closedPose = isMobile ? { rotateX: 0 } : { rotateY: 0 };
  const openPose = isMobile ? { rotateX: -180 } : { rotateY: -180 };

  // ВАЖНО: initial должен совпадать с текущим opened, чтобы при remount (после resize)
  // не показывать крышку на долю секунды
  const initialPose = opened ? openPose : closedPose;

  // Ключ: при смене mobile/desktop медальон пересоздаётся, и 3D-ось не ломает face
  const axisKey = isMobile ? "medallion-mobile" : "medallion-desktop";
  const axisClass = isMobile ? styles.mobile : styles.desktop;

  return (
    <section className={styles.accueil}>
      <div className={styles.duo}>
        <Motion.div
          key={axisKey}
          className={`${styles.medallion} ${axisClass}`}
          initial={initialPose}
          animate={opened ? openPose : closedPose}
          transition={shouldAnimate ? { duration: 1.8, ease: "easeInOut" } : { duration: 0 }}
        >
          <div className={styles.front}>
            <img
              src={medallionBack}
              alt={about.alt.medallionBack}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          <div className={styles.back}>
            <img
              src={portrait}
              alt={about.alt.portrait}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />

            {/* Нежный перелив — только после первого визита */}
            {played && <div className={styles.medallionShimmer} aria-hidden />}
          </div>
        </Motion.div>

        <About />
      </div>
    </section>
  );
}
