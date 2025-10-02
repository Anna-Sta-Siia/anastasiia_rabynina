import fr from "../assets/traduction/profanity/profanity.fr.json";
import en from "../assets/traduction/profanity/profanity.en.json";
import ru from "../assets/traduction/profanity/profanity.ru.json";

const LISTS = { fr, en, ru };
const NORM = (s = "") => String(s).toLowerCase().normalize("NFKD").trim();

/* whitelist pour éviter les classiques faux positifs */
const DEFAULT_WHITELIST = ["concepteur", "assesseur", "asseoir", "scunthorpe"];

/* mapping leet/symboles -> lettres (souple mais raisonnable) */
const SOFT_MAP = {
  a: "[a@àáâä4]+",
  e: "[e3éèêë]+",
  i: "[i1íïî!]+",
  o: "[o0ôöó]+",
  u: "[uúûùü]+",
  c: "[cçk]+",
  s: "[s$5]+",
  t: "[t7]+",
  b: "[b8]+",
  g: "[g9]+",
};

/* autoriser séparateurs entre lettres (.,_,-, espace) 0–2 fois */
const SEP = "[\\s._-]{0,2}";

/* transforme un “bad word” en regex tolérante (p*te, p.u.t.e, pvt3…) */
function wordToSoftRegex(w) {
  const plain = NORM(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const chars = Array.from(plain).map((ch) => {
    const m = SOFT_MAP[ch];
    return m ? m : ch;
  });
  return new RegExp("\\b" + chars.join(SEP) + "\\b", "iu");
}

export function makeProfanityChecker({ lang = "fr", extra = [], whitelist = [] } = {}) {
  const base = LISTS[lang] || [];
  const allow = new Set([...DEFAULT_WHITELIST, ...whitelist].map(NORM));
  const patterns = [...base, ...extra].map(wordToSoftRegex);

  return function containsProfanity(input = "") {
    const txt = NORM(input);
    for (const ok of allow) if (ok && txt.includes(ok)) return false;
    return patterns.some((re) => re.test(txt));
  };
}
