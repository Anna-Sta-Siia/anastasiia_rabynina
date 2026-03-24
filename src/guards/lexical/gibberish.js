/**
 * Vérification gibberish UNIVERSELLE (latin + cyrillique)
 */
export function makeGibberishChecker() {
  return function isGibberishUniversal(input = "") {
    const s = String(input).toLowerCase();

    // garder lettres + chiffres (latin + cyrillique)
    const clean = s.replace(/[^a-zа-яё0-9]+/gi, " ");
    const words = clean.split(/\s+/).filter((w) => w.length >= 4);
    if (!words.length) return false;

    let weird = 0;

    for (const w of words) {
      const letters = w.replace(/[^a-zа-яё]/gi, "");
      if (!letters) continue;

      const vowels = (letters.match(/[aeiouyаеёиоуыэюя]/gi) || []).length;

      const longRun =
        /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(letters) ||
        /[бвгджзйклмнпрстфхцчшщ]{5,}/i.test(letters);

      const noVowels = vowels === 0;
      const lowRatio = vowels / letters.length < 0.2;

      if (noVowels || lowRatio || longRun) weird++;
    }

    return weird > 0 && weird / words.length >= 0.5;
  };
}
