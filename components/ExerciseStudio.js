"use client";
import {useState} from "react";
import {cards} from "./ExerciseCatalogMeta";
import ExerciseArtwork from "./ExerciseArtwork";
import s from "./ExerciseStudio.module.css";
const labels=[
["Abrir los brazos","Cambiar el peso"],["Respirar","Brazos al cielo"],["Marcha sentada","Extender rodilla"],
["Empuje suave","Elevar talones"],["Separar la banda","Remo sentado"],["Flexión de codos","Sentarse y levantarse"],
["Tocar escalón","Paso con apoyo"],["Mover tobillos","Deslizar talón"],["Respirar tranquila","Mover la pelvis"],
["Hombros","Pantorrillas"],["Marcha suave","Círculos de hombros"],["Mover muñecas","Brazos con palo"],
["Cambiar el peso","Paso lateral"],["Comenzar despacio","Bajar el ritmo"],["Relajar hombros","Mirar a los lados"],
["Crecer sentada","Redondear espalda"],["Extender rodilla","Punta y talón"],["Respirar","Soltar las manos"]
];
const materials=[["Sin material","🌿"],["Silla","🪑"],["Pared","🧱"],["Botellas o latas","🧴"],["Palo de escoba","🧹"],["Bandas","〰️"],["Pesas","🏋️"],["Cama","🛏️"],["Escalón","🪜"],["Esterilla","🧘"]];
function Tile({item,active,open}){return <button type="button" className={s.card} style={{"--card-tone":item[4],"--card-accent":item[5]}} aria-pressed={active} onClick={open}><span className={s.cardArt}><ExerciseArtwork item={item}/></span><b>{item[1]}</b><small>{item[2]}</small><em>Ver rutina →</em></button>}
export default function ExerciseStudio({profile={},onProfile,onPrepareLog}){
 const [energy,setEnergy]=useState("Normal"),[posture,setPosture]=useState("Cualquiera");
 const [material,setMaterial]=useState("Todos"),[minutes,setMinutes]=useState(10);
 const [selected,setSelected]=useState(null),[step,setStep]=useState(0);
 const [done,setDone]=useState([]),[easier,setEasier]=useState(false),[finished,setFinished]=useState(false);
 const chosen=cards.find(x=>x[0]===selected),idx=chosen?cards.indexOf(chosen):-1;
 const filter=item=>{
  const id=item[0],mat=item[3].split(",");
  if(material!=="Todos"&&!mat.includes(material))return false;
  if(posture==="Sentada"&&!["chair","bed","neck","back","legs","cool","warmup","mobility"].includes(id))return false;
  if(posture==="Con apoyo"&&!["wall","chair","balance","step","strength","tai","legs","warmup"].includes(id))return false;
  if(posture==="En suelo o cama"&&!["bed","floor","yoga","stretch","cool"].includes(id))return false;
  if(posture==="De pie"&&["bed","floor","chair","back","legs"].includes(id))return false;
  return true;
 };
 const open=item=>{setSelected(item[0]);setStep(0);setDone([]);setEasier(false);setFinished(false);window.setTimeout(()=>document.getElementById("exercise-studio-detail")?.scrollIntoView({behavior:"smooth",block:"start"}),70)};
 const advance=()=>{setEasier(false);if(step===1)setFinished(true);else setStep(1)};
 const complete=()=>{setDone(x=>x.includes(step)?x:[...x,step]);advance()};
 const pill=(choices,value,change)=>choices.map(x=><button type="button" key={x} className={s.pill} aria-pressed={value===x} onClick={()=>change(x)}>{x}</button>);
 return <div className={s.studio}>
 <div className={s.hero}><img className={s.heroPhoto} src="/exercise-approved/hero.webp" alt="DIETEAR: muévete hoy por una vida más sana y feliz"/><small>DIETEAR · EJERCICIO A TU MANERA</small><h2>Muévete a tu ritmo</h2><p>Elige cómo te encuentras y qué tienes en casa. Cada estilo abre su rutina. Elige la actividad que te apetece y muévete a tu ritmo.</p></div>
 <div className={s.note}><b>💚 Respeta tus posibilidades.</b> Usa apoyos estables, evita forzar movimientos y detente si notas dolor, mareo o falta de aire inusual. Ante lesiones, problemas de equilibrio o enfermedades relevantes, consulta a un profesional antes de empezar.</div>
 <div className={s.controls}>
 <div className={s.control}><b>✨ ¿Cómo estás hoy?</b><div className={s.pills}>{pill(["Con energía","Normal","Cansada","Pocas ganas"],energy,setEnergy)}</div></div>
 <div className={s.control}><b>🧍 ¿Cómo quieres moverte?</b><div className={s.pills}>{pill(["Cualquiera","Sentada","De pie","Con apoyo","En suelo o cama"],posture,x=>{setPosture(x);setSelected(null)})}</div></div>
 <div className={s.control}><b>⏱️ Tiempo disponible</b><div className={s.pills}>{[5,10,15,20,30].map(x=><button type="button" key={x} className={s.pill} aria-pressed={minutes===x} onClick={()=>setMinutes(x)}>{x} min</button>)}</div></div>
 <div className={s.control}><b>🧩 Adaptado a ti</b><p className={s.sectionText}>{Number(profile.age)>=65?"Puedes empezar con apoyos y movimientos sencillos. La edad no define por sí sola tu capacidad.":"Empieza con movimientos cómodos y reduce el esfuerzo cuando lo necesites."}</p><button type="button" className={s.navBtn} onClick={onProfile}>Revisar mi perfil →</button></div>
 </div>
 <h3 className={s.sectionTitle}>🌈 Estilos de ejercicio</h3><p className={s.sectionText}>Elige tu actividad con las imágenes y los colores que elegimos para DIETEAR.</p>
 <div className={s.cards}>{cards.filter(x=>!["stretch","warmup","mobility","neck","back","legs","cool"].includes(x[0])).filter(filter).map(x=><Tile key={x[0]} item={x} active={selected===x[0]} open={()=>open(x)}/>)}</div>
 <h3 className={s.sectionTitle}>🧘 Calentamiento y estiramientos</h3><p className={s.sectionText}>Movilidad, estiramientos y vuelta a la calma para empezar o terminar.</p>
 <div className={s.cards}>{cards.filter(x=>["stretch","warmup","mobility","neck","back","legs","cool"].includes(x[0])).filter(filter).map(x=><Tile key={x[0]} item={x} active={selected===x[0]} open={()=>open(x)}/>)}</div>
 {!cards.some(filter)&&<div className={s.note}>No hay rutinas con estos filtros. Selecciona «Todos» y «Cualquiera» para verlas.</div>}
 <div className={s.materials}><h3>🪑 Materiales que tienes en casa</h3><p>Selecciona uno para filtrar. No necesitas comprar material.</p><div className={s.materialGrid}><button type="button" className={s.materialBtn} aria-pressed={material==="Todos"} onClick={()=>{setMaterial("Todos");setSelected(null)}}><span>✨</span>Todos</button>{materials.map(([name,icon])=><button type="button" className={s.materialBtn} key={name} aria-pressed={material===name} onClick={()=>{setMaterial(name);setSelected(null)}}><span aria-hidden="true">{icon}</span>{name}</button>)}</div></div>
 {chosen&&<section id="exercise-studio-detail" className={s.detail} aria-label={"Rutina de "+chosen[1]}>
 <div className={s.detailHeader}><div><small>MI RUTINA · HASTA {minutes} MINUTOS</small><h3>{chosen[1]}</h3><p>{chosen[2]}. Descansa cuando lo necesites y termina antes si lo prefieres.</p></div><button type="button" className={s.navBtn} onClick={()=>setSelected(null)}>✕ Cerrar</button></div>
 <div className={s.progress}><span style={{width:(done.length*50)+"%"}}/></div>
 {finished?<div className={s.done}><b>💚 ¡Has terminado!</b><p>Has marcado {done.length} de 2 movimientos. Registra solo el tiempo realmente realizado.</p><div className={s.actions}><button type="button" className={s.navBtn} onClick={()=>open(chosen)}>Repetir</button><button type="button" className={s.primary} onClick={()=>onPrepareLog?.(["yoga","stretch","mobility"].includes(chosen[0])?"Yoga / movilidad":["strength","bands"].includes(chosen[0])?"Fuerza":"Otro",minutes)}>Preparar registro →</button></div></div>:<>
 <div className={s.stepHead}><b>{labels[idx][step]}</b><small>Movimiento {step+1} de 2</small></div>
 <div className={s.routineArtwork}><ExerciseArtwork item={chosen} photo/><small>Imagen del estilo de ejercicio elegido. Sigue las indicaciones del movimiento que aparece debajo.</small></div>
 <div className={s.instructions}><p><strong>Cómo hacerlo:</strong> Realiza «{labels[idx][step]}» lentamente, dentro de tu recorrido cómodo, sin rebotes ni dolor. Busca apoyo si lo necesitas.</p><p><strong>Orientación:</strong> {energy==="Cansada"||energy==="Pocas ganas"?"2–4 movimientos suaves":"4–6 movimientos suaves"}, con pausas libres. Nunca es obligatorio completar el tiempo elegido.</p></div>
 {easier&&<div className={s.alternative}><b>🤝 Más fácil:</b> Reduce el recorrido, descansa más o haz el gesto sentada si resulta adecuado. Si no puedes hacerlo sin molestias, cambia de ejercicio.</div>}
 <div className={s.actions}><button type="button" className={s.navBtn} disabled={step===0} onClick={()=>{setStep(0);setEasier(false)}}>← Anterior</button><button type="button" className={s.navBtn} onClick={()=>setEasier(x=>!x)}>Me cuesta</button><button type="button" className={s.navBtn} onClick={advance}>Cambiar ejercicio →</button><button type="button" className={s.primary} onClick={complete}>{step===1?"Hecho · Terminar ✓":"Hecho · Siguiente ✓"}</button></div>
 </>}
 <small className={s.footer}>Ilustraciones orientativas, no una demostración clínica. No se guarda actividad automáticamente.</small>
 </section>}
 </div>;
}
