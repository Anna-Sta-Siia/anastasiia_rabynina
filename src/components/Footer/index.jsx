import { forwardRef } from 'react';
import styles from './Footer.module.css';
import { useUI } from '../../context';

import footerEn from '../../assets/traduction/footer/footer.en.json';
import footerFr from '../../assets/traduction/footer/footer.fr.json';
import footerRu from '../../assets/traduction/footer/footer.ru.json';

const Footer = forwardRef(function Footer({ className = '', style }, ref) {
  const { language } = useUI();
  const t = ({ fr: footerFr, en: footerEn, ru: footerRu }[language]) || footerEn;

  return (
    <footer
      ref={ref}
      className={`${styles.footer} ${className}`}
      style={style}
    >
      © {new Date().getFullYear()} {t.paragraph}
    </footer>
  );
});

export default Footer;
