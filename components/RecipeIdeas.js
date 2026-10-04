"use client";
import {useEffect,useState} from "react";
import {recipes} from "../lib/recipes";
import SelectedArtwork from "./SelectedArtwork";

export default function RecipeIdeas({onChoose,maxMinutes=null,mealType="all"}){
  const [openId,setOpenId]=useState(null);
  const [query,setQuery]=useState(""),[favorites,setFavorites]=useState([]),[onlyFavorites,setOnlyFavorites]=useState(false);
  useEffect(()=>{try{const stored=JSON.parse(localStorage.getItem("dietear-recipe-favorites")||"[]");if(Array.isArray(stored))setFavorites(stored)}catch{}},[]);
  function toggleFavorite(id){const next=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];setFavorites(next);try{localStorage.setItem("dietear-recipe-favorites",JSON.stringify(next))}catch{}}
  const visible=recipes.filter(recipe=>(!maxMinutes||recipe.minutes<=maxMinutes)&&(mealType==="all"||recipe.mealTypes?.includes(mealType))&&(!onlyFavorites||favorites.includes(recipe.id))&&(recipe.name+" "+recipe.ingredients.map(x=>x[0]).join(" ")).toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")));
  return <div className="recipeIdeaList">
    <div className="recipeSearch"><label>Buscar receta o ingrediente<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="¿Qué te apetece?"/></label><button aria-pressed={onlyFavorites} onClick={()=>setOnlyFavorites(!onlyFavorites)}>{onlyFavorites?"Todas las recetas":"♡ Mis favoritas"}</button></div>
    {!visible.length&&<p>{onlyFavorites?"Guarda tus recetas tocando el corazón.":"No hay recetas que coincidan con esta búsqueda."}</p>}
    {visible.map((recipe,index)=><article className="recipeIdea" key={recipe.id}>
      <div className="recipeIdeaHead">
        <SelectedArtwork className="recipeThumb" name={["recetas","plan-almuerzo","plan-desayuno","plan-cena"][index%4]}/>
        <div><h3>{recipe.name}</h3><p>{recipe.minutes} min · {recipe.ingredients.length} ingredientes</p></div>
        <button className="recipeFavorite" aria-label={(favorites.includes(recipe.id)?"Quitar de favoritas: ":"Guardar favorita: ")+recipe.name} aria-pressed={favorites.includes(recipe.id)} onClick={()=>toggleFavorite(recipe.id)}>{favorites.includes(recipe.id)?"♥":"♡"}</button>
      </div>
      <div className="recipeIdeaActions">
        <button type="button" aria-expanded={openId===recipe.id} aria-controls={"recipe-"+recipe.id} onClick={()=>setOpenId(openId===recipe.id?null:recipe.id)}>{openId===recipe.id?"Ocultar preparación":"Ver cómo se hace"}</button>
        <button type="button" onClick={()=>onChoose(recipe.name)}>Añadir al plan de hoy →</button>
      </div>
      {openId===recipe.id&&<div className="recipeIdeaDetail" id={"recipe-"+recipe.id}>
        <h4>Ingredientes por persona</h4>
        <ul>{recipe.ingredients.map(([name,qty,unit])=><li key={name}>{name}: {qty} {unit}</li>)}</ul>
        <h4>Preparación</h4>
        <ol>{recipe.steps.map((step,index)=><li key={index}>{step}</li>)}</ol>
        <p>Comprueba tus alergias, restricciones y las etiquetas de los productos antes de prepararla.</p>
      </div>}
    </article>)}
  </div>;
}
