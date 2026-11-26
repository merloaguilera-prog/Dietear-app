import test from 'node:test';
import assert from 'node:assert/strict';
import {dietGuide} from '../lib/diet-guides.mjs';
const styles=['Equilibrada','Mediterránea','Vegana','Vegetariana','Sin gluten','Sin lactosa','Hiposódica','Musulmana / Halal','Diabética','Hipocalórica','Hipercalórica','Rica en proteínas','Ganancia muscular','Rica en fibra','Baja en fibra','Baja en residuos','Sin azúcar añadido','Mantenimiento','Dieta por puntos','Coronaria'];
test('all visible diets have readable explanations',()=>{for(const style of styles){const guide=dietGuide(style);assert.ok(guide.length>70,style);assert.ok(!guide.startsWith('Este estilo de alimentación propone'),style);}});
test('low fiber is not described as high fiber',()=>{assert.match(dietGuide('Baja en fibra'),/reduce temporalmente/i);assert.match(dietGuide('Rica en fibra'),/legumbres/i);});
