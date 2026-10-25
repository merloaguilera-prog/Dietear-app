"use client";
import {useState} from "react";

const menus=[
  {name:"Menú tradicional",description:"Comidas caseras",dish:"Pollo al horno con verduras",ingredients:["2 raciones de pollo","2 patatas pequeñas","1 calabacín","1 zanahoria","1 cucharada de aceite de oliva","Limón y especias"],steps:["Precalienta el horno a 200 °C.","Lava y corta las verduras y las patatas.","Coloca todo en una bandeja, añade aceite, limón y especias.","Hornea hasta que el pollo alcance 74 °C en su interior."]},
  {name:"Menú rápido",description:"Poco tiempo de preparación",dish:"Ensalada de garbanzos",ingredients:["400 g de garbanzos cocidos","2 tomates","1 pepino","Aceite de oliva y limón"],steps:["Lava y escurre los garbanzos.","Corta el tomate y el pepino.","Mezcla los ingredientes.","Aliña y sirve."]},
  {name:"Menú económico",description:"Ingredientes cotidianos",dish:"Lentejas con verduras",ingredients:["200 g de lentejas secas","1 zanahoria","1 cebolla","1 pimiento","Tomate y aceite de oliva"],steps:["Lava las lentejas y corta las verduras.","Sofríe ligeramente las verduras.","Añade las lentejas y agua suficiente.","Cuece hasta que estén tiernas según su variedad."]},
  {name:"Menú familiar",description:"Para compartir",dish:"Pasta con tomate y verduras",ingredients:["200 g de pasta","2 tomates grandes","1 calabacín","1 cebolla","Albahaca y aceite de oliva"],steps:["Cuece la pasta siguiendo las instrucciones del envase.","Saltea cebolla y calabacín.","Añade tomate y cocina la salsa.","Mezcla con la pasta y sirve."]}
];
export default function DietMenuExplorer({diet, onPlan}){
 const [menu,setMenu]=useState(null);
 const [recipe,setRecipe]=useState(false);
 const selected=menus[menu];
 return <section className="dietMenuExplorer" aria-label="Menús y recetas de la dieta elegida">
  <h3>🍽️ Menús de {diet||"tu dieta"}</h3>
  <p>Elige una propuesta, consulta la receta y aprende a cocinarla paso a paso.</p>
  <p className="dietMenuCaution">Ejemplos generales de cocina. Comprueba ingredientes y adapta cada menú a tus alergias, necesidades y al estilo de dieta elegido antes de incorporarlo a tu plan. No son menús terapéuticos personalizados.</p>
  <div className="dietMenuChoices">{menus.map((m,i)=><button type="button" key={m.name} className={menu===i?"selected":""} onClick={()=>{setMenu(i);setRecipe(false)}}><b>{m.name}</b><small>{m.description}</small></button>)}</div>
  {selected&&<div className="dietMenuRecipe"><h4>{selected.dish}</h4><button type="button" onClick={()=>setRecipe(v=>!v)}>{recipe?"Ocultar receta":"👩‍🍳 Ver receta y cómo prepararla"}</button>
   {recipe&&<div><h5>Ingredientes (2 raciones aproximadas)</h5><ul>{selected.ingredients.map(x=><li key={x}>{x}</li>)}</ul><h5>Preparación paso a paso</h5><ol>{selected.steps.map(x=><li key={x}>{x}</li>)}</ol><p>Consulta cantidades y restricciones antes de guardar esta comida.</p></div>}
   <button type="button" onClick={onPlan}>📅 Abrir mi planificación</button>
  </div>}
 </section>;
}