"use client";
import {useState} from "react";
import {recipes} from "../lib/recipes";
import RecipePhoto from "./RecipePhoto";

const notes={
 "Equilibrada":["Variedad de alimentos, cantidades flexibles y hábitos sostenibles.","Combina verduras, proteína, hidratos de calidad y grasas saludables."],
 "Mediterránea":["Prioriza hortalizas, legumbres, fruta, cereales integrales y aceite de oliva.","Alterna pescados, huevos y otras proteínas según tus preferencias."],
 "Vegana":["Excluye todos los alimentos de origen animal.","La vitamina B12 necesita una fuente fiable mediante alimentos fortificados o suplemento adecuado."],
 "Vegetariana":["Predominan los alimentos vegetales; revisa los ingredientes de cada receta.","Vigila la variedad de proteínas, hierro y vitamina B12 según el patrón elegido."],
 "Sin gluten":["Elige productos certificados sin gluten y evita la contaminación cruzada.","La avena solo es apta cuando está certificada y es tolerada."],
 "Sin lactosa":["Comprueba las etiquetas de lácteos, salsas y productos preparados.","Sin lactosa no significa necesariamente sin proteína de leche."],
 "Hiposódica":["Reduce la sal añadida y compara el sodio de los productos envasados.","No elimines el sodio de forma extrema sin indicación clínica."],
 "Musulmana / Halal":["Comprueba la certificación halal de carnes, gelatinas y productos preparados.","Evita cerdo y alcohol en ingredientes y preparaciones."],
 "Diabética":["Organiza los hidratos de carbono y las raciones de acuerdo con tu tratamiento.","No cambies medicación ni insulina por sugerencias de la aplicación."],
 "Hipocalórica":["Prioriza alimentos saciantes y comidas completas, sin restricciones extremas.","Las necesidades energéticas son individuales; evita objetivos insuficientes."],
 "Hipercalórica":["Añade energía de forma gradual con alimentos nutritivos.","Adapta las raciones a tu situación y actividad."],
 "Alta en proteína":["Reparte fuentes proteicas variadas entre las comidas.","Si tienes enfermedad renal, consulta la cantidad adecuada."],
 "Ganar músculo":["Combina una alimentación suficiente con entrenamiento de fuerza.","El descanso y la progresión del ejercicio también importan."],
 "Rica en fibra":["Incluye legumbres, verduras, fruta y cereales integrales de forma progresiva.","Acompaña los cambios con hidratación adecuada."],
 "Baja en fibra":["Suele ser una pauta temporal que requiere motivo y duración claros.","Consulta qué alimentos y texturas te han indicado."],
 "Baja en residuos":["Es una pauta clínica específica; no debe improvisarse como dieta habitual.","Sigue la lista de alimentos y duración indicadas por tu equipo sanitario."],
 "Pérdida de grasa saludable":["Busca cambios sostenibles, no soluciones milagro.","Combina alimentación suficiente, actividad, sueño y seguimiento realista."],
 "Por puntos (equilibrada)":["Organiza elecciones mediante puntos, sin convertirlos en una medida médica.","Comprueba cantidades y valores del sistema antes de registrar puntos."],
 "Ayuno intermitente":["Es una forma de organizar horarios, no una garantía de pérdida de peso.","No es adecuado para todas las personas, especialmente con ciertos tratamientos."],
 "Baja en grasas saturadas":["Prioriza aceite de oliva, frutos secos cuando sean adecuados y pescados.","Modera productos ricos en grasas saturadas según tus necesidades."],
 "Sin alimento X":["Personaliza los alimentos excluidos y revisa las etiquetas.","Ante alergias, evita también trazas y contaminación cruzada cuando corresponda."]
};
const has=(text,pattern)=>pattern.test(text);
export function suggestedForStyle(recipe,style){
 const ingredients=recipe.ingredients.map(([name])=>name).join(" ").toLowerCase();
 const title=recipe.name.toLowerCase();
 const all=ingredients+" "+title;
 if(style==="Vegana")return !has(all,/pollo|pavo|carne|ternera|cerdo|jamón|atun|atún|salmón|merluza|pescado|gamba|marisco|huevo|queso|leche|yogur|ricota|miel|mantequilla/);
 if(style==="Vegetariana")return !has(all,/pollo|pavo|carne|ternera|cerdo|jamón|atun|atún|salmón|merluza|pescado|gamba|marisco/);
 if(style==="Sin lactosa")return !has(all,/leche|yogur|queso|ricota|nata|mantequilla/);
 if(style==="Sin gluten")return !has(all,/pan|tostada|pasta|trigo|cuscús|couscous|cebada|centeno|avena|galleta|harina|bulgur/);
 if(style==="Musulmana / Halal")return !has(all,/cerdo|jamón|bacon|panceta|vino|cerveza|licor|gelatina|pollo|pavo|ternera|carne/);
 if(style==="Rica en fibra")return has(all,/garbanzo|lenteja|alubia|avena|integral|fruta|verdura|espinaca|brócoli|manzana/);
 if(style==="Baja en fibra"||style==="Baja en residuos")return false;
 if(style==="Alta en proteína"||style==="Ganar músculo")return has(all,/pollo|pavo|huevo|pescado|atún|atun|salmón|yogur|garbanzo|lenteja|queso/);
 if(style==="Baja en grasas saturadas")return !has(all,/nata|mantequilla|bacon|panceta|chorizo/);
 return true;
}
export default function DietStyleGuide({style,onClose,onChoose,onAsk}){
 const [selected,setSelected]=useState(null),[search,setSearch]=useState("");
 const [view,setView]=useState("recipes");
 const details=notes[style]||notes.Equilibrada;
 const list=recipes.filter(r=>suggestedForStyle(r,style)&&r.name.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es")));
 const cautious=["Sin gluten","Sin lactosa","Musulmana / Halal","Diabética","Hiposódica","Baja en fibra","Baja en residuos","Sin alimento X"].includes(style);
 return <section className="dietStyleGuide" aria-label={"Contenido de la dieta "+style}>
  <header className="dietStyleGuideHeader"><div><small>DIETEAR · TU GUÍA DE ALIMENTACIÓN</small><h3>{style}</h3><p>{details[0]}</p></div><button type="button" onClick={onClose}>✕ Cerrar guía</button></header>
  <div className="dietStyleGuideTabs"><button type="button" aria-pressed={view==="recipes"} onClick={()=>setView("recipes")}>🍽️ Recetario ({list.length})</button><button type="button" aria-pressed={view==="advice"} onClick={()=>setView("advice")}>💡 Explicaciones y consejos</button></div>
  {view==="advice"?<div className="dietStyleGuideAdvice"><h4>¿Cómo funciona esta alimentación?</h4><p>{details[0]}</p><h4>Recomendaciones</h4><p>{details[1]}</p><h4>¿Necesitas ayuda?</h4><p>Las recetas son propuestas orientativas. Comprueba ingredientes, etiquetas, alergias, raciones y las indicaciones de tu profesional sanitario.</p><button type="button" onClick={()=>onAsk("Explícame de forma sencilla la alimentación "+style+", sus precauciones y cómo organizar un menú según mis preferencias y alergias.")}>💬 Preguntar a DIETEAR</button></div>:<><p className="dietStyleGuideNotice">{cautious?"Selección preliminar: no certifica que los platos sean adecuados para una condición médica, alergia o requisito religioso. Comprueba cada ingrediente y etiqueta.":"Recetas orientativas del catálogo actual. Puedes abrir sus ingredientes y preparación y añadirlas a tu plan."}</p><label className="dietStyleGuideSearch">Buscar en este recetario<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar un plato…"/></label><div className="dietStyleGuideRecipes">{list.map(r=><article key={r.id} className="dietStyleGuideRecipe"><RecipePhoto recipe={r}/><h4>{r.name}</h4><p>⏱️ {r.minutes} min · {r.ingredients.length} ingredientes</p><div className="dietStyleGuideActions"><button type="button" onClick={()=>setSelected(selected===r.id?null:r.id)}>{selected===r.id?"Ocultar":"Ingredientes y preparación"}</button><button type="button" onClick={()=>onChoose(r.name,r.mealTypes[0])}>Añadir al plan →</button></div>{selected===r.id&&<div className="dietStyleGuideSteps"><h5>Ingredientes (base orientativa)</h5><ul>{r.ingredients.map(([name,qty,unit])=><li key={name}>{name}: {qty} {unit}</li>)}</ul><h5>Preparación</h5><ol>{r.steps.map((step,i)=><li key={i}>{step}</li>)}</ol></div>}</article>)}</div>{!list.length&&<p>No hay recetas verificadas para mostrar con este filtro. Consulta las recomendaciones y personaliza tu alimentación con DIETEAR.</p>}</>}
 </section>;
}
