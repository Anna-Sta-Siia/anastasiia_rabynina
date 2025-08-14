// src/pages/Projects/index.jsx
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

  // Nouvel état combiné : filtres + recherche + tri
  const [query, setQuery] = useState({ filters: [], search: '', sort: '' });

  // Choisir le dataset par langue
  const allProjects = useMemo(() => {
    switch (language) {
      case 'en': return projectsEn;
      case 'ru': return projectsRu;
      default:   return projectsFr;
    }
  }, [language]);

  // Normalisation pour recherche (insensible à la casse/accents)
  const norm = (s = '') =>
    s.toLowerCase()
     .normalize('NFD')
     .replace(/\p{Diacritic}/gu, '');

  // Filtrage + recherche + tri
  const filteredProjects = useMemo(() => {
    const { filters, search, sort } = query;
    let list = allProjects;

    // 1) filtres par stack (ET logique)
    if (filters.length) {
      list = list.filter(p => filters.every(f => p.stack.includes(f)));
    }

    // 2) recherche par titre
    if (search.trim()) {
      const q = norm(search);
      list = list.filter(p => norm(p.title).includes(q));
    }

    // 3) tri A→Z / Z→A (locale-aware)
    if (sort === 'az') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, language));
    } else if (sort === 'za') {
      list = [...list].sort((a, b) => b.title.localeCompare(a.title, language));
    }

    return list;
  }, [query, allProjects, language]);

  // Compatibilité avec l’ancienne version du <Filter />
  function handleFilterChange(payload) {
    if (Array.isArray(payload)) {
      // Ancienne signature: on ne recevait que les filtres
      setQuery(prev => ({ ...prev, filters: payload }));
    } else {
      // Nouvelle signature: { filters, search, sort }
      setQuery(payload);
    }
  }

  return (
    <section className={styles.projects}>
      <PageTitle text={label} color={color} />

      <Filter onChange={handleFilterChange} />

      <div className={styles.projectslist}>
        {filteredProjects.map(project => (
          <ProjetCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
