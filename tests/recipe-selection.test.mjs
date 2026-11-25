import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {recipeFitsStyle, recipeHasRestriction, ingredientMatchesRestriction, buildRecipeWeek, recipeStyle} from '../lib/recipe-selection.mjs';
const recipes = JSON.parse(readFileSync(new URL('../lib/recipes-expanded.json', import.meta.url)));
test('vegan and vegetarian collections exclude the relevant animal ingredients',()=>{
  const vegan = recipes.filter(recipe=>recipeFitsStyle(recipe,'Vegana'));
  const vegetarian = recipes.filter(recipe=>recipeFitsStyle(recipe,'Vegetariana'));
  assert.ok(vegan.length > 5);
  assert.ok(vegetarian.length > vegan.length);
  for (const ingredient of ['Leche','Yogur natural','Huevo','Pollo','Atún al natural escurrido']) {
    const recipe = {ingredients:[[ingredient,100,'g']]};
    assert.equal(recipeFitsStyle(recipe,'Vegana'),false,ingredient);
  }
});
test('allergy screening expands ingredient aliases and escapes literal input',()=>{
  for (const [food,term] of [['Tofu firme','soja'],['Pan integral','gluten'],['Cuscús','trigo'],['Hummus','sésamo'],['Nueces sin sal','frutos secos'],['Tortilla francesa','huevo']]) assert.equal(ingredientMatchesRestriction(food,term),true,food);
  assert.equal(ingredientMatchesRestriction('Queso sin lactosa','leche'),true);
  assert.equal(ingredientMatchesRestriction('Queso sin lactosa','lactosa'),false);
  assert.equal(ingredientMatchesRestriction('Arroz','('),false);
  assert.equal(recipeHasRestriction({name:'Bol de verano',ingredients:[['Tofu firme',100,'g']]},['soja']),true);
});
test('every automatically planned meal comes from the filtered recipe collection',()=>{
  const days=Array.from({length:7},(_,i)=>({day:String(i),people:2,custom:'retain'}));
  const fields=[['breakfast'],['midmorning1'],['lunch'],['snack1'],['dinner']];
  const result=buildRecipeWeek(days,recipes,fields,{style:'Vegana',restrictions:['frutos secos','soja']});
  assert.equal(result.length,7);
  for (const day of result) {
    assert.equal(day.people,2); assert.equal(day.custom,'retain');
    for (const [field] of fields) if (day[field]) {
      const recipe=recipes.find(item=>item.name===day[field]);
      assert.ok(recipe);
      assert.equal(recipeFitsStyle(recipe,'Vegana'),true);
      assert.equal(recipeHasRestriction(recipe,['frutos secos','soja']),false);
    }
  }
});
test('medical, energy and points styles do not get generic automatic weeks',()=>{
  for (const style of ['Diabética','Hipercalórica','Hiposódica','Ayuno intermitente','Por puntos','Musulmana / Halal']) {
    assert.equal(recipeStyle(style).canPlan,false);
    assert.equal(buildRecipeWeek([{}],recipes,[['lunch']],{style}),null);
  }
  assert.deepEqual(buildRecipeWeek([{day:'LUN',lunch:'old'}],[],[['lunch']],{style:'Vegana'}),[{day:'LUN',lunch:'',mealServings:{}}]);
});
