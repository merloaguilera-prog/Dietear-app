"use client";
import { useState } from "react";
import { sleepSession, sleepWeek } from "../lib/sleep.js";
import { localDay } from "../lib/local-day.js";

const localInput = value => { const date = new Date(value); return `${localDay(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`; };

export default function SleepJournal({ history = [], onSave, onDelete }) {
  const [form, setForm] = useState({ start: "", end: "", quality: "", energy: "" });
  const [notice, setNotice] = useState("");
  const summary = sleepWeek(history);
  const change = event => setForm(old => ({ ...old, [event.target.name]: event.target.value }));
  return <section className="wellnessPanel sleepPanel" aria-labelledby="sleep-journal-title">
    <small>DESCANSO · REGISTRO MANUAL</small><h2 id="sleep-journal-title">Tu descanso, con horarios reales</h2>
    <p>Registra tu descanso principal, también si duermes de día por trabajo a turnos. El intervalo anotado no equivale a sueño medido ni permite diagnosticar trastornos.</p>
    <form onSubmit={event => {
      event.preventDefault(); const session = sleepSession(form);
      if (session.error) { setNotice(session.error); return; }
      const existing = history.find(item => item.id === `sleep:manual:${session.sleepDate}`);
      if (existing && !window.confirm("Ya hay un descanso principal con esa fecha de despertar. ¿Actualizarlo sin duplicarlo?")) return;
      onSave(session); setNotice("Descanso incorporado a tu historial. No se ha añadido un duplicado.");
    }}>
      <div className="wellnessGrid">
        <label>Me acosté el<input name="start" type="datetime-local" required value={form.start} onChange={change}/></label>
        <label>Me levanté el<input name="end" type="datetime-local" required value={form.end} onChange={change}/></label>
        <label>¿Cómo he descansado?<select aria-label="¿Cómo he descansado?" name="quality" required value={form.quality} onChange={change}><option value="">Seleccionar</option>{["Reparador", "Intermedio", "Poco reparador"].map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Energía al levantarme<select aria-label="Energía al levantarme" name="energy" required value={form.energy} onChange={change}><option value="">Seleccionar</option>{["Baja", "Media", "Alta"].map(value => <option key={value}>{value}</option>)}</select></label>
      </div>
      <button type="submit">Guardar descanso →</button>
    </form>
    <p role="status">{notice}</p>
    <h3>Últimos 7 días</h3>
    <div className="wellnessGrid">
      <article className="wellnessCard"><strong>{summary.count}/7 días con horarios</strong><p>Los días sin registro no se rellenan con ceros.</p></article>
      <article className="wellnessCard"><strong>{summary.average === null ? "Sin promedio todavía" : `${summary.average.toFixed(1)} h de intervalo medio`}</strong><p>Tiempo entre acostarte y levantarte, no horas de sueño verificadas.</p></article>
      <article className="wellnessCard"><strong>{summary.spreadMinutes === null ? "Faltan al menos 3 registros" : `${Math.round(summary.spreadMinutes)} min de variación de horario`}</strong><p>Rango más corto entre horas de acostarte, teniendo en cuenta medianoche. Es descriptivo, no una puntuación clínica.</p></article>
    </div>
    <ul className="wellnessHistory">{summary.records.map(item => <li key={item.id}>
      <div><time dateTime={item.sleepEnd}>{new Date(item.sleepEnd).toLocaleDateString("es-ES")}</time><p>{item.value} h · {item.quality} · energía {item.energy}</p><small>Origen: manual · {new Date(item.sleepStart).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}–{new Date(item.sleepEnd).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</small></div>
      <div className="wellnessActions"><button type="button" onClick={() => { setForm({ start: localInput(item.sleepStart), end: localInput(item.sleepEnd), quality: item.quality, energy: item.energy }); setNotice("Registro abierto para editar. Pulsa Guardar descanso cuando termines."); }}>Editar</button><button type="button" onClick={() => onDelete(item.id)}>Eliminar</button></div>
    </li>)}</ul>
    <small>Los registros antiguos sin horarios se conservan en tu historial general. Guardado local, sin envío desde este módulo. Si el mal descanso persiste o afecta a tu vida diaria, consulta con un profesional sanitario.</small>
  </section>;
}
