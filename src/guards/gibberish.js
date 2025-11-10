// src/guards/gibberish.js

/**
 * Détection simple mais robuste de texte "gribouillé" (indépendante de la langue)
 */
export function makeGibberishChecker() {
  return function isGibberish(s = "") {
    const txt = String(s).trim();
    if (!txt) return false;

    // 1. Répétitions de caractères identiques (aaaaa, !!!!!, 11111)
    if (/(.)\1{4,}/u.test(txt)) return true;

    // 2. Trop peu de lettres par rapport aux autres signes
    const letters = (txt.match(/\p{L}/gu) || []).length;
    if (letters && (txt.length - letters) / txt.length > 0.5) return true;

    // 3. Longues séquences de consonnes (>=5)
    //    Peu importe la langue : 5 consonnes d’affilée, c’est louche
    if (/[bcdfghjklmnpqrstvwxzБВГДЖЗЙКЛМНПРСТФХЦЧШЩ]{5,}/iu.test(txt)) return true;

    // 4. Texte sans voyelle (FR/EN/RU de base)
    //    -> à partir de 5 caractères, s’il n’y a aucune voyelle
    if (txt.length >= 5 && !/[aeiouyàâäéèêëîïôöùûüÿœæаеёиоуыэюя]/iu.test(txt)) return true;

    // 5. Claviers absurdes
    if (/qwerty|azerty|asdfg|йцукен|цукен/iu.test(txt)) return true;

    return false;
  };
}
