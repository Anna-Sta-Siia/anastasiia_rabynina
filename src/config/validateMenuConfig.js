// src/config/validateMenuConfig.js
//pour vérifier que  menuConfig est cohérent
export function validateMenuConfig(items, { mode = "warn" } = {}) {
  const errors = [];

  const push = (msg) => errors.push(msg);

  if (!Array.isArray(items)) {
    //on vérifie d'abord si notre menuConfig est un tableau
    push("Menu config: items n'est pas un tableau.");
  } else {
    const seenKeys = new Set(); //set , car à l'interieur tous les keys sont uniques

    items.forEach((it, i) => {
      const where = `items[${i}] (key: ${it?.key ?? "?"})`; // pour faire apparaitre les erreurs plus visisbles

      // key-verifier presence, forme et uniquité
      if (typeof it?.key !== "string" || it.key.trim() === "") {
        push(`${where}: key manquante ou invalide.`);
      } else if (seenKeys.has(it.key)) {
        push(`${where}: key dupliquée "${it.key}".`);
      } else {
        seenKeys.add(it.key);
      }

      // path
      const raw = it?.path;
      if (typeof raw !== "string") {
        push(`${where}: path manquant ou invalide (reçu: ${String(raw)}).`);
      } else {
        const p = raw.trim();
        const isExternal = /^https?:\/\//.test(p);

        // ✅ Autorisé: accueil "/" (et on tolère "" si tu veux)
        const isHome = p === "/" || p === "";

        // ✅ Autorisé: route interne "projects" ou "/projects"
        // (on refuse les trucs bizarres comme "projects/test" si tu veux strict,
        // mais ici je reste simple)
        const isInternalLogical =
          p.length > 0 &&
          !isExternal &&
          (p.startsWith("/") || /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(p));

        if (!isExternal && !isHome && !isInternalLogical) {
          push(
            `${where}: path invalide. Attendu: "/" (home), "projects" (interne logique) ou "https://..." (externe). Reçu: "${p}".`
          );
        }
      }

      // color
      if (typeof it?.color !== "string" || it.color.trim() === "") {
        push(`${where}: color manquante ou invalide.`);
      }
    });
  }

  if (errors.length > 0) {
    const message = `[MenuConfig] ${errors.length} problème(s):\n- ${errors.join("\n- ")}`;
    if (mode === "throw") throw new Error(message);
    console.warn(message);
  }

  return { ok: errors.length === 0, errors };
}
