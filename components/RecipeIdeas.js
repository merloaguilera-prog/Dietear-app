"use client";
import {useState} from "react";
import {recipes} from "../lib/recipes";

export default function RecipeIdeas({onChoose}){
  const [openId,setOpenId]=useState(null);
  return <div className="recipeIdeaList">
    {recipes.map(recipe=><article className="recipeIdea" key={recipe.id}>
      <div className="recipeIdeaHead">
        <span aria-hidden="true">{recipe.emoji}</span>
        <div><h3>{recipe.name}</h3><p>{recipe.minutes} min · {recipe.ingredients.length} ingredientes</p></div>
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
