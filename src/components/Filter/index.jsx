import { useMemo, useState } from 'react';
import { useUI } from '../../context';
import base from '../../assets/traduction/filters/filters.base.json';

import labelsFr from '../../assets/traduction/filters/filters.fr.json';
import labelsEn from '../../assets/traduction/filters/filters.en.json';
import labelsRu from '../../assets/traduction/filters/filters.ru.json';

import uiFr from '../../assets/traduction/filters/ui.fr.json';
import uiEn from '../../assets/traduction/filters/ui.en.json';
import uiRu from '../../assets/traduction/filters/ui.ru.json';

import PetalFilter from '../Petal/PetalFilter';
import styles from './Filter.module.css';

export default function Filter({ onChange }) {
  const { language } = useUI();

  const labels = useMemo(() => {
    switch (language) {
      case 'en': return labelsEn;
      case 'ru': return labelsRu;
      default:   return labelsFr;
    }
  }, [language]);

  const ui = useMemo(() => {
    switch (language) {
      case 'en': return uiEn;
      case 'ru': return uiRu;
      default:   return uiFr;
    }
  }, [language]);

  // fusion méta (key,color) + libellé traduit
  const pills = useMemo(
    () => base.map(t => ({ ...t, label: labels[t.key] ?? t.key })),
    [labels]
  );

  const [selected, setSelected] = useState([]);

  const toggle = (key) => {
    setSelected(prev => {
      const next = prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key];
      onChange?.(next);
      return next;
    });
  };

  const resetAll = () => {
    setSelected([]);
    onChange?.([]); // [] = tous les projets
  };

  return (
    <div className={styles.filterBar}>
      {/* Bouton "Tous" */}
      <PetalFilter
        key="_ALL_"
        name={ui.all}
        color="#e0e0e0"
        active={selected.length === 0}
        onClick={resetAll}
      />

      {/* Pills techniques & méthodes */}
      {pills.map(({ key, label, color }) => (
        <PetalFilter
          key={key}
          name={label}
          color={color}
          active={selected.includes(key)}
          onClick={() => toggle(key)}
        />
      ))}
    </div>
  );
}
