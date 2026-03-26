import PageTitle from "../../components/PageTitle";
import ContactForm from "../../components/ContactForm";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import { useDisplayLang } from "../../hooks/useDisplayLang";

import tEn from "../../assets/traduction/contact/contact.en.json";
import tFr from "../../assets/traduction/contact/contact.fr.json";
import tRu from "../../assets/traduction/contact/contact.ru.json";
import styles from "./Contact.module.css";

const dict = { en: tEn, fr: tFr, ru: tRu };

export default function Contact() {
  const { label, color } = usePageMeta(); // le label de la page + couleur d’accent
  const language = useDisplayLang();
  const t = dict[language] ?? dict.en;

  return (
    <section className={styles.contact}>
      <PageTitle text={label} color={color} />
      <ContactForm t={t} accent={color} />
    </section>
  );
}
