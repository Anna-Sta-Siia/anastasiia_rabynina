import styles from './Projects.module.css';
import Filter from '../../components/Filter';
import ProjetCard from '../../components/ProjetCard';
import { useState, useMemo } from 'react';
import { useUI } from '../../context';
import PageTitle from '../../components/PageTitle';
import { usePageMeta } from '../../config/hooks/usePageMeta'

import projectsFr from '../../assets/traduction/projet/projet.fr.json';
import projectsEn from '../../assets/traduction/projet/projet.en.json';
import projectsRu from '../../assets/traduction/projet/projet.ru.json';

export default function Projects() {
 const { label, color } = usePageMeta();

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
      <PageTitle text={label} color={color} />

      <Filter onChange={setActiveFilters} />

      <div className={styles.grid}>
        {filteredProjects.map(project => (
          <ProjetCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
