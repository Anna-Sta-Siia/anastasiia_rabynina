import { Link } from "react-router-dom";
import { buildInternalLangPath } from "../../utils/pathManager";
import styles from "./WipMessage.module.css";

/**
 * props:
 *  - texts: { title, lead, body, ctaProjects?, ctaHome?, ctaContact?, ctaCV? }
 *  - links?: { projects?: string, home?: string, contact?: string, cv?: string }
 *  - blur?: boolean (default: true)
 *  - lang?: "fr" | "en" | "ru"
 */
export default function WipMessage({ texts, links, blur = true, askedLang = "fr" }) {
  if (!texts) return null;

  const resolvedLinks = {
    projects: buildInternalLangPath(askedLang, "/projects"),
    home: buildInternalLangPath(askedLang, "/"),
    contact: buildInternalLangPath(askedLang, "/contact"),
    cv: `${import.meta.env.BASE_URL}cv.pdf`,
    ...links,
  };

  return (
    <div
      className={`${styles.overlay} ${blur ? styles.blurred : ""}`}
      role="region"
      aria-label={texts.title}
    >
      <div className={styles.card}>
        <h2 className={styles.title}>{texts.title}</h2>

        {texts.lead && (
          <p className={styles.lead}>
            <strong>{texts.lead}</strong>
          </p>
        )}

        {texts.body && <p className={styles.body}>{texts.body}</p>}

        <div className={styles.actions}>
          {texts.ctaProjects && (
            <Link className={styles.btn} to={resolvedLinks.projects}>
              {texts.ctaProjects}
            </Link>
          )}

          {texts.ctaHome && (
            <Link className={styles.btn} to={resolvedLinks.home}>
              {texts.ctaHome}
            </Link>
          )}

          {texts.ctaContact && (
            <Link className={styles.btn} to={resolvedLinks.contact}>
              {texts.ctaContact}
            </Link>
          )}

          {texts.ctaCV && (
            <a
              className={styles.btn}
              href={resolvedLinks.cv}
              target="_blank"
              rel="noopener noreferrer"
            >
              {texts.ctaCV}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
