"use client";
import {useMemo,useState} from "react";
import {foodDateStatus,subtractPantry} from "../lib/pantry.js";

const norm=value=>String(value||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const AISLES=[
  ["Fruta y verdura","🥦",["tomate","lechuga","calabacin","cebolla","ajo","patata","zanahoria","verdura","fruta","manzana","platano","aguacate","brocoli"]],
  ["Carnicería y huevos","🍗",["pollo","pavo","carne","ternera","cerdo","huevo"]],
  ["Pescadería","🐟",["pescado","merluza","salmon","atun","sardina"]],
  ["Lácteos y refrigerados","🥛",["leche","yogur","queso","lacteo"]],
  ["Pan, arroz y pasta","🥖",["pan","arroz","pasta","avena","cereal","harina"]],
  ["Legumbres y conservas","🫘",["lenteja","garbanzo","judia","legumbre","conserva"]],
  ["Despensa","🫒",["aceite","sal","especia","fruto seco","almendra","nuez"]]
];
const aisleFor=name=>{
  const text=norm(name);
  const match=AISLES.find(([, ,words])=>words.some(word=>text.includes(word)));
  return match?match.slice(0,2):["Otros","🛒"];
};
const safeNumber=value=>{
  const parsed=Number(String(value??"").replace(",","."));
  return Number.isFinite(parsed)&&parsed>=0?parsed:0;
};

export default function SmartShopping({shopping,setShopping,fridge,profile,setProfile,flash}){
  const [beforeDiscount,setBeforeDiscount]=useState(null);
  const budget=safeNumber(profile.shoppingBudget);
  const total=useMemo(()=>shopping.reduce((sum,item)=>sum+safeNumber(item.estimatedPrice),0),[shopping]);
  const pending=shopping.filter(item=>!item.done&&!item.coveredByStock);
  const inFridge=pending.filter(item=>fridge.some(food=>!foodDateStatus(food).blocked&&norm(item.name||item.text)===norm(food.name)));
  const discounted=subtractPantry(shopping,fridge);
  const canDiscount=discounted.some((item,index)=>item.qty!==shopping[index]?.qty);
  const duplicates=useMemo(()=>{
    const counts={};
    shopping.forEach(item=>{const key=norm(item.name||item.text);counts[key]=(counts[key]||0)+1;});
    return Object.values(counts).filter(count=>count>1).length;
  },[shopping]);

  function setPrice(index,value){
    setShopping(list=>list.map((item,i)=>i===index?{...item,estimatedPrice:value}:item));
  }
  function order(){
    const rank=name=>{
      const label=aisleFor(name)[0];
      const position=AISLES.findIndex(([aisle])=>aisle===label);
      return position<0?99:position;
    };
    setShopping(list=>[...list].sort((a,b)=>rank(a.name||a.text)-rank(b.name||b.text)||String(a.name||a.text).localeCompare(String(b.name||b.text),"es")));
    flash("🛒 Lista ordenada por pasillos");
  }
  function removeFridgeItems(){
    setBeforeDiscount(shopping);
    setShopping(discounted);
    flash("🧊 Cantidades descontadas solo con nombre y unidad idénticos. Revisa los precios de los productos ajustados.");
  }

  if(!shopping.length)return null;

  return <section aria-label="Resumen inteligente de la compra" style={{display:"grid",gap:14,margin:"18px 0"}}>
    <div className="gentleResult">
      <b>💶 Presupuesto de la compra</b>
      <label>Presupuesto máximo (€)<input inputMode="decimal" value={profile.shoppingBudget||""} onChange={event=>setProfile(current=>({...current,shoppingBudget:event.target.value}))} placeholder="Ej.: 80"/></label>
      <span>Estimación anotada: <b>{total.toFixed(2)} €</b>{budget>0?" de "+budget.toFixed(2)+" €":""}</span>
      {budget>0&&total>budget&&<span role="alert">⚠️ La estimación supera el presupuesto en {(total-budget).toFixed(2)} €.</span>}
      {budget>0&&total>0&&total<=budget&&<span>✅ Quedan aproximadamente {(budget-total).toFixed(2)} € de margen.</span>}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
      <article className="gentleResult"><b>🛒 {pending.length}</b><span>Pendientes</span></article>
      <article className="gentleResult"><b>🧊 {inFridge.length}</b><span>Ya aparecen en nevera</span></article>
      <article className="gentleResult"><b>🔁 {duplicates}</b><span>Productos repetidos</span></article>
    </div>

    <div className="branchActions">
      <button type="button" onClick={order}>🧭 Ordenar por pasillos</button>
      <button type="button" disabled={!canDiscount} onClick={removeFridgeItems}>🧊 Descontar cantidades conocidas</button>
      {beforeDiscount&&<button type="button" onClick={()=>{if(!window.confirm("¿Restaurar la lista anterior al descuento? Se perderán los cambios de la lista posteriores a ese descuento."))return;setShopping(beforeDiscount);setBeforeDiscount(null);flash("Lista anterior al descuento restaurada.")}}>Deshacer último descuento</button>}
    </div>
    <small>Solo se descuentan cantidades registradas con el mismo nombre y unidad; no se adivinan equivalencias ni cantidades. Los lotes con fecha vencida no se descuentan. Los precios afectados se vacían para que los actualices. Un producto cubierto por la nevera no se considera comprado.</small>

    <details>
      <summary>Añadir precios estimados</summary>
      <div style={{display:"grid",gap:8,marginTop:12}}>
        {shopping.map((item,index)=>{
          const [aisle,icon]=aisleFor(item.name||item.text);
          return <label key={index} style={{display:"grid",gridTemplateColumns:"minmax(120px,1fr) auto minmax(80px,110px)",gap:8,alignItems:"center"}}>
            <span><b>{icon} {item.text||item.name}</b><small style={{display:"block"}}>{aisle} · {item.qty||1} {item.unit||"ud"}</small></span>
            <span>Coste total</span>
            <input aria-label={"Precio estimado de "+(item.text||item.name)} inputMode="decimal" value={item.estimatedPrice||""} onChange={event=>setPrice(index,event.target.value)} placeholder="0,00"/>
          </label>;
        })}
      </div>
    </details>
    <small>Los precios son estimaciones introducidas por ti; pueden variar según tienda, formato y localidad.</small>
  </section>;
}
