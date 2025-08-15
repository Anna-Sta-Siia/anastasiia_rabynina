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

/* ===== Helpers hors composant (stables) ===== */
const normalize = (s = '') =>
  s.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .trim();

const startsAtWord = (title, q) => {
  const t = normalize(title);
  const n = normalize(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
  const re = new RegExp(`(^|[\\s-_])${n}`, 'i');                 // début de mot
  return re.test(t);
};

export default function Projects() {
  const { label, color } = usePageMeta();
  const { language } = useUI();

  // filtres + recherche + tri
  const [query, setQuery] = useState({ filters: [], search: '', sort: '' });

  // dataset par langue
  const allProjects = useMemo(() => {
    switch (language) {
      case 'en': return projectsEn;
      case 'ru': return projectsRu;
      default:   return projectsFr;
    }
  }, [language]);

  // filtre + recherche (début de mot) + tri
  const filteredProjects = useMemo(() => {
    const { filters, search, sort } = query;
    let list = allProjects;

    if (filters.length) {
      list = list.filter(p => filters.every(f => p.stack.includes(f)));
    }

    if (search.trim()) {
      list = list.filter(p => startsAtWord(p.title, search));
    }

    if (sort === 'az') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, language));
    } else if (sort === 'za') {
      list = [...list].sort((a, b) => b.title.localeCompare(a.title, language));
    }

    return list;
  }, [query, allProjects, language]); 

  function handleFilterChange(payload) {
    if (Array.isArray(payload)) {
      setQuery(prev => ({ ...prev, filters: payload }));
    } else {
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
