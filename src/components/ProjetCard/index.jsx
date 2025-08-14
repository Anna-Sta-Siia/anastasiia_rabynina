import { useState, useMemo } from "react";
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
      case "en":
        return uiEn;
      case "ru":
        return uiRu;
      default:
        return uiFr;
    }
  }, [language]);

  // Dictionnaire de libellés pour les stacks
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

  // On essaie d’abord “skills”, sinon “formation”
  const skillsItem = useMemo(
    () =>
      menuItems.find((i) => i.key === "skills") ??
      menuItems.find((i) => i.key === "formation"),
    []
  );
  const skillsPath = skillsItem?.path || "/formation";

  const {
    title,
    titleLogo,
    titleLogoAlt,              // <- alt localisé pour le logo (optionnel)
    image,
    imageAlt,                  // <- alt localisé pour l'image
    link,
    description,
    stack = [],
    color,
    imageEffect = "none",      // "spin" | "fade" | "none"
    slogan                     // <- nouveau : texte superposé sur l'image
  } = project;

  // Classe d'effet visuel sur l'image selon JSON
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

          {image && (
            <figure className={styles.mediaWrap}>
              <img
                src={`${import.meta.env.BASE_URL}${image}`}
                alt={imageAlt || title}
                className={`${styles.media} ${imgEffectClass}`}
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
          <p className={styles.description}>{description}</p>

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
    </div>
  );
}
