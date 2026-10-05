"use client";
import {useMemo,useState} from "react";
import {DesignedFormArtwork} from "./DesignedScreens";
import {bmi,bmrEstimate,kcalEstimate,proteinRange,series} from "../lib/dietear-engine";
import {BODY_MEASUREMENTS,bodyHistory,decimalValue} from "../lib/body-measurements";
import MeasurementCalendar from "./MeasurementCalendar";

export default function HealthMetrics({profile,setProfile,history,register}){
  const [m,setM]=useState(()=>({date:new Date().toLocaleDateString("sv-SE"),weight:"",...Object.fromEntries(BODY_MEASUREMENTS.map(field=>[field.key,""]))}));
  const [notice,setNotice]=useState("");
  const [showNeeds,setShowNeeds]=useState(false);
  const calc=useMemo(()=>({
    bmi:bmi(decimalValue(m.weight)||profile.weight,profile.height),
    bmr:bmrEstimate({weight:decimalValue(m.weight)||profile.weight,height:profile.height,age:profile.age,sex:profile.sex}),
    kcal:kcalEstimate({weight:decimalValue(m.weight)||profile.weight,height:profile.height,age:profile.age,sex:profile.sex,activity:profile.activity,steps:profile.steps,workActivity:profile.workActivity,exerciseDays:profile.exerciseDays,exerciseMinutes:profile.exerciseMinutes}),
    protein:proteinRange(decimalValue(m.weight)||profile.weight)
  }),[m,profile]);
  const needs=useMemo(()=>{const w=decimalValue(m.weight)||Number(profile.weight);if(!w)return null;const kcal=calc.kcal||null;return {protein:calc.protein,fiber:kcal?Math.round(kcal/1000*14):null,carbs:kcal?[Math.round(kcal*.45/4),Math.round(kcal*.60/4)]:null,fats:kcal?[Math.round(kcal*.20/9),Math.round(kcal*.35/9)]:null,water:[Math.round(w*30/100)/10,Math.round(w*35/100)/10]}},[m.weight,profile.weight,calc]);
  const weights=series(history,"peso").slice(-8);
  const max=Math.max(...weights.map(x=>x.value),1),min=Math.min(...weights.map(x=>x.value),max);
  const inputs=[{key:"weight",type:"peso",label:"Peso",unit:"kg"},...BODY_MEASUREMENTS.map(field=>({...field,unit:"cm"}))];
  const filled=inputs.filter(field=>String(m[field.key]).trim()!=="");
  const valid=filled.length>0&&filled.every(field=>Number.isFinite(decimalValue(m[field.key]))&&decimalValue(m[field.key])>0);
  const validDate=/^\d{4}-\d{2}-\d{2}$/.test(m.date)&&Number.isFinite(new Date(m.date+"T12:00:00").getTime());
  const save=()=>{
    if(!valid||!validDate)return;
    const records=filled.map(field=>({...field,value:decimalValue(m[field.key])}));
    records.forEach(field=>register(field.type,field.value,field.label+" "+field.value+" "+field.unit,m.date));
    const latestWeight=history.filter(item=>item.type==="peso").sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
    const weight=records.find(field=>field.type==="peso");
    if(weight&&(!latestWeight||m.date>=new Date(latestWeight.date).toLocaleDateString("sv-SE")))setProfile(old=>({...old,weight:weight.value}));
    setM(old=>({...old,...Object.fromEntries(inputs.map(field=>[field.key,""]))}));
    setNotice(records.length+" "+(records.length===1?"registro guardado":"registros guardados")+" · "+new Date(m.date+"T12:00:00").toLocaleDateString("es-ES"));
  };
  const complete=profile.age&&profile.sex&&(m.weight||profile.weight)&&profile.height&&(profile.activity||profile.steps||profile.workActivity||profile.exerciseDays);
  const lastMeasurements=BODY_MEASUREMENTS.map(field=>({...field,last:bodyHistory(history,field.type).slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0]})).filter(field=>field.last);
  return <div className="metricStudio">
    <div className="metricHead"><div><small>📊 MOTOR COMÚN DIETEAR</small><h2>Peso, medidas y cálculos conectados</h2><p>El metabolismo basal se estima con Mifflin-St Jeor. El mantenimiento se afina con tu actividad diaria, pasos, trabajo y ejercicio cuando esos datos están disponibles.</p></div></div>
    <div className="metricForm metricPersonalForm">
      <label>Fecha del registro<input type="date" value={m.date} onChange={e=>setM({...m,date:e.target.value})}/></label>
      <label>Mujer / Hombre<select aria-label="Mujer / Hombre" value={profile.sex||""} onChange={e=>setProfile(old=>({...old,sex:e.target.value}))}><option value="">Seleccionar</option><option>Mujer</option><option>Hombre</option></select></label>
      <label>Edad (años)<input type="number" min="1" step="1" inputMode="numeric" value={profile.age||""} onChange={e=>setProfile(old=>({...old,age:e.target.value}))}/></label>
      <label>Altura (cm)<input type="number" min="0" step="0.1" inputMode="decimal" value={profile.height||""} onChange={e=>setProfile(old=>({...old,height:e.target.value}))}/></label>
      <label>Peso actual (kg)<input inputMode="decimal" value={m.weight} onChange={e=>setM({...m,weight:e.target.value})} placeholder={profile.weight?"Último: "+profile.weight:"Ej.: 72,5"}/></label>
    </div>
    <p className="measurementHelp">Edad, sexo y altura están conectados con Mi ficha. Para registrar medidas no necesitas introducir un peso nuevo. Todos los contornos se indican en centímetros.</p>
    <div className="bodyMeasureForm">{BODY_MEASUREMENTS.map(field=><label key={field.key}><b>{field.label} (cm)</b><input aria-label={field.label+" (cm)"} inputMode="decimal" value={m[field.key]} placeholder="Opcional" onChange={e=>setM({...m,[field.key]:e.target.value})}/><small>{field.hint}</small></label>)}</div>
    <div className="measurementSave"><button className="saveMetricButton" onClick={save} disabled={!valid||!validDate}>Guardar registros →</button><small>Mantén el mismo punto de medida para poder comparar tus registros.</small></div>
    {filled.length>0&&!valid&&<p role="alert">Revisa las medidas: introduce números mayores que cero. Puedes usar coma o punto decimal.</p>}
    {notice&&<p className="measurementNotice" role="status">{notice}</p>}
    {lastMeasurements.length>0&&<section className="lastMeasurements"><h3>Últimas medidas guardadas</h3><div>{lastMeasurements.map(field=><article key={field.key}><b>{field.label}</b><strong>{field.last.value} cm</strong><small>{new Date(field.last.date).toLocaleDateString("es-ES")}</small></article>)}</div></section>}
    <MeasurementCalendar history={history} selectedDate={m.date} onDate={date=>setM(old=>({...old,date}))}/>
    {!complete&&<p className="helper">Para estimar energía necesitamos sexo para el cálculo fisiológico, edad, peso, altura y actividad. Pasos, trabajo y ejercicio semanal permiten afinar el mantenimiento.</p>}
    <div className="metricCards">
      <article><DesignedFormArtwork file="visual-weight.png"/><small>IMC ORIENTATIVO</small><b>{calc.bmi??"—"}</b><span>Dato descriptivo, no diagnóstico</span></article>
      <article><DesignedFormArtwork file="hd-ejercicio.png"/><small>🔥 METABOLISMO BASAL</small><b>{calc.bmr?calc.bmr+" kcal/día":"—"}</b><span>Energía estimada en reposo</span></article>
      <article><DesignedFormArtwork file="visual-water.png"/><small>⚡ MANTENIMIENTO TEÓRICO ESTIMADO</small><b>{calc.kcal?"≈ "+calc.kcal+" kcal/día":"—"}</b><span>No es gasto medido ni una recomendación de ingesta. Se estima con tus datos y actividad registrada.</span></article>
      <article><DesignedFormArtwork file="hd-complete.png"/><small>PROTEÍNA ORIENTATIVA</small><b>{calc.protein?calc.protein[0]+"–"+calc.protein[1]+" g":"—"}</b><span>Rango general, no prescripción</span></article>
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
