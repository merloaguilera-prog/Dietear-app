export const APP_STATE_VERSION=1;
export const emptyMeasurements=()=>({weight:"",height:"",waist:"",hip:"",chest:"",arm:"",leg:""});
export function bmi(weight,heightCm){const w=Number(weight),h=Number(heightCm)/100;return w>0&&h>0?+(w/(h*h)).toFixed(1):null}
export function kcalEstimate({weight,height,age,sex,activity="Moderada"}){const w=Number(weight),h=Number(height),a=Number(age);if(!(w>0&&h>0&&a>0))return null;const base=10*w+6.25*h-5*a+(sex==="Hombre"?5:-161);const factors={"Muy tranquila":1.2,"Ligera":1.375,"Moderada":1.55,"Activa":1.725,"Muy activa":1.9};return Math.round(base*(factors[activity]||1.55))}
export function proteinRange(weight){const w=Number(weight);return w>0?[Math.round(w*.8),Math.round(w*1.2)]:null}
export function latest(history,type){return history.find(x=>x.type===type)||null}
export function series(history,type){return history.filter(x=>x.type===type).slice().reverse().map(x=>({date:x.date,value:Number(x.value)})).filter(x=>Number.isFinite(x.value))}
export function todayIndex(){const d=new Date().getDay();return d===0?6:d-1}
