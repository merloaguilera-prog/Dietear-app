"use client";
import {writeLocalJson} from "../lib/client-runtime";
import {useEffect,useMemo,useState} from "react";
import {recipes} from "../lib/recipes";

const norm=s=>String(s||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const matches=(ingredient,available)=>{
  const wanted=norm(ingredient);
  const have=norm(available);
  return !!have&&(wanted===have||wanted.includes(have)||have.includes(wanted));
};
const dateKey=()=>new Date().toLocaleDateString("sv-SE");
const daysUntil=value=>{
  if(!value)return null;
  const today=new Date(dateKey()+"T12:00:00");
  const target=new Date(value+"T12:00:00");
  return Math.ceil((target-today)/86400000);
};
const expiryLabel=days=>{
  if(days===null)return "Añadir fecha";
  if(days<0)return "Caducado";
  if(days===0)return "Consumir hoy";
  if(days===1)return "Consumir mañana";
  return days<=3?`Consumir en ${days} días`:`Quedan ${days} días`;
};
const urgency=days=>days===null?99:days<0?-10:days;

export default function FridgeIdeas({fridge,onChoose}){
  const [dates,setDates]=useState({});
  const [ready,setReady]=useState(false);
  const [storageSaved,setStorageSaved]=useState(true);

  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem("dietear-expiry-dates")||"{}");
      setDates(saved&&typeof saved==="object"?saved:{});
    }catch{setDates({});}
    setReady(true);
  },[]);

  const updateDate=(name,value)=>{
    const next={...dates,[norm(name)]:value};
    if(!value)delete next[norm(name)];
    setDates(next);
    setStorageSaved(writeLocalJson("dietear-expiry-dates",next));
  };

  const pantry=useMemo(()=>fridge.map((item,index)=>{
    const date=dates[norm(item.name)]||"";
    const days=daysUntil(date);
    return {...item,index,date,days};
  }).sort((a,b)=>urgency(a.days)-urgency(b.days)),[fridge,dates]);

  if(!fridge.length)return null;

  const expiring=pantry.filter(item=>item.days!==null&&item.days>=0&&item.days<=3);
  const expired=pantry.filter(item=>item.days!==null&&item.days<0);
  const ranked=recipes.map(recipe=>{
    const present=recipe.ingredients
      .map(([name])=>name)
      .filter(name=>fridge.some(item=>matches(name,item.name)));
    const missing=recipe.ingredients
      .map(([name])=>name)
      .filter(name=>!fridge.some(item=>matches(name,item.name)));
    const rescueHits=present.filter(name=>expiring.some(item=>matches(name,item.name))).length;
    return {...recipe,hits:present.length,missing,rescueHits};
  }).sort((a,b)=>b.rescueHits-a.rescueHits||b.hits-a.hits||a.missing.length-b.missing.length);
  const hasMatches=ranked.some(recipe=>recipe.hits>0);

  return <div className="fridgeIdeas">
    {!storageSaved&&<p role="alert">No se han podido guardar las últimas fechas. Conserva esta pantalla abierta y revisa el espacio o los permisos de almacenamiento.</p>}
    <div>
      <small>🧊 NEVERA INTELIGENTE</small>
      <h3>{expiring.length?"Primero, aprovecha lo que caduca antes":hasMatches?"Recetas que aprovechan tu nevera":"Aún no hay recetas con esos ingredientes"}</h3>
      <p>{expiring.length
        ?`Tienes ${expiring.length} alimento${expiring.length===1?"":"s"} para consumir en los próximos 3 días. Las recetas se ordenan para ayudarte a reducir desperdicio.`
        :hasMatches
          ?"Estas ideas aprovechan parte de lo que has registrado. Añade fechas para priorizar automáticamente."
          :"Añade más alimentos o consulta ideas que requieren compra."}</p>
      {expired.length>0&&<p role="alert">⚠️ Hay {expired.length} alimento{expired.length===1?"":"s"} con fecha vencida. Comprueba su estado y la indicación “caducidad” o “consumo preferente” antes de decidir.</p>}
    </div>

    <div style={{display:"grid",gap:10,margin:"16px 0"}}>
      <b>Fechas y prioridad de consumo</b>
      {pantry.map(item=>{
        const status=expiryLabel(item.days);
        const urgent=item.days!==null&&item.days<=3;
        return <div key={item.index+"-"+item.name} style={{display:"grid",gridTemplateColumns:"minmax(120px,1fr) auto auto",gap:10,alignItems:"center",padding:"10px 12px",border:"1px solid "+(urgent?"#f0b8a8":"#dce9df"),borderRadius:14,background:urgent?"#fff7f3":"#fbfefb"}}>
          <span><b>{item.name}</b><small style={{display:"block",color:urgent?"#a13d27":"#547064"}}>{status}</small></span>
          <label style={{fontSize:12,color:"#547064"}}>Consumir antes de</label>
          <input aria-label={`Fecha para ${item.name}`} type="date" min={dateKey()} value={item.date} onChange={event=>updateDate(item.name,event.target.value)} style={{padding:"7px 9px",border:"1px solid #bfd4c5",borderRadius:10,background:"white"}}/>
        </div>;
      })}
    </div>

    <div className="fridgeIdeaGrid">
      {ranked.filter(recipe=>recipe.hits>0).slice(0,3).map(recipe=><article key={recipe.id}>
        <span>{recipe.emoji}</span>
        <div>
          <b>{recipe.name}</b>
          {recipe.rescueHits>0&&<small>♻️ Aprovecha {recipe.rescueHits} ingrediente{recipe.rescueHits===1?"":"s"} próximo{recipe.rescueHits===1?"":"s"} a caducar</small>}
          <small>{recipe.hits} de {recipe.ingredients.length} ingredientes en tu nevera</small>
          {recipe.missing.length>0&&<small>Faltan: {recipe.missing.join(", ")}</small>}
        </div>
        <button onClick={()=>onChoose(recipe.name)}>Añadir al plan →</button>
      </article>)}
    </div>
    <p>{ready?"Las fechas se guardan en este dispositivo. ":""}Revisa siempre el alimento, el etiquetado y tus restricciones antes de elegir una receta.</p>
  </div>;
}
