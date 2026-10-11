"use client";
import {useState} from 'react';
import {PERSONAL_GOALS, selectedGoals, togglePersonalGoal, personalGoalProgress, saveGoalTargets} from '../lib/personal-goals';

export function GoalSelector({profile, setProfile}) {
  const selected = selectedGoals(profile);
  return <fieldset className="personalGoalSelector"><legend>Mis objetivos · elige uno o varios</legend><div className="personalGoalChoices">{PERSONAL_GOALS.map(goal => <button type="button" key={goal.name} style={{'--goal-color': goal.color}} aria-pressed={selected.includes(goal.name)} onClick={() => setProfile(old => togglePersonalGoal(old, goal.name))}><span aria-hidden="true">{goal.icon}</span><b>{goal.name}</b><span className="goalCheck" aria-hidden="true">{selected.includes(goal.name) ? '✓' : '+'}</span></button>)}</div></fieldset>;
}

function GoalRing({goal, progress}) {
  return <div className="personalGoalRing">
    <svg viewBox="0 0 100 100" role="img" aria-label={progress == null ? goal.name : `${goal.name}: ${progress}% del seguimiento mostrado`}>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" strokeWidth="9"/>
      {progress != null && <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" pathLength="100" strokeDasharray={`${progress} 100`} transform="rotate(-90 50 50)"/>}
    </svg>
    <span aria-hidden="true">{progress == null ? goal.icon : `${progress}%`}</span>
  </div>;
}

export default function PersonalGoals({profile, setProfile, history, planner, careRecords, onOpen, editable = true}) {
  const selected = selectedGoals(profile);
  const summaries = personalGoalProgress(profile, history, planner, careRecords);
  const [draft, setDraft] = useState(() => ({weight: profile.goalTargets?.weight || '', activityMinutes: profile.goalTargets?.activityMinutes || '', strengthSessions: profile.goalTargets?.strengthSessions || ''}));
  const [notice, setNotice] = useState('');
  function saveTargets(event) {
    event.preventDefault();
    setProfile(old => saveGoalTargets(old, draft, history));
    setNotice('Tus metas están guardadas. El avance se actualizará con tus registros.');
  }
  return <section className="personalGoalsPanel">
    <div className="personalGoalsHeading"><div><small>TUS METAS · TU RITMO</small><h2>Un camino para cada objetivo</h2><p>{selected.length ? `${selected.length} ${selected.length === 1 ? 'objetivo elegido' : 'objetivos elegidos'}. Mira tu avance y elige tu siguiente paso.` : 'Elige lo que quieres cuidar. Puedes combinar varias metas.'}</p></div><span className="personalGoalsBadge">{selected.length}<small>metas</small></span></div>
    {editable && <GoalSelector profile={profile} setProfile={setProfile}/>}
    <div className="personalGoalCards">{PERSONAL_GOALS.filter(goal => selected.includes(goal.name)).map(goal => {
      const summary = summaries[goal.name];
      return <article className="personalGoalCard" style={{'--goal-color': goal.color}} key={goal.name}>
        <div className="personalGoalCardHead"><h3>{goal.name}</h3><GoalRing goal={goal} progress={summary.progress}/></div>
        <strong>{summary.value}</strong><p className="personalGoalUnit">{summary.unit}</p><p>{summary.detail}</p>
        {summary.progress === 100 && <p className="personalGoalMilestone">✓ Seguimiento completado para esta meta</p>}
        <button type="button" onClick={() => onOpen(goal.tab, goal.section)}>{summary.action} →</button>
      </article>;
    })}</div>
    {!selected.length && !editable && <button type="button" onClick={() => onOpen('perfil','Mis objetivos')}>Elegir mis objetivos →</button>}
    {editable && selected.some(name => ['Mejorar mi peso','Moverme un poco más','Ganar fuerza'].includes(name)) && <details className="personalGoalTargets"><summary>Personalizar mis metas</summary><form onSubmit={saveTargets}>
      {selected.includes('Mejorar mi peso') && <label>Mi peso objetivo (kg)<input type="number" min="0.001" step="0.001" value={draft.weight} onChange={e => setDraft(old => ({...old,weight:e.target.value}))} placeholder="Elige tu propia meta"/></label>}
      {selected.includes('Moverme un poco más') && <label>Minutos de movimiento por semana<input type="number" min="1" step="1" value={draft.activityMinutes} onChange={e => setDraft(old => ({...old,activityMinutes:e.target.value}))} placeholder="La cantidad que tú elijas"/></label>}
      {selected.includes('Ganar fuerza') && <label>Sesiones de fuerza por semana<input type="number" min="1" step="1" value={draft.strengthSessions} onChange={e => setDraft(old => ({...old,strengthSessions:e.target.value}))} placeholder="La cantidad que tú elijas"/></label>}
      <p>Las metas son referencias elegidas por ti. Puedes cambiarlas sin borrar tus registros.</p><button type="submit">Guardar mis metas</button>
    </form><p role="status">{notice}</p></details>}
    {!editable && selected.length > 0 && <button type="button" onClick={() => onOpen('perfil','Mis objetivos')}>Cambiar o añadir objetivos →</button>}
    <p className="personalGoalsFootnote">Los anillos representan tus registros o tu meta configurada. No son una puntuación de salud.</p>
  </section>;
}
