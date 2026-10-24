import test from "node:test";
import assert from "node:assert/strict";
import {loadState, saveState, migrateLegacy, STORE_KEY} from "../lib/dietear-store.js";
import {sanitizeSavedState} from "../lib/state-validation.js";

const validData = () => ({
  goals: [["a","Agua",1,2,"L"],["p","Pasos",500,7000,""],["e","Actividad",10,30,"min"],["f","Fruta",1,5,"raciones"]],
  shopping: [{name:"Tomates",text:"Tomates",qty:2,unit:"ud",days:["LUN"],done:false}],
  fridge: [{name:"Arroz",done:false}], profile:{name:"Ana",people:2,allergens:"huevo",familyMembers:[{id:1,name:"Ana",allergens:"huevo",avoid:""}]},
  history:[{id:1,type:"agua",value:0.25,date:"2026-10-24T12:00:00.000Z",label:"Agua 0,25 L"}],
  planner:[{day:"LUN",breakfast:"Tostada",lunch:"Lentejas",people:2}],
  careRecords:[], weekKey:"2026-10-19",dayKey:"2026-10-24",weekArchive:{"2026-10-12":{planner:[],shopping:[]}},
});
function setup(t, raw, beforeWrite = () => {}) {
  const items = new Map(raw === undefined ? [] : [[STORE_KEY,raw]]);
  globalThis.window = {localStorage:{
    getItem:key=>items.get(key)??null,
    setItem(key,value){beforeWrite(key,value);items.set(key,value);},
  }};
  t.after(()=>{delete globalThis.window;});
  return items;
}
const envelope = data => JSON.stringify({version:2,savedAt:"2026-10-24T12:00:00Z",data});
const backups = items => [...items.keys()].filter(key=>key.startsWith(STORE_KEY+"-recovery-"));

test("valid saved data opens without changing any values or creating recovery copies", t=>{
  const original=validData(),items=setup(t,envelope(original));
  const {_savedDay,...loaded}=loadState();
  assert.deepEqual(loaded,original);
  assert.equal(saveState(loaded),"saved");
  assert.equal(backups(items).length,0);
  assert.deepEqual(JSON.parse(items.get(STORE_KEY)).data,original);
});

test("malformed collections cannot break startup and are backed up before repair", t=>{
  const damaged={...validData(),shopping:{bad:true},fridge:[null,{name:"Arroz"}],goals:{bad:true},profile:{name:12}};
  const raw=envelope(damaged),items=setup(t,raw);
  const loaded=loadState();
  assert.deepEqual(loaded.shopping,[]);
  assert.deepEqual(loaded.fridge,[{name:"Arroz"}]);
  assert.equal(loaded.profile.name,"12");
  assert.equal(loaded.goals,undefined);
  assert.deepEqual(loaded.history,damaged.history);
  assert.equal(items.get(STORE_KEY),raw);
  assert.equal(saveState(loaded),"recovered");
  assert.equal(items.get(backups(items)[0]),raw);
  assert.equal(saveState(loaded),"recovered");
  assert.equal(backups(items).length,1);
});

test("invalid JSON is preserved verbatim before a fresh state is saved", t=>{
  const raw='{"version":2,"data":';
  const items=setup(t,raw);
  assert.deepEqual(loadState(),{});
  assert.equal(migrateLegacy(),null);
  assert.equal(saveState(validData()),"recovered");
  assert.equal(items.get(backups(items)[0]),raw);
});

test("if backup is blocked, the original is never overwritten", t=>{
  const raw=envelope({shopping:"broken"});
  const items=setup(t,raw,key=>{if(key!==STORE_KEY)throw new DOMException("Full","QuotaExceededError");});
  const loaded=loadState();
  assert.equal(saveState(loaded),"recovery-blocked");
  assert.equal(items.get(STORE_KEY),raw);
});

test("a write failure after backup is safe and retry reuses the same backup", t=>{
  let blocked=true;
  const raw=envelope({fridge:[null]});
  const items=setup(t,raw,key=>{if(key===STORE_KEY&&blocked)throw new Error("Full");});
  const loaded=loadState();
  assert.equal(saveState(loaded),"recovery-blocked");
  assert.equal(items.get(STORE_KEY),raw);
  assert.equal(backups(items).length,1);
  blocked=false;
  assert.equal(saveState(loaded),"recovered");
  assert.equal(backups(items).length,1);
  assert.equal(items.get(backups(items)[0]),raw);
});

test("an unknown storage version is never downgraded or replaced with legacy data", t=>{
  const raw=JSON.stringify({version:99,data:validData()}),items=setup(t,raw);
  items.set("dietear-profile",JSON.stringify({name:"Legacy"}));
  assert.deepEqual(loadState(),{});
  assert.equal(migrateLegacy(),null);
  assert.equal(saveState(validData()),"protected");
  assert.equal(items.get(STORE_KEY),raw);
});

test("a different tab changing the original during recovery prevents overwriting", t=>{
  const items=setup(t,envelope({shopping:false}));
  const loaded=loadState(),newer=envelope(validData());
  items.set(STORE_KEY,newer);
  assert.equal(saveState(loaded),"protected");
  assert.equal(items.get(STORE_KEY),newer);
});

test("unavailable storage reports a save failure without breaking startup", t=>{
  setup(t);
  Object.defineProperty(window,"localStorage",{get(){throw new DOMException("Denied","SecurityError");}});
  assert.equal(loadState(),null);
  assert.equal(migrateLegacy(),null);
  assert.equal(saveState(validData()),"unavailable");
});

test("old-key migration validates data but leaves every original key in place", t=>{
  const items=setup(t);
  const raw=JSON.stringify([{name:"Arroz"},null]);
  items.set("dietear-fridge",raw);
  assert.equal(loadState(),null);
  const loaded=migrateLegacy();
  assert.deepEqual(loaded.fridge,[{name:"Arroz"}]);
  assert.equal(saveState(loaded),"saved");
  assert.equal(items.get("dietear-fridge"),raw);
});

test("damaged archive dates, family members and plan fields are safe to read", ()=>{
  const result=sanitizeSavedState({weekKey:"2026-02-31",weekArchive:{bad:{},"2026-10-19":{shopping:[null,{text:"Pan",days:{}}],planner:[null,{lunch:{}}]}},profile:{familyMembers:[null,{name:"Ana"}],healthTrackedAreas:{},clinicalContext:{broken:null}}});
  assert.equal(result.weekKey,undefined);
  assert.equal(result.weekArchive.bad,undefined);
  assert.deepEqual(result.weekArchive["2026-10-19"].shopping,[{text:"Pan",days:[]}]);
  assert.deepEqual(result.weekArchive["2026-10-19"].planner,[{},{lunch:""}]);
  assert.deepEqual(result.profile.familyMembers,[{name:"Ana",allergens:"",avoid:""}]);
  assert.deepEqual(result.profile.healthTrackedAreas,[]);
  assert.deepEqual(result.profile.clinicalContext,{});
  assert.deepEqual(sanitizeSavedState({shopping:[{name:"Arroz",text:{broken:true}}]}).shopping,[]);
});
