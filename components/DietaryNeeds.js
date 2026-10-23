"use client";

export default function DietaryNeeds({ profile, setProfile }) {
  const update = (field, value) => setProfile(current => ({ ...current, [field]: value }));
  return <section className="wellnessPanel" aria-label="Necesidades alimentarias">
    <h3>Tu alimentación y bienestar</h3>
    <p>Conserva tus restricciones y las indicaciones alimentarias que ya te haya dado un profesional. Esta sección no registra ni interpreta controles clínicos.</p>
    <div className="wellnessGrid">
      <label>Alergias alimentarias<input value={profile.allergens || ""} onChange={event => update("allergens", event.target.value)} placeholder="Ej.: huevo, cacahuete…" /></label>
      <label>Intolerancias alimentarias<input value={profile.intolerances || ""} onChange={event => update("intolerances", event.target.value)} placeholder="Ej.: lactosa…" /></label>
      <label>Alimentos que prefiero excluir<input value={profile.avoid || ""} onChange={event => update("avoid", event.target.value)} placeholder="Ej.: cebolla, picante…" /></label>
    </div>
    <label>Indicaciones alimentarias de mi profesional (solo en este dispositivo)<textarea value={profile.dietaryGuidance || ""} onChange={event => update("dietaryGuidance", event.target.value)} placeholder="Copia únicamente las indicaciones para organizar tus comidas. No introduzcas resultados de analíticas ni medicación." maxLength={3000} /></label>
    <small>Estas notas no se añaden automáticamente a las consultas de IA ni modifican por sí solas el menú. Revisa siempre el etiquetado y las trazas; para una dieta terapéutica, sigue las indicaciones de tu profesional.</small>
  </section>;
}
