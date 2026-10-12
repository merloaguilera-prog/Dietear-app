"use client";
import {useEffect,useRef,useState} from "react";

const fits={compatible:"Compatible",con_ajustes:"Con ajustes",no_adecuado:"No adecuado",consultar:"Consultar según tu caso"};
const format=value=>new Intl.NumberFormat("es-ES",{maximumFractionDigits:2}).format(value);
const RECENT_KEY="dietear-food-analysis-recents";

export default function FoodAnalysis({profile,history,careRecords,onAsk,onPlan}){
  const [query,setQuery]=useState("");
  const [portion,setPortion]=useState("100");
  const [analysis,setAnalysis]=useState(null);
  const [loading,setLoading]=useState(false);
  const [listening,setListening]=useState(false);
  const [recents,setRecents]=useState([]);
  const [error,setError]=useState("");
  const controller=useRef();
  const recognition=useRef();

  useEffect(()=>{
    try{setRecents(JSON.parse(localStorage.getItem(RECENT_KEY)||"[]").filter(Boolean).slice(0,5));}catch{setRecents([]);}
    return ()=>{
      controller.current?.abort();
      recognition.current?.abort?.();
    };
  },[]);

  const amount=Number(portion.replace(",","."));
  const valid=Number.isFinite(amount)&&amount>0;

  function remember(value){
    const next=[value,...recents.filter(item=>item.toLowerCase()!==value.toLowerCase())].slice(0,5);
    setRecents(next);
    try{localStorage.setItem(RECENT_KEY,JSON.stringify(next));}catch{/* El análisis sigue funcionando si el almacenamiento está bloqueado. */}
  }

  function dictate(){
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition){
      setError("El dictado no está disponible en este navegador. Puedes escribir el alimento.");
      return;
    }
    if(listening){
      recognition.current?.stop?.();
      return;
    }
    const active=new SpeechRecognition();
    recognition.current=active;
    active.lang="es-ES";
    active.interimResults=false;
    active.maxAlternatives=1;
    active.onstart=()=>{setListening(true);setError("");};
    active.onresult=event=>{
      const text=event.results?.[0]?.[0]?.transcript?.trim();
      if(text)setQuery(current=>current?current+" "+text:text);
    };
    active.onerror=event=>{
      if(event.error!=="aborted")setError("No he podido entender el dictado. Inténtalo otra vez o escríbelo.");
    };
    active.onend=()=>{setListening(false);recognition.current=null;};
    try{active.start();}catch{
      recognition.current=null;
      setListening(false);
      setError("No se pudo iniciar el micrófono. Revisa el permiso del navegador e inténtalo otra vez.");
    }
  }

  async function analyze(event){
    event.preventDefault();
    if(!query.trim()||!valid){
      setError("Escribe un alimento y una cantidad mayor que cero.");
      return;
    }
    controller.current?.abort();
    const current=new AbortController();
    controller.current=current;
    setLoading(true);
    setError("");
    setAnalysis(null);
    try{
      const response=await fetch("/api/food-analysis",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({query,context:{profile,history:history.slice(-60),careRecords:careRecords.slice(0,20)}}),
        signal:current.signal
      });
      const data=await response.json();
      if(!response.ok)throw Error(data.error||"No se pudo analizar.");
      setAnalysis(data.analysis);
      remember(query.trim());
    }catch(e){
      if(e.name!=="AbortError")setError(e.message);
    }finally{
      if(controller.current===current)setLoading(false);
    }
  }

  const rows=items=><table>
    <thead><tr><th>Nutriente</th><th>Por 100 {analysis.basis_unit}</th><th>Tu cantidad ({portion} {analysis.basis_unit})</th><th>Fuente</th></tr></thead>
    <tbody>{items.map(n=><tr key={n.key}><th>{n.label}</th><td>{n.value_per_100===null?"Sin dato":format(n.value_per_100)+" "+n.unit}</td><td>{n.value_per_100===null||!valid?"Sin dato":format(n.value_per_100*amount/100)+" "+n.unit}</td><td>{n.source_url?<a href={n.source_url} target="_blank" rel="noopener noreferrer">Consultar</a>:"—"}</td></tr>)}</tbody>
  </table>;

  return <div className="foodAnalysis">
    <p>Consulta composición, usos y cómo encaja en distintos estilos de alimentación. Puedes escribir o dictar el alimento; indica la marca para consultar su etiqueta.</p>
    <form onSubmit={analyze}>
      <label>Alimento y marca (si la conoces)
        <span style={{display:"flex",gap:8,alignItems:"stretch"}}>
          <input aria-label="Alimento para analizar" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej.: yogur griego natural, marca…" required maxLength={500}/>
          <button type="button" onClick={dictate} aria-pressed={listening} aria-label={listening?"Detener dictado":"Dictar alimento"}>{listening?"⏹️ Parar":"🎙️ Dictar"}</button>
        </span>
      </label>
      <label>Cantidad en {analysis?.basis_unit||"g o ml"}
        <input aria-label="Cantidad del alimento" inputMode="decimal" value={portion} onChange={e=>setPortion(e.target.value)}/>
      </label>
      <div aria-label="Cantidades rápidas" style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {["50","100","150","250"].map(value=><button type="button" key={value} onClick={()=>setPortion(value)} aria-pressed={portion===value}>{value} g/ml</button>)}
      </div>
      <button disabled={loading}>{loading?"Consultando fuentes…":"Analizar →"}</button>
    </form>
    {recents.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}><small style={{width:"100%"}}>CONSULTAS RECIENTES</small>{recents.map(item=><button type="button" key={item} onClick={()=>setQuery(item)}>{item}</button>)}</div>}
    {listening&&<p role="status">🎙️ Escuchando… di el alimento, la marca y la preparación.</p>}
    {error&&<p role="alert">{error}</p>}
    {!valid&&<p role="alert">La cantidad debe ser mayor que cero.</p>}
    {analysis&&<article className="foodAnalysisResult">
      <header><small>{analysis.data_quality==="etiqueta"?"ETIQUETA DEL PRODUCTO":analysis.data_quality==="referencia_general"?"REFERENCIA GENERAL · PUEDE VARIAR":"DATOS INSUFICIENTES"}</small><h3>{analysis.food}</h3><p>{analysis.description}</p><p>{analysis.basis_note}</p></header>
      <section><h4>Valores nutricionales</h4><div className="nutritionTable">{rows(analysis.nutrients.filter(n=>!["monounsaturated_fat","polyunsaturated_fat","cholesterol","calcium","potassium","iron","vitamin_d","vitamin_b12"].includes(n.key)))}</div><details><summary>Más grasas, minerales y vitaminas</summary><div className="nutritionTable">{rows(analysis.nutrients.filter(n=>["monounsaturated_fat","polyunsaturated_fat","cholesterol","calcium","potassium","iron","vitamin_d","vitamin_b12"].includes(n.key)))}</div></details><p>“Sin dato” significa que la fuente consultada no permite confirmar ese valor.</p></section>
      <section><h4>¿Cómo encaja en tu alimentación?</h4><p>{analysis.assessment}</p><ul>{analysis.considerations.map((x,i)=><li key={i}>{x}</li>)}</ul><div className="foodDietGrid">{analysis.diets.map((d,i)=><article key={i}><h4>{d.name}</h4><b>{fits[d.fit]}</b><p>{d.reason}</p></article>)}</div></section>
      <section><h4>Ideas para utilizarlo</h4><div className="foodUseGrid">{analysis.uses.map((u,i)=><article key={i}><h4>{u.title}</h4><p>{u.description}</p></article>)}</div><p><b>Alergias y etiquetas: </b>{analysis.allergens}</p></section>
      {analysis.missing_data.length>0&&<section><h4>Para afinar esta ficha</h4><ul>{analysis.missing_data.map((x,i)=><li key={i}>{x}</li>)}</ul></section>}
      <section><h4>Fuentes consultadas</h4><ul>{analysis.sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul></section>
      <div className="branchActions"><button onClick={()=>onAsk(`Explícame cómo utilizar ${analysis.food} según mi perfil y los registros guardados, incluyendo cantidad, frecuencia, restricciones y qué debo consultar. Ficha de referencia: ${JSON.stringify(analysis)}`)}>Consultar con mis datos →</button><button onClick={onPlan}>Abrir mi plan →</button></div>
    </article>}
  </div>;
}
