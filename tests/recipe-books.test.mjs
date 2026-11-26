import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mealServings} from '../lib/week-plan.js';
import {recipeFitsStyle,recipeHasRestriction} from '../lib/recipe-selection.mjs';
import {RECIPE_BOOKS,ADDITIONAL_RECIPE_BOOKS,MAX_SHARED_RECIPES,RECIPE_BOOK_TARGET,recipeBookAudit,expandRecipeBook,recipeBookForStyle,selectRecipeBook} from '../lib/recipe-books.mjs';

const source=readFileSync(new URL('../lib/recipes.js',import.meta.url),'utf8');
const expanded=readFileSync(new URL('../lib/recipes-expanded.json',import.meta.url),'utf8');
const code=source.replace(/import \{mealServings\}[^;]+;/,'const mealServings='+mealServings.toString()+';').replace(/import expandedRecipes[^;]+;/,'const expandedRecipes='+expanded+';');
const {recipes}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const books=Object.values(RECIPE_BOOKS);

test('eight distinct books contain real recipes compatible with their ingredient rules',()=>{
 assert.equal(books.length,8);
 const byId=new Map(recipes.map(recipe=>[recipe.id,recipe]));
 for(const book of books){
  assert.equal(book.recipeIds.length,16,book.name);
  assert.equal(new Set(book.recipeIds).size,16,book.name);
  for(const id of book.recipeIds){assert.ok(byId.has(id),id);assert.equal(recipeFitsStyle(byId.get(id),book.name),true,book.name+': '+id);}
  assert.deepEqual(selectRecipeBook(recipes,book.name).slice(0,book.recipeIds.length).map(recipe=>recipe.id),book.recipeIds);
 }
});
test('no pair of default books shares more than five dishes and no dish appears in more than two',()=>{
 const uses=new Map();
 for(const book of books)for(const id of book.recipeIds)uses.set(id,(uses.get(id)||0)+1);
 for(const [id,count] of uses)assert.ok(count<=2,id);
 for(let i=0;i<books.length;i++)for(let j=i+1;j<books.length;j++){
  const shared=books[i].recipeIds.filter(id=>books[j].recipeIds.includes(id));
  assert.ok(shared.length<=MAX_SHARED_RECIPES,books[i].name+' / '+books[j].name+': '+shared.join(', '));
 }
});
test('the first three proposals are different in every initial book',()=>{
 const featured=books.flatMap(book=>selectRecipeBook(recipes,book.name).slice(0,3).map(recipe=>recipe.id));
 assert.equal(featured.length,24);assert.equal(new Set(featured).size,24);
});
test('personal restrictions apply to both selected and expanded catalogues without backfilling',()=>{
 const restrictions=['frutos secos','soja','gluten'];
 for(const expanded of [false,true])for(const recipe of selectRecipeBook(recipes,'Vegana',{restrictions,expanded})){
  assert.equal(recipeFitsStyle(recipe,'Vegana'),true);
  assert.equal(recipeHasRestriction(recipe,restrictions),false);
 }
 assert.deepEqual(selectRecipeBook(recipes,'Sin lactosa',{restrictions:recipes.flatMap(recipe=>recipe.ingredients.map(item=>item[0]))}),[]);
});
test('aliases share one book and unknown styles require an explicit general-catalogue choice',()=>{
 assert.equal(recipeBookForStyle(' MEDITERRANEA '),RECIPE_BOOKS.mediterranean);
 for(const style of ['Estilo desconocido']){
  assert.equal(recipeBookForStyle(style),null);
  assert.deepEqual(selectRecipeBook(recipes,style),[]);
  assert.equal(selectRecipeBook(recipes,style,{expanded:true}).length,recipes.filter(recipe=>recipeFitsStyle(recipe,style)).length);
 }
});
test('the complete compatible catalogue remains available without changing IDs, quantities or saved dishes',()=>{
 const before=JSON.stringify(recipes);
 for(const book of books){
  const expanded=selectRecipeBook(recipes,book.name,{expanded:true});
  assert.equal(expanded.length,recipes.filter(recipe=>recipeFitsStyle(recipe,book.name)).length);
  for(const recipe of expanded)assert.equal(recipe,recipes.find(item=>item.id===recipe.id));
 }
 assert.equal(JSON.stringify(recipes),before);
});
test('new catalogue entries require editorial selection before entering a default book',()=>{
 const recipe={...recipes[0],id:'new-dish',name:'Nueva propuesta'};
 assert.equal(selectRecipeBook([...recipes,recipe],'Equilibrada').some(item=>item.id===recipe.id),false);
 assert.equal(selectRecipeBook([...recipes,recipe],'Equilibrada',{expanded:true}).some(item=>item.id===recipe.id),true);
});

test('new nonclinical collections contain real unique recipes and remain separate from clinical diets',()=>{
 const byId=new Map(recipes.map(r=>[r.id,r]));
 for(const book of Object.values(ADDITIONAL_RECIPE_BOOKS)){
  assert.equal(book.recipeIds.length,12,book.name);
  assert.equal(new Set(book.recipeIds).size,12,book.name);
  for(const id of book.recipeIds)assert.ok(byId.has(id),id);
  assert.ok(selectRecipeBook(recipes,book.name).length>=20,book.name);
 }
 assert.equal(recipeBookForStyle('Diabética').recipeIds.length,12);
 assert.equal(recipeBookForStyle('Hiposódica').recipeIds.length,12);
});

test('muscle and protein collections are culinary ideas, not certified macros',()=>{assert.equal(recipeBookForStyle('Rica en proteínas').recipeIds.length,12);assert.equal(recipeBookForStyle('Ganancia muscular').recipeIds.length,12);});

test('seven clinical collections remain blocked from automatic planning',()=>{for(const style of ['Hiposódica','Musulmana / Halal','Diabética','Hipocalórica','Hipercalórica','Baja en fibra','Baja en residuos']){assert.equal(recipeBookForStyle(style).recipeIds.length,12,style);}});

test('publication audit rejects duplicate IDs and insufficient meal variety',()=>{const book={recipeIds:['receta-20','receta-20','receta-13']};const audit=recipeBookAudit(book,recipes);assert.deepEqual(audit.duplicates,['receta-20']);assert.equal(audit.meetsMinimum,false);assert.equal(RECIPE_BOOK_TARGET.total,20);});

test('expanded books have at least twenty distinct recipes and meal coverage',()=>{for(const book of [...Object.values(RECIPE_BOOKS),...Object.values(ADDITIONAL_RECIPE_BOOKS)]){const expanded=expandRecipeBook(book,recipes);const audit=recipeBookAudit(expanded,recipes);assert.equal(audit.meetsMinimum,true,book.name+': '+JSON.stringify(audit));}});
