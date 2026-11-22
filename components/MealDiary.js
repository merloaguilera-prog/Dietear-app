"use client";
import {useEffect, useRef, useState} from 'react';
import {createMealRecord, DIARY_NUTRIENTS, localDay, mealRecords} from '../lib/meal-diary.mjs';
import {MAX_PHOTO_BYTES} from '../lib/meal-photo.mjs';
import {MEAL_FIELDS} from '../lib/week-plan';
import DailyNutrition from './DailyNutrition';
const empty = () => ({name:'',mealType:'lunch',servings:'1',nutrients:{},source:'manual',notes:'',confirmed:false});
const newId = () => 'meal:'+(crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
// Redraw before upload to remove EXIF metadata and limit the transmitted image.
function photoData(file) {return new Promise((resolve,reject)=>{
 const image=new Image(),url=URL.createObjectURL(file);
 const fail=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo leer la foto. Prueba con otra imagen o completa el diario manualmente.'));};
 image.onerror=fail;
 image.onload=()=>{try{
  if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>40000000){fail();return;}
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  const result=canvas.toDataURL('image/jpeg',.88);URL.revokeObjectURL(url);resolve(result);
 }catch{fail();}};
 image.src=url;
});}
export default function MealDiary({history=[], onSave, onDelete}) {
  const [draft,setDraft]=useState(empty), [day,setDay]=useState(''), [file,setFile]=useState(null), [preview,setPreview]=useState('');
  const [consent,setConsent]=useState(false), [proposal,setProposal]=useState(null), [loading,setLoading]=useState(false);
  const [error,setError]=useState(''), [message,setMessage]=useState('');
  const controller=useRef(null), input=useRef(null), recordId=useRef(null), submitted=useRef(false);
  useEffect(()=>{setDay(localDay(new Date()));recordId.current=newId();return()=>{controller.current?.abort();controller.current=null;};},[]);
  useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
  function update(patch) {submitted.current=false;setDraft(current=>({...current,...patch,confirmed:false}));setMessage('');}
  function clearPhoto() {controller.current?.abort();controller.current=null;setFile(null);setProposal(null);setConsent(false);setLoading(false);if(input.current)input.current.value='';}
  function selectPhoto(event) {
    const selected=event.target.files?.[0];clearPhoto();setError('');
    if(!selected)return;
    if(!['image/jpeg','image/png','image/webp'].includes(selected.type)||selected.size>MAX_PHOTO_BYTES){setError('Elige una foto JPG, PNG o WebP de hasta 5 MB.');return;}
    setFile(selected);
  }
  async function analyzePhoto() {
    if(!file||!consent||loading)return;
    const active=new AbortController();controller.current?.abort();controller.current=active;
    setLoading(true);setError('');setProposal(null);
    try {
      const image=await photoData(file);
      if(active.signal.aborted)return;
      const response=await fetch('/api/meal-photo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image}),signal:active.signal});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'No se pudo analizar la fotografía.');
      if(controller.current===active){setProposal(data.draft);setMessage('Borrador listo. Revisa la propuesta antes de usarla.');}
    }catch(cause){if(cause.name!=='AbortError'&&controller.current===active)setError(cause.message);}
    finally{if(controller.current===active){setLoading(false);controller.current=null;}}
  }
  function save(event) {
    event.preventDefault();if(submitted.current)return;
    try {
      if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||localDay(day+'T12:00:00')!==day)throw new Error('Elige una fecha válida.');
      const record=createMealRecord(draft,{id:recordId.current,date:new Date(day+'T12:00:00').toISOString()});
      submitted.current=true;onSave(record);clearPhoto();setDraft(empty());recordId.current=newId();setError('');setMessage('Entrada añadida al diario.');
    }catch(cause){submitted.current=false;setError(cause.message);}
  }
  const records=mealRecords(history,day);
  return <section className="mealDiary" aria-labelledby="meal-diary-title">
    <small>FOTO · VOZ · TEXTO</small><h2 id="meal-diary-title">Tu diario de comidas</h2><p>Escribe o dicta tu comida. También puedes elegir una foto y pedir un borrador editable. Solo se registra al confirmar.</p>
    <label>Foto del plato (opcional)<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Foto del plato" onChange={selectPhoto}/></label>
    {preview&&<><img className="mealPhotoPreview" src={preview} alt="Vista previa del plato, sin guardar"/><label className="photoConsent"><input type="checkbox" checked={consent} onChange={event=>{setConsent(event.target.checked);if(!event.target.checked){controller.current?.abort();controller.current=null;setLoading(false);}}}/>Permito enviar esta foto al servicio de IA para estimar la comida. Puede procesarla OpenAI o la pasarela de IA configurada. No se envían mis datos de salud.</label><div className="diaryActions"><button type="button" disabled={!consent||loading} onClick={analyzePhoto}>{loading?'Analizando foto…':'Analizar foto'}</button><button type="button" onClick={clearPhoto}>Quitar foto</button></div><small>La foto se envía solo al pulsar Analizar. DIETEAR no guarda la imagen en el diario. No se pueden asegurar ingredientes ocultos, alérgenos, pesos ni calorías exactas.</small></>}
    {proposal&&<article aria-label="Propuesta de la fotografía"><h3>Propuesta para revisar: {proposal.name||'No se reconoce una comida'}</h3><p>{proposal.ingredients.join(', ')}</p><ul>{proposal.notes.map((note,index)=><li key={index}>{note}</li>)}</ul><p>Valores estimados para el plato completo: {DIARY_NUTRIENTS.map(([key,label,unit])=>label+': '+(proposal.nutrients[key]??'sin dato')+(proposal.nutrients[key]!=null?' '+unit:'')).join(' · ')}</p><button type="button" disabled={!proposal.name} onClick={()=>{update({name:proposal.name,nutrients:Object.fromEntries(Object.entries(proposal.nutrients).map(([key,value])=>[key,value==null?'':String(value)])),servings:'1',source:'foto-ia',notes:proposal.notes.join(' ')});setProposal(null);setMessage('Propuesta introducida. Corrige cantidades y confirma para guardar.');}}>Usar este borrador</button><button type="button" onClick={()=>setProposal(null)}>Descartar propuesta</button></article>}
    <form onSubmit={save}>
      <label>Fecha del registro<input type="date" aria-label="Fecha del registro de comida" value={day} onChange={event=>{setDay(event.target.value);update({});}} required/></label>
      <label>Comida<input value={draft.name} maxLength={150} aria-label="Nombre de la comida" placeholder="Ej.: lentejas con verduras" onChange={event=>update({name:event.target.value})} required/></label>
      <label>Momento del día<select aria-label="Momento de la comida" value={draft.mealType} onChange={event=>update({mealType:event.target.value})}>{MEAL_FIELDS.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
      <label>Raciones consumidas<input aria-label="Raciones consumidas" type="number" min="0.1" max="20" step="any" value={draft.servings} onChange={event=>update({servings:event.target.value})} required/></label>
      <p>Valores por ración; en una foto, una ración representa el plato completo. Escribe los datos que conozcas o corrige la estimación. Deja en blanco los demás.</p>
      <div className="mealNutrients">{DIARY_NUTRIENTS.map(([key,label,unit])=><label key={key}>{label} ({unit})<input aria-label={label+' por ración'} type="number" min="0" max="100000" step="any" value={draft.nutrients[key]??''} onChange={event=>update({nutrients:{...draft.nutrients,[key]:event.target.value}})}/></label>)}</div>
      <label>Notas<textarea aria-label="Notas de la comida" value={draft.notes} maxLength={1500} onChange={event=>update({notes:event.target.value})}/></label>
      {draft.source==='foto-ia'&&<p>Esta entrada conserva el origen «estimación por foto», aunque corrijas sus valores.</p>}
      <label className="photoConsent"><input aria-label="He revisado la comida y las cantidades" type="checkbox" checked={draft.confirmed} onChange={event=>{submitted.current=false;setDraft(current=>({...current,confirmed:event.target.checked}));}} required/>He revisado la comida y las cantidades. Quiero registrarlas.</label>
      <button type="submit" disabled={!draft.confirmed||!draft.name.trim()}>Confirmar y guardar comida</button>
    </form>
    {error&&<p className="diaryError" role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
    <DailyNutrition history={history} day={day||undefined}/>
    <ul className="diaryEntries">{records.map(record=><li key={record.id}><b>{record.label}</b><p>{record.food.servings} ración(es) · {record.food.source==='foto-ia'?'Estimación por foto revisada':'Registro manual'}{record.value!==null?' · '+new Intl.NumberFormat('es-ES',{maximumFractionDigits:1}).format(record.value)+' kcal':' · Calorías sin dato'}</p>{onDelete&&<button type="button" aria-label={'Eliminar comida '+record.label} onClick={()=>onDelete(record.id)}>Eliminar entrada</button>}</li>)}</ul>
  </section>;
}
