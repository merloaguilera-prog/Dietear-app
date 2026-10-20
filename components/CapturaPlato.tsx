"use client";

import { useEffect, useRef, useState } from "react";

type Props = { onSave?: (photo: File) => Promise<void> | void };
export default function CapturaPlato({ onSave }: Props) {
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!photo) { setPreview(null); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function select(file?: File) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Selecciona una imagen válida."); return; }
    if (file.size > 15 * 1024 * 1024) { setError("La foto no puede superar los 15 MB."); return; }
    setPhoto(file);
  }

  async function save() {
    if (!photo) return;
    if (!onSave) { setError("El registro todavía no está conectado. La foto no se ha guardado."); return; }
    setSaving(true); setError("");
    try { await onSave(photo); setPhoto(null); }
    catch { setError("No se ha podido guardar. Inténtalo de nuevo."); }
    finally { setSaving(false); }
  }

  return (
    <section aria-label="Fotografiar comida" style={{ padding: 20, border: "3px solid #56ff17", borderRadius: 24, background: "#103b23", color: "white" }}>
      <h2>Mi plato inteligente</h2>
      <p>Fotografía tu comida para empezar.</p>
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={e => { select(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={gallery} type="file" accept="image/*" hidden onChange={e => { select(e.target.files?.[0]); e.target.value = ""; }} />
      {preview ? <img src={preview} alt="Vista previa de la comida" style={{ width: "100%", maxHeight: 360, objectFit: "contain", borderRadius: 16 }} /> : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
        <button type="button" onClick={() => camera.current?.click()}>📷 Hacer foto</button>
        <button type="button" onClick={() => gallery.current?.click()}>🖼️ Galería</button>
        {photo && <button type="button" disabled={saving} onClick={() => setPhoto(null)}>Descartar</button>}
        {photo && <button type="button" disabled={saving} onClick={save}>{saving ? "Guardando…" : "Guardar foto"}</button>}
      </div>
      {error && <p role="alert">{error}</p>}
      <p style={{ fontSize: 13 }}>La imagen permanece en este dispositivo hasta que decidas guardarla.</p>
    </section>
  );
}
