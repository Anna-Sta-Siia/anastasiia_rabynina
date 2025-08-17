// src/components/Filter/index.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useUI } from "../../context";
import PetalFilter from "../Petal/PetalFilter";
import styles from "./Filter.module.css";

import baseFilters from "../../assets/traduction/filters/filters.base.json";
import labelsFR from "../../assets/traduction/filters/filters.fr.json";
import labelsEN from "../../assets/traduction/filters/filters.en.json";
import labelsRU from "../../assets/traduction/filters/filters.ru.json";
import uiFR from "../../assets/traduction/filters/ui.fr.json";
import uiEN from "../../assets/traduction/filters/ui.en.json";
import uiRU from "../../assets/traduction/filters/ui.ru.json";

export default function Filter({
  onChange,
  items: itemsProp,
  defaultSelected = [],
  defaultSearch = "",
  defaultSort = "",
  defaultMode = "or",
  fireOnMount = true,
}) {
  const { language } = useUI();

  const labelsMap = useMemo(
    () => ({ fr: labelsFR, en: labelsEN, ru: labelsRU }[language] || labelsEN),
    [language]
  );
  const ui = useMemo(() => ({ fr: uiFR, en: uiEN, ru: uiRU }[language] || uiEN), [language]);

  const items = useMemo(() => {
    if (itemsProp?.length) return itemsProp;
    return baseFilters.map((f) => ({ ...f, label: labelsMap[f.key] ?? f.key }));
  }, [itemsProp, labelsMap]);

  const [selected, setSelected] = useState(defaultSelected);
  const [search, setSearch] = useState(defaultSearch);
  const [sort, setSort] = useState(defaultSort);
  const [mode, setMode] = useState(defaultMode);

  const signature = useMemo(() => {
    const sel = Array.isArray(defaultSelected) ? defaultSelected.join("|") : "";
    return `${defaultMode}::${defaultSort}::${defaultSearch}::${sel}`;
  }, [defaultSelected, defaultSearch, defaultSort, defaultMode]);

  // ⛑️ DEV/StrictMode: ignorer les 2 premiers passages du useEffect si fireOnMount=false
  const skipCount = useRef(0);

  useEffect(() => {
    setSelected(Array.isArray(defaultSelected) ? defaultSelected : []);
    setSearch(defaultSearch || "");
    setSort(defaultSort || "");
    setMode(defaultMode || "or");

    if (!fireOnMount) {
      if (skipCount.current < 2) {
        skipCount.current += 1;
        return; // ne pas appeler onChange sur les 2 premiers passages
      }
    }

    onChange?.({
      filters: Array.isArray(defaultSelected) ? defaultSelected : [],
      search: defaultSearch || "",
      sort: defaultSort || "",
      mode: defaultMode || "or",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, fireOnMount]);

  function pushChange(nextSel = selected, nextSearch = search, nextSort = sort, nextMode = mode) {
    onChange?.({ filters: nextSel, search: nextSearch, sort: nextSort, mode: nextMode });
  }

  function toggle(key, e) {
    const wasEmpty = selected.length === 0;
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];

    if (!next.length) {
      setSelected(next);
      setMode(defaultMode);
      pushChange([], search, sort, defaultMode);
      return;
    }

    const baseMode = wasEmpty ? defaultMode : mode;
    const nextMode = e?.altKey ? "and" : baseMode;

    setSelected(next);
    setMode(nextMode);
    pushChange(next, search, sort, nextMode);
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
            onClick={(e) => toggle(key, e)}
          />
        ))}
      </div>

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
    </div>
  );
}
