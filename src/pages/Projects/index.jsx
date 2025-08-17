// src/pages/Projects/index.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Projects.module.css";
import Filter from "../../components/Filter";
import ProjetCard from "../../components/ProjetCard";
import PageTitle from "../../components/PageTitle";
import { usePageMeta } from "../../config/hooks/usePageMeta";
import { useUI } from "../../context";

import projectsFr from "../../assets/traduction/projet/projet.fr.json";
import projectsEn from "../../assets/traduction/projet/projet.en.json";
import projectsRu from "../../assets/traduction/projet/projet.ru.json";

/* ===== Helpers stables ===== */
const normalize = (s = "") =>
  s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// début de mot (séparateurs: espace, tiret, underscore)
const startsAtWord = (title, q) => {
  const t = normalize(title);
  const n = normalize(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex
  const re = new RegExp(`(^|[\\s-_])${n}`, "i");
  return re.test(t);
};

export default function Projects() {
  const { label, color } = usePageMeta();
  const { language } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();

  // Jeu de données par langue
  const allProjects = useMemo(() => {
    switch (language) {
      case "en":
        return projectsEn;
      case "ru":
        return projectsRu;
      default:
        return projectsFr;
    }
  }, [language]);

  // Valeur de l’URL (source de vérité pour une arrivée depuis Skills)
  const onlyFromUrl = searchParams.get("only") || "";

  // Sélection à afficher quand on arrive avec ?only=slug
  const prefillFromOnly = useMemo(() => {
    if (!onlyFromUrl) return [];
    const p = allProjects.find((x) => x.id === onlyFromUrl);
    return p?.stack ?? [];
  }, [onlyFromUrl, allProjects]);

  // Mode "only" actif tant que l’utilisateur n’a rien touché
  const [only, setOnly] = useState(onlyFromUrl);

  // Defaults "gelés" que l’on passe à <Filter /> pour éviter toute ré-init intempestive
  const [defaults, setDefaults] = useState({
    selected: prefillFromOnly,
    mode: "and",
  });

  // Si l’URL change vers un NOUVEAU ?only=..., on met à jour le gel ; si on enlève ?only, on NE touche PAS aux defaults.
  useEffect(() => {
    if (onlyFromUrl) {
      setDefaults({ selected: prefillFromOnly, mode: "and" });
      setOnly(onlyFromUrl);
    }
  }, [onlyFromUrl, prefillFromOnly]);

  // État UI courant (filtres/recherche/tri) – indépendamment de "only"
  const [query, setQuery] = useState({
    filters: [],
    search: "",
    sort: "",
    mode: "and",
  });

  // On ignore le 1er onChange automatique envoyé par <Filter> à l'initialisation
  const bootRef = useRef(false);
  const defaultsSignature = useMemo(
    () =>
      JSON.stringify({
        filters: defaults.selected,
        search: "",
        sort: "",
        mode: defaults.mode,
      }),
    [defaults]
  );

  function handleFilterChange(payload) {
    // 1) Ping automatique de Filter après montage → on l’ignore
    if (!bootRef.current && JSON.stringify(payload) === defaultsSignature) {
      bootRef.current = true;
      setQuery(payload); // optionnel, pour rester en phase
      return;
    }

    // 2) Première vraie interaction utilisateur : on quitte le mode "only"
    if (only) {
      setOnly("");
      const next = new URLSearchParams(searchParams);
      next.delete("only");
      setSearchParams(next, { replace: true });
      // IMPORTANT : on NE modifie pas "defaults" ici → Filter garde la même sélection visible
    }

    // 3) Met à jour l’état de filtre courant
    setQuery(payload);
  }

  // Liste filtrée
  const filteredProjects = useMemo(() => {
    const { filters, search, sort, mode } = query;

    // Mode "only" : on *force* un seul projet et on ignore tout le reste
    if (only) {
      return allProjects.filter((p) => p.id === only);
    }

    let list = allProjects;

    // Filtres par stack
    if (filters.length) {
      list =
        mode === "and"
          ? list.filter((p) => filters.every((f) => p.stack.includes(f)))
          : list.filter((p) => filters.some((f) => p.stack.includes(f)));
    }

    // Recherche titre (début de mot)
    if (search.trim()) {
      list = list.filter((p) => startsAtWord(p.title, search));
    }

    // Tri
    if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title, language));
    if (sort === "za") list = [...list].sort((a, b) => b.title.localeCompare(a.title, language));

    return list;
  }, [allProjects, language, only, query]);

  return (
    <section className={styles.projects}>
      <PageTitle text={label} color={color} />

      {/* On fige les defaults tant que l’utilisateur n’a pas réellement cliqué */}
      <Filter
        onChange={handleFilterChange}
        defaultSelected={defaults.selected}
        defaultMode={defaults.mode}
      />

      <div className={styles.projectslist}>
        {filteredProjects.map((project) => (
          <ProjetCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
