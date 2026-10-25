import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {exerciseCategories,exerciseLoggingKind} from '../lib/exercise-catalog.js';
test('exercise gallery contains eight distinct local photographs with no duplicated movement names',()=>{
 assert.equal(exerciseCategories.length,8);
 assert.equal(new Set(exerciseCategories.map(x=>x.id)).size,8);
 assert.equal(new Set(exerciseCategories.map(x=>x.source)).size,8);
 assert.deepEqual(exerciseCategories.map(x=>x.number),[1,2,3,4,5,6,7,8]);
 const hashes=exerciseCategories.map(category=>{
  const image=readFileSync(new URL('../public'+category.image,import.meta.url));
  assert.equal(image.toString('ascii',0,4),'RIFF');assert.equal(image.toString('ascii',8,12),'WEBP');
  assert.ok(image.length<400000,category.id+' must remain lightweight');
  return createHash('sha256').update(image).digest('hex');
 });
 assert.equal(new Set(hashes).size,8);
 const movements=exerciseCategories.flatMap(x=>x.movements);assert.equal(new Set(movements).size,movements.length);
});
test('every exercise category leads to an existing activity type without claiming completion',()=>{
 for(const category of exerciseCategories)assert.ok(['Caminar','Fuerza','Yoga / movilidad'].includes(exerciseLoggingKind(category.id)));
 for(const id of ['missing','__proto__',null])assert.equal(exerciseLoggingKind(id),null);
});
test('all exercise images carry an author, source, license and meaningful description',()=>{
 for(const category of exerciseCategories){assert.ok(category.author);assert.ok(category.alt.length>20);assert.match(category.source,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);assert.match(category.license,/^https:\/\/creativecommons.org\//);assert.ok(category.movements.length>=3);}
});
