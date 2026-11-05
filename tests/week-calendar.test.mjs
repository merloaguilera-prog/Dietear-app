import test from "node:test";
import assert from "node:assert/strict";
import {weekKeyFor,shiftWeek,moveToWeek,emptyWeek} from "../lib/week-plan.js";

test("la semana empieza el lunes, incluso en cambio de año",()=>{
 assert.equal(weekKeyFor(new Date(2027,0,1)),"2026-12-28");
 assert.equal(shiftWeek("2026-12-28",1),"2027-01-04");
});

test("el historial permite consultar semanas sin perder el menú",()=>{
 const planner=emptyWeek(2);
 planner[0].breakfast="Avena";
 const moved=moveToWeek({weekKey:"2026-11-02",planner,shopping:[{text:"Avena"}],archive:{},people:2},"2026-11-09");
 assert.equal(moved.weekKey,"2026-11-09");
 assert.equal(moved.planner[0].breakfast,"");
 const restored=moveToWeek({...moved,people:2},"2026-11-02");
 assert.equal(restored.planner[0].breakfast,"Avena");
 assert.equal(restored.shopping[0].text,"Avena");
});

test("seleccionar la semana actual no altera los datos",()=>{
 const planner=emptyWeek(1),shopping=[{text:"Tomate"}];
 const result=moveToWeek({weekKey:"2026-11-02",planner,shopping,archive:{},people:1},"2026-11-02");
 assert.equal(result.planner,planner);
 assert.equal(result.shopping,shopping);
});
