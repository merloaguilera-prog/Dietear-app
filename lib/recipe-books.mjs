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
 noAddedSugar:{name:'Sin azúcar añadido',recipeIds:['receta-13','receta-15','receta-17','receta-20','receta-21','receta-23','receta-26','receta-27','receta-28','receta-31','receta-34','receta-39']},
 proteinIdeas:{name:'Rica en proteínas',recipeIds:['pollo','pescado','receta-20','receta-25','receta-31','receta-38','receta-39','receta-43','receta-44','receta-48','receta-49','receta-51']},
 muscleIdeas:{name:'Ganancia muscular',recipeIds:['pollo','arroz','receta-21','receta-25','receta-31','receta-32','receta-35','receta-36','receta-38','receta-43','receta-51','receta-63']},
 lowSodiumIdeas:{name:'Hiposódica',recipeIds:['receta-13','receta-20','receta-23','receta-26','receta-28','receta-31','receta-34','receta-36','receta-39','receta-40','receta-48','receta-53']},
 halalIdeas:{name:'Musulmana / Halal',recipeIds:['receta-13','receta-15','receta-17','receta-21','receta-23','receta-26','receta-27','receta-28','receta-29','receta-34','receta-35','receta-54']},
 diabetesIdeas:{name:'Diabética',recipeIds:['receta-20','receta-21','receta-23','receta-26','receta-27','receta-28','receta-31','receta-39','receta-43','receta-44','receta-48','receta-51']},
 lowEnergyIdeas:{name:'Hipocalórica',recipeIds:['receta-13','receta-17','receta-20','receta-23','receta-26','receta-28','receta-39','receta-40','receta-44','receta-48','receta-50','receta-54']},
 highEnergyIdeas:{name:'Hipercalórica',recipeIds:['receta-8','receta-12','receta-15','receta-19','receta-24','receta-25','receta-31','receta-32','receta-35','receta-43','receta-57','receta-63']},
 lowFiberIdeas:{name:'Baja en fibra',recipeIds:['receta-13','receta-14','receta-18','receta-20','receta-23','receta-36','receta-38','receta-39','receta-40','receta-44','receta-48','receta-50']},
 lowResidueIdeas:{name:'Baja en residuos',recipeIds:['receta-13','receta-14','receta-18','receta-20','receta-23','receta-36','receta-38','receta-39','receta-40','receta-44','receta-48','receta-50']}
};

// Catalogue expansion is deterministic and does not fabricate recipe records.
// Clinical collections remain suggestions only; ingredient screening is not certification.
const MEAL_GROUPS={breakfast:['breakfast'],midmorning:['midmorning1'],lunch:['lunch'],snack:['snack1','snack2'],dinner:['dinner']};
export function expandRecipeBook(book,recipes,{minimum=20}={}){
 if(!book)return null;
 const byId=new Map(recipes.map(r=>[r.id,r]));
 const ids=[...new Set(book.recipeIds)].filter(id=>byId.has(id));
 const pool=recipes.filter(r=>!ids.includes(r.id)&&recipeFitsStyle(r,book.name));
 const count=group=>ids.filter(id=>byId.get(id).mealTypes.some(t=>MEAL_GROUPS[group].includes(t))).length;
 for(const [group,target] of Object.entries(RECIPE_BOOK_TARGET)){
  if(group==='total')continue;
  while(count(group)<target){
   const index=pool.findIndex(r=>r.mealTypes.some(t=>MEAL_GROUPS[group].includes(t)));
   if(index<0)break;
   ids.push(pool.splice(index,1)[0].id);
  }
 }
 while(ids.length<minimum&&pool.length)ids.push(pool.shift().id);
 return {...book,recipeIds:ids};
}

const normalize=value=>String(value||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
const aliases={
 '':'balanced','equilibrada':'balanced','mediterranea':'mediterranean',
 'vegana':'vegan','vegetariana':'vegetarian','sin lactosa':'lactose',
 'sin gluten':'gluten','rica en fibra':'fiber','rica en proteinas':'proteinIdeas','ganancia muscular':'muscleIdeas','hiposodica':'lowSodiumIdeas','musulmana / halal':'halalIdeas','diabetica':'diabetesIdeas','hipocalorica':'lowEnergyIdeas','hipercalorica':'highEnergyIdeas','baja en fibra':'lowFiberIdeas','baja en residuos':'lowResidueIdeas','sin azucar anadido':'noAddedSugar','mantenimiento':'maintenance','sin alimento x':'custom'
};
export function recipeBookForStyle(style='Equilibrada'){
 const key=aliases[normalize(style)];return RECIPE_BOOKS[key]||ADDITIONAL_RECIPE_BOOKS[key]||null;
}
export function selectRecipeBook(recipes,style,{restrictions=[],expanded=false}={}){
 const book=recipeBookForStyle(style);
 const byId=new Map(recipes.map(recipe=>[recipe.id,recipe]));
 const candidates=expanded?recipes:(expandRecipeBook(book,recipes)?.recipeIds||[]).map(id=>byId.get(id)).filter(Boolean);
 // Specialized styles without a reviewed book never inherit the generic book.
 // The full catalogue remains available as an explicit, separate choice.
 return candidates.filter(recipe=>recipeFitsStyle(recipe,style)&&!recipeHasRestriction(recipe,restrictions));
}
