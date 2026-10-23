// DIETEAR's own energy-based reference. It is not a branded points programme.
export const KCAL_PER_POINT = 50;
export const POINTS_STORAGE_KEY = "dietear-points-v1";
export const MEAL_MOMENTS = ["Desayuno", "Media mañana", "Almuerzo", "Merienda", "Cena", "Otro"];
export const METHOD_VERSION = "dietear-kcal50-decimal-v2";

export function pointsFromKcal(kcal) {
  return Number.isFinite(kcal) && kcal >= 0 ? Math.round((kcal / KCAL_PER_POINT + Number.EPSILON) * 10) / 10 : null;
}

export function foodEnergy(food, grams) {
  return food && Number.isFinite(food.kcalPer100g) && Number.isFinite(grams) && grams > 0
    ? food.kcalPer100g * grams / 100 : null;
}

export function normalizeFoodText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

// Exact, reviewed ingredient bindings; unknown ingredients remain unscored.
// Each recipe quantity is per serving, as in the existing recipe catalogue.
const RECIPE_REFERENCES = {
  "Aceite de oliva": ["aceite-de-oliva", .91],
  "Aguacate": ["aguacate"], "Ajo": ["ajo", 3], "Albahaca": ["albahaca"],
  "Almendras sin sal": ["almendras"], "Alubias cocidas": ["alubias-blancas-cocidas"],
  "Arroz": ["arroz-blanco-seco"], "Arroz integral precocido": ["arroz-integral-cocido"], "Arándanos": ["arandanos"],
  "Atún al natural escurrido": ["atun-al-natural"], "Avena": ["avena"],
  "Bacalao fresco": ["bacalao-fresco"], "Boniato": ["boniato"], "Brócoli": ["brocoli"],
  "Calabacín": ["calabacin"], "Canela": ["canela"], "Cebolla": ["cebolla"],
  "Champiñones": ["champinon"], "Crema de cacahuete sin azúcar": ["crema-de-cacahuete"],
  "Cuscús": ["cuscus-seco"], "Espinacas": ["espinacas"], "Fresas": ["fresas"],
  "Garbanzos cocidos": ["garbanzos-cocidos"], "Guisantes": ["guisantes"],
  "Huevo": ["huevo", 50], "Hummus": ["hummus"], "Judías verdes": ["judias-verdes"],
  "Leche": ["leche-entera", 1.03], "Lechuga": ["lechuga"],
  "Lentejas cocidas": ["lentejas-cocidas"], "Limón": ["limon", 60],
  "Mandarina": ["mandarina", 80], "Mango": ["mango"], "Manzana": ["manzana", 150],
  "Nueces sin sal": ["nueces"], "Pan integral": ["pan-integral"],
  "Pasta integral": ["pasta-integral-seca"], "Patata": ["patata"],
  "Pavo cocido": ["pavo-pechuga-asada"], "Pavo fresco": ["pavo-pechuga-cruda"],
  "Pepino": ["pepino"], "Pimiento rojo": ["pimiento-rojo"], "Pimiento verde": ["pimiento-verde"],
  "Piña": ["pina"], "Plátano": ["platano", 120], "Pollo": ["pollo-pechuga-cruda"],
  "Puerro": ["puerro"], "Queso fresco": ["queso-fresco"], "Quinoa": ["quinoa-seca"],
  "Remolacha cocida": ["remolacha-cocida"], "Ricota": ["ricota"], "Salmón": ["salmon"],
  "Sardinas en conserva escurridas": ["sardinas-en-aceite"], "Tofu firme": ["tofu-firme"],
  "Tomate": ["tomate"], "Tomate triturado": ["tomate-triturado"],
  "Tortilla integral de trigo": ["tortilla-integral-de-trigo", 40], "Vinagre": ["vinagre", 1.01],
  "Yogur griego natural": ["yogur-griego-natural"], "Yogur natural": ["yogur-natural"],
  "Zanahoria": ["zanahoria"],
};

// Concrete examples for this calculator only. The shared meal planner is unchanged.
// Generic ingredients cannot be assigned a source value without choosing a food.
export function recipeForPoints(recipe) {
  const choices = new Set();
  const ingredients = recipe.ingredients.flatMap(([name, quantity, unit]) => {
    if (name === "Verduras variadas") {
      choices.add("verduras: mitad calabacín y mitad zanahoria");
      return [["Calabacín", quantity / 2, unit], ["Zanahoria", quantity / 2, unit]];
    }
    if (name === "Frutos rojos") {
      choices.add("frutos rojos: mitad fresas y mitad arándanos");
      return [["Fresas", quantity / 2, unit], ["Arándanos", quantity / 2, unit]];
    }
    const explicit = { "Pimiento": "Pimiento rojo", "Pescado": "Bacalao fresco", "Merluza": "Bacalao fresco", "Fruta de temporada": "Manzana" }[name];
    if (explicit) choices.add(`${name.toLocaleLowerCase("es")}: ${explicit.toLocaleLowerCase("es")}`);
    return [[explicit || name, quantity, unit]];
  });
  return { ...recipe, ingredients,
    name: recipe.name.replace(/^Merluza/, "Bacalao").replace(/^Pescado/, "Bacalao"),
    steps: recipe.steps.map(step => step.replace(/merluza/gi, "bacalao")),
    exampleNote: choices.size ? "Versión de ejemplo para el cálculo: " + [...choices].join("; ") + ". Puedes cambiarla en Ajustar ingredientes." : "",
  };
}

export function resolveRecipeIngredients(recipe) {
  return recipe.ingredients.map(([name, quantity, unit], index) => {
    const reference = RECIPE_REFERENCES[name];
    const factor = unit === "g" ? 1 : reference?.[1];
    return { key: recipe.id + "-" + index, name, quantity, unit,
      foodId: reference?.[0] || "", grams: reference && factor ? quantity * factor : null,
      conversion: unit === "g" ? "" : factor ? `${quantity} ${unit} ≈ ${Number((quantity * factor).toFixed(1))} g comestibles` : "Cantidad por concretar" };
  });
}

export function calculateRecipe(ingredients, foodById, servings = 1) {
  const rows = ingredients.map(row => {
    const food = foodById[row.foodId];
    const kcal = foodEnergy(food, row.grams);
    return { ...row, food, kcal, points: pointsFromKcal(kcal) };
  });
  const complete = rows.length > 0 && Number.isFinite(servings) && servings > 0 && rows.every(row => row.kcal !== null);
  const kcal = complete ? rows.reduce((sum, row) => sum + row.kcal, 0) : null;
  return { rows, complete, kcal, points: pointsFromKcal(kcal),
    kcalPerServing: complete ? kcal / servings : null,
    pointsPerServing: complete ? pointsFromKcal(kcal / servings) : null };
}

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00");
  return Number.isFinite(date.getTime()) && localDateKey(date) === value;
}

export function weekDates(key) {
  const day = new Date(key + "T12:00:00");
  if (!validDateKey(key)) return [];
  day.setDate(day.getDate() - (day.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(day); date.setDate(day.getDate() + index); return localDateKey(date);
  });
}

export function sumPoints(entries, dates) {
  const allowed = new Set(dates);
  return Math.round(entries.filter(entry => allowed.has(entry.date)).reduce((sum, entry) => sum + entry.points, 0) * 10) / 10;
}

export function readPointsState(text) {
  const parsed = JSON.parse(text || "{}");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid points record");
  const daily = Number.isInteger(parsed.daily) && parsed.daily > 0 && parsed.daily <= 200 ? parsed.daily : 30;
  // Keep historical points exactly as recorded, including the older rounded method.
  const entries = Array.isArray(parsed.entries) ? parsed.entries.filter(entry => entry && validDateKey(entry.date) &&
    Number.isFinite(entry.points) && entry.points >= 0 && typeof entry.description === "string").map((entry, index) => ({
      ...entry, id: String(entry.id || `legacy-${index}`), meal: MEAL_MOMENTS.includes(entry.meal) ? entry.meal : "Otro",
    })) : [];
  return { daily, entries };
}
