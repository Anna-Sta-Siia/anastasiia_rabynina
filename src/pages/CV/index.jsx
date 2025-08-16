// src/pages/CV/index.jsx (exemple)
import { useMemo } from "react";
import PageTitle from "../../components/PageTitle";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import WipMessage from "../../components/WipMessage";
import { useUI } from "../../context";

import wipFr from "../../assets/traduction/wip/wip.fr.json";
import wipEn from "../../assets/traduction/wip/wip.en.json";
import wipRu from "../../assets/traduction/wip/wip.ru.json";

import styles from "./CV.module.css";

export default function CV() {
  const { label, color } = usePageMeta();
  const { language } = useUI();
  const t = useMemo(
    () => (language === "en" ? wipEn : language === "ru" ? wipRu : wipFr),
    [language]
  );
  return (
    <section className={styles.cv}>
      <PageTitle text={label} color={color} />
      <WipMessage
        texts={t.cv}
        links={{ projects: "/projects", home: "/", contact: "/contact", cv: "/cv.pdf" }}
      />
    </section>
  );
}
