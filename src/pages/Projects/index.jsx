import styles from './Projects.module.css';
import Filter from '../../components/Filter';
import ProjetCard from '../../components/ProjetCard';
import { useState, useMemo } from 'react';
import { useUI } from '../../context';
import PageTitle from '../../components/PageTitle';
import { usePageMeta } from '../../config/hooks/usePageMeta';

import projectsFr from '../../assets/traduction/projet/projet.fr.json';
import projectsEn from '../../assets/traduction/projet/projet.en.json';
import projectsRu from '../../assets/traduction/projet/projet.ru.json';

export default function Projects() {
  const { label, color } = usePageMeta();
  const { language } = useUI();

  const [activeFilters, setActiveFilters] = useState([]);

  // choisir le dataset par langue
  const allProjects = useMemo(() => {
    switch (language) {
      case 'en': return projectsEn;
      case 'ru': return projectsRu;
      default:   return projectsFr;
    }
  }, [language]);

  // filtrage par clés de stack
  const filteredProjects = useMemo(() => {
    if (!activeFilters.length) return allProjects;
    return allProjects.filter(project =>
      activeFilters.every(f => project.stack.includes(f))
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
