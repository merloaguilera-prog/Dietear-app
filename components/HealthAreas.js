"use client";
import { useState } from "react";
import SelectedArtwork from "./SelectedArtwork";

const areas = ["Corazón", "Riñones", "Pulmones", "Hígado", "Sistema digestivo", "Piel"];

export default function HealthAreas({ profile, setProfile, onAsk }) {
  const [search, setSearch] = useState("");
  const selected = profile.healthArea || "";
  const visible = areas.filter(area => area.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
  return <section className="healthAreas" aria-label="Áreas de salud">
    <h3>Conoce tu cuerpo</h3>
    <label>Buscar un órgano o área<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Ej.: riñones, piel…" /></label>
    <div className="healthAreaGrid">{visible.map(area => <button type="button" key={area} aria-pressed={selected === area} onClick={() => setProfile(old => ({ ...old, healthArea: area }))}>
      <SelectedArtwork name={area} /><b>{area}</b>
    </button>)}</div>
    {!visible.length && <p>No aparece esa área. Puedes anotarla en tus necesidades de salud.</p>}
    {selected && <div className="healthAreaDetail">
      <h3>{selected}</h3>
      <label>Mis notas sobre {selected}<textarea value={profile.healthAreaNotes?.[selected] || ""} onChange={event => setProfile(old => ({ ...old, healthAreaNotes: { ...old.healthAreaNotes, [selected]: event.target.value } }))} placeholder="Anota tus necesidades o indicaciones recibidas" /></label>
      <small>Estas notas se guardan en tu perfil.</small>
      <button type="button" onClick={() => onAsk(`Explícame cómo cuidar ${selected.toLowerCase()} y qué hábitos de alimentación y actividad pueden ayudar. Ten en cuenta mis notas y distingue información general de indicaciones médicas.`)}>Preguntar a DIETEAR sobre {selected} →</button>
    </div>}
  </section>;
}
