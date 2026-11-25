import test from "node:test";
import assert from "node:assert/strict";
import {summarizeNutrition} from "../lib/nutrition-summary.mjs";

test("sums confirmed nutrients by serving size", () => {
 const result = summarizeNutrition([
  {servings:2,nutrients:{energyKcal:100,proteinG:5,carbsG:10}},
  {servings:1,nutrients:{energyKcal:50,proteinG:3,carbsG:4}}
 ]);
 assert.equal(result.nutrients.energyKcal,250);
 assert.equal(result.nutrients.proteinG,13);
 assert.equal(result.nutrients.carbsG,24);
});
test("missing nutrient is unknown, not zero", () => {
 const result = summarizeNutrition([
  {nutrients:{energyKcal:100,proteinG:5}},
  {nutrients:{energyKcal:200}}
 ]);
 assert.equal(result.nutrients.energyKcal,300);
 assert.equal(result.nutrients.proteinG,null);
 assert.deepEqual(result.coverage.proteinG,{known:1,total:2});
 assert.equal(result.partialTotals.proteinG,5);
});
test("empty day has unknown totals", () => {
 const result=summarizeNutrition([]);
 assert.equal(result.nutrients.energyKcal,null);
});
test("rejects invalid portions and nutrient values", () => {
 assert.throws(()=>summarizeNutrition([{servings:0,nutrients:{energyKcal:100}}]),RangeError);
 assert.throws(()=>summarizeNutrition([{nutrients:{energyKcal:-10}}]),RangeError);
 assert.throws(()=>summarizeNutrition([{nutrients:{energyKcal:NaN}}]),RangeError);
});
