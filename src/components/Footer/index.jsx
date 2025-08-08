import styles from './Footer.module.css';
import { useUI } from '../../context';
import footerEn from '../../assets/traduction/footer/footer.en.json';
import footerFr from '../../assets/traduction/footer/footer.fr.json';
import footerRu from '../../assets/traduction/footer/footer.ru.json';


  
  export default function Footer() {
  const { language } = useUI();
  const translations = { fr: footerFr, en:footerEn, ru: footerRu };
  const footer = translations[language] || footerEn;
  return (
   <footer className={styles.footer}>
    © {new Date().getFullYear()} {footer.paragraph}
</footer> 
  );
}
