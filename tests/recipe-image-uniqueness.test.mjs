import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../lib/recipes.js",import.meta.url),"utf8");
const expanded=JSON.parse(fs.readFileSync(new URL("../lib/recipes-expanded.json",import.meta.url),"utf8"));
const baseCount=(source.match(/\{id:"[^"]+",mealTypes:/g)||[]).length;

test("el recetario no reutiliza celdas fotográficas",()=>{
 const count=baseCount+expanded.length;
 assert.ok(baseCount>0,"Deben existir recetas base");
 assert.ok(count<=64,"Hay "+count+" recetas para 64 celdas fotográficas; añadir nuevas imágenes antes de ampliar el catálogo");
 const cells=Array.from({length:count},(_,index)=>Math.floor(index/16)+":"+index%16);
 assert.equal(new Set(cells).size,count);
});

test("las recetas ampliadas tienen identificadores únicos",()=>{
 const ids=expanded.map(r=>r.id);
 assert.equal(new Set(ids).size,ids.length);
});
