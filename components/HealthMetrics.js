"use client";
import {useMemo,useState} from "react";
import {bmi,bmrEstimate,kcalEstimate,proteinRange,series} from "../lib/dietear-engine";

export default function HealthMetrics({profile,setProfile,history,register}){
  const [m,setM]=useState({weight:"",height:profile.height||"",waist:""});
  const [showNeeds,setShowNeeds]=useState(false);
  const calc=useMemo(()=>({
    bmi:bmi(m.weight||profile.weight,m.height||profile.height),
    bmr:bmrEstimate({weight:m.weight||profile.weight,height:m.height||profile.height,age:profile.age,sex:profile.sex}),
    kcal:kcalEstimate({weight:m.weight||profile.weight,height:m.height||profile.height,age:profile.age,sex:profile.sex,activity:profile.activity}),
    protein:proteinRange(m.weight||profile.weight)
  }),[m,profile]);
  const needs=useMemo(()=>{const w=Number(m.weight||profile.weight);if(!w)return null;const kcal=calc.kcal||null;return {protein:calc.protein,fiber:kcal?Math.round(kcal/1000*14):null,carbs:kcal?[Math.round(kcal*.45/4),Math.round(kcal*.60/4)]:null,fats:kcal?[Math.round(kcal*.20/9),Math.round(kcal*.35/9)]:null,water:[Math.round(w*30/100)/10,Math.round(w*35/100)/10]}},[m.weight,profile.weight,calc]);
  const weights=series(history,"peso").slice(-8);
  const max=Math.max(...weights.map(x=>x.value),1),min=Math.min(...weights.map(x=>x.value),max);
  const validWeight=Number.isFinite(Number(m.weight))&&Number(m.weight)>0,validWaist=Number.isFinite(Number(m.waist))&&Number(m.waist)>0;
  const save=()=>{if(!validWeight&&!validWaist)return;if(validWeight){setProfile({...profile,weight:Number(m.weight),height:Number(m.height)||profile.height});register("peso",Number(m.weight),"Peso registrado")}if(validWaist)register("cintura",Number(m.waist),"Cintura registrada");setM(x=>({...x,weight:"",waist:""}))};
  const complete=profile.age&&profile.sex&&profile.activity&&(m.weight||profile.weight)&&(m.height||profile.height);
  return <div className="metricStudio">
    <div className="metricHead"><div><small>📊 MOTOR COMÚN DIETEAR</small><h2>Peso, medidas y cálculos conectados</h2><p>La energía se calcula con Mifflin-St Jeor y separa metabolismo basal de gasto diario.</p></div></div>
    <div className="metricForm">
      <label>Peso actual (kg)<input type="number" min="0" inputMode="decimal" value={m.weight} onChange={e=>setM({...m,weight:e.target.value})}/></label>
      <label>Altura (cm)<input type="number" min="0" inputMode="decimal" value={m.height} onChange={e=>setM({...m,height:e.target.value})}/></label>
      <label>Cintura (cm)<input type="number" min="0" inputMode="decimal" value={m.waist} onChange={e=>setM({...m,waist:e.target.value})}/></label>
      <button onClick={save} disabled={!validWeight&&!validWaist}>Guardar registro</button>
    </div>
    {!complete&&<p className="helper">Para calcular energía necesitamos: sexo (hombre/mujer), edad, peso, altura y nivel de actividad. Completa los datos que falten en tu ficha.</p>}
    <div className="metricCards">
      <article><small>IMC ORIENTATIVO</small><b>{calc.bmi??"—"}</b><span>Dato descriptivo, no diagnóstico</span></article>
      <article><small>🔥 METABOLISMO BASAL</small><b>{calc.bmr?calc.bmr+" kcal/día":"—"}</b><span>Energía estimada en reposo</span></article>
      <article><small>⚡ GASTO DIARIO TOTAL</small><b>{calc.kcal?calc.kcal+" kcal/día":"—"}</b><span>Metabolismo basal + actividad indicada</span></article>
      <article><small>PROTEÍNA ORIENTATIVA</small><b>{calc.protein?calc.protein[0]+"–"+calc.protein[1]+" g":"—"}</b><span>Rango general, no prescripción</span></article>
    </div>
    <div className="needsPanel">
      <button type="button" onClick={()=>setShowNeeds(x=>!x)}>🧮 {showNeeds?"Ocultar necesidades":"Calcular mis necesidades nutricionales"}</button>
      {showNeeds&&<div className="metricCards">
        <article><small>PROTEÍNA</small><b>{needs?.protein?needs.protein[0]+"–"+needs.protein[1]+" g/día":"—"}</b><span>Rango general según peso</span></article>
        <article><small>FIBRA</small><b>{needs?.fiber?needs.fiber+" g/día":"—"}</b><span>Orientación general ligada a energía</span></article>
        <article><small>HIDRATOS</small><b>{needs?.carbs?needs.carbs[0]+"–"+needs.carbs[1]+" g/día":"—"}</b><span>Rango orientativo de energía diaria</span></article>
        <article><small>GRASAS</small><b>{needs?.fats?needs.fats[0]+"–"+needs.fats[1]+" g/día":"—"}</b><span>Rango orientativo de energía diaria</span></article>
        <article><small>HIDRATACIÓN</small><b>{needs?.water?needs.water[0]+"–"+needs.water[1]+" L/día":"—"}</b><span>Estimación base; calor, ejercicio y salud pueden cambiarla</span></article>
        <article><small>VITAMINAS Y MINERALES</small><b>Variedad primero</b><span>Prioriza fruta, verdura, legumbres, cereales integrales, proteínas variadas, frutos secos y alimentos ricos en calcio.</span></article>
      </div>}
      {showNeeds&&<p className="helper">Cálculos orientativos para adultos. Embarazo, lactancia, enfermedad renal, hepática, cardiaca, diabetes, medicación u otras situaciones pueden requerir objetivos diferentes.</p>}
    </div>
    {weights.length>1&&<div className="miniTrend"><b>Evolución reciente</b><div>{weights.map((x,i)=>{const pct=max===min?50:10+((x.value-min)/(max-min))*80;return <span key={i} title={x.value+" kg"} style={{height:pct+"%"}}/>})}</div><small>{weights[0].value} kg → {weights[weights.length-1].value} kg</small></div>}
  </div>;
}