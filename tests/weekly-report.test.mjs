import test from 'node:test';
import assert from 'node:assert/strict';
import {createMealRecord} from '../lib/meal-diary.mjs';
import {weeklyNutritionReport,weeklyReportCsv} from '../lib/weekly-report.mjs';
const meal=(id,date,energyKcal)=>createMealRecord({confirmed:true,name:'Nombre privado',mealType:'lunch',servings:2,nutrients:{energyKcal,proteinG:5}},{id,date:date+'T12:00:00'});
test('weekly reports include seven calendar dates and only deduplicated confirmed meals in range',()=>{
 const a=meal('a','2026-11-25',100),old=meal('old','2026-11-18',200),future=meal('future','2026-11-26',300);
 const report=weeklyNutritionReport([a,a,old,future,{...a,id:'bad',food:{...a.food,confirmed:false}},{type:'actividad',value:900,date:a.date}], '2026-11-25');
 assert.equal(report.startDay,'2026-11-19');assert.equal(report.days.length,7);assert.equal(report.entries,1);assert.equal(report.recordedDays,1);assert.equal(report.nutrients.energyKcal,200);
 assert.equal(report.days[0].nutrients.energyKcal,null);assert.equal(report.days[6].nutrients.proteinG,10);
 assert.ok(!JSON.stringify(report).includes('Nombre privado'));
});
test('missing nutrients remain unknown with partial totals and entry coverage',()=>{
 const report=weeklyNutritionReport([meal('a','2026-11-24',100),meal('b','2026-11-25',null)],'2026-11-25');
 assert.equal(report.nutrients.energyKcal,null);assert.equal(report.partialTotals.energyKcal,200);assert.deepEqual(report.coverage.energyKcal,{known:1,total:2});
 assert.equal(report.nutrients.proteinG,20);
});
test('empty reports keep all days and distinguish missing data from zero',()=>{
 const report=weeklyNutritionReport([],'2024-03-01');assert.equal(report.startDay,'2024-02-24');assert.equal(report.days[5].day,'2024-02-29');assert.equal(report.nutrients.energyKcal,null);assert.equal(report.recordedDays,0);
});
test('invalid dates are rejected and CSV preserves unknown fields and coverage',()=>{
 for(const date of ['',null,'2026-02-30','01/02/2026'])assert.throws(()=>weeklyNutritionReport([],date),RangeError);
 const report=weeklyNutritionReport([meal('a','2026-11-25',null)],'2026-11-25');const csv=weeklyReportCsv(report);
 assert.equal(csv.split('\r\n').filter(Boolean).length,8);assert.ok(csv.includes('2026-11-25;1;;0;10;1;'));assert.ok(!csv.includes('Nombre privado'));
});
