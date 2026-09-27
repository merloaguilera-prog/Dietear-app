"use client";
import{MEAL_FIELDS}from"../lib/week-plan";
export default function PlanSummary({planner,shopping,onFood,onShopping}){
 const meals=planner.reduce((n,d)=>n+MEAL_FIELDS.filter(([key])=>d[key]).length,0),
 pending=shopping.filter(x=>!x.done).length,
 people=Math.max(...planner.map(x=>Number(x.people)||1),1);
 return <section className="planSummary planSummaryVisual">
  <div className="planSummaryHead">
   <div className="planSummaryIllustration" aria-hidden="true"><span>🥗</span><span>📅</span><span>🛒</span></div>
   <div><small>🌿 RESUMEN DE TU PLAN</small><b>Tu semana de un vistazo</b><p>Lo importante de tu semana, claro y a mano.</p></div>
  </div>
  <div className="planSummaryCards">
   <article><span>🍽️</span><div><b>Comidas</b><small>planificadas</small></div><strong>{meals}</strong></article>
   <article><span>👥</span><div><b>Personas</b><small>máximo</small></div><strong>{people}</strong></article>
   <article><span>🛒</span><div><b>Compra</b><small>productos pendientes</small></div><strong>{pending}</strong></article>
  </div>
  <div className="planSummaryActions"><button onClick={onFood}>🥗 Añadir comida</button><button onClick={onShopping}>🛒 Revisar compra</button></div>
 </section>
}