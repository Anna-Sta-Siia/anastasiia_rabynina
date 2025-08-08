import styles from './Projects.module.css';
import Filter from '../../components/Filter';
import ProjetCard from '../../components/ProjetCard';
import { useState, useMemo } from 'react';
import { useUI } from '../../context';
import { useLocation } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import menuItems from '../../config/menuConfig';

import projectsFr from '../../assets/traduction/projet/projet.fr.json';
import projectsEn from '../../assets/traduction/projet/projet.en.json';
import projectsRu from '../../assets/traduction/projet/projet.ru.json';

export default function Projects() {
  const location = useLocation();
  const currentPath = location.pathname;
  const pageData = menuItems.find(item => item.path === currentPath);
  const color = pageData?.color || '#eee';
  const [activeFilters, setActiveFilters] = useState([]);
  const { language } = useUI(); // <<< DOIT être à l'intérieur du composant

  // 🌍 Sélectionne le bon fichier de projets selon la langue
  const allProjects = useMemo(() => {
    switch (language) {
      case 'en':
        return projectsEn;
      case 'ru':
        return projectsRu;
      default:
        return projectsFr;
    }
  }, [language]);

  // 🔎 Applique le filtre actif aux projets
  const filteredProjects = useMemo(() => {
    if (activeFilters.length === 0) return allProjects;

    return allProjects.filter(project =>
      activeFilters.every(filter => project.stack.includes(filter))
    );
  }, [activeFilters, allProjects]);

  return (
    <section className={styles.projects}>
      <PageTitle text="Projects" color={color} />

      <Filter onChange={setActiveFilters} />

      <div className={styles.grid}>
        {filteredProjects.map(project => (
          <ProjetCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
