"use client";
import {useEffect,useState} from "react";
import Image from "next/image";

const dayKey=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const card={border:"2px solid #b8e2c5",borderRadius:18,padding:16,background:"#fff",minWidth:0};
export default function ConnectedDay({history=[],fridge=[],shopping=[],onOpen}){
 const [points,setPoints]=useState(null),[habits,setHabits]=useState(null),[day,setDay]=useState("");
 useEffect(()=>{const read=()=>{try{const today=dayKey();setDay(today);const p=JSON.parse(localStorage.getItem("dietear-points-v1")||"{}");const h=JSON.parse(localStorage.getItem("dietear-daily-habits")||"{}");setPoints({daily:Number.isFinite(p.daily)?p.daily:30,used:Array.isArray(p.entries)?p.entries.filter(e=>e.date===today).reduce((n,e)=>n+(Number(e.points)||0),0):0});setHabits(h.day===today&&Array.isArray(h.items)?h.items:[])}catch{setPoints(null);setHabits(null)}};read();window.addEventListener("focus",read);window.addEventListener("dietear:daily-updated",read);window.addEventListener("storage",read);return()=>{window.removeEventListener("focus",read);window.removeEventListener("dietear:daily-updated",read);window.removeEventListener("storage",read)}},[]);
 const latest=Array.isArray(history)?history[history.length-1]:null;
 const cards=[
 {title:"Alimentación",emoji:"🥗",detail:points?points.used+" puntos registrados hoy · "+Math.max(0,points.daily-points.used)+" restantes":"Abre tu registro de comidas",tab:"alimentacion",section:"Todo Dietas"},
 {title:"Actividad",emoji:"👟",detail:habits?.includes("walk")?"Movimiento marcado hoy":"Registra tus pasos o tu ejercicio",tab:"progreso",section:"Pasos y actividad"},
 {title:"Salud y descanso",emoji:"💗",detail:habits?.includes("rest")?"Descanso marcado hoy":"Consulta tus medidas y tu descanso",tab:"progreso",section:"Peso y medidas"},
 {title:"Objetivos",emoji:"🎯",detail:latest?"Tu historial tiene registros; consulta tu evolución":"Consulta tus metas y registra avances",tab:"perfil",section:"Mis objetivos"}
 ];
 return <section aria-label="Mi día conectado" style={{border:"3px solid #77ce79",borderRadius:24,background:"linear-gradient(130deg,#f0ffdf,#fff4fc)",padding:"clamp(14px,3vw,24px)",margin:"20px 0",color:"#183d2d"}}>
 <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
 <Image src="/dietear-visuals/visual-agenda.png" width={132} height={132} alt="Ilustración del seguimiento diario" style={{width:112,height:112,objectFit:"cover",borderRadius:18}}/>
 <div style={{flex:"1 1 240px"}}><small>DIETEAR · TODO EN UN MISMO LUGAR</small><h2 style={{fontSize:"clamp(24px,3vw,34px)",margin:"4px 0"}}>🌿 Mi día conectado</h2><p style={{margin:0}}>Alimentación, actividad, salud y objetivos reunidos. Solo mostramos datos que hayas registrado.</p></div>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:12,marginTop:18}}>
 {cards.map(c=><button key={c.title} type="button" onClick={()=>onOpen(c.tab,c.section)} style={{...card,textAlign:"left",cursor:"pointer",borderColor:"#89d4a1"}}><div style={{fontSize:25}}>{c.emoji}</div><strong style={{display:"block",fontSize:18,margin:"6px 0"}}>{c.title} →</strong><span style={{fontSize:14}}>{c.detail}</span></button>)}
 </div>
 <div style={{...card,marginTop:14,background:"#fffef7"}}><strong>💡 Una idea para hoy</strong><p style={{margin:"7px 0 12px"}}>{fridge.length?"Tienes "+fridge.length+" alimentos en Mi Nevera. ¿Preparamos una comida con ellos?":habits?.includes("walk")?"¡Has marcado movimiento hoy! Puedes revisar tu evolución o planificar la próxima comida.":"¿Empezamos con un paso pequeño? Registra una comida o elige un rato de movimiento."}</p><button type="button" onClick={()=>onOpen("alimentacion",fridge.length?"Mi Nevera":"¿Qué como hoy?")} style={{borderRadius:12,padding:"9px 14px",border:"2px solid #62b776",background:"#e4ffdc",fontWeight:700}}>Ver sugerencia →</button></div>
 <small style={{display:"block",marginTop:12}}>Resumen orientativo basado en registros locales. No hay sincronización automática con dispositivos ni análisis clínico. {day?"Fecha: "+day:""}</small>
 </section>
}
