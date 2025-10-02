export function makeGibberishChecker() {
  return function isGibberish(s = "") {
    const txt = String(s).trim();
    if (!txt) return false;
    if (/(.)\1{4,}/.test(txt)) return true; // aaaa, !!!!, 1111
    const letters = (txt.match(/\p{L}/gu) || []).length;
    if (letters && (txt.length - letters) / txt.length > 0.5) return true;
    if (txt.length >= 12 && !/[aeiouyàâäéèêëîïôöùûüAEIOUY]/.test(txt)) return true;
    if (/qwerty|azerty|asdfg|йцукен|цукен/iu.test(txt)) return true;
    return false;
  };
}
