import type { CatalogoNutricional, FichaNutricional } from "./catalogo-nutricional";

/** USDA FoodData Central adapter. Run on the server only: never expose the API key to browsers. */
type Nutrient = { nutrientId?: number; nutrientNumber?: string; value?: number; amount?: number; nutrient?: { id?: number; number?: string } };
type Food = { fdcId?: number; description?: string; foodNutrients?: Nutrient[] };
type SearchResponse = { foods?: Food[] };

function nutrient(food: Food, ids: number[], numbers: string[]): number | null {
  const match = food.foodNutrients?.find(n => ids.includes(n.nutrientId ?? n.nutrient?.id ?? -1) ||
    numbers.includes(n.nutrientNumber ?? n.nutrient?.number ?? ""));
  const value = match?.value ?? match?.amount;
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}
function convert(food: Food): FichaNutricional | null {
  if (!food.fdcId || !food.description) return null;
  const proteinas = nutrient(food, [1003], ["203"]);
  const grasas = nutrient(food, [1004], ["204"]);
  const hidratos = nutrient(food, [1005], ["205"]);
  // USDA 1008 is energy in kcal; 2047/2048 are alternative energy methods in kcal.
  const kcal = nutrient(food, [1008, 2047, 2048], ["208"]);
  if ([proteinas, grasas, hidratos, kcal].some(x => x === null)) return null;
  const desc = food.description.toLocaleLowerCase("en");
  const estado = /\b(raw|uncooked)\b/.test(desc) ? "crudo" :
    /\b(cooked|boiled|baked|roasted|fried|steamed)\b/.test(desc) ? "cocinado" : "otro";
  return { id: String(food.fdcId), nombre: food.description, fuente: "USDA FoodData Central",
    estado, por100g: { kcal: kcal!, proteinas: proteinas!, hidratos: hidratos!, grasas: grasas! } };
}

export function catalogoUSDA(apiKey: string): CatalogoNutricional {
  if (!apiKey.trim()) throw new Error("Falta la clave USDA");
  return {
    async buscar(nombre: string): Promise<FichaNutricional[]> {
      const query = nombre.trim();
      if (query.length < 2 || query.length > 100) return [];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, pageSize: 15, dataType: ["Foundation", "SR Legacy"] }),
          signal: controller.signal,
          cache: "no-store"
        });
        if (!response.ok) throw new Error(`USDA error ${response.status}`);
        const data = await response.json() as SearchResponse;
        return (data.foods ?? []).map(convert).filter((f): f is FichaNutricional => f !== null);
      } finally { clearTimeout(timeout); }
    }
  };
}
