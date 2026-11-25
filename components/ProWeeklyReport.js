"use client";
import {useEffect,useMemo,useState} from 'react';
import {localDay,DIARY_NUTRIENTS} from '../lib/meal-diary.mjs';
import {weeklyNutritionReport,weeklyReportCsv} from '../lib/weekly-report.mjs';

const number=value=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:1}).format(value);
export default function ProWeeklyReport({history,onOpenDiary}) {
 const [endDay,setEndDay]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>setEndDay(localDay(new Date())),[]);
 const report=useMemo(()=>{try{return weeklyNutritionReport(history,endDay);}catch{return null;}},[history,endDay]);
 function download(kind){
  if(!report)return;
  let url,anchor;
  try{
   const csv=kind==='csv',text=csv?weeklyReportCsv(report):JSON.stringify(report,null,2);
   url=URL.createObjectURL(new Blob([text],{type:csv?'text/csv;charset=utf-8':'application/json'}));
   anchor=document.createElement('a');anchor.href=url;anchor.download=`dietear-informe-${report.startDay}-${report.endDay}.${kind}`;
   document.body.appendChild(anchor);anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   setMessage('Informe preparado para descargar. Solo contiene el resumen del periodo, sin tu nombre ni el detalle de salud.');
  }catch{if(url)URL.revokeObjectURL(url);setMessage('No se ha podido preparar la descarga. Inténtalo de nuevo.');}
  finally{anchor?.remove();}
 }
 return <section className="proWeeklyReport" aria-label="Informe semanal DIETEAR PRO">
  <h3>Tu informe semanal</h3><p>Consulta siete días de tu diario y descarga el resumen. Disponible sin pago durante la preparación de PRO.</p>
  <label>Último día del informe<input type="date" value={endDay} onChange={event=>{setEndDay(event.target.value);setMessage('');}}/></label>
  {!report?<p role="status">Elige una fecha válida para consultar el periodo.</p>:<>
   <p role="status">Del {report.startDay} al {report.endDay}: {report.entries} comidas confirmadas en {report.recordedDays} de 7 días.</p>
   <div className="nutritionCards">{DIARY_NUTRIENTS.map(([key,label,unit])=><article key={key}><h4>{label}</h4><strong>{report.nutrients[key]===null?'Sin dato completo':number(report.nutrients[key])+' '+unit}</strong><p>{report.coverage[key].known} de {report.entries} comidas con dato{report.coverage[key].known>0&&report.nutrients[key]===null?'; subtotal conocido: '+number(report.partialTotals[key])+' '+unit:''}.</p></article>)}</div>
   <div className="weeklyReportTable" role="region" aria-label="Detalle diario del informe" tabIndex={0}><table><caption>Datos completos por día; una casilla vacía indica que falta información.</caption><thead><tr><th scope="col">Fecha</th><th scope="col">Comidas</th>{DIARY_NUTRIENTS.map(([key,label,unit])=><th scope="col" key={key}>{label} ({unit})</th>)}</tr></thead><tbody>{report.days.map(day=><tr key={day.day}><th scope="row">{day.day}</th><td>{day.entries}</td>{DIARY_NUTRIENTS.map(([key])=><td key={key}>{day.nutrients[key]===null?'—':number(day.nutrients[key])}</td>)}</tr>)}</tbody></table></div>
   <p>Solo se incluyen las comidas registradas y confirmadas; los días sin registros no cuentan como consumo cero. Las estimaciones por foto siguen siendo orientativas. El ejercicio no se descuenta de la ingesta.</p>
   <div className="branchActions"><button type="button" onClick={()=>download('json')}>Descargar informe JSON</button><button type="button" onClick={()=>download('csv')}>Descargar informe CSV</button><button type="button" onClick={onOpenDiary}>Completar mi diario</button></div>
  </>}
  {message&&<p role="status">{message}</p>}
  <p>La descarga se prepara en este dispositivo. No envía el informe a ningún servicio. El archivo contiene datos personales de alimentación: guárdalo donde tú decidas.</p>
 </section>;
}
