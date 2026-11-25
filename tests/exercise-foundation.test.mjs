import test from "node:test";
import assert from "node:assert/strict";
import {guidesForLevel,summarizeActivity} from "../lib/exercise-foundation.mjs";

test("levels filter guides and include safe step-by-step instructions",()=>{
 assert.ok(guidesForLevel("suave").length>=2);
 assert.ok(guidesForLevel("avanzado").every(x=>x.levels.includes("avanzado")));
 assert.ok(guidesForLevel("suave").every(x=>x.steps.length>=3));
 assert.throws(()=>guidesForLevel("desconocido"),RangeError);
});
test("duplicate session IDs are counted once",()=>{
 const result=summarizeActivity([
  {id:"watch:1",durationMinutes:30,activeKcal:110},
  {id:"watch:1",durationMinutes:30,activeKcal:110},
  {id:"manual:2",durationMinutes:15,activeKcal:50}
 ]);
 assert.deepEqual(result,{sessions:2,durationMinutes:45,activeKcal:160,activeKcalCoverage:{known:2,total:2}});
});
test("unknown energy is not reported as zero",()=>{
 const result=summarizeActivity([{id:"a",durationMinutes:10},{id:"b",durationMinutes:20,activeKcal:80}]);
 assert.equal(result.activeKcal,null);
 assert.deepEqual(result.activeKcalCoverage,{known:1,total:2});
});
test("invalid activity is rejected",()=>{
 assert.throws(()=>summarizeActivity([{id:"",durationMinutes:5}]),TypeError);
 assert.throws(()=>summarizeActivity([{id:"x",durationMinutes:-2}]),RangeError);
});
