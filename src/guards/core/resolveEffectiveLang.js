import { validatePagePack } from "./validatePagePack";

export function resolveEffectiveLang({
  askedLang,
  contentByLang,
  uiByLang,
  rules,
  fallbackOrder = ["fr", "en", "ru"],
  debugLabel = "Page i18n",
}) {
  const askedCheck = validatePagePack({
    content: contentByLang?.[askedLang],
    ui: uiByLang?.[askedLang],
    rules,
  });

  if (import.meta.env.DEV) {
    console.warn(`[${debugLabel}] asked "${askedLang}":`, askedCheck);
  }

  if (askedCheck.valid) {
    return {
      effectiveLang: askedLang,
      hasFallback: false,
      unavailable: false,
      reasons: [],
    };
  }

  for (const lang of fallbackOrder) {
    if (lang === askedLang) continue;

    const check = validatePagePack({
      content: contentByLang?.[lang],
      ui: uiByLang?.[lang],
      rules,
    });

    if (import.meta.env.DEV) {
      console.warn(`[${debugLabel}] fallback "${lang}":`, check);
    }

    if (check.valid) {
      return {
        effectiveLang: lang,
        hasFallback: true,
        unavailable: false,
        reasons: [...askedCheck.missingContent, ...askedCheck.missingUI],
      };
    }
  }

  return {
    effectiveLang: null,
    hasFallback: false,
    unavailable: true,
    reasons: [...askedCheck.missingContent, ...askedCheck.missingUI],
  };
}
