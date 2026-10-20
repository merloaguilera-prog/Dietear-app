"use client";

import { useState } from "react";

export type AlimentoEditable = { nombre: string; gramos_estimados: number | null; confianza: "baja" | "media" | "alta" };
type Props = { alimentos: AlimentoEditable[]; onConfirmar: (alimentos: { nombre: string; gramos: number }[]) => Promise<void> | void };

export default function CorregirAlimentos({ alimentos, onConfirmar }: Props) {
  const [filas, setFilas] = useState(() => alimentos.map(a => ({
    id: crypto.randomUUID(), nombre: a.nombre, gramos: a.gramos_estimados?.toString() ?? "", confianza: a.confianza
  })));
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function confirmar() {
    setError("");
    if (filas.length === 0) { setError("Añade al menos un alimento."); return; }
    const normalizados = filas.map(f => ({ nombre: f.nombre.trim(), gramos: Number(f.gramos) }));
    if (filas.some(f => !f.gramos.trim()) || normalizados.some(f => !f.nombre || f.nombre.length > 120 || !Number.isFinite(f.gramos) || f.gramos <= 0 || f.gramos > 5000)) {
      setError("Revisa los nombres y las cantidades: introduce gramos entre 0 y 5000."); return;
    }
    setGuardando(true);
    try { await onConfirmar(normalizados); }
    catch { setError("No se han podido guardar las correcciones."); }
    finally { setGuardando(false); }
  }

  return <section aria-label="Corregir alimentos" style={{ padding: 20, border: "3px solid #56ff17", borderRadius: 22, background: "#103b23", color: "white" }}>
    <h2>Revisa tu plato</h2>
    <p>La IA puede equivocarse. Corrige los alimentos y sus cantidades antes de continuar.</p>
    {filas.map((f, i) => <div key={f.id} style={{ marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <label>Alimento {i + 1}<input aria-label={`Nombre del alimento ${i + 1}`} value={f.nombre} maxLength={120} onChange={e => setFilas(old => old.map(x => x.id === f.id ? { ...x, nombre: e.target.value } : x))} /></label>
      <label>Gramos<input aria-label={`Gramos del alimento ${i + 1}`} type="number" min="1" max="5000" step="1" value={f.gramos} onChange={e => setFilas(old => old.map(x => x.id === f.id ? { ...x, gramos: e.target.value } : x))} /></label>
      <span>Confianza: {f.confianza}</span>
      <button type="button" onClick={() => setFilas(old => old.filter(x => x.id !== f.id))}>Eliminar</button>
    </div>)}
    <button type="button" onClick={() => setFilas(old => [...old, { id: crypto.randomUUID(), nombre: "", gramos: "", confianza: "baja" }])}>+ Añadir alimento</button>
    <button type="button" disabled={guardando} onClick={confirmar}>{guardando ? "Guardando…" : "Confirmar cantidades"}</button>
    {error && <p role="alert">{error}</p>}
    <p>Las cantidades son aproximadas; el cálculo nutricional se realizará después de confirmar.</p>
  </section>;
}
