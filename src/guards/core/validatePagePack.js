import { getNestedValue } from "./getNestedValue";

export function validatePagePack({ content, ui, rules }) {
  const criticalContent = rules?.criticalContent || [];
  const criticalUI = rules?.criticalUI || [];

  let missingContent = [];

  // 🔥 CAS TABLEAU (Projects)
  if (Array.isArray(content)) {
    for (const project of content) {
      for (const key of criticalContent) {
        const value = getNestedValue(project, key);

        if (value === undefined || value === null || value === "") {
          missingContent.push(`${project.id || "unknown"}.${key}`);
        }
      }
    }
  } else {
    // 🔥 CAS NORMAL (pages simples)
    missingContent = criticalContent.filter((key) => {
      const value = getNestedValue(content, key);
      return value === undefined || value === null || value === "";
    });
  }

  const missingUI = criticalUI.filter((key) => {
    const value = getNestedValue(ui, key);
    return value === undefined || value === null || value === "";
  });

  return {
    valid: missingContent.length === 0 && missingUI.length === 0,
    missingContent,
    missingUI,
  };
}
