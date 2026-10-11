import test from 'node:test';
import assert from 'node:assert/strict';
import {selectedGoals, togglePersonalGoal, saveGoalTargets, personalGoalProgress} from '../lib/personal-goals.js';
import {saveState, loadState} from '../lib/dietear-store.js';

const now = new Date('2026-10-11T12:00:00Z');
const weight = (value, date = '2026-10-10T12:00:00Z') => ({type:'peso',value,date});

test('legacy single goal becomes multiple goals, siblings and explicit deselection survive reload', () => {
  let profile = {goal:'Mejorar mi peso'};
  assert.deepEqual(selectedGoals(profile), ['Mejorar mi peso']);
  profile = togglePersonalGoal(profile, 'Moverme un poco más');
  assert.deepEqual(selectedGoals(profile), ['Mejorar mi peso','Moverme un poco más']);
  const storage = new Map();
  globalThis.window = {};
  globalThis.localStorage = {setItem: (key,value) => storage.set(key,value), getItem: key => storage.get(key)};
  saveState({profile});
  profile = loadState().profile;
  assert.equal(profile.goal, 'Mejorar mi peso · Moverme un poco más');
  profile = togglePersonalGoal(profile,'Mejorar mi peso');
  assert.deepEqual(selectedGoals(profile), ['Moverme un poco más']);
  profile = togglePersonalGoal(profile,'Moverme un poco más');
  assert.deepEqual(selectedGoals(profile), []);
  delete globalThis.window; delete globalThis.localStorage;
});

test('weekly cards use this week only, net movement and distinct habit days', () => {
  const records = [
    {type:'actividad',value:30,label:'Fuerza · 30 min',date:'2026-10-06T12:00:00Z'},
    {type:'paseo',value:20,label:'Caminar',date:'2026-10-06T13:00:00Z'},
    {type:'actividad',value:-5,label:'Corrección',date:'2026-10-06T14:00:00Z'},
    {type:'agua',value:0.5,date:'2026-10-07T12:00:00Z'},
    {type:'actividad',value:60,label:'Fuerza',date:'2026-10-04T12:00:00Z'},
    {type:'actividad',value:60,label:'Fuerza',date:'2026-10-12T12:00:00Z'}
  ];
  const result = personalGoalProgress({goalTargets:{activityMinutes:90,strengthSessions:2}},records,[],[],now);
  assert.equal(result['Moverme un poco más'].value,'45');
  assert.equal(result['Moverme un poco más'].progress,50);
  assert.equal(result['Ganar fuerza'].value,'1');
  assert.equal(result['Ganar fuerza'].progress,50);
  assert.equal(result['Cuidar mis hábitos'].value,'2/7');
});

test('weight targets support both directions and changing other targets preserves the baseline', () => {
  let profile = saveGoalTargets({}, {weight:100}, [weight(120)], now);
  assert.equal(personalGoalProgress(profile,[weight(110)],[],[],now)['Mejorar mi peso'].progress,50);
  profile = saveGoalTargets(profile,{weight:100,activityMinutes:80},[weight(110)],now);
  assert.equal(profile.goalTargets.weightBaseline,120);
  assert.equal(personalGoalProgress(profile,[weight(125)],[],[],now)['Mejorar mi peso'].progress,0);
  assert.equal(personalGoalProgress(profile,[weight(99)],[],[],now)['Mejorar mi peso'].progress,100);
  profile = saveGoalTargets({}, {weight:80}, [weight(60)], now);
  assert.equal(personalGoalProgress(profile,[weight(70)],[],[],now)['Mejorar mi peso'].progress,50);
});

test('missing readings cannot imply completed weight or health goals', () => {
  const result = personalGoalProgress({goalTargets:{weight:80}},[],[],[],now);
  assert.equal(result['Mejorar mi peso'].value,'Sin datos');
  assert.equal(result['Mejorar mi peso'].progress,null);
  assert.equal(result['Cuidar mi salud'].progress,null);
  assert.equal(result['Moverme un poco más'].progress,null);
});

test('planning is measured separately from food actually eaten', () => {
  const result = personalGoalProgress({},[],[{breakfast:'Tostada'},{lunch:'Lentejas'},{}],[],now);
  assert.equal(result['Comer un poco mejor'].value,'2/7');
  assert.match(result['Comer un poco mejor'].detail,/no significa que ya/);
});
