export const PERSONAL_GOALS = [
 {id:'health',label:'Cuidar mi salud',icon:'💚',description:'Conocer mi punto de partida y llevar mi seguimiento.',step:'Revisa una medida que ya tengas registrada o anota una que quieras seguir.',tab:'progreso',section:'Peso y medidas',action:'Revisar mis medidas'},
 {id:'weight',label:'Mejorar mi peso',icon:'🌿',description:'Observar mi evolución sin prisas ni presión.',step:'Consulta tu evolución y piensa en un hábito que te resulte sostenible.',tab:'progreso',section:'Mis gráficas',action:'Ver mi evolución'},
 {id:'food',label:'Comer un poco mejor',icon:'🥗',description:'Elegir platos que encajen con mis gustos y necesidades.',step:'Elige una receta teniendo en cuenta tus preferencias y exclusiones.',tab:'alimentacion',section:'Todo Dietas',action:'Elegir una receta'},
 {id:'movement',label:'Moverme un poco más',icon:'👟',description:'Encontrar movimiento que pueda adaptar a mi ritmo.',step:'Explora las actividades y elige una que puedas adaptar a tu día.',tab:'progreso',section:'Pasos y actividad',action:'Ver mis actividades'},
 {id:'strength',label:'Ganar fuerza',icon:'💪',description:'Descubrir guías y niveles de ejercicio.',step:'Consulta una guía de fuerza y escoge el nivel que prefieras.',tab:'progreso',section:'Pasos y actividad',action:'Ver guías de fuerza'},
 {id:'habits',label:'Cuidar mis hábitos',icon:'🌱',description:'Reconocer pequeños pasos que pueda mantener.',step:'Revisa tus registros y reconoce algo que ya has empezado.',tab:'progreso',section:'Mis logros',action:'Revisar mis logros'},
 {id:'rest',label:'Dormir y descansar mejor',icon:'🌙',description:'Prestar atención a mi descanso y cómo me encuentro.',step:'Anota cómo has descansado para poder observar tu evolución.',tab:'progreso',section:'Sueño y descanso',action:'Registrar mi descanso'},
 {id:'water',label:'Beber agua con regularidad',icon:'💧',description:'Llevar mi registro de hidratación a mi manera.',step:'Registra el agua que has bebido y revisa tu referencia personal.',tab:'progreso',section:'Hidratación',action:'Registrar mi agua'},
 {id:'planning',label:'Organizar mis comidas',icon:'📅',description:'Hacer sitio a la alimentación en mi rutina.',step:'Elige una comida de tu semana y revisa si encaja con tu día.',tab:'plan',section:'',action:'Abrir mi menú semanal'},
];
const byId=new Map(PERSONAL_GOALS.map(goal=>[goal.id,goal]));
const byLabel=new Map(PERSONAL_GOALS.map(goal=>[goal.label,goal]));
export const normalizePersonalGoalIds=values=>Array.isArray(values)?[...new Set(values.filter(id=>typeof id==='string'&&byId.has(id)))]:[];
export function selectedPersonalGoalIds(profile={}){
 if(Array.isArray(profile.personalGoals))return normalizePersonalGoalIds(profile.personalGoals);
 const legacy=byLabel.get(profile.goal);return legacy?[legacy.id]:[];
}
export function withPersonalGoals(profile,values){
 const personalGoals=normalizePersonalGoalIds(values),oldPrimary=byLabel.get(profile.goal);
 const goal=oldPrimary&&personalGoals.includes(oldPrimary.id)?oldPrimary.label:byId.get(personalGoals[0])?.label||'';
 return {...profile,personalGoals,goal};
}
export function togglePersonalGoal(profile,id){
 if(!byId.has(id))return profile;
 const selected=selectedPersonalGoalIds(profile);
 return withPersonalGoals(profile,selected.includes(id)?selected.filter(value=>value!==id):[...selected,id]);
}
export function withPrimaryPersonalGoal(profile,label){
 const goal=byLabel.get(label);if(!goal)return profile;
 return {...withPersonalGoals(profile,[...selectedPersonalGoalIds(profile),goal.id]),goal:label};
}
export function personalGoalDay(date=new Date()){
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
}
const validDay=day=>typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(new Date(day+'T12:00:00Z').getTime())&&new Date(day+'T12:00:00Z').toISOString().slice(0,10)===day;
export function normalizeGoalCheckins(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return {};
 return Object.fromEntries(Object.entries(value).filter(([day,ids])=>validDay(day)&&Array.isArray(ids)).map(([day,ids])=>[day,normalizePersonalGoalIds(ids)]));
}
export function toggleGoalCheckin(profile,id,day){
 if(!validDay(day)||!selectedPersonalGoalIds(profile).includes(id))return profile;
 const goalCheckins=normalizeGoalCheckins(profile.goalCheckins),done=goalCheckins[day]||[];
 return {...profile,goalCheckins:{...goalCheckins,[day]:done.includes(id)?done.filter(value=>value!==id):[...done,id]}};
}
export function personalGoalWeek(profile,day){
 if(!validDay(day))return {days:[],steps:0,activeDays:0};
 const checkins=normalizeGoalCheckins(profile.goalCheckins),end=new Date(day+'T12:00:00Z');
 const days=Array.from({length:7},(_,index)=>{const date=new Date(end);date.setUTCDate(date.getUTCDate()-6+index);const key=date.toISOString().slice(0,10);return {day:key,count:(checkins[key]||[]).length};});
 return {days,steps:days.reduce((sum,item)=>sum+item.count,0),activeDays:days.filter(item=>item.count>0).length};
}
