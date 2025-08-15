import PageTitle from "../../components/PageTitle";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import styles from "./Skills.module.css";

export default function Skills() {
  const { label, color } = usePageMeta();
  return (
    <section className={styles.skills}>
      <PageTitle text={label} color={color} />
    </section>
  );
}
