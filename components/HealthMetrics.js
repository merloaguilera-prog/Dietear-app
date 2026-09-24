"use client";
import {useMemo,useState} from "react";
import {bmi,kcalEstimate,proteinRange,series} from "../lib/dietear-engine";

export default function HealthMetrics({profile,setProfile,history,register}){
  const [m,setM]=useState({weight:"",height:profile.height||"",waist:""});
  const calc=useMemo(()=>({
    bmi:bmi(m.weight||profile.weight,m.height||profile.height),
    kcal:kcalEstimate({weight:m.weight||profile.weight,height:m.height||profile.height,age:profile.age,sex:profile.sex,activity:profile.activity}),
    protein:proteinRange(m.weight||profile.weight)
  }),[m,profile]);
  const weights=series(history,"peso").slice(-8);
  const max=Math.max(...weights.map(x=>x.value),1);
  const min=Math.min(...weights.map(x=>x.value),max);
  const validWeight=Number.isFinite(Number(m.weight))&&Number(m.weight)>0;
  const validWaist=Number.isFinite(Number(m.waist))&&Number(m.waist)>0;
  const save=()=>{
    if(!validWeight&&!validWaist)return;
    if(validWeight){
      setProfile({...profile,weight:Number(m.weight),height:Number(m.height)||profile.height});
      register("peso",Number(m.weight),"Peso registrado");
    }
    if(validWaist)register("cintura",Number(m.waist),"Cintura registrada");
    setM(x=>({...x,weight:"",waist:""}));
  };
  return <div className="metricStudio">
    <div className="metricHead"><div><small>📊 MOTOR COMÚN DIETEAR</small><h2>Peso, medidas y cálculos conectados</h2><p>Registra el peso y la cintura juntos o por separado. Los datos aparecerán en tu evolución.</p></div></div>
    <div className="metricForm">
      <label>Peso actual (kg)<input type="number" min="0" inputMode="decimal" value={m.weight} onChange={e=>setM({...m,weight:e.target.value})}/></label>
      <label>Altura (cm)<input type="number" min="0" inputMode="decimal" value={m.height} onChange={e=>setM({...m,height:e.target.value})}/></label>
      <label>Cintura (cm)<input type="number" min="0" inputMode="decimal" value={m.waist} onChange={e=>setM({...m,waist:e.target.value})}/></label>
      <button onClick={save} disabled={!validWeight&&!validWaist}>Guardar registro</button>
    </div>
    <div className="metricCards">
      <article><small>IMC ORIENTATIVO</small><b>{calc.bmi??"—"}</b><span>Dato descriptivo, no diagnóstico</span></article>
      <article><small>ENERGÍA ESTIMADA</small><b>{calc.kcal?calc.kcal+" kcal":"—"}</b><span>Estimación; se ajustará al contexto</span></article>
      <article><small>PROTEÍNA ORIENTATIVA</small><b>{calc.protein?calc.protein[0]+"–"+calc.protein[1]+" g":"—"}</b><span>Rango general, no prescripción</span></article>
    </div>
    {weights.length>1&&<div className="miniTrend"><b>Evolución reciente</b><div>{weights.map((x,i)=>{const pct=max===min?50:10+((x.value-min)/(max-min))*80;return <span key={i} title={x.value+" kg"} style={{height:pct+"%"}}/>})}</div><small>{weights[0].value} kg → {weights[weights.length-1].value} kg</small></div>}
  </div>;
}
