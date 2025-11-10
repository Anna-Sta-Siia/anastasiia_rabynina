import { useLayoutEffect, useState } from "react";
import { measureOverflow } from "../utils/overflow";

export function useOverflow(ref, deps = [], { slack = 1 } = {}) {
  const [isOverflow, setOverflow] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setOverflow(measureOverflow(el, slack));
    measure(); // 1ère mesure

    // Surveille les changements de taille du contenu/boîte
    let ro;
    if (window.ResizeObserver && el) {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // <- passe les dépendances de contenu/langue ici

  return isOverflow;
}
