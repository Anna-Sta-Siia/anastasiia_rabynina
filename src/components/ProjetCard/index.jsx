import { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUI } from "../../context";
import menuItems from "../../config/menuConfig";
import styles from "./ProjetCard.module.css";

// UI (projet)
import uiFr from "../../assets/traduction/projet/ui.fr.json";
import uiEn from "../../assets/traduction/projet/ui.en.json";
import uiRu from "../../assets/traduction/projet/ui.ru.json";

// Labels des filtres (affichage humain des stacks)
import labelsFr from "../../assets/traduction/filters/filters.fr.json";
import labelsEn from "../../assets/traduction/filters/filters.en.json";
import labelsRu from "../../assets/traduction/filters/filters.ru.json";

export default function ProjetCard({ project }) {
  const { language } = useUI();

  // UI localisée
  const ui = useMemo(() => {
    switch (language) {
      case "en": return uiEn;
      case "ru": return uiRu;
      default:   return uiFr;
    }
  }, [language]);

  // Dictionnaire de libellés pour les stacks
  const filterLabels = useMemo(() => {
    switch (language) {
      case "en": return labelsEn;
      case "ru": return labelsRu;
      default:   return labelsFr;
    }
  }, [language]);

  // Lien vers la page compétences/formation
  const skillsPath = useMemo(() => {
    const item = menuItems.find(i => i.key === "skills") ?? menuItems.find(i => i.key === "formation");
    return item?.path || "/formation";
  }, []);

  const {
    id, title, titleLogo, titleLogoAlt,
    image, imageAlt, link, description,
    stack = [], color, imageEffect = "none", slogan
  } = project;

  // Effet visuel image
  const imgEffectClass = useMemo(() => {
    switch (imageEffect) {
      case "spin": return styles.imgSpin;
      case "fade": return styles.imgFade;
      default:     return "";
    }
  }, [imageEffect]);

  const [isFlipped, setIsFlipped] = useState(false);

  /* ===========================
     CLAMP + MODALE
     =========================== */

  // --- APERÇU ---
  const descRef = useRef(null);
  const descOpenerRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);

  // --- OUTILS ---
  const toolsRef = useRef(null);
  const toolsOpenerRef = useRef(null);
  const [toolsOverflow, setToolsOverflow] = useState(false);

  // Modale commune (null | 'desc' | 'tools')
  const [modalType, setModalType] = useState(null);
  const showModal = modalType !== null;
  const closeBtnRef = useRef(null);
  const lastOpenerRef = useRef(null); // rendre le focus au bon bouton

  // Mesure générique d'overflow
  const setOverflowFromRef = useCallback((ref, setter) => {
    const el = ref.current;
    if (!el) return;
    setter(el.scrollHeight > el.clientHeight + 1);
  }, []);

  // Mesures après layout + resize + ResizeObserver
  useLayoutEffect(() => {
    setOverflowFromRef(descRef, setIsOverflow);
    setOverflowFromRef(toolsRef, setToolsOverflow);

    const onResize = () => {
      setOverflowFromRef(descRef, setIsOverflow);
      setOverflowFromRef(toolsRef, setToolsOverflow);
    };
    window.addEventListener("resize", onResize);

    let ro1, ro2;
    if (window.ResizeObserver) {
      if (descRef.current) { ro1 = new ResizeObserver(() => setOverflowFromRef(descRef, setIsOverflow)); ro1.observe(descRef.current); }
      if (toolsRef.current){ ro2 = new ResizeObserver(() => setOverflowFromRef(toolsRef, setToolsOverflow)); ro2.observe(toolsRef.current); }
    }
    return () => {
      window.removeEventListener("resize", onResize);
      ro1?.disconnect(); ro2?.disconnect();
    };
  }, [language, description, stack, setOverflowFromRef]);

  // Escape pour fermer la modale
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setModalType(null); };
    if (showModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  // Focus management
  useEffect(() => {
    if (showModal) setTimeout(() => closeBtnRef.current?.focus(), 0);
    else lastOpenerRef.current?.focus?.();
  }, [showModal]);

  // Outils condensés (clampables)
  const toolsHuman = useMemo(
    () => stack.map(k => filterLabels[k] ?? k).join(" · "),
    [stack, filterLabels]
  );

  // ID stable pour aria-labelledby / aria-describedby
  const modalTitleId = useMemo(() => {
    const base = (id || title || "desc")
      .toString()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `desc-title-${base}`;
  }, [id, title]);

  // Piège Tab (accessibilité)
  const trapTab = (e) => {
    if (e.key !== "Tab") return;
    const root = e.currentTarget;
    const f = root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div className={styles.card} data-project={id}>
      <div className={`${styles.inner} ${isFlipped ? styles.flipped : ""}`}>
        {/* ---------- FACE AVANT ---------- */}
        <div className={styles.front} style={{ background: color }}>
          {titleLogo ? (
            <img
              className={styles.titleLogo}
              src={`${import.meta.env.BASE_URL}${titleLogo}`}
              alt={titleLogoAlt || title}
              width={180}
              decoding="async"
              loading="lazy"
            />
          ) : (
            <h3 className={styles.title}>{title}</h3>
          )}

          {/* Bulle média ronde */}
          {image && (
            <figure className={styles.mediaWrap}>
              <img
                src={`${import.meta.env.BASE_URL}${image}`}
                alt={imageAlt || title}
                className={imgEffectClass}
                decoding="async"
                loading="lazy"
              />
              {slogan && <figcaption className={styles.slogan}>{slogan}</figcaption>}
            </figure>
          )}

          <div className={styles.projectcardbottom}>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={styles.skillsrefer}
                aria-label={`${ui.visit} — ${title}`}
              >
                {ui.visit}
              </a>
            )}

            <div className={styles.arrowContainer}>
              <p>{ui.flip}</p>
              <button
                className={styles.flipArrow}
                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                aria-label={ui.flip}
                title={ui.flip}
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* ---------- FACE ARRIÈRE ---------- */}
        <div className={styles.back} style={{ background: color }}>
          <h4 className={styles.descriptiontitle}>{ui.preview}</h4>

          {/* Aperçu (clamp + bouton) */}
          <div className={styles.previewZone}>
            <div className={styles.descBox} ref={descRef} aria-live="polite">
              {description}
            </div>
            {isOverflow && (
              <button
                type="button"
                className={styles.seeMoreBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  lastOpenerRef.current = descOpenerRef.current;
                  setModalType("desc");
                }}
                aria-haspopup="dialog"
                aria-expanded={showModal && modalType === "desc" ? "true" : "false"}
                ref={descOpenerRef}
              >
                {ui.seeMore}…
              </button>
            )}
          </div>

          {!!stack.length && (
            <>
              <h4 className={styles.descriptiontitle}>{ui.tools}</h4>

              {/* OUTILS (clamp 2 lignes + bouton) */}
              <div className={styles.toolsZone}>
                <div className={styles.toolsBox} ref={toolsRef} aria-live="polite">
                  {toolsHuman}
                </div>
                {toolsOverflow && (
                  <button
                    type="button"
                    className={styles.seeMoreBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      lastOpenerRef.current = toolsOpenerRef.current;
                      setModalType("tools");
                    }}
                    aria-haspopup="dialog"
                    aria-expanded={showModal && modalType === "tools" ? "true" : "false"}
                    ref={toolsOpenerRef}
                  >
                    {ui.seeMore}…
                  </button>
                )}
              </div>
            </>
          )}

          <div className={styles.projectcardbottom}>
            <div className={styles.skillsCta}>
              <Link
                to={skillsPath}
                className={styles.skillsLink}
                onClick={(e) => e.stopPropagation()}
                aria-label={ui.seeSkills}
                title={ui.seeSkills}
              >
                {ui.seeSkills}
              </Link>
            </div>

            <div className={styles.arrowContainer}>
              <p>{ui.flipBack}</p>
              <button
                type="button"
                className={`${styles.flipArrow} ${styles.flipBack}`}
                aria-label={ui.flipBack}
                title={ui.flipBack}
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              >
                ◀
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- MODALE ---------- */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          aria-describedby={`${modalTitleId}-desc`}
          onClick={() => setModalType(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={trapTab}
          >
            <h3 id={modalTitleId} className={styles.modalTitle}>
              {title} — {modalType === "tools" ? ui.tools : ui.preview}
            </h3>

            {modalType === "tools" ? (
              <ul id={`${modalTitleId}-desc`} className={styles.modalList}>
                {stack.map((k) => <li key={k}>{filterLabels[k] ?? k}</li>)}
              </ul>
            ) : (
              <p id={`${modalTitleId}-desc`} className={styles.modalText}>{description}</p>
            )}

            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setModalType(null)}
              ref={closeBtnRef}
            >
              {ui.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
