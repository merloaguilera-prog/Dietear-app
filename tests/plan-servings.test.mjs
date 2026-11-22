import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeWeek,mealServings} from '../lib/week-plan.js';
const source=readFileSync(new URL('../lib/recipes.js',import.meta.url),'utf8');
const expanded=readFileSync(new URL('../lib/recipes-expanded.json',import.meta.url),'utf8');
const code=source.replace(/import \{mealServings\}[^;]+;/,'const mealServings='+mealServings.toString()+';').replace(/import expandedRecipes[^;]+;/,'const expandedRecipes='+expanded+';');
const {shoppingFromPlan}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('recipe servings survive reopening and change only the chosen meal quantities',()=>{
 const plan=normalizeWeek([{day:'LUN',people:1,portionFactor:1,lunch:'Ensalada templada con legumbres',dinner:'Pescado con verduras y patata',mealServings:{lunch:2}}]);
 assert.equal(mealServings(plan[0],'lunch'),2);assert.equal(mealServings(plan[0],'dinner'),1);
 const shopping=shoppingFromPlan(plan,[['lunch'],['dinner']]);
 assert.equal(shopping.find(item=>item.text==='Garbanzos cocidos').qty,240);
 assert.equal(shopping.find(item=>item.text==='Pescado').qty,150);
 assert.equal(shopping.find(item=>item.text==='Aceite de oliva').qty,30);
 const reopened=normalizeWeek(JSON.parse(JSON.stringify(plan)));
 assert.equal(mealServings(reopened[0],'lunch'),2);
});
test('invalid stored serving overrides cannot contaminate the generated shopping list',()=>{
 for(const value of [-1,Infinity,'bad',null,{}]) {
  const plan=normalizeWeek([{people:3,mealServings:{lunch:value}}]);
  assert.equal(mealServings(plan[0],'lunch'),3);
 }
});
