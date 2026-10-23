"use client";
import {useMemo,useState} from "react";

const PRESETS={
  adulto:{label:"Adulto",factor:1},
  menor:{label:"Menor",factor:.65},
  adolescente:{label:"Adolescente",factor:.85},
  mayor:{label:"Persona mayor",factor:.8},
  activa:{label:"Persona muy activa",factor:1.2}
};
const freshMember=index=>({id:Date.now()+"-"+index,name:index===0?"Yo":"Persona "+(index+1),type:index===0?"adulto":"menor",allergens:"",avoid:""});

export default function FamilyPlanner({profile,setProfile,setPlanner,setShopping,flash,onPlan}){
  const stored=Array.isArray(profile.familyMembers)?profile.familyMembers:[];
  const initial=stored.length?stored:Array.from({length:Math.max(1,Number(profile.people)||1)},(_,i)=>freshMember(i));
  const [members,setMembers]=useState(initial);
  const total=useMemo(()=>members.reduce((sum,member)=>sum+(PRESETS[member.type]?.factor||1),0),[members]);

  function update(id,field,value){
    setMembers(list=>list.map(member=>member.id===id?{...member,[field]:value}:member));
  }
  function add(){
    setMembers(list=>[...list,freshMember(list.length)]);
  }
  function remove(id){
    setMembers(list=>list.length===1?list:list.filter(member=>member.id!==id));
  }
  function save(){
    const cleaned=members.map((member,index)=>({
      ...member,
      name:member.name.trim()||"Persona "+(index+1),
      allergens:member.allergens.trim(),
      avoid:member.avoid.trim()
    }));
    setMembers(cleaned);
    setProfile(current=>({...current,people:cleaned.length,familyMembers:cleaned,familyPortions:Number(total.toFixed(2))}));
    flash("👨‍👩‍👧‍👦 Familia guardada con porciones individuales");
  }
  function apply(){
    const portions=Math.max(.5,Number(total.toFixed(2)));
    const cleaned=members.map((member,index)=>({...member,name:member.name.trim()||"Persona "+(index+1)}));
    setProfile(current=>({...current,people:cleaned.length,familyMembers:cleaned,familyPortions:portions}));
    setPlanner(plan=>plan.map(day=>({...day,people:cleaned.length,portionFactor:portions})));
    setShopping([]);
    flash("🍽️ Porciones familiares aplicadas a toda la semana; vuelve a generar la compra");
  }

  return <div className="familyPlanner">
    <header style={{padding:"22px",borderRadius:24,background:"linear-gradient(120deg,#e0f7e8,#f6f1ff,#fff2df)",border:"2px solid #91c9a3",marginBottom:18}}><small style={{fontWeight:800,letterSpacing:2}}>MI FAMILIA · ESTUDIO PERSONALIZADO</small><h2 style={{margin:"8px 0",fontSize:"clamp(24px,3vw,34px)"}}>Cada persona, un seguimiento único 💚</h2><p style={{maxWidth:760}}>Crea fichas individuales para organizar la alimentación, los objetivos y los hábitos de cada miembro. Tú decides qué información registrar.</p><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><span style={{background:"white",padding:"10px 15px",borderRadius:16,fontWeight:700}}>👥 {members.length} perfiles</span><span style={{background:"white",padding:"10px 15px",borderRadius:16,fontWeight:700}}>🥗 Plan familiar</span><span style={{background:"white",padding:"10px 15px",borderRadius:16,fontWeight:700}}>🔒 Datos personales</span></div></header>
    <div className="gentleResult">
      <b>🍽️ Una comida, cantidades diferentes</b>
      <span>DIETEAR calcula una equivalencia orientativa para la compra. Las necesidades clínicas o infantiles deben confirmarse con un profesional.</span>
    </div>
    <div style={{display:"grid",gap:14,margin:"18px 0"}}>
      {members.map((member,index)=><article key={member.id} style={{padding:16,border:"2px solid #b9d9c2",borderRadius:18,background:index%2?"#fffaf0":"#f5fff7"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><span aria-hidden="true" style={{fontSize:28,background:"white",padding:12,borderRadius:16}}>👤</span><div><small>FICHA PERSONAL · {index+1}</small><h3 style={{margin:"2px 0"}}>{member.name||"Persona "+(index+1)}</h3></div></div>
          {members.length>1&&<button type="button" onClick={()=>remove(member.id)} aria-label={"Eliminar "+member.name}>🗑️ Quitar</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10,marginTop:12}}>
          <label>Nombre<input value={member.name} onChange={event=>update(member.id,"name",event.target.value)} placeholder="Nombre o apodo"/></label>
          <label>Etapa o necesidad<select value={member.type} onChange={event=>update(member.id,"type",event.target.value)}>{Object.entries(PRESETS).map(([value,item])=><option key={value} value={value}>{item.label}</option>)}</select></label>
          <label>Alergias<input value={member.allergens} onChange={event=>update(member.id,"allergens",event.target.value)} placeholder="Ej.: huevo, marisco…"/></label>
          <label>Prefiere evitar<input value={member.avoid} onChange={event=>update(member.id,"avoid",event.target.value)} placeholder="Ej.: cebolla, picante…"/></label>
        </div>
        <details style={{marginTop:16,padding:14,border:"1px solid #a9cfb8",borderRadius:16,background:"#fff"}}><summary style={{cursor:"pointer",fontWeight:800}}>📋 Valoración personal ampliada (opcional)</summary>
          <p style={{fontSize:14}}>Datos aportados por la persona; no se utilizan para emitir diagnósticos ni calcular automáticamente una dieta clínica.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12}}>
            <label>Edad (años)<input type="number" min="0" max="120" value={member.age??""} onChange={e=>update(member.id,"age",e.target.value)} placeholder="Opcional"/></label>
            <label>Altura (cm)<input type="number" min="30" max="250" value={member.height??""} onChange={e=>update(member.id,"height",e.target.value)} placeholder="Opcional"/></label>
            <label>Peso registrado (kg)<input type="number" min="0" max="500" step="0.1" value={member.weight??""} onChange={e=>update(member.id,"weight",e.target.value)} placeholder="Opcional"/></label>
            <label>Actividad habitual<select value={member.activity??""} onChange={e=>update(member.id,"activity",e.target.value)}><option value="">Sin indicar</option><option value="baja">Baja</option><option value="moderada">Moderada</option><option value="alta">Alta</option><option value="adaptada">Actividad adaptada</option></select></label>
            <label>Objetivos personales<input value={member.objectives??""} onChange={e=>update(member.id,"objectives",e.target.value)} placeholder="Ej.: comer variado, caminar"/></label>
            <label>Horarios y rutinas<input value={member.routine??""} onChange={e=>update(member.id,"routine",e.target.value)} placeholder="Ej.: turnos, colegio"/></label>
            <label>Necesidades alimentarias<input value={member.nutritionNeeds??""} onChange={e=>update(member.id,"nutritionNeeds",e.target.value)} placeholder="Ej.: textura, preferencias"/></label>
            <label>Indicaciones alimentarias del profesional (solo locales)<input value={member.professionalNotes??""} onChange={e=>update(member.id,"professionalNotes",e.target.value)} placeholder="Solo pautas de alimentación; sin analíticas ni medicación"/></label>
          </div>
          <p style={{fontSize:13}}>La ficha se guarda con el perfil de este navegador. Las notas profesionales permanecen locales y no se añaden automáticamente a la IA. No hay sincronización entre dispositivos en esta versión.</p>
        </details>
        <small>Porción orientativa: × {PRESETS[member.type]?.factor||1}. Es una equivalencia aproximada de compra, no una prescripción nutricional individual.</small>
      </article>)}
    </div>
    <button type="button" onClick={add}>＋ Añadir persona</button>
    <div className="gentleResult" style={{marginTop:16}}>
      <b>👥 {members.length} persona{members.length===1?"":"s"} · Equivalencia para compra: {total.toFixed(2)} porciones adultas</b>
      <span>La lista de compra multiplicará las recetas por esta equivalencia después de aplicarla a la semana.</span>
    </div>
    <div className="branchActions">
      <button type="button" onClick={save}>💚 Guardar familia</button>
      <button type="button" className="primaryAction" onClick={apply}>🍽️ Aplicar porciones a mi semana</button>
      <button type="button" onClick={onPlan}>📅 Ver mi plan</button>
    </div>
  </div>;
}
