"use client";
import {useEffect,useState} from "react";
import {recipes} from "../lib/recipes";
import {matchesMeal} from "../lib/meal-options";
import {MEAL_FIELDS} from "../lib/week-plan";
import RecipePhoto from "./RecipePhoto";
const categories=[["all","Todo el libro"],["breakfast","Desayunos"],["midmorning1","Media mañana"],["lunch","Comidas"],["snack","Meriendas y snacks"],["dinner","Cenas"]];
const seasons=[["all","Todo el año"],["invierno","❄️ Invierno"],["primavera","🌷 Primavera"],["verano","☀️ Verano"],["otono","🍂 Otoño"]];
const seasonNames={invierno:"invierno",primavera:"primavera",verano:"verano",otono:"otoño"};
export default function RecipeIdeas({onChoose,maxMinutes=null,mealType="all",premiumAccess=false}){
 const [openId,setOpenId]=useState(null),[replaced,setReplaced]=useState([]),[notice,setNotice]=useState(""),[query,setQuery]=useState(""),[favorites,setFavorites]=useState([]),[disliked,setDisliked]=useState([]),[showDisliked,setShowDisliked]=useState(false),[onlyFavorites,setOnlyFavorites]=useState(false),[category,setCategory]=useState("all"),[season,setSeason]=useState("all"),[time,setTime]=useState("all"),[portions,setPortions]=useState({}),[slots,setSlots]=useState({});
 useEffect(()=>{
  try{
   const stored=JSON.parse(localStorage.getItem("dietear-recipe-favorites")||"[]");
   const rejected=JSON.parse(localStorage.getItem("dietear-recipe-disliked")||"[]");
   const validIds=new Set(recipes.map(r=>r.id));
   const clean=list=>Array.isArray(list)?[...new Set(list.filter(id=>typeof id==="string"&&validIds.has(id)))]:[];
   const dislikedIds=clean(rejected);
   const favoritesIds=clean(stored).filter(id=>!dislikedIds.includes(id));
   // Una receta rechazada nunca debe reaparecer entre favoritas tras recargar.
   setFavorites(favoritesIds);
   setDisliked(dislikedIds);
   localStorage.setItem("dietear-recipe-favorites",JSON.stringify(favoritesIds));
   localStorage.setItem("dietear-recipe-disliked",JSON.stringify(dislikedIds));
  }catch{setNotice("No se han podido recuperar las preferencias de recetas de este navegador.");}
 },[]);
 useEffect(()=>{setCategory("all")},[mealType]);
 function toggleFavorite(id){
  const next=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];
  setFavorites(next);
  if(next.includes(id)&&disliked.includes(id)){
   const remaining=disliked.filter(x=>x!==id);
   setDisliked(remaining);
   try{localStorage.setItem("dietear-recipe-disliked",JSON.stringify(remaining))}catch{}
  }
  try{localStorage.setItem("dietear-recipe-favorites",JSON.stringify(next))}catch{}
 }
 function toggleDisliked(id){
  const next=disliked.includes(id)?disliked.filter(x=>x!==id):[...disliked,id];
  setDisliked(next);
  if(next.includes(id)&&favorites.includes(id)){
   const remaining=favorites.filter(x=>x!==id);
   setFavorites(remaining);
   try{localStorage.setItem("dietear-recipe-favorites",JSON.stringify(remaining))}catch{}
  }
  try{localStorage.setItem("dietear-recipe-disliked",JSON.stringify(next))}catch{}
 }
 function changeRecipe(current){
  const candidates=visible.filter(r=>r.id!==current.id&&r.mealTypes.some(t=>current.mealTypes.includes(t)));
  if(!candidates.length){setNotice("No hay otra alternativa para esta comida con los filtros actuales. Prueba a ampliar la búsqueda.");return;}
  // Avanzar desde la receta actual, no escoger siempre la primera de la lista.
  const currentIndex=visible.findIndex(r=>r.id===current.id);
  const next=visible.slice(currentIndex+1).find(r=>candidates.some(c=>c.id===r.id))||candidates[0];
  setReplaced(ids=>[...ids,current.id]);
  setOpenId(next.id);
  setNotice("Hemos cambiado «"+current.name+"» por «"+next.name+"». Puedes recuperar las recetas cambiadas.");
 }
 useEffect(()=>{
  if(!openId||!replaced.length)return;
  const target=document.getElementById("dietear-recipe-"+openId);
  target?.scrollIntoView({behavior:"smooth",block:"center"});
 },[openId,replaced]);
 const visible=recipes.filter(r=>(showDisliked?disliked.includes(r.id):!disliked.includes(r.id))&&(!maxMinutes||r.minutes<=maxMinutes)&&(time==="all"||r.minutes<=Number(time))&&(mealType==="all"||r.mealTypes.includes(mealType))&&(category==="all"||(category==="snack"?r.mealTypes.some(t=>["midmorning1","snack1","snack2"].includes(t)):r.mealTypes.includes(category)))&&(!onlyFavorites||favorites.includes(r.id))&&(!replaced.includes(r.id))&&(season==="all"||!Array.isArray(r.seasons)||r.seasons.includes(season))&&matchesMeal(r,query));
 return <div className="recipeBook"><header className="recipeBookHead"><small>DIETEAR · EL PLACER DE COMER BIEN</small><h3>{recipes.length} recetas saludables · DIETEAR Gratis</h3><p>Recetas variadas para todo el año. Encuentra tu próximo plato y llévalo a tu plan.</p><p><strong>💎 Premium:</strong> enciclopedias por dieta, menús de temporada, novedades mensuales y datos nutricionales completos. Estas ampliaciones están en preparación.</p></header><nav aria-label="Temporadas del recetario" className="recipeCategories">{seasons.map(([key,label])=><button key={key} type="button" aria-pressed={season===key} onClick={()=>setSeason(key)}>{label}</button>)}</nav><div className="recipeCategories">{categories.map(([key,label])=><button key={key} aria-pressed={category===key} onClick={()=>setCategory(key)}>{label}</button>)}</div><div className="recipeSearch"><label>Buscar receta o ingrediente<input aria-label="Buscar receta o ingrediente" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Garbanzos, mango, tostadas…"/></label><label>Tiempo disponible<select aria-label="Tiempo disponible" value={time} onChange={e=>setTime(e.target.value)}><option value="all">Todos los tiempos</option><option value="15">Hasta 15 minutos</option><option value="30">Hasta 30 minutos</option></select></label><button aria-pressed={onlyFavorites} onClick={()=>{setOnlyFavorites(!onlyFavorites);setShowDisliked(false)}}>{onlyFavorites?"Todas las recetas":"♡ Mis favoritas"}</button><button aria-pressed={showDisliked} onClick={()=>{setShowDisliked(!showDisliked);setOnlyFavorites(false)}}>{showDisliked?"Volver a recetas":"⊘ No me gusta ("+disliked.length+")"}</button></div><p className="recipeCount">{visible.length} recetas para explorar {season!=="all"?"· "+seasonNames[season]:"· todo el año"} · Fotografías ilustrativas</p>{notice&&<p role="status" aria-live="polite">{notice}</p>}{replaced.length>0&&<button type="button" onClick={()=>{setReplaced([]);setNotice("Todas las recetas cambiadas vuelven a estar disponibles.")}}>↩ Recuperar recetas cambiadas ({replaced.length})</button>}{!visible.length&&<p>No hay coincidencias. Prueba otro ingrediente o cambia los filtros.</p>}<div className="recipeBookGrid">{visible.map(r=>{const people=portions[r.id]||1,slot=slots[r.id]||r.mealTypes[0];return <article className="recipeIdea" id={"dietear-recipe-"+r.id} key={r.id}><div className="recipeImageWrap"><RecipePhoto recipe={r}/><span className="recipeTime">{r.minutes} min</span><button className="recipeFavorite" aria-label={(favorites.includes(r.id)?"Quitar de favoritas: ":"Guardar favorita: ")+r.name} aria-pressed={favorites.includes(r.id)} onClick={()=>toggleFavorite(r.id)}>{favorites.includes(r.id)?"♥":"♡"}</button></div><div className="recipeCardBody"><h3>{r.name}</h3><p aria-label="Tiempo e ingredientes">⏱ {r.minutes} minutos · 🥬 {r.ingredients.length} ingredientes · 🍽 Porciones ajustables</p><p className="recipeNutrition" aria-label="Información nutricional">{!premiumAccess ? <small>💎 Proteínas, grasas, carbohidratos y calorías: información reservada para Premium.</small> : r.nutrition?.verified ? <><b>Proteínas: {r.nutrition.protein} g</b> · <b>Grasas: {r.nutrition.fat} g</b> · <b>Carbohidratos: {r.nutrition.carbs} g</b> · <b>{r.nutrition.kcal} kcal</b></> : <small>Proteínas · Grasas · Carbohidratos · Calorías: pendientes de cálculo verificado para esta ración</small>}</p><div className="recipePreferenceActions"><button type="button" onClick={()=>changeRecipe(r)}>↻ Cambiar</button><button type="button" aria-pressed={disliked.includes(r.id)} onClick={()=>toggleDisliked(r.id)}>{disliked.includes(r.id)?"↩ Recuperar":"⊘ No me gusta"}</button><button type="button" aria-pressed={favorites.includes(r.id)} onClick={()=>toggleFavorite(r.id)}>{favorites.includes(r.id)?"♥ Favorito":"♡ Favorito"}</button></div><p>{r.ingredients.length} ingredientes · Preparación sencilla</p><label>Añadir a<select aria-label={"Destino de "+r.name} value={slot} onChange={e=>setSlots({...slots,[r.id]:e.target.value})}>{MEAL_FIELDS.filter(([key])=>r.mealTypes.includes(key)).map(([key,label])=><option key={key} value={key}>{label.replace(/^[^A-Za-zÁÉÍÓÚáéíóúÑñ]+/, "")}</option>)}</select></label><div className="recipeIdeaActions"><button aria-expanded={openId===r.id} onClick={()=>setOpenId(openId===r.id?null:r.id)}>{openId===r.id?"Ocultar preparación":"Ver cómo se hace"}</button><button onClick={()=>onChoose(r.name,slot,portions[r.id]?people:undefined)}>Añadir al plan de hoy →</button></div>{openId===r.id&&<div className="recipeIdeaDetail"><label>Personas<input type="number" min="1" step="1" aria-label={"Personas para "+r.name} value={people} onChange={e=>setPortions({...portions,[r.id]:Math.max(1,Math.floor(Number(e.target.value)||1))})}/></label><h4>Ingredientes para {people} persona(s)</h4><ul>{r.ingredients.map(([name,qty,unit])=><li key={name}>{name}: {new Intl.NumberFormat("es-ES",{maximumFractionDigits:1}).format(qty*people)} {unit}</li>)}</ul><h4>Preparación paso a paso</h4><ol>{r.steps.map((step,index)=><li key={index}>{step}</li>)}</ol><small>Cantidades culinarias orientativas. Adapta según tus necesidades y revisa alergias y etiquetas.</small></div>}</div></article>})}</div></div>
}
