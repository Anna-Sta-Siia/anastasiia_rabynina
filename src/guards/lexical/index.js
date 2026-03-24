// src/guards/index.js
import { makeProfanityChecker } from "./profanity";
import { makeGibberishChecker } from "./gibberish";
import { looksLikeUrlOrHtml } from "./utils";

/**
 * Nom/prénom international : lettres Unicode + séparateurs simples entre groupes
 * (ex : Anne-Sophie, O'Connor, Мария Анна)
 */
export const NAME_RE = /^(?!.*[ '\-’]{2})(?!.*[ '\-’]$)[\p{L}]+(?:[ '\-’][\p{L}]+)*$/u;

/** Normalise un input texte (trim + collapse espaces) — Unicode-safe */
export const normalize = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : v);

/** Applique des règles seulement si une valeur est présente (pour champs optionnels) */
function optionalize(rules) {
  const wrapped = {};
  for (const [k, fn] of Object.entries(rules)) {
    wrapped[k] = (v) => !v || fn(v);
  }
  return wrapped;
}

/**
 * Heuristique légère : texte majoritairement en cyrillique ?
 * Sert à éviter les faux positifs “gibberish” quand on tape en russe.
 */
const CYR = /\p{sc=Cyrillic}/u;
const LETTER = /\p{L}/u;

/**
 * Fabrique tous les “guards” (validateurs) selon la langue active.
 * @param {Object} opts
 * @param {"fr"|"en"|"ru"} opts.lang
 * @param {string[]} opts.whitelist mots autorisés malgré la détection de grossièretés
 * @param {string[]} opts.extraBadWords mots à ajouter au lexique des grossièretés
 */
export function makeContentGuards({ lang = "fr", whitelist = [], extraBadWords = [] } = {}) {
  const hasProfanity = makeProfanityChecker({ lang, whitelist, extra: extraBadWords });
  const isGibberish = makeGibberishChecker(); // langue-agnostique → on met une soupape cyrillique

  // Règles pour les noms, avec messages i18n
  const nameRules = (t) => ({
    pattern: (v) =>
      NAME_RE.test(v) || (t?.errors?.patternCommon ?? "Only letters, spaces, - and '."),
    noUrl: (v) => !looksLikeUrlOrHtml(v) || (t?.errors?.noUrl ?? "No links/HTML here"),
    noProfanity: (v) => !hasProfanity(v) || (t?.errors?.profanity ?? "Inappropriate language"),
    // язык-агностичная проверка: и латиница, и кириллица, для всех lang
    noGibberish: (v) => !isGibberish(v) || (t?.errors?.gibberish ?? "Looks like gibberish"),
  });

  return {
    // Prénom = requis
    forNameRequired: (t) => nameRules(t),

    // Nom de famille = optionnel
    forLastNameOptional: (t) => optionalize(nameRules(t)),

    // Email (le pattern email reste dans le champ RHF)
    forEmail: (t) => ({
      noProfanity: (v) => !hasProfanity(v) || (t?.errors?.profanityEmail ?? "Adresse inacceptable"),
    }),

    // Société (optionnel)
    forCompany: (t) =>
      optionalize({
        noUrl: (v) => !looksLikeUrlOrHtml(v) || (t?.errors?.noUrl ?? "Pas de liens/HTML ici"),
        noProfanity: (v) => !hasProfanity(v) || (t?.errors?.profanity ?? "Langage inapproprié"),
        noGibberish: (v) => {
          const txt = String(v || "").trim();
          if (!txt) return true; // optionnel → vide OK

          // lettres / voyelles (FR/EN + cyrillique), séparateurs usuels d'une raison sociale
          const letters = (txt.match(/\p{L}/gu) || []).length;
          const vowels = (txt.match(/[aeiouyàâäéèêëîïôöùûüAEIOUYаеёиоуыэюяАЕЁИОУЫЭЮЯ]/gu) || [])
            .length;
          const separators = (txt.match(/[&+@.,'’/\-() ]/g) || []).length;

          // 1) suites répétées (aaaaa, -----)
          if (/(.)\1{4,}/.test(txt))
            return t?.errors?.gibberish ?? "Le texte ressemble à un gribouillage";

          // 2) motifs clavier évidents
          if (/azerty|qwerty|asdfg|йцукен/iu.test(txt))
            return t?.errors?.gibberish ?? "Le texte ressemble à un gribouillage";

          // 3) très pauvre en voyelles (long, sans séparateurs)
          const len = txt.length;
          if (len >= 9 && separators === 0 && vowels / (letters || 1) < 0.15)
            return t?.errors?.gibberish ?? "Le texte ressemble à un gribouillage";

          // 4) très long bloc sans séparateurs (ça sent la frappe au hasard)
          if (len >= 18 && separators === 0)
            return t?.errors?.gibberish ?? "Le texte ressemble à un gribouillage";

          // sinon OK (on tolère chiffres & symboles usuels dans les raisons sociales)
          return true;
        },
      }),

    // Sujet (pour “other”/custom)
    forSubject: (t) => ({
      noUrl: (v) => !looksLikeUrlOrHtml(v) || (t?.errors?.noUrl ?? "No links/HTML here"),
      noProfanity: (v) => !hasProfanity(v) || (t?.errors?.profanity ?? "Sujet inapproprié"),
      noGibberish: (v) => !isGibberish(v) || (t?.errors?.gibberish ?? "Sujet invalide"),
    }),

    // Message
    forMessage: (t) => ({
      noProfanity: (v) =>
        !hasProfanity(v) || (t?.errors?.profanity ?? "Merci de reformuler (langage inapproprié)."),
      noGibberish: (v) =>
        !isGibberish(v) || (t?.errors?.gibberish ?? "Le message ressemble à un gribouillage"),
    }),

    // utilitaires exposés
    _raw: { hasProfanity, isGibberish, looksLikeUrlOrHtml, NAME_RE, normalize },
  };
}
