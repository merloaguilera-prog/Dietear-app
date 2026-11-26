import {recipeFitsStyle, recipeHasRestriction} from './recipe-selection.mjs';

// Editorial selections from the existing catalogue. Ingredient screening still
// applies after selection; IDs and limits are checked against the real recipes.
export const MAX_SHARED_RECIPES = 5;
export const RECIPE_BOOKS = {
  "balanced": {
    "name": "Equilibrada",
    "recipeIds": [
      "pollo",
      "arroz",
      "receta-43",
      "legumbre",
      "pescado",
      "receta-7",
      "receta-9",
      "receta-14",
      "receta-20",
      "receta-25",
      "receta-32",
      "receta-37",
      "receta-49",
      "receta-58",
      "receta-60",
      "receta-64"
    ]
  },
  "mediterranean": {
    "name": "Mediterránea",
    "recipeIds": [
      "receta-45",
      "receta-44",
      "receta-47",
      "pescado",
      "receta-5",
      "receta-6",
      "receta-9",
      "receta-16",
      "receta-21",
      "receta-27",
      "receta-32",
      "receta-36",
      "receta-39",
      "receta-46",
      "receta-50",
      "receta-55"
    ]
  },
  "vegan": {
    "name": "Vegana",
    "recipeIds": [
      "receta-51",
      "receta-26",
      "receta-30",
      "legumbre",
      "receta-10",
      "receta-12",
      "receta-15",
      "receta-22",
      "receta-33",
      "receta-35",
      "receta-42",
      "receta-52",
      "receta-53",
      "receta-56",
      "receta-61",
      "receta-62"
    ]
  },
  "vegetarian": {
    "name": "Vegetariana",
    "recipeIds": [
      "receta-49",
      "receta-31",
      "receta-57",
      "arroz",
      "receta-8",
      "receta-11",
      "receta-18",
      "receta-19",
      "receta-20",
      "receta-25",
      "receta-36",
      "receta-48",
      "receta-50",
      "receta-59",
      "receta-60",
      "receta-63"
    ]
  },
  "lactose": {
    "name": "Sin lactosa",
    "recipeIds": [
      "receta-38",
      "receta-40",
      "receta-54",
      "receta-6",
      "receta-12",
      "receta-13",
      "receta-17",
      "receta-22",
      "receta-29",
      "receta-30",
      "receta-33",
      "receta-34",
      "receta-37",
      "receta-41",
      "receta-42",
      "receta-47"
    ]
  },
  "gluten": {
    "name": "Sin gluten",
    "recipeIds": [
      "receta-46",
      "receta-21",
      "receta-24",
      "receta-15",
      "receta-17",
      "receta-18",
      "receta-26",
      "receta-28",
      "receta-31",
      "receta-38",
      "receta-44",
      "receta-51",
      "receta-52",
      "receta-54",
      "receta-57",
      "receta-62"
    ]
  },
  "maintenance": {
    "name": "Mantenimiento",
    "recipeIds": [
      "receta-23",
      "receta-34",
      "receta-27",
      "pollo",
      "receta-7",
      "receta-8",
      "receta-14",
      "receta-19",
      "receta-28",
      "receta-39",
      "receta-43",
      "receta-48",
      "receta-53",
      "receta-55",
      "receta-58",
      "receta-63"
    ]
  },
  "custom": {
    "name": "Sin alimento X",
    "recipeIds": [
      "receta-41",
      "receta-29",
      "receta-56",
      "receta-5",
      "receta-10",
      "receta-11",
      "receta-13",
      "receta-16",
      "receta-23",
      "receta-24",
      "receta-35",
      "receta-40",
      "receta-45",
      "receta-59",
      "receta-61",
      "receta-64"
    ]
  }
};
// Additional culinary collections. These are ingredient-based suggestions, not clinical prescriptions.
export const ADDITIONAL_RECIPE_BOOKS={
 fiber:{name:'Rica en fibra',recipeIds:['receta-21','receta-26','receta-27','receta-28','receta-29','receta-35','receta-17','receta-24','receta-33','receta-53','receta-54','receta-61']},
 noAddedSugar:{name:'Sin azúcar añadido',recipeIds:['receta-13','receta-15','receta-17','receta-20','receta-21','receta-23','receta-26','receta-27','receta-28','receta-31','receta-34','receta-39']}
};
const normalize=value=>String(value||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
const aliases={
 '':'balanced','equilibrada':'balanced','mediterranea':'mediterranean',
 'vegana':'vegan','vegetariana':'vegetarian','sin lactosa':'lactose',
 'sin gluten':'gluten','rica en fibra':'fiber','sin azucar anadido':'noAddedSugar','mantenimiento':'maintenance','sin alimento x':'custom'
};
export function recipeBookForStyle(style='Equilibrada'){
 const key=aliases[normalize(style)];return RECIPE_BOOKS[key]||ADDITIONAL_RECIPE_BOOKS[key]||null;
}
export function selectRecipeBook(recipes,style,{restrictions=[],expanded=false}={}){
 const book=recipeBookForStyle(style);
 const byId=new Map(recipes.map(recipe=>[recipe.id,recipe]));
 const candidates=expanded?recipes:(book?.recipeIds||[]).map(id=>byId.get(id)).filter(Boolean);
 // Specialized styles without a reviewed book never inherit the generic book.
 // The full catalogue remains available as an explicit, separate choice.
 return candidates.filter(recipe=>recipeFitsStyle(recipe,style)&&!recipeHasRestriction(recipe,restrictions));
}
