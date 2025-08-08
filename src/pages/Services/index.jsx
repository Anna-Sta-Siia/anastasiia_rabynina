import styles from './Services.module.css';
import PageTitle from '../../components/PageTitle';
import { usePageMeta } from '../../config/hooks/usePageMeta'

export default function Services() {
  const { label, color } = usePageMeta();
  return (
    <section className={styles.services}>
       <PageTitle text={label} color={color} />
      <ul className={styles.list}>
        <li>🔧 Intégration Web (HTML / CSS / JS)</li>
        <li>⚙️ Mise en place de Redux Toolkit + RTK Query</li>
        <li>🌐 Internationalisation (i18n)</li>
        <li>✨ Optimisation et performance</li>
      </ul>
    </section>
  );
}
