export const APP_STATE_VERSION=1;
export const emptyMeasurements=()=>({weight:"",height:"",waist:"",hip:"",chest:"",arm:"",leg:""});
export function bmi(weight,heightCm){const w=Number(weight),h=Number(heightCm)/100;return w>0&&h>0?+(w/(h*h)).toFixed(1):null}
export function bmrEstimate({weight,height,age,sex}){const w=Number(weight),h=Number(height),a=Number(age);if(!(w>0&&h>0&&a>0)||!["Hombre","Mujer"].includes(sex))return null;return Math.round(10*w+6.25*h-5*a+(sex==="Hombre"?5:-161))}
export function activityFactor({activity,steps,workActivity,exerciseDays,exerciseMinutes}){
  const fallback={"Muy tranquila":1.2,"Sedentaria":1.2,"Ligera":1.375,"Moderada":1.55,"Activa":1.725,"Muy activa":1.9}[activity];
  const s=Number(steps),days=Number(exerciseDays),mins=Number(exerciseMinutes);
  const hasDetail=(s>0)||days>0||mins>0||workActivity;
  if(!hasDetail)return fallback||null;
  let factor=1.2;
  if(s>=10000)factor+=.18;else if(s>=7500)factor+=.13;else if(s>=5000)factor+=.08;else if(s>=2500)factor+=.03;
  factor+=({"Sentada/o gran parte del día":0,"De pie parte del día":.04,"Camino bastante durante el día":.09,"Trabajo físicamente activo":.15}[workActivity]||0);
  const weekly=Math.max(0,Math.min(7,days))*Math.max(0,mins);
  if(weekly>=300)factor+=.14;else if(weekly>=150)factor+=.10;else if(weekly>=60)factor+=.05;
  return +Math.min(1.8,Math.max(1.2,factor)).toFixed(3)
}
export function kcalEstimate({weight,height,age,sex,activity,steps,workActivity,exerciseDays,exerciseMinutes}){
  const base=bmrEstimate({weight,height,age,sex});
  const factor=activityFactor({activity,steps,workActivity,exerciseDays,exerciseMinutes});
  return base&&factor?Math.round(base*factor):null
}
export function proteinRange(weight){const w=Number(weight);return w>0?[Math.round(w*.8),Math.round(w*1.2)]:null}
export function latest(history,type){return history.find(x=>x.type===type)||null}
export function series(history,type){return history.filter(x=>x.type===type).slice().sort((a,b)=>new Date(a.date)-new Date(b.date)).map(x=>({date:x.date,value:Number(x.value)})).filter(x=>Number.isFinite(x.value))}
export function todayIndex(){const d=new Date().getDay();return d===0?6:d-1}
