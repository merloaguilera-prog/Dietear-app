"use client";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import SelectedArtwork from "./SelectedArtwork";
import { datesForWeek, MEAL_FIELDS, WEEK_DAYS } from "../lib/week-plan";
import {matchesMeal,normalizeMealText} from "../lib/meal-options";
import { recipes, recipeByName } from "../lib/recipes";
import RecipePhoto from "./RecipePhoto";
import { dietArtwork } from "../lib/diet-artwork";

const root = "/dietear-visuals/";
export function AppSymbol({ name, illustrated = false }) {
  const id=useId();
  const colors={"Alimentación":["#8ef43f","#09a936"],"Ejercicio":["#ec90ff","#9017ee"],"Mi Plan":["#ffe75a","#ff8d00"],"Mi Progreso":["#6cff89","#05aa40"],"Mi Compra":["#ff78bf","#eb006d"],"Mi Nevera":["#ffe34a","#ef9d00"],"Salud":["#ff72aa","#ed0b55"],"Objetivos":["#b0f72c","#11ae3f"]}[name]||["#7fdcff","#1475e7"];
  const shapes = {
    "Perfil": <><circle cx="16" cy="9" r="6"/><path d="M5 29v-4a11 11 0 0 1 22 0v4H5Z"/></>,
    "Inicio": <><path d="m3 14 13-11 13 11M7 12v17h18V12M13 29V18h6v11"/></>,
    "Alimentación": <><path d="M4 13h24c-1 10-6 14-12 14S5 23 4 13Z"/><path d="M10 13c-6-7-3-11 3-5M18 13c-2-8 2-13 6-8M15 13V4"/></>,
    "Ejercicio": <><circle cx="20" cy="5" r="3"/><path d="m16 11 5 3 5-2M17 10l-5 9 6 3-3 8M12 19l-7 8M15 12l-6 1-4 5"/></>,
    "Mi Plan": <><rect x="4" y="7" width="24" height="22" rx="4"/><path d="M4 14h24M10 3v8M22 3v8M11 20h2M19 20h2M11 25h2M19 25h2"/></>,
    "Mi Progreso": <><path d="M5 29V18h5v11M14 29V11h5v18M23 29V4h5v25"/></>,
    "Mi Compra": <><path d="M6 11h20l3 18H3l3-18Z"/><path d="m10 11 6-8 6 8M11 16v7M21 16v7"/></>,
    "Mi Nevera": <><rect x="6" y="3" width="20" height="26" rx="3"/><path d="M6 13h20M10 7v3M10 18v6"/></>,
    "Salud": <path d="M16 28 4 16C-4 4 10-3 16 8 22-3 36 4 28 16L16 28Z"/>,
    "Objetivos": <><circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="7"/><path d="m16 16 12-12M24 4h4v4"/></>
  };
  return <svg className={illustrated?"illustratedSymbol":"lineSymbol"} viewBox="0 0 32 32" fill={illustrated?`url(#${id})`:"none"} stroke={illustrated?colors[1]:"currentColor"} strokeWidth={illustrated?1.5:2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {illustrated&&<defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor={colors[0]}/><stop offset=".45" stopColor={colors[1]}/><stop offset="1" stopColor={colors[0]}/></linearGradient></defs>}
    {shapes[name] || shapes["Salud"]}
    {illustrated&&<path d="M8 6C12 3 16 3 19 5" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2"/>}
  </svg>;
}

export function DesignedHome({ profile, links, onOpen }) {
  return <section className="designedHome" aria-label="Inicio DIETEAR">
    <div className="homeScene">
      <div className="sceneHeadline"><small>MENOS PLATOS Y MÁS ZAPATOS</small><h1>Cuida de ti ♡</h1></div>
      <Image className="scenePhoto" src={root+"hd-inicio.png"} alt="La chica y su perrita entre plantas y flores" width={1672} height={941} sizes="(max-width: 760px) 100vw, 60vw" unoptimized priority/>
      <div className="sceneWelcome"><h2>Hola{profile.name ? ", "+profile.name.split(" ")[0] : ""} ♡</h2><p>Pequeños cambios, grandes resultados. Tu bienestar empieza hoy.</p><button onClick={()=>onOpen("alimentacion","Crear mi dieta")}>Comenzar ahora →</button></div>
    </div>
    <div className="homeButtons" aria-label="Accesos principales de DIETEAR">
      {links.map((item,i)=>{const homePhotos={"Alimentación":"hd-alimentacion.png","Ejercicio":"hd-ejercicio.png","Mi Plan":"hd-complete.png","Mi Progreso":"inicio-completo.png","Mi Compra":"hd-budget.png","Mi Nevera":"hd-nevera.png","Salud":"hd-fit.png","Objetivos":"hd-inicio.png"};return <button className={"homeBubble homeBubble-"+i} key={item[0]} onClick={()=>onOpen(item[2],item[3])}><Image className="homeBubblePhoto" src={root+homePhotos[item[0]]} alt="" width={480} height={300} sizes="(max-width:650px) 42vw, 220px"/><b>{item[0]}</b><small>{item[1]}</small></button>})}
      <p className="homeMotto">🌿 Una vida más sana está en tus manos.</p>
    </div>
  </section>;
}

export function DesignedHeader({ tab, profile }) {
  const food = tab === "alimentacion";
  return <section className={"designedHero "+(food?"nutritionScene":"profileScene")}>
    <div className="sceneHeadline"><small>DIETEAR · {food?"ALIMENTACIÓN":"PARA MÍ"}</small><h1>{food?"Tu base para sentirte bien":"DIETEAR empieza contigo"}</h1><p>{food?"Descubre, aprende y disfruta de una alimentación saludable.":"Tu vida, tus gustos y tu salud tienen su lugar aquí."}</p></div>
    <Image className="scenePhoto" src={root+(food?"hd-alimentacion.png":"seleccion-icono.png")} alt={food?"Alimentos frescos y una ensalada completa":"Identidad de DIETEAR"} width={food?1672:1254} height={food?941:1254} sizes="(max-width:760px) 100vw, 65vw" unoptimized priority/>
    {!food&&<p className="profileGreeting">{profile.name?"Hola, "+profile.name:"Tu espacio personal"} ♡</p>}
  </section>;
}

const mealArt = ["plan-desayuno","plan-media","plan-almuerzo","plan-merienda","recetas","plan-cena"];
const mealTimes = ["08:00","11:00","14:00","17:00","18:30","20:30"];
const plain = label => label.replace(/^[^A-Za-zÁÉÍÓÚáéíóúÑñ]+/, "");
export function DesignedWeek({ planner, setPlanner, weekKey, changeWeek, setShopping, onShopping, onCreate, profile, setProfile, isRestricted, flash }) {
  const [day,setDay] = useState(0), [editing,setEditing] = useState(null), [recipeSearch,setRecipeSearch] = useState("");
  const dialog = useRef(null);
  const [showAllMeals,setShowAllMeals]=useState(false),[mealError,setMealError]=useState("");
  useEffect(()=>{setDay((new Date().getDay()+6)%7)},[]);
  useEffect(()=>{if(editing&&dialog.current&&!dialog.current.open)dialog.current.showModal()},[editing]);
  const dates=datesForWeek(weekKey), selected=planner[day];
  const update=(field,value)=>{setPlanner(old=>old.map((item,index)=>index===day?{...item,[field]:value}:item));setShopping([])};
  const choose=(name,ingredients=[])=>{if([name,...ingredients.map(x=>x[0])].some(isRestricted)){setMealError("Esta comida contiene un alimento que has excluido.");return}update(editing,name);setEditing(null);flash("Comida guardada en el día elegido")};
  const available=recipes.filter(r=>showAllMeals||r.mealTypes.includes(editing));
  return <section className="designedWeek" aria-label="Mi plan semanal">
    <div className="sceneHeadline"><small>DIETEAR · MI PLAN SEMANAL</small><h1>Tu semana, a tu manera</h1><p>Organiza tus comidas. Personaliza, cambia y adapta a tu rutina.</p></div>
    <div className="designedWeekNav"><button aria-label="Semana anterior" onClick={()=>changeWeek(-1)}>‹</button><b>{dates[0].toLocaleDateString("es-ES",{day:"numeric",month:"short"})} – {dates[6].toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"})}</b><button aria-label="Semana siguiente" onClick={()=>changeWeek(1)}>›</button></div>
    <div className="designedDays" aria-label="Día del plan">{dates.map((date,index)=><button key={WEEK_DAYS[index]} aria-pressed={day===index} onClick={()=>setDay(index)}><b>{WEEK_DAYS[index].slice(0,3)}</b><span>{date.getDate()}</span></button>)}</div>
    <div className="designedMealRows plannerGrid">{MEAL_FIELDS.map(([field,label],index)=><article className="designedMeal" key={field}>
      <div className="mealCopy"><label htmlFor={"designed-meal-"+field}>{plain(label)}</label><input id={"designed-meal-"+field} aria-label={plain(label)+" del día elegido"} value={selected?.[field]||""} placeholder="Añadir comida…" onChange={event=>update(field,event.target.value)}/><input className="mealTime" type="time" aria-label={"Hora de "+plain(label)} value={profile.mealTimes?.[field]||mealTimes[index]} onChange={event=>setProfile(old=>({...old,mealTimes:{...old.mealTimes,[field]:event.target.value}}))}/></div>
      <Image className="mealIllustration mealPhoto" src={root+["hd-inicio.png","hd-tropical.png","hd-chickpea.png","hd-alimentacion.png","hd-complete.png","hd-fit.png"][index]} alt="" width={420} height={260} sizes="110px"/>
      <button className="addMealBubble" aria-label={"Elegir receta para "+plain(label)} onClick={()=>{setRecipeSearch("");setShowAllMeals(false);setMealError("");setEditing(field)}}>+</button>
    </article>)}</div>
    <div className="designedPlanFoot"><div className="planPeople"><span>Personas</span><button aria-label="Una persona menos" onClick={()=>update("people",Math.max(1,(selected?.people||1)-1))}>−</button><b>{selected?.people||1}</b><button aria-label="Una persona más" onClick={()=>update("people",(selected?.people||1)+1)}>+</button></div><button onClick={onShopping}>🛒 Ver mi lista de la compra →</button><button onClick={onCreate}>✨ Crear mi semana</button></div>
    {editing&&<dialog className="mealChooser" ref={dialog} onCancel={()=>setEditing(null)}><div className="mealChooserHead"><h2>Elige para {plain(MEAL_FIELDS.find(([field])=>field===editing)[1]).toLowerCase()}</h2><button aria-label="Cerrar recetas" onClick={()=>setEditing(null)}>×</button></div><form onSubmit={e=>{e.preventDefault();const name=recipeSearch.trim();if(!name)return;const exact=recipes.find(r=>normalizeMealText(r.name)===normalizeMealText(name));choose(exact?.name||name,exact?.ingredients)}}><label>Buscar receta o escribir mi comida<input aria-label="Buscar receta o escribir mi comida" autoFocus value={recipeSearch} onChange={e=>{setRecipeSearch(e.target.value);setMealError("")}} placeholder="Ej.: pan con aceite…"/></label><button disabled={!recipeSearch.trim()}>Añadir lo que he escrito →</button><p>Pulsa Intro para guardar lo escrito o elige una receta de la lista.</p></form><div className="mealChooserFilters"><button aria-pressed={!showAllMeals} onClick={()=>setShowAllMeals(false)}>Para esta comida</button><button aria-pressed={showAllMeals} onClick={()=>setShowAllMeals(true)}>Todas las opciones</button></div>{mealError&&<p role="alert">{mealError}</p>}<div className="mealChooserList">{available.filter(r=>matchesMeal(r,recipeSearch)).map((r,index)=><button key={r.id} onClick={()=>choose(r.name,r.ingredients)}><span className="mealChooserPhoto"><RecipePhoto recipe={r}/></span><b>{r.name}</b><small>{r.minutes} min · {r.ingredients.slice(0,3).map(x=>x[0]).join(", ")}</small><i>＋</i></button>)}{!available.some(r=>matchesMeal(r,recipeSearch))&&<p>No hay coincidencias. Puedes añadir tu propia comida con el botón de arriba.</p>}</div></dialog>}
  </section>;
}

function Sparkline({ records, bars=false, color }) {
  if(!records.length)return <svg viewBox="0 0 200 70" aria-hidden="true"><path d="M6 58H194" stroke="#cdddc6" strokeDasharray="4 5" fill="none"/></svg>;
  const values=records.slice(-12).map(item=>Number(item.value)||0), min=Math.min(...values), max=Math.max(...values), range=max-min||1;
  const points=values.map((value,index)=>[10+index*180/Math.max(1,values.length-1),55-(value-min)*44/range]);
  return <svg viewBox="0 0 200 70" aria-hidden="true">{bars?values.map((value,index)=><rect key={index} x={6+index*188/values.length} y={60-Math.max(4,value/Math.max(...values,1)*50)} width={Math.max(4,180/values.length-4)} height={Math.max(4,value/Math.max(...values,1)*50)} rx="3" fill={color}/>):<><polyline points={points.map(point=>point.join(",")).join(" ")} fill="none" stroke={color} strokeWidth="3"/>{points.map(([x,y],index)=><circle key={index} cx={x} cy={y} r="3" fill={color}/>)}</>}</svg>;
}
export function DesignedProgress({ history, onOpen }) {
  const [period,setPeriod]=useState(31);
  const cutoff=Date.now()-period*86400000;
  const entries=history.filter(item=>new Date(item.date).getTime()>=cutoff).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const types=type=>entries.filter(item=>type.includes(item.type));
  const weights=types(["peso"]), calories=types(["calorias"]), movement=types(["actividad","paseo"]), water=types(["agua"]);
  const total=items=>items.reduce((sum,item)=>sum+(Number(item.value)||0),0);
  const cards=[{title:"Peso",value:weights.length?Number(weights.at(-1).value)+" kg":"Sin registros",records:weights,color:"#31a74a",section:"Peso y medidas"},{title:"Calorías",value:calories.length?Math.round(total(calories))+" kcal":"Sin registros",records:calories,color:"#db64ad",bars:true,section:"Mis gráficas"},{title:"Movimiento",value:movement.length?Math.round(total(movement))+" min":"Sin registros",records:movement,color:"#4faad7",bars:true,section:"Pasos y actividad"},{title:"Hidratación",value:water.length?total(water).toFixed(1)+" L":"Sin registros",records:water,color:"#51c9da",bars:true,section:"Hidratación"}];
  return <section className="designedProgress"><div className="sceneHeadline"><small>DIETEAR · MI PROGRESO</small><h1>Cada pequeño paso cuenta</h1><p>Visualiza tus avances y mantén la motivación.</p></div><div className="progressPeriods">{[[7,"Semana"],[31,"Mes"],[366,"Año"]].map(([value,label])=><button aria-pressed={period===value} key={value} onClick={()=>setPeriod(value)}>{label}</button>)}</div><div className="designedMetricGrid">{cards.map(card=><button className="designedMetric" style={{"--metric-color":card.color}} key={card.title} onClick={()=>onOpen("progreso",card.section)}><span>{card.title}</span><b>{card.value}</b><Sparkline records={card.records} bars={card.bars} color={card.color}/></button>)}</div><div className="progressEncouragement"><Image className="progressEncouragementPhoto" src={root+"inicio-completo.png"} alt="" width={640} height={420} sizes="(max-width:650px) 42vw, 260px"/><div><h2>¡Vas sumando!</h2><p>{entries.length?entries.length+" registros en este periodo. Tu constancia da resultados.":"Tu camino empieza con un paso. Registra algo que hayas hecho hoy."}</p><button onClick={()=>onOpen("progreso","Peso y medidas")}>＋ Registrar un avance</button></div></div></section>;
}

const banners = {
  "Comer bien con presupuesto":["Cuida tu salud y tu bolsillo","Aprovecha lo que tienes y compra solo lo que necesitas.","hd-budget.png"],
  "¿Es bueno para mí?":["Elige lo que encaja contigo","Tus gustos, necesidades y restricciones orientan tus elecciones.","hd-fit.png"],
  "Mi Nevera":["Tu cocina empieza aquí","Añade tus alimentos y descubre recetas con lo que tienes.","hd-nevera.png"],
  "Mi Compra":["Tu compra, más sencilla","Tu plan y tu nevera se unen en una lista.","hd-alimentacion.png"],
  "Pasos y actividad":["Muévete a tu ritmo","En cualquier lugar, cada movimiento suma.","hd-ejercicio.png"],
  "Recetas rápidas":["Ideas deliciosas para cada día","Recetas fáciles, rápidas y a tu manera.","hd-alimentacion.png"],
  "¿Qué como hoy?":["Hoy cocinamos algo bueno","Elige una receta y llévala a tu plan.","hd-chickpea.png"],
  "Todo Dietas":["Elige tu estilo de alimentación","Personaliza según tus necesidades.","hd-tropical.png"],
  "Analizar alimento":["Conoce lo que comes","Escanea o busca un producto y descubre su etiqueta.","hd-escaner.png"],
  "Crear mi dieta":["Crea tu propia dieta","Tú eliges, DIETEAR te acompaña.",null]
};
export function DesignedModuleBanner({ section }) {
  const data=banners[section] || (featurePhotos[section] ? [section,"Tu espacio para cuidarte, a tu manera.",featurePhotos[section]] : null);if(!data)return null;
  return <section className={"moduleBanner moduleBanner-"+(section==="Crear mi dieta"?"creator":"photo")}><div className="sceneHeadline"><small>DIETEAR · {section.toLocaleUpperCase("es")}</small><h1>{data[0]}</h1><p>{data[1]}</p></div>{data[2]?<Image className={"scenePhoto "+(data[2].startsWith("visual-")?"squareModulePhoto":"")} src={root+data[2]} alt="" width={1254} height={data[2].startsWith("visual-")?1254:706} sizes="(max-width:760px) 100vw, 45vw"/>:<SelectedArtwork name="crear" className="creatorBannerArt"/>}</section>;
}

export function DesignedActivityChoices({ onChoose, onProfile, onAsk }) {
  const choices=[
    ["Caminatas","Caminar","hd-ejercicio.png"],
    ["Fuerza","Fuerza","hd-fit.png"],
    ["Yoga y movilidad","Yoga / movilidad","inicio-completo.png"],
    ["En casa","Fuerza","hd-inicio.png"]
  ];
  return <div className="designedActivityChoices">{choices.map(([label,kind,file])=><button key={label} onClick={()=>onChoose(kind)}><Image className="activityChoicePhoto" src={root+file} alt="" width={720} height={420} sizes="(max-width:650px) 30vw, 180px"/><b>{label}</b></button>)}<button onClick={onProfile}><Image className="activityChoicePhoto" src={root+"visual-family.png"} alt="" width={720} height={420} sizes="(max-width:650px) 30vw, 180px"/><b>Según mi edad</b></button><button onClick={onAsk}><Image className="activityChoicePhoto" src={root+"inicio-completo.png"} alt="" width={720} height={420} sizes="(max-width:650px) 30vw, 180px"/><b>Mi rutina</b></button></div>;
}

const featurePhotos = {
  "Crear mi dieta": "hd-inicio.png",
  "¿Qué como hoy?": "hd-chickpea.png",
  "Menú semanal": "hd-complete.png",
  "Todo Dietas": "hd-tropical.png",
  "Mi Nevera": "hd-nevera.png",
  "Mi Compra": "hd-budget.png",
  "Analizar alimento": "hd-escaner.png",
  "¿Es bueno para mí?": "hd-fit.png",
  "Crear semana": "hd-chickpea.png",
  "Modificar plan": "hd-complete.png",
  "Personas": "visual-family.png",
  "Día comodín": "visual-celebrate.png",
  "Copiar semana": "visual-agenda.png",
  "Generar compra": "hd-budget.png",
  "Fiestas y días especiales": "visual-celebrate.png",
  "Trabajo y horarios": "visual-agenda.png",
  "Viajes y vacaciones": "inicio-completo.png",
  "Peso y medidas": "visual-weight.png",
  "Pasos y actividad": "hd-ejercicio.png",
  "Mis gráficas": "visual-graphs.png",
  "Fotos de evolución": "visual-camera.png",
  "Mis logros": "visual-trophy.png",
  "Cómo puedo mejorar": "visual-growth.png",
  "Hidratación": "visual-water.png",
  "Sueño y descanso": "visual-rest.png",
  "Mi Camino": "inicio-completo.png",
  "Mi ficha": "hd-inicio.png",
  "Mis objetivos": "visual-growth.png",
  "Mis motivaciones": "inicio-completo.png",
  "Salud y necesidades": "hd-fit.png",
  "Mi familia": "visual-family.png",
  "Gustos y alimentos": "hd-tropical.png",
  "Privacidad y permisos": "visual-privacy.png",
  "Apps y dispositivos": "visual-devices.png",
  "Premium": "visual-premium.png",
  "Acceso profesional": "visual-professional.png",
};
const featureRecipePhotos = {"Comer bien con presupuesto": {name:"Lentejas con verduras",imageSheet:1,imageCell:4},"Recetas rápidas": {name:"Huevos con tomate",imageSheet:3,imageCell:1}};
export function hasDesignedFeaturePhoto(name) { return Boolean(featurePhotos[name] || featureRecipePhotos[name]); }
export function DesignedFeatureArtwork({ name }) {
  if(featureRecipePhotos[name]) return <span className="featureArtwork featurePhoto"><RecipePhoto recipe={featureRecipePhotos[name]}/></span>;
  const file = featurePhotos[name];
  return file ? <Image className={"featureArtwork featurePhoto "+(name==="Hidratación"?"featureArtworkCompact":"")} src={root+file} alt="" width={file==="inicio-completo.png"?1228:1672} height={file.startsWith("visual-")?1672:file==="inicio-completo.png"?1281:941} sizes="(max-width:650px) 45vw, 20vw"/> : null;
}

export function DesignedDietArtwork({name}){
  const artwork=dietArtwork[name],excluded=name==="Sin lactosa"||name==="Sin gluten";
  if(!artwork)return null;
  return <span className={"dietChoiceArtwork dietPhoto "+(excluded?"excludedFood":"")} data-diet-artwork={name}>
    {typeof artwork==="string"?<Image src={root+artwork} alt={name} width={1254} height={1254} sizes="(max-width:650px) 45vw, 25vw"/>:<RecipePhoto recipe={{name,imageSheet:artwork[0],imageCell:artwork[1]}}/>}
    {excluded&&<svg className="dietProhibition" viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="39"/><path d="M23 23 77 77"/></svg>}
  </span>;
}
export function DesignedFormArtwork({file}) {return <Image className="formArtwork" src={root+file} alt="" width={1254} height={file.startsWith("visual-")?1254:706} sizes="90px"/>;}