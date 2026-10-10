"use client";
import {useState} from "react";
import {homeGuide} from "../lib/exercise-home-guide";
import s from "./ExerciseStudio.module.css";
const colors=[["#eaffee","#0abe48"],["#f7eaff","#b94de2"],["#fff5df","#ffb500"],["#eafaff","#00a3eb"],["#fff0f8","#f65cab"]];
export default function HomeExerciseGuide({numberOffset=0,material,posture,energy,minutes,onPrepareLog}){
 const [selected,setSelected]=useState(null),[step,setStep]=useState(0),[easier,setEasier]=useState(false),[finished,setFinished]=useState(false);
 const visible=homeGuide.filter(x=>(material==="Todos"||x.material.includes(material))&&(posture==="Cualquiera"||x.posture.includes(posture)));
 const open=item=>{setSelected(item);setStep(0);setEasier(false);setFinished(false);window.setTimeout(()=>document.getElementById("home-exercise-guide-detail")?.scrollIntoView({behavior:"smooth",block:"start"}),70)};
 const photo=item=>"/exercise-home-guide/"+item.id+".webp";
 return <section className={s.homeGuide} aria-label="Ejercicios del segundo collage">
 <h3 className={s.sectionTitle}>🏡 Ejercicios del segundo collage</h3><p className={s.sectionText}>15 ejercicios con su imagen y una guía en tres pasos. Abre el que quieras practicar.</p>
 <div className={s.cards}>{visible.map(item=>{const index=homeGuide.indexOf(item),color=colors[index%5];return <button key={item.id} type="button" className={s.card} style={{"--card-tone":color[0],"--card-accent":color[1]}} aria-pressed={selected?.id===item.id} onClick={()=>open(item)}><span className={s.cardArt}><span className={s.exerciseNumber}>Ejercicio {numberOffset+index+1}</span><img className={s.homeGuidePhoto} src={photo(item)} alt={item.movement} width={282} height={index<5?168:index<10?157:146} loading="lazy" decoding="async"/></span><b>{numberOffset+index+1}. {item.name}</b><small>{item.movement}<br/>Material: {item.material.join(" / ")}</small><em>Ver ejercicio paso a paso →</em></button>})}</div>
 {!visible.length&&<p className={s.note}>No hay ejercicios del segundo collage con estos filtros. Elige «Todos» y «Cualquiera» para verlos.</p>}
 {selected&&<section id="home-exercise-guide-detail" className={s.detail} aria-label={"Guía de "+selected.name}>
 <div className={s.detailHeader}><div><small>SEGUNDO COLLAGE · GUÍA DE EJERCICIO</small><h3>{numberOffset+homeGuide.indexOf(selected)+1}. {selected.name}</h3><p>{selected.movement}. Material: {selected.material.join(" / ")}.</p></div><button type="button" className={s.navBtn} onClick={()=>setSelected(null)}>✕ Cerrar guía</button></div>
 {finished?<div className={s.done}><b>Has terminado la guía</b><p>Descansa cuando lo necesites. Si quieres registrar actividad, indica solo el tiempo que realmente hayas realizado.</p><div className={s.actions}><button type="button" className={s.navBtn} onClick={()=>open(selected)}>Volver a ver los pasos</button>{onPrepareLog&&<button type="button" className={s.primary} onClick={()=>onPrepareLog(homeGuide.indexOf(selected)>=10?"Yoga / movilidad":"Fuerza",minutes)}>Preparar registro →</button>}</div></div>:<>
 <div className={s.stepHead}><b>{["Preparación","Movimiento","Vuelta al inicio"][step]}</b><small>Paso {step+1} de 3</small></div>
 <div className={s.routineArtwork}><img src={photo(selected)} alt={selected.movement} width={282} height={homeGuide.indexOf(selected)<5?168:homeGuide.indexOf(selected)<10?157:146} loading="eager"/><small>Imagen orientativa del ejercicio. Puedes reducir el recorrido y la carga; las repeticiones del collage no son obligatorias.</small></div>
 <div className={s.instructions}><p><strong>Cómo hacerlo:</strong> {selected.steps[step]}</p><p><strong>A tu ritmo:</strong> {energy==="Cansada"||energy==="Pocas ganas"?"Empieza por la opción más fácil y descansa entre movimientos.":"Practica primero el movimiento sin carga y aumenta solo si te resulta cómodo."} Tienes hasta {minutes} minutos disponibles; puedes terminar antes.</p></div>
 {easier&&<div className={s.alternative}><b>Opción más fácil:</b> {selected.easier}</div>}
 <div className={s.actions}><button type="button" className={s.navBtn} disabled={step===0} onClick={()=>setStep(x=>x-1)}>← Anterior paso</button><button type="button" className={s.navBtn} aria-pressed={easier} onClick={()=>setEasier(x=>!x)}>Ver opción más fácil</button><button type="button" className={s.primary} onClick={()=>{setEasier(false);if(step===2)setFinished(true);else setStep(x=>x+1)}}>{step===2?"Terminar guía ✓":"Siguiente paso →"}</button></div>
 </>}
 <small className={s.footer}>Detente si notas dolor, mareo o falta de aire inusual. No se guarda actividad automáticamente.</small>
 </section>}
 </section>;
}
