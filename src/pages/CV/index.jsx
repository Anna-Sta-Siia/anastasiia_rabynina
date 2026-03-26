import { useMemo } from "react";
import PageTitle from "../../components/PageTitle";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import WipMessage from "../../components/WipMessage";
import { useDisplayLang } from "../../hooks/useDisplayLang";
import { buildInternalLangPath } from "../../utils/pathManager";

import wipFr from "../../assets/traduction/wip/wip.fr.json";
import wipEn from "../../assets/traduction/wip/wip.en.json";
import wipRu from "../../assets/traduction/wip/wip.ru.json";

import styles from "./CV.module.css";

const WIP_BY_LANG = {
  fr: wipFr,
  en: wipEn,
  ru: wipRu,
};

export default function CV() {
  const displayLang = useDisplayLang();
  const { label, color } = usePageMeta();

  const t = useMemo(() => {
    return WIP_BY_LANG[displayLang] || WIP_BY_LANG.fr;
  }, [displayLang]);

  const links = useMemo(
    () => ({
      projects: buildInternalLangPath(displayLang, "/projects"),
      home: buildInternalLangPath(displayLang, "/"),
      contact: buildInternalLangPath(displayLang, "/contact"),
      cv: `${import.meta.env.BASE_URL}cv.pdf`,
    }),
    [displayLang],
  );

  return (
    <section className={styles.cv}>
      <PageTitle text={label} color={color} />
      <WipMessage texts={t.cv} links={links} lang={displayLang} />
    </section>
  );
}
