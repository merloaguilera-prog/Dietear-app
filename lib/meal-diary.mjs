import {NUTRIENTS, summarizeNutrition} from './nutrition-summary.mjs';
export const DIARY_NUTRIENTS=[['energyKcal','Calorías','kcal'],['proteinG','Proteínas','g'],['carbsG','Hidratos','g'],['fatG','Grasas','g'],['fiberG','Fibra','g']];
export const localDay = value => new Date(value).toLocaleDateString('sv-SE');
const meals=new Set(['breakfast','midmorning1','lunch','snack1','snack2','dinner']);
export function createMealRecord(draft, {id, date = new Date().toISOString()} = {}) {
  if (!draft || draft.confirmed !== true) throw new TypeError('Revisa y confirma la entrada antes de guardarla.');
  if (typeof id !== 'string' || !id.trim() || !Number.isFinite(new Date(date).getTime())) throw new TypeError('Registro no válido.');
  const name=String(draft.name || '').trim();
  if (!name || name.length>150) throw new RangeError('Escribe un nombre de hasta 150 caracteres.');
  const servings=Number(String(draft.servings ?? 1).replace(',','.'));
  if (!Number.isFinite(servings)||servings<=0||servings>20) throw new RangeError('Las raciones deben ser mayores que cero y como máximo 20.');
  const nutrients=Object.fromEntries(NUTRIENTS.map(key=>{
    const input=draft.nutrients?.[key];
    const value=input==null||input==='' ? null : typeof input==='number' ? input : typeof input==='string' ? Number(input.replace(',','.')) : NaN;
    if(value!==null&&(!Number.isFinite(value)||value<0||value>100000))throw new RangeError('Revisa los valores nutricionales. Deja en blanco los que no conozcas.');
    return [key,value];
  }));
  if (!meals.has(draft.mealType)) throw new RangeError('Elige una comida del día.');
  return {id,date,type:'comida',value:nutrients.energyKcal===null?null:nutrients.energyKcal*servings,label:name,
    food:{version:1,confirmed:true,name,mealType:draft.mealType,servings,nutrients,source:draft.source==='foto-ia'?'foto-ia':'manual',notes:String(draft.notes||'').slice(0,1500)}};
}
export function mealRecords(history, day = null) {
  const seen=new Set();
  return (Array.isArray(history)?history:[]).flatMap(item=>{
    if(item?.type!=='comida'||item.food?.version!==1||(day&&localDay(item.date)!==day)||seen.has(item.id))return [];
    try {const record=createMealRecord(item.food,{id:item.id,date:item.date});seen.add(item.id);return [record];}catch{return [];}
  });
}
export function dayNutrition(history, day = localDay(new Date())) {
  const records=mealRecords(history,day);
  return {...summarizeNutrition(records.map(item=>item.food)),records};
}
export function nutritionDays(history) {
  const records=mealRecords(history);
  return [...new Set(records.map(item=>localDay(item.date)))].sort().map(day=>({day,...dayNutrition(records,day)}));
}
