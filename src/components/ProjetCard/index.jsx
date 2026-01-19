// src/components/ProjetCard/index.jsx
import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useUI } from "../../context";
import { useOverflow } from "../../hooks/useOverflow";
import { useReturnFocus } from "../../hooks/useReturnFocus";
import { menuItems } from "../../config/menuConfig";
import styles from "./ProjetCard.module.css";
import Modal from "../Modal";
import modalCss from "../Modal/Modal.module.css";

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

  /* ========== UI localisée ========== */
  const ui = useMemo(() => {
    switch (language) {
      case "en":
        return uiEn;
      case "ru":
        return uiRu;
      default:
        return uiFr;
    }
  }, [language]);

  const filterLabels = useMemo(() => {
    switch (language) {
      case "en":
        return labelsEn;
      case "ru":
        return labelsRu;
      default:
        return labelsFr;
    }
  }, [language]);

  /* ========== Lien Skills ========== */
  const skillsPath = useMemo(() => {
    const item = menuItems.find((i) => i.key === "skills");
    return item?.path || "/skills";
  }, []);

  /* ========== Données projet ========== */
  const {
    id,
    title,
    titleLogo,
    titleLogoAlt,
    image,
    imageAlt,
    link,
    description,
    stack = [],
    color,
    imageEffect = "none",
    slogan,
  } = project;

  /* ========== Effet visuel image ========== */
  const imgEffectClass = useMemo(() => {
    switch (imageEffect) {
      case "spin":
        return styles.imgSpin;
      case "fade":
        return styles.imgFade;
      default:
        return "";
    }
  }, [imageEffect]);

  const [isFlipped, setIsFlipped] = useState(false);

  /* ===========================
     CLAMP + MODALE (hooks)
     =========================== */

  // --- APERÇU ---
  const descRef = useRef(null);
  const descOpenerRef = useRef(null);
  const descOverflow = useOverflow(descRef, [language, description]); // true si ça déborde

  // --- OUTILS ---
  const toolsRef = useRef(null);
  const toolsOpenerRef = useRef(null);
  const toolsOverflow = useOverflow(toolsRef, [language, stack]);

  // Modale commune (null | 'desc' | 'tools')
  const [modalType, setModalType] = useState(null);
  const showModal = modalType !== null;

  // Rendre le focus au bon bouton après fermeture
  const lastOpenerRef = useReturnFocus(showModal);

  // Outils condensés (clampables)
  const toolsHuman = useMemo(
    () => stack.map((k) => filterLabels[k] ?? k).join(" · "),
    [stack, filterLabels]
  );

  // ID stable pour aria-describedby de la modale (contenu)
  const modalTitleId = useMemo(() => {
    const base = (id || title || "desc")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `desc-title-${base}`;
  }, [id, title]);

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
                className={`${styles.mediaImg ?? ""} ${imgEffectClass}`}
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

          {/* Aperçu (clamp + bouton) */}
          <div className={styles.previewZone}>
            <div className={styles.descBox} ref={descRef} aria-live="polite">
              {description}
            </div>

            {descOverflow && (
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
              {/* on passe l’id du projet pour filtrer la page Skills */}
              <Link
                to={`${skillsPath}?only=${encodeURIComponent(id)}`}
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

      {/* ---------- MODALE (externe) ---------- */}
      <Modal
        open={showModal}
        title={`${title} — ${modalType === "tools" ? ui.tools : ui.preview}`}
        onClose={() => setModalType(null)}
        describedById={`${modalTitleId}-desc`}
      >
        {modalType === "tools" ? (
          <ul id={`${modalTitleId}-desc`} className={modalCss.modalList}>
            {stack.map((k) => (
              <li key={k}>{filterLabels[k] ?? k}</li>
            ))}
          </ul>
        ) : (
          <p id={`${modalTitleId}-desc`} className={modalCss.modalText}>
            {description}
          </p>
        )}
      </Modal>
    </div>
  );
}
