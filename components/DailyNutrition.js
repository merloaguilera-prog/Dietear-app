"use client";
import {dayNutrition, DIARY_NUTRIENTS} from '../lib/meal-diary.mjs';
export default function DailyNutrition({history, day, onOpen}) {
  const result=dayNutrition(history,day);
  return <section className="dailyNutrition" aria-label="Nutrientes registrados"><h3>Lo que has registrado {day?'el '+day:'hoy'}</h3><div className="nutritionCards">{DIARY_NUTRIENTS.map(([key,label,unit])=><div key={key}><small>{label}</small><b>{result.nutrients[key]===null?'Sin dato completo':new Intl.NumberFormat('es-ES',{maximumFractionDigits:1}).format(result.nutrients[key])+' '+unit}</b>{result.entries>0&&result.coverage[key].known<result.entries&&<small>{result.coverage[key].known}/{result.entries} entradas con dato{result.coverage[key].known>0?' · subtotal conocido: '+result.partialTotals[key]+' '+unit:''}</small>}</div>)}</div><p>{result.entries} entrada(s) confirmada(s). Los valores desconocidos se mantienen vacíos. Este resumen solo incluye lo registrado; las estimaciones por foto pueden variar. El ejercicio no se resta de la ingesta.</p>{onOpen&&<button type="button" onClick={onOpen}>Abrir diario de comidas →</button>}</section>;
}
