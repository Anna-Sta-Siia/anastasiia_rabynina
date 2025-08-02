import { useUI } from '../../context/UIContext';
import { Link } from 'react-router-dom';
import luna from '../../assets/images/luna.svg';
import solnyshko from '../../assets/images/solnyshko.svg';
import styles from './Header.module.css';
import Menu from '../Menu';

export default function Header() {
  const { theme, setTheme, language, setLanguage } = useUI();
  const logoText = language === 'ru' ? 'Анастасия Р. ' : 'Anastasia R.';

  return (
    <header className={styles.header}>
      <div className={styles.header_up}>
      {/* Gauche : logo */}
      <div className={styles.left}>
        <Link to="/" className={`${styles.logo} logo`}>
          {logoText}
        </Link>
        </div>
      {/* Droite : contrôles */}
      <div className={styles.right}>
  <select
    value={language}
    onChange={e => setLanguage(e.target.value)}
    aria-label="Select language"
    className={`${styles.control} ${styles.langSelect}`}   // <<< ici
  >
    <option value="en">EN</option>
    <option value="fr">FR</option>
    <option value="ru">RU</option>
  </select>

  <button
    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    aria-label="Toggle theme"
    className={`${styles.control} ${styles.themeButton}`}   // <<< et ici
  >
    <img
      src={theme === 'light' ? luna : solnyshko}
      alt={theme === 'light' ? 'Moon icon' : 'Sun icon'}
      className={styles.icon}
    />
  </button>
</div>
      </div>
      {/* Centre : le slider de pétales */}
      <div className={styles.header_bottom}>
        <Menu />
      </div>
    </header>
  );
}