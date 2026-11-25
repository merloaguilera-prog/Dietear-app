// Shared, dependency-free nutrition totals. Inputs must be confirmed food entries,
// not raw image/AI guesses. Unknown nutrients remain unknown (never silently zero).
export const NUTRIENTS = Object.freeze(["energyKcal","proteinG","carbsG","fatG","fiberG","saturatedFatG","sugarsG","sodiumMg","calciumMg","ironMg","vitaminCMg"]);
export function summarizeNutrition(entries) {
  if (!Array.isArray(entries)) throw new TypeError("entries must be an array");
  const totals = Object.fromEntries(NUTRIENTS.map(key => [key, 0]));
  const known = Object.fromEntries(NUTRIENTS.map(key => [key, 0]));
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") throw new TypeError("invalid entry");
    const servings = entry.servings ?? 1;
    if (typeof servings !== "number" || !Number.isFinite(servings) || servings <= 0) throw new RangeError("invalid servings");
    const nutrients = entry.nutrients ?? {};
    for (const key of NUTRIENTS) {
      const value = nutrients[key];
      if (value == null) continue;
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new RangeError("invalid nutrient: " + key);
      totals[key] += value * servings;
      known[key]++;
    }
  }
  return {
    entries: entries.length,
    nutrients: Object.fromEntries(NUTRIENTS.map(key => [key, known[key] === entries.length && entries.length > 0 ? Math.round(totals[key] * 100) / 100 : null])),
    partialTotals: Object.fromEntries(NUTRIENTS.map(key => [key, Math.round(totals[key] * 100) / 100])),
    coverage: Object.fromEntries(NUTRIENTS.map(key => [key, {known: known[key], total: entries.length}])),
  };
}
