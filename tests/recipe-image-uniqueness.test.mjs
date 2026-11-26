import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../lib/recipes.js",import.meta.url),"utf8");
const photoSource=fs.readFileSync(new URL("../components/RecipePhoto.js",import.meta.url),"utf8");
const expanded=JSON.parse(fs.readFileSync(new URL("../lib/recipes-expanded.json",import.meta.url),"utf8"));
const baseIds=[...source.matchAll(/\{id:"([^"]+)",mealTypes:/g)].map(match=>match[1]);
const allIds=[...baseIds,...expanded.map(r=>r.id)];
const allNames=[...source.matchAll(/\{id:"[^"]+",mealTypes:\[[^\]]+\],name:"([^"]+)"/g)].map(match=>match[1]).concat(expanded.map(r=>r.name));

test("cada receta tiene un identificador único",()=>{
 assert.ok(baseIds.length>0,"Deben existir recetas base");
 assert.equal(new Set(allIds).size,allIds.length,"Hay recetas con identificadores repetidos");
});

test("cada receta tiene un nombre único",()=>{
 assert.equal(allNames.length,allIds.length,"No se han podido revisar todos los nombres");
 assert.equal(new Set(allNames.map(name=>name.trim().toLocaleLowerCase("es"))).size,allNames.length,"Hay platos repetidos en el recetario");
});

test("las fotografías existentes son exclusivas y las recetas adicionales quedan sin foto",()=>{
 const photographed=Math.min(allIds.length,64);
 assert.match(source,/imageSheet:index<64\?Math\.floor\(index\/16\):null/);
 assert.match(source,/imageCell:index<64\?index%16:null/);
 assert.match(photoSource,/recipe(?:\?\.|\.)imageSheet/);
 assert.match(photoSource,/recipe(?:\?\.|\.)imageCell/);
 const cells=allIds.slice(0,photographed).map((_,index)=>Math.floor(index/16)+":"+index%16);
 assert.equal(new Set(cells).size,photographed);
 assert.ok(allIds.length>photographed,"El test también cubre las recetas pendientes de fotografía");
});
