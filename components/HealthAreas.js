"use client";
import { useRef, useState } from "react";
import SelectedArtwork from "./SelectedArtwork";

const groups = [
  { name: "Cabeza y sentidos", areas: [["Cerebro y sistema nervioso", "🧠"], ["Ojos", "👁️"], ["Oídos", "👂"], ["Boca y dientes", "🦷"]] },
  { name: "Tórax y cuello", areas: [["Corazón", "❤️"], ["Pulmones", "🫁"], ["Tiroides", "🦋"]] },
  { name: "Abdomen y pelvis", areas: [["Hígado", "🟤"], ["Estómago", "🍽️"], ["Intestino delgado", "🌀"], ["Colon e intestino grueso", "🌀"], ["Sistema digestivo", "🥗"], ["Páncreas", "💛"], ["Vesícula biliar", "💚"], ["Bazo", "🟣"], ["Riñones", "🫘"], ["Vejiga", "💧"], ["Sistema reproductor", "🌸"]] },
  { name: "Movimiento, piel y circulación", areas: [["Huesos", "🦴"], ["Articulaciones", "🦵"], ["Músculos", "💪"], ["Piel", "✋"], ["Cabello y uñas", "✨"], ["Sangre y circulación", "🩸"]] }
];
const illustrated = new Set(["Corazón", "Riñones", "Pulmones", "Hígado", "Sistema digestivo", "Piel"]);
const normalize = value => value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function HealthAreas({ profile, setProfile, onAsk }) {
  const detailRef = useRef(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const selected = profile.healthArea || "";
  const tracked = profile.healthTrackedAreas || [];
  const details = profile.healthAreaDetails?.[selected] || {};
  const notes = profile.healthAreaNotes?.[selected] || "";
  const date = details.date || new Date().toLocaleDateString("sv-SE");
  const records = (profile.healthAreaRecords || []).filter(record => record.area === selected).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const hasData = [notes, details.changes, details.diagnosis, details.medication, details.guidance].some(value => value?.trim());
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(new Date(date + "T12:00:00").getTime());
  const updateDetails = (key, value) => setProfile(old => ({ ...old, healthAreaDetails: { ...old.healthAreaDetails, [selected]: { ...old.healthAreaDetails?.[selected], [key]: value } } }));
  const toggleTracked = area => setProfile(old => {
    const previous = old.healthTrackedAreas || [];
    return { ...old, healthTrackedAreas: previous.includes(area) ? previous.filter(item => item !== area) : [...previous, area] };
  });
  const openArea = area => { setProfile(old => ({ ...old, healthArea: area })); setNotice(""); window.setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); };
  const save = () => {
    if (!hasData || !validDate) return;
    const record = { ...details, id: Date.now() + Math.random(), area: selected, date: new Date(date + "T12:00:00").toISOString(), notes };
    setProfile(old => ({ ...old, healthTrackedAreas: [...new Set([...(old.healthTrackedAreas || []), selected])], healthAreaRecords: [record, ...(old.healthAreaRecords || [])] }));
    setNotice("Seguimiento guardado · " + new Date(record.date).toLocaleDateString("es-ES"));
  };
  const visibleGroups = groups.map(group => ({ ...group, areas: group.areas.filter(([area]) => normalize(area).includes(normalize(search))) })).filter(group => group.areas.length);

  return <section className="healthAreas" aria-label="Áreas de salud">
    <div className="organIntro"><small>MI CUERPO · MI SEGUIMIENTO</small><h3>Órganos y áreas de tu cuerpo</h3><p>Abre una tarjeta para añadir tus datos. Marca las áreas que quieras seguir; puedes elegir varias.</p></div>
    {tracked.length > 0 && <div className="trackedHealthAreas"><b>Áreas marcadas para seguimiento · {tracked.length}</b><div>{tracked.map(area => <button type="button" key={area} onClick={() => openArea(area)}>✓ {area} →</button>)}</div></div>}
    <label>Buscar un órgano o área<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Ej.: riñones, tiroides, estómago…" /></label>
    <div className="organGroups">{visibleGroups.map((group, groupIndex) => <section className={"organGroup organGroup-" + groupIndex} key={group.name} aria-label={group.name}>
      <h4>{group.name}</h4><div className="healthAreaGrid">{group.areas.map(([area, icon]) => <article className={"organCard" + (tracked.includes(area) ? " isTracked" : "")} key={area}>
        <button type="button" aria-label={"Abrir " + area} aria-pressed={selected === area} onClick={() => openArea(area)}>
          {illustrated.has(area) ? <SelectedArtwork name={area} /> : <span className="organSymbol" aria-hidden="true">{icon}</span>}<b>{area}</b><small>Abrir seguimiento →</small>
        </button>
        <label className="organCheck"><input type="checkbox" checked={tracked.includes(area)} onChange={() => toggleTracked(area)} aria-label={"Marcar " + area + " para seguimiento"} /><span>{tracked.includes(area) ? "Marcado" : "Marcar para seguir"}</span></label>
      </article>)}</div>
    </section>)}</div>
    {!visibleGroups.length && <p>No aparece esa área. Puedes anotarla en tus necesidades de salud.</p>}
    {selected && <div className="healthAreaDetail" ref={detailRef}>
      <small>SEGUIMIENTO DE UN ÁREA</small><h3>{selected}</h3>
      <div className="organDetailForm">
        <label>Fecha del seguimiento<input type="date" value={date} onChange={event => updateDetails("date", event.target.value)} /></label>
        <label>Qué quiero controlar / cambios observados<input value={details.changes || ""} onChange={event => updateDetails("changes", event.target.value)} placeholder="Escribe lo que quieras registrar" /></label>
        <label>Diagnóstico indicado por tu profesional (opcional)<input value={details.diagnosis || ""} onChange={event => updateDetails("diagnosis", event.target.value)} /></label>
        <label>Tratamiento o medicación indicada (opcional)<input value={details.medication || ""} onChange={event => updateDetails("medication", event.target.value)} /></label>
      </div>
      <label>Indicaciones para la alimentación de {selected}<textarea aria-label={"Indicaciones para la alimentación de " + selected} value={details.guidance || ""} onChange={event => updateDetails("guidance", event.target.value)} placeholder="Copia las indicaciones que te haya dado tu profesional" /></label>
      <label>Mis notas sobre {selected}<textarea aria-label={"Mis notas sobre " + selected} value={notes} onChange={event => setProfile(old => ({ ...old, healthAreaNotes: { ...old.healthAreaNotes, [selected]: event.target.value } }))} placeholder="Anota tus necesidades o indicaciones recibidas" /></label>
      <small>Los campos se conservan en tu perfil. Guarda cada registro para comparar su evolución por fecha.</small>
      <div className="organDetailActions"><button type="button" disabled={!hasData || !validDate} onClick={save}>Guardar seguimiento de {selected} →</button><button type="button" onClick={() => onAsk(`Quiero revisar el seguimiento de ${selected.toLowerCase()} guardado en mi perfil, incluyendo fechas, notas e indicaciones profesionales. Explícame hábitos generales y qué información falta para adaptar mi alimentación; no deduzcas un diagnóstico por haber marcado esta área.`)}>Preguntar a DIETEAR sobre {selected} →</button></div>
      {notice && <p className="measurementNotice" role="status">{notice}</p>}
      {records.length > 0 && <details className="organRecords" open><summary>Registros de {selected} · {records.length}</summary>{records.map(record => <article key={record.id}><b>{new Date(record.date).toLocaleDateString("es-ES")}</b>{[["Qué controlo", record.changes], ["Diagnóstico indicado", record.diagnosis], ["Tratamiento indicado", record.medication], ["Alimentación", record.guidance], ["Notas", record.notes]].filter(([, value]) => value).map(([label, value]) => <p key={label}><strong>{label}: </strong>{value}</p>)}</article>)}</details>}
    </div>}
  </section>;
}
