"use client";
import {useEffect,useState} from 'react';
import {PERSONAL_GOALS,selectedPersonalGoalIds,withPersonalGoals,togglePersonalGoal,withPrimaryPersonalGoal,personalGoalDay,normalizeGoalCheckins,toggleGoalCheckin,personalGoalWeek} from '../lib/personal-goals.mjs';

export default function PersonalGoals({profile,setProfile,onOpen}){
 const [day,setDay]=useState('');
 useEffect(()=>{const refresh=()=>setDay(personalGoalDay());refresh();const timer=setInterval(refresh,60000);document.addEventListener('visibilitychange',refresh);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',refresh);};},[]);
 const ids=selectedPersonalGoalIds(profile),selected=ids.map(id=>PERSONAL_GOALS.find(goal=>goal.id===id));
 const marked=normalizeGoalCheckins(profile.goalCheckins)[day]||[],completed=ids.filter(id=>marked.includes(id)).length;
 const week=personalGoalWeek(profile,day);
 return <section className="personalGoalsStudio" aria-label="Mis objetivos personales">
  <header className="personalGoalsHeading"><small>A TU RITMO · TODO SUMA</small><h2>🎯 Mis objetivos</h2><p>Puedes elegir todos los que quieras y cambiarlos cuando cambie tu vida.</p></header>
  <fieldset className="personalGoalChoices"><legend>Elige tus objetivos</legend>
   {PERSONAL_GOALS.map(goal=><label key={goal.id} className="personalGoalChoice" data-selected={ids.includes(goal.id)}>
    <input type="checkbox" aria-label={goal.label} checked={ids.includes(goal.id)} onChange={()=>setProfile(current=>togglePersonalGoal(current,goal.id))}/>
    <span><strong><span aria-hidden="true">{goal.icon} </span>{goal.label}</strong><span>{goal.description}</span></span>
   </label>)}
  </fieldset>
  <div className="personalGoalSelectionActions"><button type="button" onClick={()=>setProfile(current=>withPersonalGoals(current,PERSONAL_GOALS.map(goal=>goal.id)))}>Marcar todos</button><button type="button" disabled={!ids.length} onClick={()=>setProfile(current=>withPersonalGoals(current,[]))}>Desmarcar todos</button></div>
  <div className="personalGoalSummary"><p role="status">{ids.length} {ids.length===1?'objetivo elegido':'objetivos elegidos'}</p>
   {selected.length>0?<><label>Mi prioridad ahora<select aria-label="Mi prioridad ahora" value={profile.goal||selected[0].label} onChange={event=>setProfile(current=>withPrimaryPersonalGoal(current,event.target.value))}>{selected.map(goal=><option key={goal.id}>{goal.label}</option>)}</select></label><small>Elegir una prioridad mantiene los demás objetivos marcados.</small></>:<p>Elige uno o varios para ver pasos y herramientas que te ayuden a empezar.</p>}
  </div>
  {selected.length>0&&<section className="personalGoalSteps" aria-label="Mis pasos de hoy"><h3>Un pequeño paso para hoy</h3><p>Escoge lo que te resulte posible. Marca un paso cuando lo hayas hecho.</p>
   <div className="personalGoalProgress"><span>{completed} de {selected.length} pasos marcados hoy</span><progress aria-label="Pasos marcados hoy" max={selected.length} value={completed}/></div>
   <div className="personalGoalStepGrid">{selected.map(goal=><article key={goal.id}><h4>{goal.icon} {goal.label}</h4><p>{goal.step}</p><button type="button" onClick={()=>onOpen(goal.tab,goal.section)}>{goal.action} →</button><label className="personalGoalDone"><input type="checkbox" aria-label={'Hecho hoy: '+goal.label} checked={marked.includes(goal.id)} disabled={!day} onChange={()=>setProfile(current=>toggleGoalCheckin(current,goal.id,day))}/> Lo he hecho hoy</label></article>)}</div>
   <small>Las marcas reflejan los pasos que tú confirmas; abrir una herramienta no registra un paso por sí solo.</small>
  </section>}
  <details className="personalGoalWeek"><summary>Mis pasos de los últimos 7 días</summary><p>{week.steps} pasos marcados en {week.activeDays} {week.activeDays===1?'día':'días'}.</p><div>{week.days.map(item=><span key={item.day}><time dateTime={item.day}>{new Date(item.day+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</time><b>{item.count}</b></span>)}</div><small>Puedes revisar tus marcas aunque cambies los objetivos que tienes elegidos.</small></details>
 </section>;
}
