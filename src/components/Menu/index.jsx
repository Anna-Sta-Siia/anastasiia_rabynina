import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUI } from "../../context";
import Petal from "../Petal/PetalMenu";
import styles from "./Menu.module.css";

import menuEn from "../../assets/traduction/menu/menu.en.json";
import menuFr from "../../assets/traduction/menu/menu.fr.json";
import menuRu from "../../assets/traduction/menu/menu.ru.json";

const labels = { en: menuEn, fr: menuFr, ru: menuRu };

const items = [
  { key: "projects", path: "/projects", color: "#F8BBD0" },
  { key: "skills", path: "/skills", color: "#FFCC80" },
  { key: "contact", path: "/contact", color: "#B0BEC5" },
  {
    key: "linkedin",
    path: "https://www.linkedin.com/in/anastasia-rabynina-139992312/",
    color: "#81D4FA",
  },
  { key: "github", path: "https://github.com/Anna-Sta-Siia", color: "#D1C4E9" },
  { key: "cv", path: "/cv", color: "#bbf8c5" },
];

export default function Menu() {
  const { language } = useUI();
  const translated = labels[language] || labels.en;
  const location = useLocation();
  const currentPath = location.pathname;

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);

  const sliderRef = useRef(null);
  const petalRef = useRef(null);
  const [dir, setDir] = useState(+1);
  const dirRef = useRef(dir);
  useEffect(() => {
    dirRef.current = dir;
  }, [dir]);

  const isAnimatingRef = useRef(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  const FADE_MS = 400;
  const AUTO_MS = 6000;
  const RESUME_AFTER = 2000;

  function startAuto() {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => step(dirRef.current), AUTO_MS);
  }

  function stopAuto() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function pauseAuto() {
    stopAuto();
    clearTimeout(resumeTimeoutRef.current);
  }

  function resumeAutoDelayed() {
    clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      startAuto();
    }, RESUME_AFTER);
  }

  function step(delta) {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setFade(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + delta + items.length) % items.length);
      setFade(false);
      isAnimatingRef.current = false;
    }, FADE_MS);
  }

  useEffect(() => {
    startAuto();
    return () => {
      stopAuto();
      clearTimeout(resumeTimeoutRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleScroll = (which) => {
    const delta = which === "right" ? +1 : -1;
    setDir(delta);
    pauseAuto();
    step(delta);
    resumeAutoDelayed();
  };

  useEffect(() => {
    function updateVisibleCount() {
      const container = sliderRef.current;
      const petal = petalRef.current;
      if (!container || !petal) return;

      const containerWidth = container.clientWidth;
      const petalRect = petal.getBoundingClientRect();
      const petalWidth = petalRect.width;

      const styles = window.getComputedStyle(container);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;

      const count = Math.max(1, Math.floor((containerWidth + gap) / (petalWidth + gap)));
      setVisibleCount(count);
    }

    updateVisibleCount();
    const ro = new ResizeObserver(updateVisibleCount);
    if (sliderRef.current) ro.observe(sliderRef.current);
    window.addEventListener("resize", updateVisibleCount);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateVisibleCount);
    };
  }, []);

  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  return (
    <div className={styles.wrapper}>
      <button className={styles.arrow} onClick={() => handleScroll("right")}>
        ◀
      </button>

      <div
        ref={sliderRef}
        className={`${styles.slider} ${fade ? styles.fade : ""}`}
        onMouseEnter={canHover ? pauseAuto : undefined}
        onMouseLeave={canHover ? resumeAutoDelayed : undefined}
        onPointerDown={!canHover ? pauseAuto : undefined}
        onPointerUp={!canHover ? resumeAutoDelayed : undefined}
        onFocus={pauseAuto}
        onBlur={resumeAutoDelayed}
      >
        {Array(visibleCount)
          .fill(0)
          .map((_, i) => {
            const item = items[(index + i) % items.length];
            const isActive = item.path === currentPath;

            return (
              <Petal
                ref={i === 0 ? petalRef : null}
                key={`${item.key}-${i}`}
                name={translated[item.key] || item.key}
                path={item.path}
                color={item.color}
                isActive={isActive}
              />
            );
          })}
      </div>

      <button className={styles.arrow} onClick={() => handleScroll("left")}>
        ▶
      </button>
    </div>
  );
}
