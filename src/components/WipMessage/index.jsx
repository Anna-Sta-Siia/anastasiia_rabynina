// WipMessage.jsx
import { Link } from "react-router-dom";
import styles from "./WipMessage.module.css";

/**
 * props:
 *  - texts: { title, lead, body, ctaProjects?, ctaHome?, ctaContact?, ctaCV? }
 *  - links?: { projects?: string, home?: string, contact?: string, cv?: string }
 *  - blur?: boolean (default: true)
 */
export default function WipMessage({
  texts,
  links = { projects: "/projects", home: "/", contact: "/contact", cv: "/cv" },
  blur = true,
}) {
  if (!texts) return null;

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
            <Link className={styles.btn} to={links.projects}>
              {texts.ctaProjects}
            </Link>
          )}
          {texts.ctaHome && (
            <Link className={styles.btn} to={links.home}>
              {texts.ctaHome}
            </Link>
          )}
          {texts.ctaContact && (
            <Link className={styles.btn} to={links.contact}>
              {texts.ctaContact}
            </Link>
          )}
          {texts.ctaCV && (
            <Link className={styles.btn} to={links.cv}>
              {texts.ctaCV}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
