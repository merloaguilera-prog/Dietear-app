"use client";
import { useEffect, useState } from "react";
import { HABITS_KEY, HABITS_EVENT, HABIT_CHOICES, normalizeHabits, updateHabitDay, habitWeek } from "../lib/daily-habits.js";
import { localDay } from "../lib/local-day.js";

export default function DailyHabits({ onOpen }) {
  const [state, setState] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const read = () => {
      try { setState(normalizeHabits(JSON.parse(localStorage.getItem(HABITS_KEY) || "{}"))); }
      catch { setNotice("No se pudo recuperar el seguimiento. No se sobrescribirá hasta que puedas volver a abrirlo."); }
    };
    read();
    const timer = setInterval(read, 60000);
    window.addEventListener("focus", read);
    window.addEventListener("storage", read);
    window.addEventListener(HABITS_EVENT, read);
    return () => { clearInterval(timer); window.removeEventListener("focus", read); window.removeEventListener("storage", read); window.removeEventListener(HABITS_EVENT, read); };
  }, []);

  function save(change) {
    try {
      const current = JSON.parse(localStorage.getItem(HABITS_KEY) || "{}");
      const next = updateHabitDay(current, localDay(), change);
      localStorage.setItem(HABITS_KEY, JSON.stringify(next));
      setState(next);
      setNotice("Guardado en este dispositivo.");
      window.dispatchEvent(new Event(HABITS_EVENT));
    } catch { setNotice("No se pudo guardar. Revisa el espacio o los permisos del navegador; no hemos marcado el cambio como guardado."); }
  }

  const today = state?.day || localDay();
  const entry = state?.days[today];
  const completed = state?.active.filter(id => entry?.completed.includes(id)).length || 0;
  return <section className="wellnessPanel habitsPanel" aria-labelledby="daily-habits-title">
    <small>OBJETIVOS CONCRETOS · SIN CASTIGOS</small>
    <h2 id="daily-habits-title">Hoy me propongo…</h2>
    <p>Elige de 1 a 3 pequeños objetivos. Marca lo que hayas hecho; cambiar un objetivo no borra tu historial.</p>
    {!state ? <p>Cargando seguimiento…</p> : <>
      <details open>
        <summary>Elegir o cambiar mis objetivos ({state.active.length}/3)</summary>
        <div className="wellnessActions">
          {HABIT_CHOICES.map(habit => <button key={habit.id} type="button" aria-pressed={state.active.includes(habit.id)} onClick={() => {
            if (!state.active.includes(habit.id) && state.active.length === 3) { setNotice("Para mantenerlo sencillo, desmarca un objetivo antes de añadir otro."); return; }
            save({ active: state.active.includes(habit.id) ? state.active.filter(id => id !== habit.id) : [...state.active, habit.id] });
          }}>{state.active.includes(habit.id) ? "✓ " : "+ "}{habit.label}</button>)}
        </div>
      </details>
      <div className="wellnessGrid">
        {HABIT_CHOICES.filter(habit => state.active.includes(habit.id)).map(habit => <article className="wellnessCard" key={habit.id}>
          <h3>{habit.label}</h3><p>{habit.action}</p>
          <button type="button" aria-pressed={entry?.completed.includes(habit.id) || false} onClick={() => save({ toggle: habit.id })}>{entry?.completed.includes(habit.id) ? "✓ Hecho hoy (desmarcar)" : "Marcar como hecho"}</button>
          {onOpen && <button type="button" onClick={() => onOpen(habit.tab, habit.section)}>Abrir registro →</button>}
        </article>)}
      </div>
      {!!state.active.length && <p>{completed} de {state.active.length} objetivos marcados hoy. <button type="button" onClick={() => save({ review: true })}>Revisar mi día</button></p>}
      <details><summary>Mi revisión de los últimos 7 días</summary>
        <p>Son tus marcas personales, no una evaluación médica. Un día sin datos no se interpreta como incumplimiento.</p>
        <ul className="wellnessHistory">{habitWeek(state, today).map(day => <li key={day.day}><time dateTime={day.day}>{new Date(day.day + "T12:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}</time><span>{day.status}{day.total && day.status !== "Sin evaluar" ? ` · ${day.completed}/${day.total}` : ""}</span></li>)}</ul>
      </details>
      <details><summary>Privacidad del seguimiento</summary><p>Los hábitos se guardan solo en este navegador. No se sincronizan ni se envían a la IA desde este módulo.</p><button type="button" onClick={() => {
        if (!window.confirm("¿Borrar solo los objetivos diarios y su historial de hábitos? El resto de tus datos se conserva.")) return;
        try { localStorage.removeItem(HABITS_KEY); setState(normalizeHabits({})); window.dispatchEvent(new Event(HABITS_EVENT)); setNotice("Objetivos diarios e historial de hábitos eliminados de este dispositivo."); }
        catch { setNotice("No se pudo borrar el seguimiento."); }
      }}>Borrar mis hábitos e historial</button></details>
    </>}
    <p role="status">{notice}</p>
  </section>;
}
