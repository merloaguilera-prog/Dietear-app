import test from 'node:test';
import assert from 'node:assert/strict';
import {PERSONAL_GOALS,selectedPersonalGoalIds,withPersonalGoals,togglePersonalGoal,withPrimaryPersonalGoal,personalGoalDay,normalizeGoalCheckins,toggleGoalCheckin,personalGoalWeek} from '../lib/personal-goals.mjs';
import {sanitizeSavedState} from '../lib/state-validation.js';

test('legacy single goals remain selected until the user changes their selection',()=>{
 const profile={goal:'Cuidar mi salud',name:'Ana'};
 assert.deepEqual(selectedPersonalGoalIds(profile),['health']);
 assert.deepEqual(togglePersonalGoal(profile,'food'),{goal:'Cuidar mi salud',name:'Ana',personalGoals:['health','food']});
 assert.deepEqual(profile,{goal:'Cuidar mi salud',name:'Ana'});
});
test('all objectives can be chosen together, deselected independently, and cleared without a forced default',()=>{
 let profile=withPersonalGoals({goal:'Ganar fuerza',dietStyle:'Vegana'},PERSONAL_GOALS.map(goal=>goal.id));
 assert.equal(profile.personalGoals.length,9);assert.equal(profile.goal,'Ganar fuerza');
 profile=togglePersonalGoal(profile,'strength');
 assert.equal(profile.personalGoals.length,8);assert.equal(profile.goal,'Cuidar mi salud');assert.equal(profile.dietStyle,'Vegana');
 profile=withPersonalGoals(profile,[]);
 assert.deepEqual(selectedPersonalGoalIds(profile),[]);assert.equal(profile.goal,'');
 assert.deepEqual(selectedPersonalGoalIds({...profile,goal:'Cuidar mi salud'}),[]);
});
test('changing the primary goal adds it without replacing the other selected objectives',()=>{
 const profile=withPrimaryPersonalGoal(withPersonalGoals({},['food','movement']),'Dormir y descansar mejor');
 assert.deepEqual(profile.personalGoals,['food','movement','rest']);assert.equal(profile.goal,'Dormir y descansar mejor');
 assert.equal(withPrimaryPersonalGoal(profile,'unknown'),profile);assert.equal(togglePersonalGoal(profile,'unknown'),profile);
});
test('check-ins are explicit, reversible, scoped by day and restricted to selected goals',()=>{
 const profile=withPersonalGoals({},['food','movement']);
 const first=toggleGoalCheckin(profile,'food','2026-11-25');
 assert.deepEqual(first.goalCheckins,{'2026-11-25':['food']});assert.equal(profile.goalCheckins,undefined);
 const second=toggleGoalCheckin(first,'movement','2026-11-26');
 assert.deepEqual(second.goalCheckins,{'2026-11-25':['food'],'2026-11-26':['movement']});
 assert.deepEqual(toggleGoalCheckin(first,'food','2026-11-25').goalCheckins,{'2026-11-25':[]});
 assert.equal(toggleGoalCheckin(profile,'water','2026-11-25'),profile);
 assert.equal(toggleGoalCheckin(profile,'food','2026-02-31'),profile);
});
test('weekly counts use calendar days across year boundaries and exclude future marks',()=>{
 const profile={goalCheckins:{'2025-12-25':['food'],'2025-12-26':['food','food'],'2025-12-31':['movement'],'2026-01-01':['rest','water'],'2026-01-02':['food']}};
 const week=personalGoalWeek(profile,'2026-01-01');
 assert.deepEqual(week.days.map(day=>day.day),['2025-12-26','2025-12-27','2025-12-28','2025-12-29','2025-12-30','2025-12-31','2026-01-01']);
 assert.equal(week.steps,4);assert.equal(week.activeDays,3);
 assert.equal(personalGoalDay(new Date(2026,0,1,0,5)),'2026-01-01');
 assert.deepEqual(personalGoalWeek(profile,'bad'),{days:[],steps:0,activeDays:0});
});
test('changing selected goals preserves past marks and unrelated health, food and daily data',()=>{
 const marked=toggleGoalCheckin(withPersonalGoals({allergens:'huevo',recipeFavorites:['legumbre']},['food']),'food','2026-11-25');
 const profile=withPersonalGoals(marked,['movement']);
 assert.deepEqual(profile.goalCheckins,{'2026-11-25':['food']});assert.equal(personalGoalWeek(profile,'2026-11-25').steps,1);
 assert.equal(profile.allergens,'huevo');assert.deepEqual(profile.recipeFavorites,['legumbre']);
});
test('saved multi-goal state survives recovery while invalid values cannot break rendering',()=>{
 const goals=[['a','Agua',0,2,'L'],['p','Pasos',0,7000,''],['e','Actividad',0,30,'min'],['f','Fruta',0,5,'raciones']];
 const saved={goals,history:[],profile:{goal:'Ganar fuerza',personalGoals:['food','movement','food',null,{}],goalCheckins:{'bad':['food'],'2026-02-31':['food'],'2026-11-25':['food','food','unknown']},name:'Ana'}};
 const clean=sanitizeSavedState(saved);
 assert.deepEqual(clean.goals,goals);assert.deepEqual(clean.history,[]);
 assert.deepEqual(clean.profile.personalGoals,['food','movement']);assert.equal(clean.profile.goal,'Comer un poco mejor');
 assert.deepEqual(clean.profile.goalCheckins,{'2026-11-25':['food']});
 assert.deepEqual(sanitizeSavedState(JSON.parse(JSON.stringify(clean))),clean);
 assert.deepEqual(selectedPersonalGoalIds(sanitizeSavedState({profile:{goal:'Cuidar mi salud',personalGoals:{broken:true}}}).profile),['health']);
 assert.deepEqual(normalizeGoalCheckins(['food']),{});
});
