import { getNestedValue } from "./getNestedValue";

export function validatePagePack({ content, ui, rules }) {
  const criticalContent = rules?.criticalContent || [];
  const criticalUI = rules?.criticalUI || [];

  const missingContent = criticalContent.filter((key) => {
    const value = getNestedValue(content, key);
    return value === undefined || value === null || value === "";
  });

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
