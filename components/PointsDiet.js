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
 useEffect(()=>{if(ready){localStorage.setItem("dietear-points-v1",JSON.stringify({daily,entries}));window.dispatchEvent(new Event("dietear:daily-updated"));}},[ready,daily,entries]);
 const date=today(),week=monday(date);
 const weekEntries=entries.filter(e=>e.date>=week&&e.date<=date);
 const spentToday=entries.filter(e=>e.date===date).reduce((s,e)=>s+e.points,0);
 const spentWeek=weekEntries.reduce((s,e)=>s+e.points,0);
 const add=(name,p)=>setEntries(e=>[...e,{id:Date.now()+"-"+Math.random(),date,description:name,points:p}]);
 const totalFood=points(foods[Number(food)][1]*qty);
 const [mealType,setMealType]=useState("Desayuno"),[search,setSearch]=useState("");
 const todayEntries=entries.filter(e=>e.date===date);
 const record=(name,p)=>setEntries(e=>[...e,{id:Date.now()+"-"+Math.random(),date,description:name,points:p,meal:mealType}]);
 const card={padding:18,border:"2px solid #b6dfc8",borderRadius:18,background:"#fff",minWidth:0};
 return <section className="pointsDashboard" style={{margin:"18px 0",padding:"clamp(14px,3vw,26px)",border:"2px solid #36a67d",borderRadius:22,background:"#f1fff7",color:"#163d31",width:"100%",minWidth:0}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}><div><small>DIETEAR · SEGUIMIENTO</small><h2 style={{fontSize:"clamp(25px,3vw,36px)",margin:"4px 0"}}>🔢 Mi dieta por puntos</h2><p style={{margin:0}}>Consulta tu saldo y registra lo que comes, paso a paso.</p></div><label style={{display:"flex",alignItems:"center",gap:8}}>Presupuesto de ejemplo <input aria-label="Presupuesto diario de puntos" type="number" min="10" max="80" value={daily} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=10&&n<=80)setDaily(n)}} style={{width:76}}/></label></div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,170px),1fr))",gap:12,margin:"20px 0"}}>
 {[["Disponibles hoy",daily-spentToday,"#e4f9dc"],["Consumidos hoy",spentToday,"#fff0c9"],["Presupuesto diario",daily,"#f3e9ff"],["Saldo semanal",daily*7-spentWeek,"#e5f5ff"]].map(([name,n,bg])=><div key={name} style={{...card,background:bg}}><small style={{fontWeight:700}}>{name}</small><div style={{fontSize:32,fontWeight:850,lineHeight:1.3}}>{n} <span style={{fontSize:15}}>pt</span></div></div>)}</div>
 <div style={{height:12,background:"#d4e7dc",borderRadius:20,overflow:"hidden",marginBottom:8}} role="progressbar" aria-label="Puntos consumidos hoy" aria-valuemin={0} aria-valuemax={daily} aria-valuenow={Math.min(daily,spentToday)}><div style={{height:"100%",width:Math.min(100,spentToday/daily*100)+"%",background:"#37a77c",borderRadius:20}}/></div><small>{spentToday} de {daily} puntos del presupuesto de ejemplo registrados hoy.</small>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:16,marginTop:22}}>
 <div style={card}><h3 style={{marginTop:0}}>1 · 🍎 Registrar comida</h3><label>Momento del día<select value={mealType} onChange={e=>setMealType(e.target.value)} style={{width:"100%",marginTop:5}}>{["Desayuno","Media mañana","Almuerzo","Merienda","Cena","Otro"].map(m=><option key={m}>{m}</option>)}</select></label><label style={{display:"block",marginTop:12}}>Alimento<select value={food} onChange={e=>setFood(e.target.value)} style={{width:"100%",marginTop:5}}>{foods.map(([name],i)=><option key={name} value={i}>{name} · {points(foods[i][1])} pt</option>)}</select></label><label style={{display:"block",marginTop:12}}>Número de raciones<input type="number" min=".5" max="10" step=".5" value={qty} onChange={e=>setQty(Math.max(.5,Math.min(10,Number(e.target.value)||.5)))} style={{width:100,marginLeft:8}}/></label><button type="button" onClick={()=>record(foods[Number(food)][0]+" × "+qty,totalFood)} style={{display:"block",width:"100%",marginTop:16,padding:12,borderRadius:12,background:"#d3f4d7",fontWeight:750}}>＋ Añadir {totalFood} puntos</button></div>
 <div style={card}><h3 style={{marginTop:0}}>2 · 📅 Mis comidas de hoy</h3>{todayEntries.length===0?<p>Aún no has registrado alimentos hoy.</p>:["Desayuno","Media mañana","Almuerzo","Merienda","Cena","Otro"].map(meal=>{const group=todayEntries.filter(e=>(e.meal||"Otro")===meal);return group.length?<div key={meal} style={{marginBottom:12}}><strong>{meal}</strong><ul style={{paddingLeft:18}}>{group.map(e=><li key={e.id} style={{margin:"6px 0"}}>{e.description} · <b>{e.points} pt</b> <button type="button" onClick={()=>setEntries(a=>a.filter(x=>x.id!==e.id))} aria-label={"Eliminar "+e.description}>✕</button></li>)}</ul></div>:null})}</div>
 </div>
 <div style={{...card,marginTop:16}}><h3 style={{marginTop:0}}>3 · 🍽️ Platos rápidos</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,210px),1fr))",gap:12}}>{meals.map(m=>{const p=points(m.items.reduce((sum,i)=>sum+foods[i][1],0));return <div key={m.name} style={{background:"#f6fcf8",border:"1px solid #c4e6d2",borderRadius:12,padding:12}}><strong>{m.name}</strong><p style={{fontSize:13}}>{m.items.map(i=>foods[i][0]).join(", ")}</p><button type="button" onClick={()=>record(m.name,p)}>Añadir {p} pt</button></div>})}</div></div>
 <details style={{...card,marginTop:16}}><summary style={{cursor:"pointer",fontWeight:750}}>🔎 Ver lista de alimentos y sus puntos</summary><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar alimento" aria-label="Buscar alimentos" style={{width:"100%",margin:"12px 0"}}/><ul>{foods.filter(([name])=>name.toLowerCase().includes(search.toLowerCase())).map(([name,kcal])=><li key={name}>{name} · {points(kcal)} pt</li>)}</ul></details>
 <details style={{marginTop:16}}><summary style={{cursor:"pointer",fontWeight:700}}>ℹ️ Cómo funciona este método</summary><p>Método orientativo propio: 1 punto por cada 50 kcal, redondeado por ración. No equivale a puntos oficiales de ninguna marca. Los 30 puntos iniciales son un ejemplo editable, no una recomendación personalizada. El saldo semanal suma los presupuestos de siete días sin trasladar puntos entre semanas.</p><p>Prioriza variedad, fibra y proteínas suficientes. No te saltes comidas para ahorrar puntos. Los datos se guardan en este navegador.</p></details>
 </section>;
}
