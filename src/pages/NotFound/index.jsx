import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <section className={styles.notfound}>
      <h1>404</h1>
      <p>Oups, cette page n’existe pas.</p>
      <Link to="/" className={styles.homeLink}>Retour à l’accueil</Link>
    </section>
  );
}
