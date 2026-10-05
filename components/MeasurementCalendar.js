"use client";
import {useEffect,useState} from "react";
import {BODY_MEASUREMENTS} from "../lib/body-measurements";

const keyFor=date=>date.toLocaleDateString("sv-SE");
const parse=key=>new Date(key+"T12:00:00");
const addDays=(date,days)=>{const next=new Date(date);next.setDate(next.getDate()+days);return next;};
const fullDate=date=>date.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"});
const types=new Set(["peso","medida",...BODY_MEASUREMENTS.map(field=>field.type)]);

export default function MeasurementCalendar({history,selectedDate,onDate}) {
  const [period,setPeriod]=useState("month"),[cursor,setCursor]=useState(()=>parse(selectedDate));
  useEffect(()=>{if(selectedDate&&Number.isFinite(parse(selectedDate).getTime()))setCursor(parse(selectedDate));},[selectedDate]);
  const records=history.filter(item=>types.has(item.type)&&Number.isFinite(new Date(item.date).getTime())).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
  const firstMonth=new Date(cursor.getFullYear(),cursor.getMonth(),1,12),firstWeek=addDays(cursor,-((cursor.getDay()+6)%7));
  const start=period==="week"?firstWeek:addDays(firstMonth,-((firstMonth.getDay()+6)%7));
  const monthEnd=new Date(cursor.getFullYear(),cursor.getMonth()+1,0,12);
  const count=period==="week"?7:Math.ceil(((firstMonth.getDay()+6)%7+monthEnd.getDate())/7)*7;
  const days=Array.from({length:count},(_,index)=>addDays(start,index));
  const end=period==="week"?addDays(firstWeek,6):monthEnd;
  const from=keyFor(period==="week"?firstWeek:firstMonth),to=keyFor(end);
  const inPeriod=records.filter(item=>{const date=keyFor(new Date(item.date));return date>=from&&date<=to;});
  const dayRecords=new Map();records.forEach(item=>{const date=keyFor(new Date(item.date));dayRecords.set(date,(dayRecords.get(date)||0)+1);});
  const shift=direction=>setCursor(old=>period==="week"?addDays(old,direction*7):new Date(old.getFullYear(),old.getMonth()+direction,1,12));
  const heading=period==="week"?fullDate(firstWeek)+" – "+fullDate(end):cursor.toLocaleDateString("es-ES",{month:"long",year:"numeric"});
  return <section className="measurementCalendar" aria-label="Calendario de medidas">
    <div className="measurementCalendarHead"><div><small>TU SEGUIMIENTO</small><h3>Calendario de peso y medidas</h3><p>Los días marcados tienen registros. Selecciona una fecha para añadir medidas.</p></div><div className="measurementCalendarModes">{[["week","Semana"],["month","Mes"]].map(([value,label])=><button type="button" key={value} aria-pressed={period===value} onClick={()=>setPeriod(value)}>{label}</button>)}</div></div>
    <div className="measurementCalendarNav"><button type="button" aria-label="Periodo anterior de medidas" onClick={()=>shift(-1)}>‹</button><b>{heading}</b><button type="button" aria-label="Periodo siguiente de medidas" onClick={()=>shift(1)}>›</button></div>
    <div className="measurementCalendarJump"><label>Ir a mes<input type="month" value={keyFor(cursor).slice(0,7)} onChange={event=>{if(event.target.value)setCursor(parse(event.target.value+"-01"));}}/></label><button type="button" onClick={()=>onDate(keyFor(new Date()))}>Hoy</button></div>
    <div className="measurementCalendarGrid"><div className="calendarWeekdays">{["L","M","X","J","V","S","D"].map(day=><span key={day}>{day}</span>)}</div><div className="calendarMeasureDays">{days.map(date=>{const key=keyFor(date),amount=dayRecords.get(key)||0;return <button type="button" key={key} className={(date.getMonth()!==cursor.getMonth()?"outsideMonth ":"")+(amount?"hasMeasurements ":"")+(key===selectedDate?"selectedMeasureDate":"")} aria-pressed={key===selectedDate} aria-label={fullDate(date)+" · "+amount+" registros"} onClick={()=>onDate(key)}><b>{date.getDate()}</b><small>{amount?amount+" reg.":""}</small></button>;})}</div></div>
    <p className="calendarSelection">Fecha para registrar: <b>{selectedDate&&Number.isFinite(parse(selectedDate).getTime())?fullDate(parse(selectedDate)):"Selecciona una fecha"}</b></p>
    <details className="measurementCalendarRecords" open><summary>Registros de {period==="week"?"esta semana":"este mes"} · {inPeriod.length}</summary>{inPeriod.length?<div className="measurementRecordList">{inPeriod.map(item=><article key={item.id}><time dateTime={item.date}>{new Date(item.date).toLocaleDateString("es-ES")}</time><b>{item.label}</b><strong>{item.value} {item.type==="peso"?"kg":"cm"}</strong></article>)}</div>:<p>Aún no hay registros en este periodo.</p>}</details>
  </section>;
}
