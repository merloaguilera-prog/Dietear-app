// Foundation for exercise guides and activity import. No clinical prescription.
// Device sessions and manual sessions must have stable IDs to avoid double counting.
export const EXERCISE_LEVELS = Object.freeze(["suave", "intermedio", "avanzado"]);
export const EXERCISE_GUIDES = Object.freeze([
  {id:"movilidad-sentada",title:"Movilidad suave sentada",levels:["suave"],equipment:"silla estable",steps:["Siéntate con los pies apoyados y la espalda cómoda.","Mueve lentamente los hombros hacia atrás y adelante sin forzar.","Descansa y detén el ejercicio si aparece dolor o mareo."],adaptations:["Reduce la amplitud del movimiento."],mediaStatus:"pending-licensed-media"},
  {id:"sentarse-levantarse",title:"Sentarse y levantarse",levels:["suave","intermedio"],equipment:"silla estable",steps:["Coloca la silla sobre una superficie firme.","Apoya los pies y levántate de forma controlada si puedes hacerlo con seguridad.","Vuelve a sentarte lentamente; utiliza apoyo cuando lo necesites."],adaptations:["Utiliza apoyo estable o pide orientación profesional si tienes problemas de equilibrio."],mediaStatus:"pending-licensed-media"},
  {id:"sentadilla",title:"Sentadilla con peso corporal",levels:["intermedio","avanzado"],equipment:"ninguno",steps:["Separa los pies a una distancia cómoda.","Flexiona caderas y rodillas hasta un rango controlable, sin forzar.","Regresa a la posición inicial de manera controlada."],adaptations:["Reduce profundidad o utiliza una silla como referencia."],mediaStatus:"pending-licensed-media"}
]);
export function guidesForLevel(level) {
 if (!EXERCISE_LEVELS.includes(level)) throw new RangeError("unknown exercise level");
 return EXERCISE_GUIDES.filter(guide => guide.levels.includes(level));
}
// Only combine distinct recorded sessions; the same event may arrive from multiple devices.
export function summarizeActivity(sessions) {
 if (!Array.isArray(sessions)) throw new TypeError("sessions must be an array");
 const seen=new Set();
 let minutes=0,activeKcal=0,knownKcal=0;
 for (const session of sessions) {
  if (!session || typeof session.id!=="string" || !session.id.trim()) throw new TypeError("session id required");
  if (seen.has(session.id)) continue;
  const duration=session.durationMinutes;
  if (typeof duration!=="number" || !Number.isFinite(duration) || duration<0) throw new RangeError("invalid duration");
  const kcal=session.activeKcal;
  if (kcal!=null && (typeof kcal!=="number" || !Number.isFinite(kcal) || kcal<0)) throw new RangeError("invalid active calories");
  seen.add(session.id); minutes+=duration;
  if (kcal!=null) {activeKcal+=kcal;knownKcal++;}
 }
 return {sessions:seen.size,durationMinutes:minutes,activeKcal:knownKcal===seen.size && seen.size>0?Math.round(activeKcal*100)/100:null,activeKcalCoverage:{known:knownKcal,total:seen.size}};
}
