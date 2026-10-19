import { dayNumber, localDay, validDay } from "./local-day.js";

export const foodName = value => String(value || "").trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
export const ingredientMatches = (a, b) => {
  const left = foodName(a), right = foodName(b);
  const phrase = text => ` ${text.replace(/[^a-z0-9]+/g, " ").trim()} `;
  return !!left && !!right && (phrase(left).includes(phrase(right)) || phrase(right).includes(phrase(left)));
};
export function foodDateStatus(item, today = localDay()) {
  const date = dayNumber(item.expiryDate);
  if (date === null) return item.expiryDate
    ? { days: null, blocked: true, label: "Fecha no válida: corrige la etiqueta antes de usar este lote en sugerencias" }
    : { days: null, blocked: false, label: "Sin fecha registrada: revisa la etiqueta y la conservación" };
  const days = date - dayNumber(today);
  if (days < 0) {
    if (item.dateType === "best-before") return { days, blocked: true, label: "Consumo preferente superado: revisar calidad, envase y conservación antes de usar" };
    return { days, blocked: true, label: item.dateType === "use-by" ? "Caducado: no consumir aunque parezca estar bien" : "Fecha vencida sin tipo confirmado: no se usa en sugerencias" };
  }
  const prefix = item.dateType === "best-before" ? "Consumo preferente" : item.dateType === "use-by" ? "Caducidad" : "Fecha pendiente de clasificar";
  return { days, blocked: false, label: `${prefix}: ${days === 0 ? "hoy" : days === 1 ? "mañana" : `en ${days} días`}` };
}

export function migratePantry(fridge, legacy = {}) {
  return fridge.map(item => !Object.hasOwn(item, "expiryDate") && validDay(legacy[foodName(item.name)]) ? { ...item, expiryDate: legacy[foodName(item.name)], dateType: "unknown" } : item);
}

export function rankPantryRecipes(recipes, fridge, today, isRestricted = () => false) {
  const available = fridge.filter(item => !foodDateStatus(item, today).blocked);
  return recipes.filter(recipe => ![recipe.name, ...recipe.ingredients.map(([name]) => name)].some(isRestricted)).map(recipe => {
    const present = recipe.ingredients.filter(([name]) => available.some(item => ingredientMatches(name, item.name)));
    const missing = recipe.ingredients.filter(([name]) => !available.some(item => ingredientMatches(name, item.name))).map(([name]) => name);
    const rescueHits = present.filter(([name]) => available.some(item => ingredientMatches(name, item.name) && foodDateStatus(item, today).days !== null && foodDateStatus(item, today).days <= 3)).length;
    return { ...recipe, hits: present.length, missing, rescueHits };
  }).sort((a, b) => b.rescueHits - a.rescueHits || b.hits - a.hits || a.missing.length - b.missing.length);
}

// Exact names and equal units only: never guess g/ml conversions or subtract from free text.
export function subtractPantry(list, fridge, today = localDay()) {
  const stock = new Map();
  for (const food of fridge) {
    if (foodDateStatus(food, today).blocked) continue;
    const quantity = Number(String(food.quantity ?? "").replace(",", "."));
    if (!(quantity > 0) || !food.unit) continue;
    const key = `${foodName(food.name)}|${food.unit}`;
    stock.set(key, (stock.get(key) || 0) + quantity);
  }
  for (const item of list) {
    if (!item.stockAdjusted) continue;
    const key = `${foodName(item.name || item.text)}|${item.unit}`;
    stock.set(key, Math.max(0, (stock.get(key) || 0) - (Number(item.stockUsed) || 0)));
  }
  return list.map(item => {
    if (item.review || item.stockAdjusted || item.done) return item;
    const key = `${foodName(item.name || item.text)}|${item.unit}`;
    const need = Number(item.qty), have = stock.get(key) || 0;
    if (!(need > 0) || !have) return item;
    const used = Math.min(need, have);
    stock.set(key, have - used);
    return { ...item, requiredQty: need, qty: Math.round((need - used) * 1000) / 1000, stockUsed: used, stockAdjusted: true, coveredByStock: used === need, inFridge: true, estimatedPrice: "" };
  });
}

export function wasteTotals(events, today = localDay()) {
  return events.filter(item => item.date?.startsWith(today.slice(0, 7))).reduce((total, event) => {
    const kg = Number(event.kg) || 0, cost = Number(event.cost) || 0;
    if (event.outcome === "used") { total.kgUsed += kg; total.costUsed += cost; }
    if (event.outcome === "discarded") { total.kgDiscarded += kg; total.costDiscarded += cost; }
    return total;
  }, { kgUsed: 0, costUsed: 0, kgDiscarded: 0, costDiscarded: 0 });
}
