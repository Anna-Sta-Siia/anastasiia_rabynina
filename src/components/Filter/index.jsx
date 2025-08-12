// src/components/Filter/index.jsx
import { useState, useMemo } from 'react';
import { useUI } from '../../context';
import PetalFilter from '../Petal/PetalFilter';
import styles from './Filter.module.css';

import baseFilters from '../../assets/traduction/filters/filters.base.json';
import labelsFR from '../../assets/traduction/filters/filters.fr.json';
import labelsEN from '../../assets/traduction/filters/filters.en.json';
import labelsRU from '../../assets/traduction/filters/filters.ru.json';
import uiFR from '../../assets/traduction/filters/ui.fr.json';
import uiEN from '../../assets/traduction/filters/ui.en.json';
import uiRU from '../../assets/traduction/filters/ui.ru.json';

export default function Filter({ onChange }) {
  const { language } = useUI();
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(''); // '', 'az', 'za'

  const labelsMap = useMemo(
    () => ({ fr: labelsFR, en: labelsEN, ru: labelsRU }[language] || labelsEN),
    [language]
  );
  const ui = useMemo(
    () => ({ fr: uiFR, en: uiEN, ru: uiRU }[language] || uiEN),
    [language]
  );

  const items = useMemo(
    () => baseFilters.map(f => ({ ...f, label: labelsMap[f.key] ?? f.key })),
    [labelsMap]
  );

  function pushChange(nextSelected = selected, nextSearch = search, nextSort = sort) {
    onChange?.({ filters: nextSelected, search: nextSearch, sort: nextSort });
  }

  function toggle(key) {
    const next = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key];
    setSelected(next);
    pushChange(next);
  }

  function clearAll() {
    setSelected([]);
    setSearch('');
    setSort('');
    onChange?.({ filters: [], search: '', sort: '' });
  }

  return (
    <div className={styles.filterBar}>
      {/* 1) RANGÉE DES FILTRES : “Tous” + bulles colorées */}
      <div className={styles.pillsRow}>
        <PetalFilter
          name={ui.all}
          color="#ddd"
          active={!selected.length}
          onClick={clearAll}
        />
        {items.map(({ key, color, label }) => (
          <PetalFilter
            key={key}
            name={label}
            color={color}
            active={selected.includes(key)}
            onClick={() => toggle(key)}
          />
        ))}
      </div>

      {/* 2) RANGÉE OUTILS : recherche + tri */}
      <div className={styles.toolsRow}>
        <input
          className={styles.search}
          type="search"
          placeholder={ui.search}
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            pushChange(selected, v);
          }}
        />
        <div className={styles.sortBtns}>
          <button
            type="button"
            className={sort === 'az' ? styles.activeBtn : ''}
            onClick={() => { setSort('az'); pushChange(selected, search, 'az'); }}
          >
            {ui.sortAZ}
          </button>
          <button
            type="button"
            className={sort === 'za' ? styles.activeBtn : ''}
            onClick={() => { setSort('za'); pushChange(selected, search, 'za'); }}
          >
            {ui.sortZA}
          </button>
        </div>
      </div>
    </div>
  );
}
