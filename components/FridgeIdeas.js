"use client";
import {recipes} from "../lib/recipes";

const norm=s=>String(s||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const matches=(ingredient,available)=>{
  const wanted=norm(ingredient);
  const have=norm(available);
  return !!have && (wanted===have || wanted.includes(have) || have.includes(wanted));
};

export default function FridgeIdeas({fridge,onChoose}){
  if(!fridge.length)return null;
  const ranked=recipes.map(recipe=>{
    const missing=recipe.ingredients
      .map(([name])=>name)
      .filter(name=>!fridge.some(item=>matches(name,item.name)));
    return {...recipe,hits:recipe.ingredients.length-missing.length,missing};
  }).sort((a,b)=>b.hits-a.hits||a.missing.length-b.missing.length);
  const hasMatches=ranked.some(recipe=>recipe.hits>0);
  return <div className="fridgeIdeas">
    <div>
      <small>🧊 NEVERA INTELIGENTE</small>
      <h3>{hasMatches?"Recetas que aprovechan tu nevera":"Aún no hay recetas con esos ingredientes"}</h3>
      <p>{hasMatches
        ?"Estas ideas aprovechan parte de lo que has registrado. Comprueba qué falta antes de prepararlas."
        :"Ninguna de las recetas disponibles coincide todavía. Puedes añadir más alimentos o consultar ideas que requieren compra."}</p>
    </div>
    <div className="fridgeIdeaGrid">
      {ranked.filter(recipe=>recipe.hits>0).slice(0,3).map(recipe=><article key={recipe.id}>
        <span>{recipe.emoji}</span>
        <div>
          <b>{recipe.name}</b>
          <small>{recipe.hits} de {recipe.ingredients.length} ingredientes en tu nevera</small>
          {recipe.missing.length>0&&<small>Faltan: {recipe.missing.join(", ")}</small>}
        </div>
        <button onClick={()=>onChoose(recipe.name)}>Añadir al plan →</button>
      </article>)}
    </div>
    <p>Revisa siempre los ingredientes y tus restricciones alimentarias antes de elegir una receta.</p>
  </div>;
}
