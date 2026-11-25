const normalize = value => String(value || '').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const meat = /\b(pollo|pavo|cerdo|jamon|ternera|carne|bacon|chorizo)\b/;
const fish = /\b(pescado|atun|salmon|merluza|bacalao|sardinas?|marisco|gambas?|mejillones?)\b/;
const dairy = /\b(leche|yogur|queso|ricota|nata|mantequilla)\b/;
const gluten = /\b(trigo|pan|pasta|cuscus|avena|cebada|centeno|espelta)\b/;
const egg = /\b(huevo|huevos|tortilla francesa|mayonesa)\b/;
const animal = text => meat.test(text) || fish.test(text) || dairy.test(text) || egg.test(text) || /\bmiel\b/.test(text);
export const restrictionList = values => [...new Set(values.filter(Boolean).flatMap(value => normalize(value).split(/[,;\n]/)).map(value => value.trim()).filter(Boolean))];

// Ingredient-based screening helps select candidates. It never certifies product
// labels, traces, clinical suitability or halal processing.
export function ingredientMatchesRestriction(ingredient, restriction) {
  const text = normalize(ingredient), term = normalize(restriction).trim();
  if (!term) return false;
  if (/^(gluten|trigo|celiaquia)$/.test(term)) return gluten.test(text) && !/sin gluten/.test(text);
  if (/^(leche|lacteos?|lactosa)$/.test(term)) return dairy.test(text) && (term !== 'lactosa' || !/sin lactosa/.test(text));
  if (/^(huevos?)$/.test(term)) return egg.test(text);
  if (/^(pescados?)$/.test(term)) return fish.test(text);
  if (/^(carnes?)$/.test(term)) return meat.test(text);
  if (/^(frutos? secos?)$/.test(term)) return /\b(nueces|nuez|almendras?|avellanas?|pistachos?|anacardos?|cacahuetes?)\b/.test(text);
  if (/^(soja|soya)$/.test(term)) return /\b(soja|soya|tofu|tempeh)\b/.test(text);
  if (/^(sesamo|ajonjoli)$/.test(term)) return /\b(sesamo|ajonjoli|tahini|hummus)\b/.test(text);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp('(^|[^a-z0-9])'+escaped+'(?:s|es)?([^a-z0-9]|$)').test(text);
}

export function recipeHasRestriction(recipe, restrictions = []) {
  const texts = [recipe.name, ...recipe.ingredients.map(item => item[0])];
  return restrictions.some(term => texts.some(text => ingredientMatchesRestriction(text, term)));
}

export function recipeStyle(style = '') {
  const name = normalize(style);
  if (name.includes('vegana')) return {key:'vegan', canPlan:true, note:'Ideas con ingredientes vegetales. Revisa etiquetas y posibles trazas.'};
  if (name.includes('vegetariana')) return {key:'vegetarian', canPlan:true, note:'Ideas sin carne ni pescado entre sus ingredientes declarados. Revisa etiquetas.'};
  if (name.includes('sin lactosa')) return {key:'lactose', canPlan:true, note:'Se excluyen los lácteos con lactosa declarados. Revisa etiquetas; sin lactosa no significa sin proteínas de leche.'};
  if (name.includes('sin gluten')) return {key:'gluten', canPlan:true, note:'Ideas sin cereales con gluten declarados. Para celiaquía, comprueba certificación y contaminación cruzada de cada producto.'};
  if (/diabet|hipo|hipercal|sodio|sodica|halal|musulmana|fibra|residuos|azucar|hierro|puntos|ayuno|keto|proteina|muscul/.test(name)) {
    return {key:'review', canPlan:false, note:'Este estilo necesita criterios específicos que aún no están validados. Las ideas generales se consultan por separado, sin atribuirles aptitud terapéutica ni aplicar una semana automáticamente.'};
  }
  return {key:'general', canPlan:true, note:'Ideas culinarias generales. Las cantidades se pueden adaptar; no fijan un objetivo energético.'};
}

export function recipeFitsStyle(recipe, style) {
  const key = recipeStyle(style).key;
  return recipe.ingredients.every(([name]) => {
    const text = normalize(name);
    if (key === 'vegan') return !animal(text);
    if (key === 'vegetarian') return !meat.test(text) && !fish.test(text);
    if (key === 'lactose') return !dairy.test(text) || /sin lactosa/.test(text);
    if (key === 'gluten') return !gluten.test(text) || /sin gluten/.test(text);
    return true;
  });
}

export function buildRecipeWeek(planner, recipes, mealFields, {style = '', restrictions = [], offset = 0} = {}) {
  if (!recipeStyle(style).canPlan) return null;
  const candidates = recipes.filter(recipe => recipeFitsStyle(recipe, style) && !recipeHasRestriction(recipe, restrictions));
  const used = new Set();
  return planner.map((day, index) => {
    const meals = Object.fromEntries(mealFields.map(([field], mealIndex) => {
      const types = ['midmorning1','midmorning2','snack1','snack2'].includes(field) ? ['midmorning1','snack1','snack2'] : [field];
      const pool = candidates.filter(recipe => recipe.mealTypes.some(type => types.includes(type)));
      const fresh = pool.filter(recipe => !used.has(recipe.id));
      const choices = fresh.length ? fresh : pool;
      const choice = choices[(index + mealIndex + offset) % choices.length];
      if (choice) used.add(choice.id);
      return [field, choice?.name || ''];
    }));
    return {...day, ...meals, mealServings:{}};
  });
}
