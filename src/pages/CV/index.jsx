import styles from './CV.module.css';
import PageTitle from '../../components/PageTitle';
import { usePageMeta } from '../../config/hooks/usePageMeta'

export default function CV() {
  const { label, color } = usePageMeta();

  return (
    <section className={styles.CV}>
      <PageTitle text={label} color={color} />
    </section>
  );
}
