import styles from './Services.module.css';

export default function Services() {
  return (
    <section className={styles.services}>
      <h2>Mes Services</h2>
      <ul className={styles.list}>
        <li>🔧 Intégration Web (HTML / CSS / JS)</li>
        <li>⚙️ Mise en place de Redux Toolkit + RTK Query</li>
        <li>🎨 Maquettage & prototypage Figma</li>
        <li>🌐 Internationalisation (i18n)</li>
        <li>✨ Optimisation et performance</li>
      </ul>
    </section>
  );
}
