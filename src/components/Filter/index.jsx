// src/components/Filter/index.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import PetalFilter from "../Petal/PetalFilter";
import styles from "./Filter.module.css";

import baseFilters from "../../assets/traduction/filters/filters.base.json";
import labelsFR from "../../assets/traduction/filters/filters.fr.json";
import labelsEN from "../../assets/traduction/filters/filters.en.json";
import labelsRU from "../../assets/traduction/filters/filters.ru.json";

import filtersUiFr from "../../assets/traduction/filters/filtersUi.fr.json";
import filtersUiEn from "../../assets/traduction/filters/filtersUi.en.json";
import filtersUiRu from "../../assets/traduction/filters/filtersUi.ru.json";

const LABELS = { fr: labelsFR, en: labelsEN, ru: labelsRU };
const UI = { fr: filtersUiFr, en: filtersUiEn, ru: filtersUiRu };

export default function Filter({
  lang = "fr",
  onChange,
  items: itemsProp,
  defaultSelected = [],
  defaultSearch = "",
  defaultSort = "",
  defaultMode = "or",
  fireOnMount = true,
  searchToolsRow = true,
}) {
  const labelsMap = LABELS[lang] || LABELS.fr;
  const ui = UI[lang] || UI.fr;

  const items = useMemo(() => {
    if (itemsProp?.length) return itemsProp;

    return baseFilters.map((f) => ({
      ...f,
      label: labelsMap[f.key] ?? f.key,
    }));
  }, [itemsProp, labelsMap]);

  const [selected, setSelected] = useState(defaultSelected);
  const [search, setSearch] = useState(defaultSearch);
  const [sort, setSort] = useState(defaultSort);
  const [mode, setMode] = useState(defaultMode);

  const signature = useMemo(() => {
    const sel = Array.isArray(defaultSelected) ? defaultSelected.join("|") : "";
    return `${defaultMode}::${defaultSort}::${defaultSearch}::${sel}`;
  }, [defaultSelected, defaultSearch, defaultSort, defaultMode]);

  const skipCount = useRef(0);

  useEffect(() => {
    setSelected(Array.isArray(defaultSelected) ? defaultSelected : []);
    setSearch(defaultSearch || "");
    setSort(defaultSort || "");
    const safeMode = defaultMode || "or";
    setMode(safeMode);

    if (!fireOnMount) {
      if (skipCount.current < 2) {
        skipCount.current += 1;
        return;
      }
    }

    onChange?.({
      filters: Array.isArray(defaultSelected) ? defaultSelected : [],
      search: defaultSearch || "",
      sort: defaultSort || "",
      mode: safeMode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, fireOnMount]);

  function pushChange(nextSel = selected, nextSearch = search, nextSort = sort, nextMode = mode) {
    onChange?.({ filters: nextSel, search: nextSearch, sort: nextSort, mode: nextMode });
  }

  function toggle(key) {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];

    setSelected(next);
    setMode(defaultMode);
    pushChange(next, search, sort, defaultMode);
  }

  function clearAll() {
    setSelected([]);
    setSearch("");
    setSort("");
    setMode(defaultMode);
    pushChange([], "", "", defaultMode);
  }

  return (
    <div className={styles.filterBar}>
      <div className={styles.pillsRow}>
        <PetalFilter name={ui.all} color="#ddd" active={!selected.length} onClick={clearAll} />

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

      {searchToolsRow && (
        <div className={styles.searchRow}>
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
              className={sort === "az" ? styles.activeBtn : ""}
              onClick={() => {
                setSort("az");
                pushChange(selected, search, "az");
              }}
            >
              {ui.sortAZ}
            </button>

            <button
              type="button"
              className={sort === "za" ? styles.activeBtn : ""}
              onClick={() => {
                setSort("za");
                pushChange(selected, search, "za");
              }}
            >
              {ui.sortZA}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
