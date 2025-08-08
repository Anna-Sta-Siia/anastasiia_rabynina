import { useUI } from '../../context';
import { useLocation, Link } from 'react-router-dom';
import menuItems from '../../config/menuConfig';

import luna from '../../assets/images/luna.svg';
import solnyshko from '../../assets/images/solnyshko.svg';
import styles from './Header.module.css';
import Menu from '../Menu';

export default function Header() {
  const { theme, setTheme, language, setLanguage } = useUI();
  const location = useLocation();
  const currentPath = location.pathname;

  const logoText = language === 'ru' ? 'Анастасия Р. ' : 'Anastasia R.';

  // Trouver la couleur de fond de la page active
  const matched = menuItems.find(item => item.path === currentPath);
  const bgColor = matched?.color || '#FFFFFF'; // fallback

  return (
    <header className={styles.header} style={{ backgroundColor: bgColor }}>
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
            className={`${styles.control} ${styles.langSelect}`}
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="ru">RU</option>
          </select>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
            className={`${styles.control} ${styles.themeButton}`}
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
