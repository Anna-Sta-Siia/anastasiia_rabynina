// src/guards/index.js
import { makeProfanityChecker } from "./profanity";
import { makeGibberishChecker } from "./gibberish";
import { looksLikeUrlOrHtml } from "./utils";

// Regex nom/prénom international : lettres + séparateurs simples entre groupes
export const NAME_RE = /^[\p{L}]+(?:[ '\-’][\p{L}]+)*$/u;

// Normalise un input texte (trim + collapse espaces)
export const normalize = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : v);

// Enveloppe des validateurs pour qu’ils ne s’appliquent que si une valeur est présente
function optionalize(rules) {
  const wrapped = {};
  for (const [k, fn] of Object.entries(rules)) {
    wrapped[k] = (v) => !v || fn(v);
  }
  return wrapped;
}

export function makeContentGuards({ lang = "fr", whitelist = [], extraBadWords = [] } = {}) {
  const hasProfanity = makeProfanityChecker({ lang, whitelist, extra: extraBadWords });
  const isGibberish = makeGibberishChecker();

  // fabrique de règles pour les noms, avec messages i18n
  const nameRules = (t) => ({
    pattern: (v) =>
      NAME_RE.test(v) || (t?.errors?.patternCommon ?? "Only letters, spaces, - and '."),
    noUrl: (v) => !looksLikeUrlOrHtml(v) || (t?.errors?.noUrl ?? "No links/HTML here."),
    noProfanity: (v) => !hasProfanity(v) || (t?.errors?.profanity ?? "Inappropriate language."),
    noGibberish: (v) => !isGibberish(v) || (t?.errors?.gibberish ?? "Looks like gibberish."),
  });

  return {
    // Prénom = requis
    forNameRequired: (t) => nameRules(t),

    // Nom de famille = optionnel
    forLastNameOptional: (t) => optionalize(nameRules(t)),

    // Email (le pattern email reste dans le champ RHF)
    forEmail: (t) => ({
      noProfanity: (v) =>
        !hasProfanity(v) || (t?.errors?.profanityEmail ?? "Adresse inacceptable."),
    }),

    // Société (optionnel)
    forCompany: (t) =>
      optionalize({
        noUrl: (v) => !looksLikeUrlOrHtml(v) || (t?.errors?.noUrl ?? "Pas de liens/HTML ici."),
        noProfanity: (v) => !hasProfanity(v) || (t?.errors?.profanity ?? "Langage inapproprié."),
      }),

    // Sujet
    forSubject: (t) => ({
      noUrl: (v) => !looksLikeUrlOrHtml(v) || (t?.errors?.noUrl ?? "No links/HTML here."),
      noProfanity: (v) => !hasProfanity(v) || (t?.errors?.profanity ?? "Sujet inapproprié."),
      noGibberish: (v) => !isGibberish(v) || (t?.errors?.gibberish ?? "Sujet invalide."),
    }),

    // Message
    forMessage: (t) => ({
      noProfanity: (v) =>
        !hasProfanity(v) || (t?.errors?.profanity ?? "Merci de reformuler (langage inapproprié)."),
      noGibberish: (v) =>
        !isGibberish(v) || (t?.errors?.gibberish ?? "Le message ressemble à un gribouillage."),
    }),

    // utilitaires exposés
    _raw: { hasProfanity, isGibberish, looksLikeUrlOrHtml, NAME_RE, normalize },
  };
}
