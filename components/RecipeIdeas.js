"use client";
import {useEffect, useState} from 'react';
import {recipes} from '../lib/recipes';
import {matchesMeal} from '../lib/meal-options';
import {MEAL_FIELDS} from '../lib/week-plan';
import {recipeFitsStyle, recipeHasRestriction, recipeStyle} from '../lib/recipe-selection.mjs';
import {recipeBookForStyle, selectRecipeBook} from '../lib/recipe-books.mjs';
import RecipePhoto from './RecipePhoto';
import ReadingControls from './ReadingControls';
import {dietGuide} from '../lib/diet-guides.mjs';

const categories=[['all','Todo el libro'],['breakfast','Desayunos'],['lunch','Comidas'],['dinner','Cenas'],['snack','Meriendas y tentempiés']];
export default function RecipeIdeas({onChoose, maxMinutes=null, mealType='all', profile={}, restrictions=[], onPreferencesChange, onChangeStyle, curated=false}) {
  const [openId,setOpenId]=useState(null), [query,setQuery]=useState(''), [legacyFavorites,setLegacyFavorites]=useState([]);
  const [onlyFavorites,setOnlyFavorites]=useState(false), [category,setCategory]=useState('all'), [time,setTime]=useState('all');
  const [portions,setPortions]=useState({}), [slots,setSlots]=useState({}), [expandedBook,setExpandedBook]=useState(false);
  useEffect(()=>{try{const stored=JSON.parse(localStorage.getItem('dietear-recipe-favorites')||'[]');if(Array.isArray(stored))setLegacyFavorites(stored.filter(id=>typeof id==='string'));}catch{}},[]);
  useEffect(()=>{setCategory('all');setOpenId(null);setQuery('');setTime('all');setOnlyFavorites(false);setExpandedBook(false);},[mealType,profile.dietStyle]);
  const favorites=Array.isArray(profile.recipeFavorites)?profile.recipeFavorites:legacyFavorites;
  const dislikes=Array.isArray(profile.recipeDislikes)?profile.recipeDislikes:[];
  const style=profile.dietStyle||'Equilibrada', styleInfo=recipeStyle(style), book=recipeBookForStyle(style);
  const bookPending=curated&&!book&&!expandedBook&&!onlyFavorites;
  const requiresClinicalReview=curated&&book&&!styleInfo.canPlan;
  function toggleFavorite(id) {
    const next=favorites.includes(id)?favorites.filter(item=>item!==id):[...favorites,id];
    if(onPreferencesChange)onPreferencesChange({recipeFavorites:next});
    else {setLegacyFavorites(next);try{localStorage.setItem('dietear-recipe-favorites',JSON.stringify(next));}catch{}}
  }
  function dislike(id) {onPreferencesChange?.({recipeDislikes:[...new Set([...dislikes,id])],recipeFavorites:favorites.filter(item=>item!==id)});}
  const photoReady=recipe=>Number.isInteger(recipe.imageSheet)&&recipe.imageSheet>=0&&recipe.imageSheet<4&&Number.isInteger(recipe.imageCell)&&recipe.imageCell>=0&&recipe.imageCell<16;
  const eligibleRecipes=recipes.filter(photoReady);
  const photographedCollection=curated?selectRecipeBook(eligibleRecipes,style,{restrictions,expanded:expandedBook||onlyFavorites}):eligibleRecipes.filter(recipe=>recipeFitsStyle(recipe,style)&&!recipeHasRestriction(recipe,restrictions));
  const fullCollection=curated?selectRecipeBook(recipes,style,{restrictions,expanded:expandedBook||onlyFavorites}):recipes.filter(recipe=>recipeFitsStyle(recipe,style)&&!recipeHasRestriction(recipe,restrictions));
  // Prioritize photographs; only use unillustrated dishes to complete a short book.
  const collection=photographedCollection.length>=20?photographedCollection:[...photographedCollection,...fullCollection.filter(recipe=>!photoReady(recipe)).slice(0,20-photographedCollection.length)];
  const visible=collection.filter(r=>!dislikes.includes(r.id)&&(!maxMinutes||r.minutes<=maxMinutes)&&(time==='all'||r.minutes<=Number(time))&&(mealType==='all'||r.mealTypes.includes(mealType))&&(category==='all'||(category==='snack'?r.mealTypes.some(type=>['midmorning1','snack1','snack2'].includes(type)):r.mealTypes.includes(category)))&&(!onlyFavorites||favorites.includes(r.id))&&matchesMeal(r,query));
  function change(recipe) {
    const alternative=visible.find(item=>item.id!==recipe.id&&item.mealTypes.some(type=>recipe.mealTypes.includes(type)));
    if(alternative) {setOpenId(alternative.id);window.setTimeout(()=>document.getElementById('recipe-'+alternative.id)?.scrollIntoView({block:'center',behavior:'smooth'}),0);}
  }
  return <div className="recipeBook" id="diet-recipe-book" role="region" aria-label={"Libro de recetas: "+style} tabIndex={-1}>
    <header className="recipeBookHead">{onChangeStyle&&<button type="button" className="changeDietStyle" onClick={onChangeStyle}>← Cambiar estilo de alimentación</button>}<small>DIETEAR · EL PLACER DE COMER BIEN</small><h3>{bookPending?'Recetario específico pendiente: ':!book?'Ideas generales · ':'Tu libro: '}{style}</h3>{!bookPending&&<p>{collection.length} recetas {curated&&book&&!expandedBook&&!onlyFavorites?'seleccionadas para este estilo':'de la biblioteca actual'}. Priorizamos las recetas con fotografía; si faltan platos para completar el libro, añadimos opciones sin imagen. Ingredientes, cantidades y preparación para elegir sin complicarte.</p>}</header>
    {curated && <section className="dietGuide" aria-label={"En qué consiste la dieta "+style}><h4>¿En qué consiste la dieta {style}?</h4><ReadingControls key={style} title={"la dieta "+style} summary={dietGuide(style)} preferredRate={profile.readingRate} onRateChange={readingRate=>onPreferencesChange?.({readingRate})}/><p>Después de esta explicación encontrarás el recetario disponible para este estilo. Las dietas terapéuticas sin recetario validado se identifican como pendientes.</p></section>}
    {requiresClinicalReview&&<p className="recipeStyleNote" role="status"><strong>Selección de ideas en revisión, no dieta terapéutica validada.</strong> Estas recetas no garantizan la cantidad de sodio, fibra, energía o hidratos adecuada, ni certificación halal. No generes un plan clínico automático: revisa ingredientes, etiquetas, porciones y necesidades con un profesional sanitario cuando corresponda.</p>}
    <p className="recipeStyleNote">{styleInfo.note} Las fotografías son ilustrativas; revisa siempre los ingredientes de la ficha.</p>
    {curated&&<div className="recipeBookScope">
      <p>{bookPending?'Estamos preparando el recetario propio de este estilo. Puedes consultar ideas generales por separado, sin atribuirles adecuación a esta dieta.':book&&!expandedBook&&!onlyFavorites?'Una selección culinaria orientativa para explorar platos; no implica validación nutricional ni clínica.':book?'Catálogo ampliado de recetas compatibles; puede compartir platos con otros estilos.':'Estas son ideas generales, no un recetario validado para este estilo.'}</p>
      <button type="button" aria-pressed={expandedBook} onClick={()=>{setExpandedBook(!expandedBook);setOnlyFavorites(false);}}>{expandedBook?'Volver a la selección del estilo':book?'Ver más recetas compatibles':'Consultar recetas generales'}</button>
    </div>}
    <div className="recipeCategories">{categories.map(([key,label])=><button type="button" key={key} aria-pressed={category===key} onClick={()=>setCategory(key)}>{label}</button>)}</div>
    <div className="recipeSearch"><label>Buscar receta o ingrediente<input aria-label="Buscar receta o ingrediente" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Garbanzos, mango, tostadas…"/></label><label>Tiempo disponible<select aria-label="Tiempo disponible" value={time} onChange={event=>setTime(event.target.value)}><option value="all">Todos los tiempos</option><option value="15">Hasta 15 minutos</option><option value="30">Hasta 30 minutos</option></select></label><button type="button" aria-pressed={onlyFavorites} onClick={()=>setOnlyFavorites(!onlyFavorites)}>{onlyFavorites?'Todas las recetas':'♡ Mis favoritas'}</button></div>
    {dislikes.length>0&&<details className="recipeDisliked"><summary>No me gustan ({dislikes.length})</summary><p>Estas recetas se ocultan de este libro y de las semanas nuevas.</p>{recipes.filter(recipe=>dislikes.includes(recipe.id)).map(recipe=><p key={recipe.id}>{recipe.name} <button type="button" onClick={()=>onPreferencesChange?.({recipeDislikes:dislikes.filter(id=>id!==recipe.id)})}>Volver a mostrar {recipe.name}</button></p>)}</details>}
    <p className="recipeCount" role="status">{bookPending?"Recetario específico en preparación":visible.length+" recetas disponibles"}</p>
    {!bookPending&&!visible.length&&<p>No hay coincidencias. Prueba otro ingrediente, revisa tus exclusiones o cambia los filtros.</p>}
    <div className="recipeBookGrid">{visible.map(r=>{
      const people=portions[r.id]||Math.max(1,Math.min(20,Number(profile.people)||1)), slot=slots[r.id]||r.mealTypes[0];
      return <article className="recipeIdea" id={'recipe-'+r.id} key={r.id}>
        <div className="recipeImageWrap"><RecipePhoto recipe={r}/><span className="recipeTime">{r.minutes} min</span><button type="button" className="recipeFavorite" aria-label={(favorites.includes(r.id)?'Quitar de favoritas: ':'Guardar favorita: ')+r.name} aria-pressed={favorites.includes(r.id)} onClick={()=>toggleFavorite(r.id)}>{favorites.includes(r.id)?'♥':'♡'}</button></div>
        <div className="recipeCardBody"><h3>{r.name}</h3><p>{r.ingredients.length} ingredientes · Preparación sencilla</p>
          <label>Añadir a<select aria-label={'Destino de '+r.name} value={slot} onChange={event=>setSlots({...slots,[r.id]:event.target.value})}>{MEAL_FIELDS.map(([key,label])=><option key={key} value={key}>{label.replace(/^[^A-Za-zÁÉÍÓÚáéíóúÑñ]+/,'')}</option>)}</select></label>
          <div className="recipeIdeaActions"><button type="button" aria-expanded={openId===r.id} onClick={()=>setOpenId(openId===r.id?null:r.id)}>{openId===r.id?'Ocultar preparación':'Ver cómo se hace'}</button><button type="button" onClick={()=>onChoose(r.name,slot,people)}>Añadir al plan de hoy →</button></div>
          <div className="recipeActionsExtra"><button type="button" onClick={()=>change(r)} disabled={!visible.some(item=>item.id!==r.id&&item.mealTypes.some(type=>r.mealTypes.includes(type)))}>Cambiar propuesta</button>{onPreferencesChange&&<button type="button" onClick={()=>dislike(r.id)}>No me gusta</button>}</div>
          {openId===r.id&&<div className="recipeIdeaDetail"><label>Raciones<input type="number" min="1" max="20" step="1" aria-label={'Raciones de '+r.name} value={people} onChange={event=>setPortions({...portions,[r.id]:Math.max(1,Math.min(20,Math.floor(Number(event.target.value)||1)))})}/></label>
            <h4>Ingredientes para {people} ración(es)</h4><ul>{r.ingredients.map(([name,qty,unit])=><li key={name}>{name}: {new Intl.NumberFormat('es-ES',{maximumFractionDigits:1}).format(qty*people)} {unit}</li>)}</ul>
            <h4>Preparación</h4><ol>{r.steps.map((step,index)=><li key={index}>{step}</li>)}</ol>
            <ReadingControls title={r.name} summary={`${r.name}. Preparación: ${r.minutes} minutos. Para ${people} ración(es). Ingredientes: ${r.ingredients.map(([name,qty,unit])=>`${qty*people} ${unit} de ${name}`).join(', ')}.`} steps={r.steps} preferredRate={profile.readingRate} onRateChange={readingRate=>onPreferencesChange?.({readingRate})}/>
            <small>Cantidades culinarias orientativas. Los nutrientes de estas recetas aún no están verificados. Adapta según tus necesidades y revisa alergias y etiquetas.</small>
          </div>}
        </div>
      </article>;
    })}</div>
  </div>;
}
