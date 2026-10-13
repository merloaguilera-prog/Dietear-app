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
    <div className="gentleResult">
      <b>🍽️ Una comida, cantidades diferentes</b>
      <span>DIETEAR calcula una equivalencia orientativa para la compra. Las necesidades clínicas o infantiles deben confirmarse con un profesional.</span>
    </div>
    <div style={{display:"grid",gap:14,margin:"18px 0"}}>
      {members.map((member,index)=><article key={member.id} style={{padding:16,border:"2px solid #b9d9c2",borderRadius:18,background:index%2?"#fffaf0":"#f5fff7"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
          <b>{index===0?"🌿":"👤"} Persona {index+1}</b>
          {members.length>1&&<button type="button" onClick={()=>remove(member.id)} aria-label={"Eliminar "+member.name}>🗑️ Quitar</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10,marginTop:12}}>
          <label>Nombre<input value={member.name} onChange={event=>update(member.id,"name",event.target.value)} placeholder="Nombre o apodo"/></label>
          <label>Etapa o necesidad<select value={member.type} onChange={event=>update(member.id,"type",event.target.value)}>{Object.entries(PRESETS).map(([value,item])=><option key={value} value={value}>{item.label}</option>)}</select></label>
          <label>Alergias<input value={member.allergens} onChange={event=>update(member.id,"allergens",event.target.value)} placeholder="Ej.: huevo, marisco…"/></label>
          <label>Prefiere evitar<input value={member.avoid} onChange={event=>update(member.id,"avoid",event.target.value)} placeholder="Ej.: cebolla, picante…"/></label>
        </div>
        <small>Porción orientativa: × {PRESETS[member.type]?.factor||1}. No sustituye una valoración nutricional individual.</small>
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
