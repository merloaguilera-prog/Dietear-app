import {mealRecords, localDay, DIARY_NUTRIENTS} from './meal-diary.mjs';
import {summarizeNutrition} from './nutrition-summary.mjs';

export function weeklyNutritionReport(history, endDay) {
  if(typeof endDay!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(endDay))throw new RangeError('Elige una fecha válida.');
  const end=new Date(endDay+'T12:00:00Z');
  if(!Number.isFinite(end.getTime())||end.toISOString().slice(0,10)!==endDay)throw new RangeError('Elige una fecha válida.');
  const dates=Array.from({length:7},(_,index)=>{const date=new Date(end);date.setUTCDate(date.getUTCDate()-6+index);return date.toISOString().slice(0,10);});
  const records=mealRecords(history).filter(record=>dates.includes(localDay(record.date)));
  const summary=items=>summarizeNutrition(items.map(record=>record.food));
  return {format:'dietear-weekly-nutrition',version:1,startDay:dates[0],endDay,
    scope:'Solo comidas confirmadas registradas; no equivale a la ingesta total ni a una valoración clínica.',
    days:dates.map(day=>({day,...summary(records.filter(record=>localDay(record.date)===day))})),
    recordedDays:new Set(records.map(record=>localDay(record.date))).size,
    ...summary(records)};
}

export function weeklyReportCsv(report) {
  const header=['fecha','comidas_registradas',...DIARY_NUTRIENTS.flatMap(([key,,unit])=>[key+'_'+unit,key+'_entradas_con_dato'])];
  const rows=report.days.map(day=>[day.day,day.entries,...DIARY_NUTRIENTS.flatMap(([key])=>[day.nutrients[key]??'',day.coverage[key].known])]);
  return '\uFEFF'+[header,...rows].map(row=>row.join(';')).join('\r\n')+'\r\n';
}
