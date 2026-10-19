"use client";
import { useState } from "react";

const ideas = {
  seated: ["En una silla estable y sin ruedas, apoya los pies y busca una postura cómoda.", "Alterna suavemente levantar los talones y las puntas, sin forzar.", "Mueve los hombros despacio y descansa cuando lo necesites."],
  gentle: ["Elige un espacio despejado y un ritmo en el que puedas hablar con comodidad.", "Camina suavemente o realiza movilidad cómoda, sin forzar articulaciones.", "Haz pausas; la duración elegida es un máximo orientativo, no una obligación."],
};
export default function MovementBreaks({ onRecord }) {
  const [minutes, setMinutes] = useState(3), [mode, setMode] = useState("gentle"), [saved, setSaved] = useState(false);
  return <section className="wellnessPanel" aria-labelledby="movement-breaks-title">
    <small>MOVIMIENTO BREVE · A TU RITMO</small><h2 id="movement-breaks-title">Tengo unos minutos</h2>
    <p>Una pausa suave también cuenta. Estas opciones no son los protocolos intensos de investigación ni sustituyen un programa de fuerza o rehabilitación.</p>
    <div className="wellnessActions" aria-label="Duración de la pausa">{[1, 3, 5, 10].map(value => <button key={value} type="button" aria-pressed={minutes === value} onClick={() => { setMinutes(value); setSaved(false); }}>{value} min</button>)}</div>
    <label>Opción de movimiento<select value={mode} onChange={event => { setMode(event.target.value); setSaved(false); }}><option value="gentle">Caminar o movilidad suave</option><option value="seated">Movilidad sentada</option></select></label>
    <ol>{ideas[mode].map(step => <li key={step}>{step}</li>)}</ol>
    <p>Registra solo el tiempo que hayas realizado. Detente si aparece dolor, mareo, falta de aire inusual o malestar; si tienes restricciones, sigue las indicaciones de tu profesional.</p>
    <button type="button" disabled={saved} onClick={() => { onRecord(minutes, mode === "seated" ? "Movilidad sentada" : "Pausa de movimiento suave"); setSaved(true); }}>{saved ? "✓ Sesión registrada" : `He realizado ${minutes} min · guardar`}</button>
    <small style={{ display: "block", marginTop: 10 }}>La actividad no se guarda por elegir una rutina ni se convierte en calorías de comida.</small>
  </section>;
}
