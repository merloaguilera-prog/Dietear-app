import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { calculateRecipe, foodEnergy, localDateKey, normalizeFoodText, pointsFromKcal, readPointsState, recipeForPoints, resolveRecipeIngredients, sumPoints, weekDates } from "../lib/points-diet.mjs";

const foods = JSON.parse(fs.readFileSync(new URL("../lib/points-foods.json", import.meta.url), "utf8")).foods;
const foodById = Object.fromEntries(foods.map(food => [food.id, food]));

test("catalogue keeps traceable USDA sources, edible states and unique food ids", () => {
  assert.ok(foods.length >= 170);
  assert.equal(new Set(foods.map(food => food.id)).size, foods.length);
  for (const food of foods) {
    assert.ok(Number.isInteger(food.fdcId) && food.fdcId > 0);
    assert.ok(food.sourceDescription && food.preparation && food.category);
    assert.ok(Number.isFinite(food.kcalPer100g) && food.kcalPer100g >= 0 && food.kcalPer100g < 1000);
    assert.ok(food.grams > 0);
  }
  assert.equal(foodById.manzana.kcalPer100g, 52);
  assert.equal(foodById['aceite-de-oliva'].kcalPer100g, 884);
});

test("portion sizes use the correct raw or cooked energy reference", () => {
  assert.equal(foodEnergy(foodById['arroz-blanco-seco'], 100), 365);
  assert.equal(foodEnergy(foodById['arroz-blanco-cocido'], 100), 130);
  assert.equal(pointsFromKcal(foodEnergy(foodById.manzana, 150)), 1.6);
  assert.equal(pointsFromKcal(0), 0);
  assert.equal(pointsFromKcal(-1), null);
  assert.equal(foodEnergy(foodById.manzana, 0), null);
  assert.equal(foodEnergy(foodById.manzana, NaN), null);
});

test("a dish includes the oil and all ingredients, then divides before rounding", () => {
  const total = calculateRecipe([
    { foodId: 'pollo-pechuga-cruda', grams: 150 },
    { foodId: 'arroz-blanco-seco', grams: 60 },
    { foodId: 'tomate', grams: 100 },
    { foodId: 'aceite-de-oliva', grams: 9.1 },
  ], foodById, 2);
  assert.equal(total.complete, true);
  assert.ok(Math.abs(total.kcal - 497.444) < .000001);
  assert.equal(total.points, 9.9);
  assert.equal(total.pointsPerServing, 5);
  assert.ok(total.points > Math.max(...total.rows.map(row => row.points)));
});

test("missing foods, grams or servings cannot silently become zero-point ingredients", () => {
  for (const rows of [[], [{ foodId: 'unknown', grams: 100 }], [{ foodId: 'tomate', grams: null }]]) {
    const total = calculateRecipe(rows, foodById);
    assert.equal(total.complete, false);
    assert.equal(total.pointsPerServing, null);
  }
  assert.equal(calculateRecipe([{ foodId: 'tomate', grams: 100 }], foodById, 0).complete, false);
});

test("recipe unit assumptions are explicit and unknown fish are left for the user to specify", () => {
  const rows = resolveRecipeIngredients({ id: 'example', ingredients: [['Aceite de oliva', 10, 'ml'], ['Huevo', 1, 'ud'], ['Ajo', 1, 'ud'], ['Merluza', 150, 'g']] });
  assert.equal(rows[0].grams, 9.1);
  assert.equal(rows[1].grams, 50);
  assert.equal(rows[2].grams, 3);
  assert.ok(rows[0].conversion.includes('9.1'));
  assert.equal(rows[3].foodId, '');
  assert.equal(calculateRecipe(rows, foodById).complete, false);
});

test("weekly totals include all seven local calendar days and exclude other weeks", () => {
  const days = weekDates('2026-10-25');
  assert.deepEqual(days, ['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24','2026-10-25']);
  assert.equal(sumPoints([{date:days[0],points:1.1},{date:days[6],points:2.2},{date:'2026-10-26',points:99}],days),3.3);
  assert.deepEqual(weekDates('2026-02-31'), []);
  assert.equal(localDateKey(new Date(2026, 0, 2, 23, 59)), '2026-01-02');
});

test("legacy daily settings and historical points survive without recalculation", () => {
  const state = readPointsState(JSON.stringify({daily:26,entries:[{id:'old',date:'2026-10-20',description:'Manzana',points:2},{date:'bad',description:'broken',points:9}]}));
  assert.equal(state.daily,26);
  assert.equal(state.entries.length,1);
  assert.equal(state.entries[0].points,2);
  assert.equal(state.entries[0].meal,'Otro');
  assert.throws(()=>readPointsState('{broken'));
  assert.throws(()=>readPointsState('null'));
});

test("food search is accent independent",()=>{
  assert.ok(normalizeFoodText('Plátano').includes('platano'));
  assert.equal(normalizeFoodText('  Brócoli '),'brocoli');
});

test("all 64 recipe examples have explicit sourced ingredients without mutating the shared catalogue", async () => {
  // Node has no Next JSON loader; inline that one data import for this source-data check.
  const expanded = fs.readFileSync(new URL("../lib/recipes-expanded.json", import.meta.url), "utf8");
  const source = fs.readFileSync(new URL("../lib/recipes.js", import.meta.url), "utf8")
    .replace('import expandedRecipes from "./recipes-expanded.json";', `const expandedRecipes=${expanded};`);
  const { recipes } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
  assert.equal(recipes.length, 64);
  const original = JSON.stringify(recipes);
  for (const recipe of recipes) {
    const example = recipeForPoints(recipe);
    const total = calculateRecipe(resolveRecipeIngredients(example), foodById);
    assert.equal(total.complete, true, example.name);
    assert.ok(Number.isFinite(total.pointsPerServing) && total.pointsPerServing > 0, example.name);
    if (JSON.stringify(example.ingredients) !== JSON.stringify(recipe.ingredients)) assert.ok(example.exampleNote);
  }
  assert.equal(JSON.stringify(recipes), original);
  const fish = recipeForPoints(recipes.find(recipe => recipe.id === "receta-44"));
  assert.equal(fish.name, "Bacalao con tomate y guisantes");
  assert.ok(fish.exampleNote.includes("merluza: bacalao fresco"));
});

test("every food has a local, credited photo or a distinct generated illustration cell", () => {
  const commons = JSON.parse(fs.readFileSync(new URL("../lib/points-photos.json", import.meta.url)));
  const generated = JSON.parse(fs.readFileSync(new URL("../lib/points-illustrations.json", import.meta.url)));
  const images = {...commons, ...generated};
  assert.equal(Object.keys(images).length, foods.length);
  assert.equal(new Set(Object.values(commons).map(photo => photo.original)).size, Object.keys(commons).length);
  assert.equal(new Set(Object.values(generated).map(photo => `${photo.src}:${photo.cell}`)).size, Object.keys(generated).length);
  for (const food of foods) {
    const image = images[food.id];
    assert.ok(image, food.id);
    assert.ok(fs.existsSync(new URL("../public" + image.src, import.meta.url)), food.id);
    if (image.generated) {
      assert.ok(image.cell >= 0 && image.cell < image.columns * image.rows && image.width > 0 && image.height > 0);
    } else {
      assert.ok(image.author && image.page && image.licenseUrl);
      assert.match(image.license, /^(CC BY|CC0)|public domain/i);
      assert.doesNotMatch(image.license, /-NC|-ND/);
    }
  }
});
