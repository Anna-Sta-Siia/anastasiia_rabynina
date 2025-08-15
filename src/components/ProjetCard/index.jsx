import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
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

  // On essaie d’abord “skills”, sinon “formation”
  const skillsItem = useMemo(
    () => menuItems.find((i) => i.key === "skills") ?? menuItems.find((i) => i.key === "formation"),
    []
  );
  const skillsPath = skillsItem?.path || "/formation";

  const {
    id,
    title,
    titleLogo,
    titleLogoAlt,          // alt localisé pour le logo (optionnel)
    image,
    imageAlt,              // alt localisé pour l'image
    link,
    description,
    stack = [],
    color,
    imageEffect = "none",  // "spin" | "fade" | "none"
    slogan                 // texte superposé sur l'image
  } = project;

  // Classe d'effet visuel sur l'image selon JSON (spin/fade)
  const imgEffectClass = useMemo(() => {
    switch (imageEffect) {
      case "spin": return styles.imgSpin;
      case "fade": return styles.imgFade;
      default:     return "";
    }
  }, [imageEffect]);

  const [isFlipped, setIsFlipped] = useState(false);

  /* ===========================
     CLAMP + MODAL « Voir plus »
     =========================== */

  // Conteneur à “clamp”
  const descRef = useRef(null);
  // Bouton « Voir plus… » (pour restituer le focus à la fermeture)
  const openerRef = useRef(null);
  // Bouton « Fermer » dans la modale
  const closeBtnRef = useRef(null);

  const [isOverflow, setIsOverflow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Mesure fiable de l’overflow (scrollHeight > clientHeight)
  const measureOverflow = () => {
    const el = descRef.current;
    if (!el) return;
    setIsOverflow(el.scrollHeight > el.clientHeight + 1); // +1 px pour la marge sub-pixel
  };

  // 👉 useLayoutEffect pour mesurer après layout, + ResizeObserver + resize
  useLayoutEffect(() => {
    measureOverflow();

    const onResize = () => measureOverflow();
    window.addEventListener("resize", onResize);

    let ro;
    if (window.ResizeObserver && descRef.current) {
      ro = new ResizeObserver(measureOverflow);
      ro.observe(descRef.current);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [language, description]);

  // Escape pour fermer la modale
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setShowModal(false); };
    if (showModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  // Focus management : focus sur « Fermer » à l’ouverture, retour sur « Voir plus » à la fermeture
  useEffect(() => {
    if (showModal) {
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    } else {
      openerRef.current?.focus?.();
    }
  }, [showModal]);

  // ID « safe » pour aria-labelledby (supprime espaces/accents)
  const modalTitleId = useMemo(() => {
    const base = (id || title || "desc")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-");
    return `desc-title-${base}`;
  }, [id, title]);

  // (Optionnel) piège Tab dans la modale pour ne pas sortir du dialog
  function trapTab(e) {
    if (e.key !== "Tab") return;
    const root = e.currentTarget;
    const f = root.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  return (
    <div className={styles.card}>
      <div className={`${styles.inner} ${isFlipped ? styles.flipped : ""}`}>
        {/* ---------- FACE AVANT ---------- */}
        <div className={styles.front} style={{ background: color }}>
          {titleLogo ? (
            <img
              className={styles.titleLogo}
              src={`${import.meta.env.BASE_URL}${titleLogo}`}
              alt={titleLogoAlt || title}
              width={180}
              height="auto"
              decoding="async"
              loading="lazy"
            />
          ) : (
            <h3 className={styles.title}>{title}</h3>
          )}

          {/* Bulle média ronde (image + slogan éventuel) */}
          {image && (
            <figure className={styles.mediaWrap}>
              <img
                src={`${import.meta.env.BASE_URL}${image}`}
                alt={imageAlt || title}
                className={imgEffectClass}     
                decoding="async"
                loading="lazy"
              />
              {slogan && (
                <figcaption className={styles.slogan}>{slogan}</figcaption>
              )}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
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

          {/* Conteneur à hauteur fixe + line-clamp */}
          <div className={styles.previewZone}>
          <div className={styles.descBox} ref={descRef} aria-live="polite">
            {description}
          </div>

          {/* Bouton Voir plus… si overflow détecté */}
          {isOverflow && (
            <button
              type="button"
              className={styles.seeMoreBtn}
              onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
              aria-haspopup="dialog"
              aria-expanded={showModal ? "true" : "false"}
              ref={openerRef}
            >
              {ui.seeMore}…
            </button>
          )}
          </div>
          {!!stack.length && (
            <>
              <h4 className={styles.descriptiontitle}>{ui.tools}</h4>
              <ul className={styles.description}>
                {stack.map((toolKey) => (
                  <li key={toolKey}>{filterLabels[toolKey] ?? toolKey}</li>
                ))}
              </ul>
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
              >
                ◀
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- MODALE APERÇU COMPLET ---------- */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          aria-describedby={`${modalTitleId}-desc`}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={trapTab}           // piège Tab (optionnel mais recommandé)
          >
            <h3 id={modalTitleId} className={styles.modalTitle}>
              {title} — {ui.preview}
            </h3>
            <p id={`${modalTitleId}-desc`} className={styles.modalText}>
              {description}
            </p>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setShowModal(false)}
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
