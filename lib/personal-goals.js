export const PERSONAL_GOALS = [
  {name: 'Cuidar mi salud', icon: '♥', color: '#d7518b', section: 'Salud y necesidades', tab: 'perfil'},
  {name: 'Mejorar mi peso', icon: '⚖', color: '#6e5ccd', section: 'Peso y medidas', tab: 'progreso'},
  {name: 'Comer un poco mejor', icon: '🍽', color: '#329575', section: '', tab: 'plan'},
  {name: 'Moverme un poco más', icon: '👟', color: '#2686b6', section: 'Pasos y actividad', tab: 'progreso'},
  {name: 'Ganar fuerza', icon: '💪', color: '#c27924', section: 'Pasos y actividad', tab: 'progreso'},
  {name: 'Cuidar mis hábitos', icon: '✓', color: '#a150a5', section: '', tab: 'hoy'}
];

export function selectedGoals(profile) {
  const values = Array.isArray(profile.goals) ? profile.goals : profile.goal ? [profile.goal] : [];
  return [...new Set(values.filter(value => PERSONAL_GOALS.some(goal => goal.name === value)))];
}

export function togglePersonalGoal(profile, name) {
  const selected = selectedGoals(profile);
  const goals = selected.includes(name) ? selected.filter(value => value !== name) : [...selected, name];
  return {...profile, goals, goal: goals.join(' · ')};
}

const validRecords = history => history.filter(item => item.value !== '' && item.value != null && Number.isFinite(Number(item.value)) && Number.isFinite(new Date(item.date).getTime()));
const positiveNumber = value => {
  const number = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(number) && number > 0 ? number : null;
};
const percent = (value, target) => target > 0 ? Math.round(Math.max(0, Math.min(1, value / target)) * 100) : null;

export function latestWeight(history) {
  return validRecords(history).filter(item => item.type === 'peso' && Number(item.value) > 0).sort((a,b) => new Date(b.date) - new Date(a.date))[0] || null;
}

export function saveGoalTargets(profile, draft, history, now = new Date()) {
  const old = profile.goalTargets || {};
  const weight = positiveNumber(draft.weight);
  const weightChanged = weight !== positiveNumber(old.weight);
  const baseline = positiveNumber(latestWeight(history)?.value ?? profile.weight);
  return {...profile, goalTargets: {
    weight: weight ?? '',
    weightBaseline: weightChanged ? baseline ?? '' : old.weightBaseline ?? '',
    weightStartDate: weightChanged ? now.toISOString() : old.weightStartDate,
    activityMinutes: positiveNumber(draft.activityMinutes) ?? '',
    strengthSessions: positiveNumber(draft.strengthSessions) ?? ''
  }};
}

export function personalGoalProgress(profile, history, planner = [], careRecords = [], now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const records = validRecords(history).filter(item => new Date(item.date) <= now);
  const week = records.filter(item => new Date(item.date) >= monday);
  const movement = week.filter(item => ['actividad', 'paseo'].includes(item.type));
  const minutes = Math.max(0, movement.reduce((sum, item) => sum + Number(item.value), 0));
  const strength = movement.filter(item => /fuerza/i.test(item.label || '') && Number(item.value) > 0).length;
  const habitDays = new Set(week.filter(item => ['agua','actividad','paseo','pasos','fruta','bienestar'].includes(item.type) && Number(item.value) > 0).map(item => new Date(item.date).toLocaleDateString('sv-SE')));
  const plannedDays = Math.min(7, planner.filter(day => ['breakfast','midmorning1','midmorning2','lunch','snack1','snack2','dinner'].some(key => String(day[key] || '').trim())).length);
  const weight = latestWeight(records), target = positiveNumber(profile.goalTargets?.weight), baseline = positiveNumber(profile.goalTargets?.weightBaseline);
  const activityTarget = positiveNumber(profile.goalTargets?.activityMinutes), strengthTarget = positiveNumber(profile.goalTargets?.strengthSessions);
  const healthRecords = careRecords.filter(item => Number.isFinite(new Date(item.date).getTime()) && new Date(item.date) >= monday && new Date(item.date) <= now).length;
  let weightPercent = null;
  if (weight && target && baseline) {
    const distance = target - baseline;
    weightPercent = distance === 0 ? (Number(weight.value) === target ? 100 : 0) : percent((Number(weight.value) - baseline) / distance, 1);
  }
  return {
    'Cuidar mi salud': {value: String(healthRecords), unit: 'registros esta semana', detail: 'Tu seguimiento de salud y necesidades.', action: 'Abrir mi salud', progress: null},
    'Mejorar mi peso': {value: weight ? String(Number(weight.value)) : 'Sin datos', unit: weight ? 'kg · último peso registrado' : 'Registra tu punto de partida', detail: target ? `Tu meta: ${target} kg${weight ? ' · diferencia: ' + Math.abs(Number(weight.value) - target).toFixed(1) + ' kg' : ''}` : 'Puedes fijar tu propia meta de peso.', action: 'Registrar peso y medidas', progress: weightPercent},
    'Comer un poco mejor': {value: `${plannedDays}/7`, unit: 'días del plan abierto organizados', detail: 'Comidas planificadas; no significa que ya las hayas comido.', action: 'Organizar mis comidas', progress: percent(plannedDays, 7)},
    'Moverme un poco más': {value: String(+minutes.toFixed(1)), unit: 'minutos registrados esta semana', detail: activityTarget ? `Tu meta: ${activityTarget} min/semana · faltan ${Math.max(0, activityTarget - minutes)} min` : 'Fija una meta semanal a tu medida.', action: 'Registrar movimiento', progress: activityTarget ? percent(minutes, activityTarget) : null},
    'Ganar fuerza': {value: String(strength), unit: 'sesiones registradas esta semana', detail: strengthTarget ? `Tu meta: ${strengthTarget} sesiones · faltan ${Math.max(0, strengthTarget - strength)}` : 'Cuenta las actividades guardadas como Fuerza.', action: 'Abrir ejercicios', progress: strengthTarget ? percent(strength, strengthTarget) : null},
    'Cuidar mis hábitos': {value: `${habitDays.size}/7`, unit: 'días con hábitos registrados esta semana', detail: 'Agua, pasos, movimiento, alimentación o descanso.', action: 'Registrar un hábito hoy', progress: percent(habitDays.size, 7)}
  };
}
