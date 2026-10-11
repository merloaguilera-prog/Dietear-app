"use client";
import {useEffect,useMemo,useState} from "react";

const foods=[
 ["Manzana (1 mediana)",95],["Plátano (1 mediano)",105],["Yogur natural (125 g)",80],
 ["Huevo (1 unidad)",78],["Pan integral (40 g)",100],["Arroz cocido (150 g)",195],
 ["Pechuga de pollo (150 g)",248],["Aceite de oliva (10 g)",90],
 ["Lentejas cocidas (150 g)",174],["Verduras variadas (200 g)",70],
 ["Leche semidesnatada (200 ml)",100],["Almendras (30 g)",174]
];
const meals=[
 {name:"Tostada con huevo y fruta",items:[4,3,0]},
 {name:"Pollo, arroz y verduras",items:[6,5,9]},
 {name:"Yogur con plátano y almendras",items:[2,1,11]},
 {name:"Lentejas con verduras y aceite",items:[8,9,7]}
];
const points=kcal=>Math.max(1,Math.round(kcal/50));
const today=()=>new Date().toLocaleDateString("en-CA");
const monday=(date)=>{const d=new Date(date+"T12:00:00");d.setDate(d.getDate()-(d.getDay()+6)%7);return d.toLocaleDateString("en-CA");};
export default function PointsDiet(){
 const [daily,setDaily]=useState(30),[entries,setEntries]=useState([]),[food,setFood]=useState("0"),[qty,setQty]=useState(1),[ready,setReady]=useState(false);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem("dietear-points-v1")||"{}");if(Number.isInteger(saved.daily)&&saved.daily>=10&&saved.daily<=80)setDaily(saved.daily);if(Array.isArray(saved.entries))setEntries(saved.entries.filter(e=>e&&typeof e.date==="string"&&Number.isFinite(e.points)));}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)localStorage.setItem("dietear-points-v1",JSON.stringify({daily,entries}));},[ready,daily,entries]);
 const date=today(),week=monday(date);
 const weekEntries=entries.filter(e=>e.date>=week&&e.date<=date);
 const spentToday=entries.filter(e=>e.date===date).reduce((s,e)=>s+e.points,0);
 const spentWeek=weekEntries.reduce((s,e)=>s+e.points,0);
 const add=(name,p)=>setEntries(e=>[...e,{id:Date.now()+"-"+Math.random(),date,description:name,points:p}]);
 const totalFood=points(foods[Number(food)][1]*qty);
 return <section className="dietBuilder" style={{margin:"18px 0",padding:20,border:"2px solid #36a67d",borderRadius:22,background:"#f1fff7",color:"#163d31"}}>
  <h2>🔢 Mi dieta por puntos</h2>
  <p>Control diario y semanal, alimentos y platos preparados. Puedes registrar comidas y consultar lo que queda.</p>
  <p style={{fontSize:13}}><strong>Método orientativo propio:</strong> 1 punto por cada 50 kcal, redondeado por ración. No equivale a puntos oficiales de ninguna marca. El presupuesto inicial de 30 puntos es un ejemplo editable, no una recomendación personalizada.</p>
  <label>Presupuesto diario de ejemplo <input type="number" min="10" max="80" value={daily} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=10&&n<=80)setDaily(n);}} style={{maxWidth:85,marginLeft:10}}/></label>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,margin:"16px 0"}}>
   {[[ "Hoy",daily-spentToday,daily],["Semana",daily*7-spentWeek,daily*7]].map(([name,left,max])=><div key={name} style={{background:"white",borderRadius:14,padding:14,border:"1px solid #b2dfcc"}}><strong>{name}</strong><p style={{fontSize:24,fontWeight:800,margin:"6px 0"}}>{left} / {max}</p><small>Puntos restantes (saldo, no objetivo de consumo)</small></div>)}
  </div>
  <h3>🍎 Lista de alimentos</h3>
  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
   <select aria-label="Alimento" value={food} onChange={e=>setFood(e.target.value)}>{foods.map(([name],i)=><option key={name} value={i}>{name} · {points(foods[i][1])} pt</option>)}</select>
   <label>Raciones <input aria-label="Número de raciones" type="number" min="0.5" max="10" step="0.5" value={qty} onChange={e=>setQty(Math.max(.5,Math.min(10,Number(e.target.value)||.5)))} style={{width:75}}/></label>
   <button type="button" onClick={()=>add(foods[Number(food)][0]+" × "+qty,totalFood)}>Añadir {totalFood} pt</button>
  </div>
  <h3>🍽️ Platos preparados</h3>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
   {meals.map(m=>{const p=points(m.items.reduce((s,i)=>s+foods[i][1],0));return <div key={m.name} style={{padding:12,background:"white",borderRadius:12}}><strong>{m.name}</strong><p>{m.items.map(i=>foods[i][0]).join(", ")}</p><button type="button" onClick={()=>add(m.name,p)}>Registrar {p} puntos</button></div>})}
  </div>
  <h3>📅 Registro de hoy</h3>
  {entries.filter(e=>e.date===date).length===0?<p>Aún no has registrado comidas hoy.</p>:<ul>{entries.filter(e=>e.date===date).map(e=><li key={e.id}>{e.description} — {e.points} pt <button type="button" onClick={()=>setEntries(a=>a.filter(x=>x.id!==e.id))} aria-label={"Eliminar "+e.description}>Eliminar</button></li>)}</ul>}
  <h3>💡 Cómo aprovechar los puntos</h3>
  <p>Planifica comidas variadas, prioriza fibra y proteínas suficientes, revisa las raciones y registra aceites, salsas y bebidas. No te saltes comidas para ahorrar puntos. Los puntos no sustituyen la calidad nutricional ni el asesoramiento profesional.</p>
  <small>Los datos se guardan en este navegador. El saldo semanal es la suma de 7 presupuestos diarios menos los registros de la semana actual; no se trasladan puntos entre semanas.</small>
 </section>;
}
