"use client";

import { useState } from "react";
import type { FichaNutricional } from "../lib/mi-plato/catalogo-nutricional";
import { calcularConFichas } from "../lib/mi-plato/catalogo-nutricional";

type Fila = { id: string; nombre: string; gramos: string; ficha: FichaNutricional | null; opciones: FichaNutricional[]; buscando: boolean };
export default function BuscadorNutricional({ iniciales = [] }: { iniciales?: { nombre: string; gramos: number }[] }) {
  const [filas, setFilas] = useState<Fila[]>(() => iniciales.map((f, i) => ({
    id: String(i), nombre: f.nombre, gramos: String(f.gramos), ficha: null, opciones: [], buscando: false
  })));
  const [error, setError] = useState("");
  const [totales, setTotales] = useState<ReturnType<typeof calcularConFichas> | null>(null);

  function cambiar(id: string, patch: Partial<Fila>) {
    setFilas(old => old.map(f => f.id === id ? { ...f, ...patch } : f));
    setTotales(null);
  }
  async function buscar(fila: Fila) {
    cambiar(fila.id, { buscando: true, ficha: null, opciones: [] }); setError("");
    try {
      const response = await fetch(`/api/mi-plato/alimentos?q=${encodeURIComponent(fila.nombre)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error de búsqueda");
      cambiar(fila.id, { opciones: data.fichas ?? [], buscando: false });
    } catch (e) {
      cambiar(fila.id, { buscando: false });
      setError(e instanceof Error ? e.message : "No se pudo buscar el alimento");
    }
  }
  function calcular() {
    setError("");
    if (!filas.length || filas.some(f => !f.ficha || !f.gramos.trim() || !Number.isFinite(Number(f.gramos)) || Number(f.gramos) <= 0 || Number(f.gramos) > 5000)) {
      setError("Selecciona una ficha nutricional y una cantidad válida para cada alimento."); return;
    }
    try { setTotales(calcularConFichas(filas.map(f => ({ ficha: f.ficha!, gramos: Number(f.gramos) })))); }
    catch { setError("No se pudieron calcular los nutrientes."); }
  }
  return <section aria-label="Consulta nutricional" style={{ padding: 20, border: "3px solid #56ff17", borderRadius: 22, background: "#103b23", color: "white" }}>
    <h2>Calcula los nutrientes de tu plato</h2>
    <p>Revisa cada alimento, selecciona su ficha y comprueba si está crudo o cocinado.</p>
    {filas.map((f, i) => <div key={f.id} style={{ marginBottom: 16 }}>
      <label>Alimento {i + 1}<input value={f.nombre} onChange={e => cambiar(f.id, { nombre: e.target.value, ficha: null, opciones: [] })} /></label>
      <label>Gramos<input type="number" min="1" max="5000" value={f.gramos} onChange={e => cambiar(f.id, { gramos: e.target.value })} /></label>
      <button type="button" disabled={f.buscando} onClick={() => buscar(f)}>{f.buscando ? "Buscando…" : "Buscar ficha"}</button>
      {f.opciones.length > 0 && <label>Ficha nutricional
        <select value={f.ficha?.id ?? ""} onChange={e => cambiar(f.id, { ficha: f.opciones.find(x => x.id === e.target.value) ?? null })}>
          <option value="">Selecciona una ficha</option>
          {f.opciones.map(x => <option key={x.id} value={x.id}>{x.nombre} — {x.estado} ({x.fuente})</option>)}
        </select>
      </label>}
      <button type="button" onClick={() => { setFilas(old => old.filter(x => x.id !== f.id)); setTotales(null); }}>Eliminar</button>
    </div>)}
    <button type="button" onClick={() => setFilas(old => [...old, { id: crypto.randomUUID(), nombre: "", gramos: "", ficha: null, opciones: [], buscando: false }])}>+ Añadir alimento</button>
    <button type="button" onClick={calcular}>Calcular nutrientes</button>
    {error && <p role="alert">{error}</p>}
    {totales && <div role="status"><p>Calorías: {totales.kcal} kcal</p><p>Proteínas: {totales.proteinas} g</p><p>Hidratos: {totales.hidratos} g</p><p>Grasas: {totales.grasas} g</p></div>}
    <p>Resultados orientativos. No se guardan automáticamente.</p>
  </section>;
}
