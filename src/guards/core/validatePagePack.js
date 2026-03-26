import { getNestedValue } from "./getNestedValue";

function isMissingValue(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

export function validatePagePack({ content, ui, rules }) {
  const criticalContent = rules?.criticalContent || [];
  const criticalUI = rules?.criticalUI || [];

  let missingContent = [];

  // Cas tableau (ex: Projects)
  if (Array.isArray(content)) {
    for (const item of content) {
      for (const key of criticalContent) {
        const value = getNestedValue(item, key);

        if (isMissingValue(value)) {
          missingContent.push(`${item.id || "unknown"}.${key}`);
        }
      }
    }
  } else {
    // Cas objet simple (ex: Skills)
    missingContent = criticalContent.filter((key) => {
      const value = getNestedValue(content, key);
      return isMissingValue(value);
    });
  }

  const missingUI = criticalUI.filter((key) => {
    const value = getNestedValue(ui, key);
    return isMissingValue(value);
  });

  return {
    valid: missingContent.length === 0 && missingUI.length === 0,
    missingContent,
    missingUI,
  };
}
