// src/pages/Skills/index.jsx
import { useMemo } from "react";
import PageTitle from "../../components/PageTitle";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import WipMessage from "../../components/WipMessage";

import wipFr from "../../assets/traduction/wip/wip.en.json";
import wipEn from "../../assets/traduction/wip/wip.fr.json";
import wipRu from "../../assets/traduction/wip/wip.ru.json";
import { useUI } from "../../context";

import styles from "./Skills.module.css";

export default function Skills() {
  const { label, color } = usePageMeta();
  const { language } = useUI();

  const t = useMemo(() => {
    switch (language) {
      case "en":
        return wipEn;
      case "ru":
        return wipRu;
      default:
        return wipFr;
    }
  }, [language]);

  return (
    <section className={styles.skills}>
      <PageTitle text={label} color={color} />
      {/* L’overlay recouvre la section */}
      <WipMessage texts={t.skills} />
      {/* Ton futur contenu peut rester là, il sera masqué par l’overlay */}
    </section>
  );
}
