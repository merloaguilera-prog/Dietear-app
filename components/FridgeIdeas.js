"use client";
import { useEffect, useState } from "react";
import { recipes } from "../lib/recipes";
import { foodDateStatus, foodName, migratePantry, rankPantryRecipes, wasteTotals } from "../lib/pantry.js";
import { localDay } from "../lib/local-day.js";

export default function FridgeIdeas({ fridge, setFridge, onChoose, isRestricted, wasteLog = [], onWasteLog }) {
  const [today, setToday] = useState(localDay);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const legacy = JSON.parse(localStorage.getItem("dietear-expiry-dates") || "{}");
      if (legacy && typeof legacy === "object" && setFridge) setFridge(items => migratePantry(items, legacy));
    } catch { setNotice("No se pudieron recuperar las fechas anteriores. Se conservan sin sobrescribir."); }
    const refresh = () => setToday(localDay());
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [setFridge]);

  const update = (index, change) => setFridge(items => items.map((item, i) => i === index ? { ...item, ...change } : item));
  const pantry = fridge.map((item, index) => ({ ...item, index, status: foodDateStatus(item, today) }))
    .sort((a, b) => (a.status.days ?? 999) - (b.status.days ?? 999));
  const blocked = pantry.filter(item => item.status.blocked);
  const urgent = pantry.filter(item => !item.status.blocked && item.status.days !== null && item.status.days <= 3);
  const ranked = rankPantryRecipes(recipes, fridge, today, isRestricted).filter(recipe => recipe.hits > 0).slice(0, 3);
  const totals = wasteTotals(wasteLog, today);

  function logFood(item, outcome) {
    if (outcome === "used" && item.status.blocked) { setNotice("Ese lote no se puede marcar como aprovechado desde las sugerencias. Revisa su etiqueta."); return; }
    if (!window.confirm((outcome === "used" ? "¿Registrar como aprovechado todo este lote de " : "¿Registrar como desperdiciado todo este lote de ") + item.name + "? Se retirará de Mi Nevera.")) return;
    const quantity = Number(String(item.quantity ?? "").replace(",", "."));
    const kg = quantity > 0 && item.unit === "g" ? quantity / 1000 : quantity > 0 && item.unit === "kg" ? quantity : null;
    const enteredCost = String(item.cost ?? "").trim();
    const cost = enteredCost && Number.isFinite(Number(enteredCost.replace(",", "."))) && Number(enteredCost.replace(",", ".")) >= 0 ? Number(enteredCost.replace(",", ".")) : null;
    onWasteLog({ id: crypto.randomUUID(), date: today, name: item.name, outcome, kg, cost, source: "manual" }, item.index);
    setNotice("Lote registrado y retirado de la nevera. Solo se suman el peso y el coste que hayas indicado.");
  }

  return <section className="wellnessPanel fridgeIdeas" aria-labelledby="safe-pantry-title">
    <small>NEVERA INTELIGENTE · SEGURIDAD Y APROVECHAMIENTO</small>
    <h3 id="safe-pantry-title">Primero, revisa lo que ya tienes</h3>
    <p>Caducidad y consumo preferente no significan lo mismo. Las fechas y cantidades son datos introducidos por ti; el escáner de códigos no puede conocer la fecha de cada envase.</p>
    <div className="wellnessCard"><strong>Caducidad: seguridad · Consumo preferente: calidad</strong><p>No consumas un alimento pasada su caducidad, aunque parezca o huela bien. El consumo preferente superado requiere revisar conservación, envase y calidad; no se declara caducado automáticamente. Ningún lote con fecha vencida se cuenta como disponible en estas sugerencias ni al descontar la compra.</p><small>Abrir o congelar no cambia automáticamente la fecha: sigue la etiqueta y las instrucciones tras apertura/descongelación. Registrar una fecha no comprueba la cadena de frío.</small><p><a href="https://www.efsa.europa.eu/en/safe2eat/food-date-labelling" target="_blank" rel="noreferrer">Fuente: EFSA · etiquetado de fechas</a></p></div>
    {!!blocked.length && <p role="alert">{blocked.length} lote(s) con fecha vencida excluidos de la disponibilidad. No se sugieren como ingredientes para aprovechar.</p>}
    {!!urgent.length && <p>{urgent.length} lote(s) llegan a su fecha en los próximos 3 días: revisa primero esos productos.</p>}
    {pantry.map(item => <article key={foodName(item.name)} className="pantryFood" data-blocked={item.status.blocked}>
      <h4>{item.name}</h4><p>{item.status.label}</p>
      <div className="wellnessGrid">
        <label>Tipo de fecha de {item.name}<select value={item.dateType || "unknown"} onChange={event => update(item.index, { dateType: event.target.value })}><option value="unknown">No confirmado</option><option value="use-by">Fecha de caducidad</option><option value="best-before">Consumo preferente</option></select></label>
        <label>Fecha de la etiqueta de {item.name}<input type="date" value={item.expiryDate || ""} onChange={event => update(item.index, { expiryDate: event.target.value })}/></label>
        <label>Cantidad disponible de {item.name}<input type="number" min="0" step="any" inputMode="decimal" value={item.quantity ?? ""} placeholder="Sin dato" onChange={event => update(item.index, { quantity: event.target.value })}/></label>
        <label>Unidad de {item.name}<select value={item.unit || ""} onChange={event => update(item.index, { unit: event.target.value })}><option value="">Seleccionar</option>{["g", "kg", "ml", "L", "ud"].map(unit => <option key={unit}>{unit}</option>)}</select></label>
        <label>Fecha de apertura de {item.name}<input type="date" max={today} value={item.openedOn || ""} onChange={event => update(item.index, { openedOn: event.target.value })}/></label>
        <label>Fecha de congelación de {item.name}<input type="date" max={today} value={item.frozenOn || ""} onChange={event => update(item.index, { frozenOn: event.target.value })}/></label>
        <label>Coste del lote de {item.name} (€)<input type="number" min="0" step="0.01" inputMode="decimal" value={item.cost ?? ""} placeholder="Opcional" onChange={event => update(item.index, { cost: event.target.value })}/></label>
      </div>
      {onWasteLog && <div className="wellnessActions"><button type="button" disabled={item.status.blocked} onClick={() => logFood(item, "used")}>He aprovechado este lote</button><button type="button" onClick={() => logFood(item, "discarded")}>Registrar desperdicio</button></div>}
    </article>)}
    {!fridge.length && <p>Tu nevera está vacía. Añade un alimento arriba para guardar su fecha y cantidad.</p>}
    <h3>Ideas con alimentos disponibles</h3>
    <p>Las recetas son planificación, no consumo. Los ingredientes faltantes deben comprarse o sustituirse con seguridad; no uses los lotes bloqueados. Revisa siempre alergias, trazas y conservación.</p>
    {!ranked.length && <p>No hay coincidencias disponibles con tus restricciones actuales.</p>}
    <div className="fridgeIdeaGrid">{ranked.map(recipe => <article key={recipe.id}><span aria-hidden="true">{recipe.emoji}</span><div><b>{recipe.name}</b><small>{recipe.hits} de {recipe.ingredients.length} ingredientes registrados como disponibles</small>{recipe.rescueHits > 0 && <small>Prioriza {recipe.rescueHits} ingrediente(s) próximos a su fecha</small>}{recipe.missing.length > 0 && <small>Comprar o sustituir: {recipe.missing.join(", ")}</small>}</div><button type="button" onClick={() => onChoose(recipe.name)}>Añadir al plan →</button></article>)}</div>
    <details><summary>Mi aprovechamiento de este mes</summary>
      <p>Datos declarados, no ahorro verificado. Usar un alimento no demuestra por sí solo que se hubiera desperdiciado. No convertimos litros o unidades a kilogramos.</p>
      <div className="wellnessGrid"><article className="wellnessCard"><strong>{totals.kgUsed.toFixed(2)} kg aprovechados</strong><p>Valor declarado: {totals.costUsed.toFixed(2)} €</p></article><article className="wellnessCard"><strong>{totals.kgDiscarded.toFixed(2)} kg desperdiciados</strong><p>Valor declarado: {totals.costDiscarded.toFixed(2)} €</p></article></div>
      <ul className="wellnessHistory">{wasteLog.filter(event => event.date?.startsWith(today.slice(0, 7))).map(event => <li key={event.id}><span>{event.date} · {event.name} · {event.outcome === "used" ? "Aprovechado" : "Desperdiciado"} · {event.kg === null ? "Peso sin dato" : event.kg + " kg"} · {event.cost === null ? "Coste sin dato" : event.cost.toFixed(2) + " €"}</span><button type="button" onClick={() => { if (window.confirm("¿Eliminar solo este registro de aprovechamiento? No se repone el alimento en la nevera.")) onWasteLog(null, null, event.id); }}>Eliminar registro</button></li>)}</ul>
    </details>
    <p role="status">{notice}</p><small>Se guarda en este dispositivo. Los datos no se transmiten desde este módulo.</small>
  </section>;
}
