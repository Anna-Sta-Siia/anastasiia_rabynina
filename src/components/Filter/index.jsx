import { useState } from 'react';
import filters from '../../assets/filters.json';
import PetalFilter from '../Petal/PetalFilter'; 
import styles from './Filter.module.css';

export default function Filter({ onChange }) {
  const [selected, setSelected] = useState([]);

  function toggleFilter(key) {
    const updated =
      selected.includes(key)
        ? selected.filter(f => f !== key)
        : [...selected, key];

    setSelected(updated);
    onChange(updated); // pour envoyer au parent (ex : la page des projets)
  }

  return (
    <div className={styles.filterBar}>
      {filters.map(({ key, label, color }) => (
        <PetalFilter
          key={key}
          name={label}
          color={color}
          active={selected.includes(key)}
          onClick={() => toggleFilter(key)}
        />
      ))}
    </div>
  );
}
