import test from 'node:test';
import assert from 'node:assert/strict';
import {createMealRecord,dayNutrition,mealRecords,nutritionDays} from '../lib/meal-diary.mjs';
import {loadState,saveState} from '../lib/dietear-store.js';
const draft=patch=>({name:'Mi plato',servings:'1',mealType:'lunch',nutrients:{energyKcal:'100',proteinG:'5'},confirmed:true,...patch});
const record=(id,patch={})=>createMealRecord(draft(patch),{id,date:'2026-11-22T12:00:00Z'});
test('only explicitly confirmed editable food entries can be recorded',()=>{
 assert.throws(()=>record('a',{confirmed:false}),/confirma/);
 for(const servings of [0,-1,'hola',Infinity,21])assert.throws(()=>record('a',{servings}),RangeError);
 for(const energyKcal of [-1,'hola',Infinity,true])assert.throws(()=>record('a',{nutrients:{energyKcal}}),RangeError);
 const a=record('a',{servings:'0,5',nutrients:{energyKcal:'120,5'}});
 assert.equal(a.value,60.25);assert.equal(a.food.nutrients.proteinG,null);
});
test('unknown calories stay unknown and the same record is never counted twice',()=>{
 const a=record('a',{servings:2}),b=record('b',{nutrients:{energyKcal:'',proteinG:0}});
 const result=dayNutrition([a,a,b],'2026-11-22');
 assert.equal(result.entries,2);assert.equal(result.nutrients.energyKcal,null);
 assert.equal(result.partialTotals.energyKcal,200);assert.equal(result.nutrients.proteinG,10);
 assert.equal(nutritionDays([a,b])[0].nutrients.energyKcal,null);
 assert.equal(mealRecords([{...a,food:{...a.food,servings:-1}}]).length,0);
});
test('daily history persists with existing records and contains no image bytes',t=>{
 const storage=new Map();globalThis.window={localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)}};t.after(()=>delete globalThis.window);
 const food=record('a',{source:'foto-ia',notes:'Estimación revisada',image:'do not persist'});
 const previous={id:1,date:'2026-11-22T10:00:00Z',type:'agua',value:0.25,label:'Agua'};
 assert.equal(saveState({profile:{name:'Ana',readingRate:3},history:[food,previous]}),'saved');
 const saved=loadState();assert.equal(saved.profile.readingRate,3);assert.deepEqual(saved.history,[food,previous]);
 assert.equal(JSON.stringify(saved).includes('do not persist'),false);
 assert.equal(dayNutrition(saved.history,'2026-11-22').nutrients.energyKcal,100);
});
