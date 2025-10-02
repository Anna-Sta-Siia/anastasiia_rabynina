// src/guards/utils.js

/** Normalise un input texte : trim + collapse des espaces + NFKD + lowercase */
export const normalize = (v = "") =>
  String(v).normalize("NFKD").toLowerCase().replace(/\s+/g, " ").trim();

/** Version sans lowercase (utile pour afficher tout en gardant un trim propre) */
export const normalizeSoft = (v = "") => String(v).replace(/\s+/g, " ").trim();

/** Détecte les URLs ou balises HTML (basique mais efficace pour nos champs) */
export const looksLikeUrlOrHtml = (s = "") => /(https?:\/\/|www\.)|<\w+>/i.test(s);

/** Échappe une chaîne pour l’insérer dans une RegExp en sécurité */
export const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True si chaîne vide / whitespace only */
export const isEmpty = (s = "") => !String(s).trim();

/** Longueur “graphemes” (emoji/accents comptés correctement) */
export const graphemeLength = (s = "") => {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(String(s)))
      .length;
  }
  return Array.from(String(s)).length; // fallback code points
};

/**
 * Enveloppe des règles RHF pour qu’elles ne s’appliquent que si une valeur est fournie
 * (pratique pour les champs optionnels : lastName, company, etc.)
 */
export const optionalize = (rules = {}) => {
  const wrapped = {};
  for (const [k, fn] of Object.entries(rules)) {
    wrapped[k] = (v) => isEmpty(v) || fn(v);
  }
  return wrapped;
};
