// src/components/Menu/index.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUI } from "../../context";
import Petal from "../Petal/PetalMenu";
import Modal from "../Modal";
import styles from "./Menu.module.css";

import menuEn from "../../assets/traduction/menu/menu.en.json";
import menuFr from "../../assets/traduction/menu/menu.fr.json";
import menuRu from "../../assets/traduction/menu/menu.ru.json";
import contactEn from "../../assets/traduction/contact/contact.en.json";
import contactFr from "../../assets/traduction/contact/contact.fr.json";
import contactRu from "../../assets/traduction/contact/contact.ru.json";

const labels = { en: menuEn, fr: menuFr, ru: menuRu };
const contactLabels = { en: contactEn, fr: contactFr, ru: contactRu };

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
  const { language, hasContactDraft, setHasContactDraft } = useUI();
  const translated = labels[language] || labels.en;
  const tContact = contactLabels[language] || contactLabels.en;
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);
  // ==== garde "quitter la section Contact" ====
  const [leaveTarget, setLeaveTarget] = useState(null); // путь, куда хотим уйти
  const [leaveOpen, setLeaveOpen] = useState(false); // открыта ли модалка

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

  const startAuto = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => step(dirRef.current), AUTO_MS);
  }, []); // refs стабильны → deps можно оставить пустыми

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
      clearInterval(intervalRef.current);
      clearTimeout(resumeTimeoutRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [startAuto]);

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

  /** 🧠 Garde SPA: quitter la section Contact avec un brouillon */
  const handleLeaveClick = useCallback(
    (event, targetPath) => {
      // 1. Нет черновика — даём React Router самому навигировать
      if (!hasContactDraft) return;

      // 2. Защищаем только когда мы *сейчас* на /contact
      if (!location.pathname.includes("/contact")) return;

      // 3. Если кликаем по Contact → Contact, тоже ничего не делаем
      if (targetPath === "/contact") return;

      // 4. Здесь точно есть черновик и попытка уйти с Contact
      event.preventDefault();
      setLeaveTarget(targetPath);
      setLeaveOpen(true);
    },
    [hasContactDraft, location.pathname]
  );

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

            const isExternal = /^https?:\/\//.test(item.path);

            return (
              <Petal
                ref={i === 0 ? petalRef : null}
                key={`${item.key}-${i}`}
                name={translated[item.key] || item.key}
                path={item.path}
                color={item.color}
                isActive={isActive}
                // ⚠️ guard только для внутренних внутренних ссылок
                onClick={isExternal ? undefined : (e) => handleLeaveClick(e, item.path)}
              />
            );
          })}
      </div>

      <button className={styles.arrow} onClick={() => handleScroll("left")}>
        ▶
      </button>
      {/* === Modal "Quitter la section Contact ?" === */}
      <Modal
        open={leaveOpen}
        onClose={() => {
          setLeaveOpen(false);
          setLeaveTarget(null);
        }}
        title={tContact.unsentGuardTitle}
        closeLabel={tContact.close}
        showCloseButton={false}
      >
        <div className={styles.modalEditor}>
          <p className={styles.modalContent}>{tContact.unsentGuardBody}</p>
          <div className={styles.modalBar}>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  setLeaveOpen(false);
                  setLeaveTarget(null);
                }}
              >
                {tContact.unsentGuardStay}
              </button>

              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  const target = leaveTarget;
                  setLeaveOpen(false);
                  setLeaveTarget(null);
                  // по желанию: больше не считать, что есть черновик
                  setHasContactDraft(false);
                  if (target) {
                    navigate(target);
                  }
                }}
              >
                {tContact.unsentGuardLeave}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
