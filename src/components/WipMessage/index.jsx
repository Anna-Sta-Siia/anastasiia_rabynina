import styles from "./WipMessage.module.css";

/**
 * props:
 *  - texts: { title, lead, body, ctaProjects?, ctaHome?, ctaContact?, ctaCV? }
 *  - links?: { projects?: string, home?: string, contact?: string, cv?: string }
 *  - blur?: boolean (default: true)
 *
 * Place-le DANS la section à couvrir. Assure-toi que le parent a position:relative.
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
            <a className={styles.btn} href={links.projects}>
              {texts.ctaProjects}
            </a>
          )}
          {texts.ctaHome && (
            <a className={styles.btn} href={links.home}>
              {texts.ctaHome}
            </a>
          )}
          {texts.ctaContact && (
            <a className={styles.btn} href={links.contact}>
              {texts.ctaContact}
            </a>
          )}
          {texts.ctaCV && (
            <a className={styles.btn} href={links.cv}>
              {texts.ctaCV}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
