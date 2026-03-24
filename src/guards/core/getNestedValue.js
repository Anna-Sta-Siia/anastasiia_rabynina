export function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;

  return path.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[key];
  }, obj);
}
