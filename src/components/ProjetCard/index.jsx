// src/components/ProjetCard/index.jsx
import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { makeAriaId } from "../../utils/makeAriaId.js";
import { useOverflow } from "../../hooks/useOverflow";
import { useReturnFocus } from "../../hooks/useReturnFocus";
import { menuItems } from "../../config/menuConfig";
import { buildLangUrl } from "../../utils/pathManager";
import styles from "./ProjetCard.module.css";
import Modal from "../Modal";
import modalCss from "../Modal/Modal.module.css";

// UI (projets)
import UiProjetEn from "../../assets/traduction/projet/ui.en.json";
import UiProjetFR from "../../assets/traduction/projet/ui.fr.json";
import UiProjetRu from "../../assets/traduction/projet/ui.ru.json";

// Labels des filtres
import labelsFr from "../../assets/traduction/filters/filters.fr.json";
import labelsEn from "../../assets/traduction/filters/filters.en.json";
import labelsRu from "../../assets/traduction/filters/filters.ru.json";

const PROJECTS_UI_DICTS = { fr: UiProjetFR, en: UiProjetEn, ru: UiProjetRu };
const FILTER_LABELS_DICTS = { fr: labelsFr, en: labelsEn, ru: labelsRu };

export default function ProjetCard({ project, lang = "fr" }) {
  const projectsUi = PROJECTS_UI_DICTS[lang] || PROJECTS_UI_DICTS.fr;
  const filterLabels = FILTER_LABELS_DICTS[lang] || FILTER_LABELS_DICTS.fr;

  const skillsPath = useMemo(() => {
    const item = menuItems.find((i) => i.key === "skills");
    return item?.path || "/skills";
  }, []);

  const DEFAULT_CARD_COLOR = "#ffffff";
  const DEFAULT_IMAGE_EFFECT = "none";

  const {
    id,
    title,
    titleLogo,
    image,
    imageAlt,
    link,
    description,
    stack = [],
    color = DEFAULT_CARD_COLOR,
    imageEffect = DEFAULT_IMAGE_EFFECT,
    slogan,
  } = project;

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

  const withBase = (p) => `${import.meta.env.BASE_URL}${p}`;

  const descRef = useRef(null);
  const descOpenerRef = useRef(null);
  const descOverflow = useOverflow(descRef, [description, projectsUi]);

  const toolsRef = useRef(null);
  const toolsOpenerRef = useRef(null);
  const toolsOverflow = useOverflow(toolsRef, [stack, filterLabels]);

  const [modalType, setModalType] = useState(null);
  const showModal = modalType !== null;

  const lastOpenerRef = useReturnFocus(showModal);

  const toolsHuman = useMemo(
    () => stack.map((k) => filterLabels[k] ?? k).join(" · "),
    [stack, filterLabels],
  );

  const modalTitleId = useMemo(
    () => `desc-title-${makeAriaId(id || title || "desc")}`,
    [id, title],
  );

  const skillsUrl = useMemo(() => {
    return buildLangUrl(lang, {
      pathname: skillsPath,
      search: `?only=${encodeURIComponent(id)}`,
    });
  }, [lang, skillsPath, id]);

  return (
    <div className={styles.card} data-project={id}>
      <div className={`${styles.inner} ${isFlipped ? styles.flipped : ""}`}>
        <div className={styles.front} style={{ background: color }}>
          {titleLogo ? (
            <img
              className={styles.titleLogo}
              src={withBase(titleLogo)}
              alt={title}
              width={180}
              decoding="async"
              loading="lazy"
            />
          ) : (
            <h3 className={styles.title}>{title}</h3>
          )}

          {image && (
            <figure className={styles.mediaWrap}>
              <img
                src={withBase(image)}
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
                aria-label={`${projectsUi.visit} — ${title}`}
                title={projectsUi.visit}
              >
                {projectsUi.visit}
              </a>
            )}

            <div className={styles.arrowContainer}>
              <p>{projectsUi.flip}</p>
              <button
                className={styles.flipArrow}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                aria-label={projectsUi.flip}
                title={projectsUi.flip}
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        <div className={styles.back} style={{ background: color }}>
          <h4 className={styles.descriptiontitle}>{projectsUi.preview}</h4>

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
                {projectsUi.seeMore}…
              </button>
            )}
          </div>

          {!!stack.length && (
            <>
              <h4 className={styles.descriptiontitle}>{projectsUi.tools}</h4>

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
                    {projectsUi.seeMore}…
                  </button>
                )}
              </div>
            </>
          )}

          <div className={styles.projectcardbottom}>
            <div className={styles.skillsCta}>
              <Link
                to={skillsUrl}
                className={styles.skillsLink}
                onClick={(e) => e.stopPropagation()}
                aria-label={projectsUi.seeSkills}
                title={projectsUi.seeSkills}
              >
                {projectsUi.seeSkills}
              </Link>
            </div>

            <div className={styles.arrowContainer}>
              <p>{projectsUi.flipBack}</p>
              <button
                type="button"
                className={`${styles.flipArrow} ${styles.flipBack}`}
                aria-label={projectsUi.flipBack}
                title={projectsUi.flipBack}
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

      <Modal
        open={showModal}
        title={`${title} — ${modalType === "tools" ? projectsUi.tools : projectsUi.preview}`}
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
