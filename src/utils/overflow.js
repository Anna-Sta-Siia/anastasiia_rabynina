// Retourne true si le contenu déborde verticalement OU horizontalement
export function measureOverflow(el, slack = 1) {
  if (!el) return false;
  const overY = el.scrollHeight > el.clientHeight + slack;
  const overX = el.scrollWidth > el.clientWidth + slack;
  return overY || overX;
}

// Heuristique "texte > N lignes" (utile quand tu n'as pas le DOM encore)
export function exceedsLines(text, chPerLine = 26, maxLines = 5) {
  const s = (text ?? "").toString().trim();
  if (!s) return false;
  const hard = s.split(/\r?\n/).length; // lignes "dures"
  const est = Math.ceil(s.replace(/\r?\n/g, " ").length / chPerLine);
  return Math.max(hard, est) > maxLines;
}
