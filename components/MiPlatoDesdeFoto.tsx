"use client";

import { useState } from "react";
import CapturaPlato from "./CapturaPlato";
import FlujoCorreccionNutricional from "./FlujoCorreccionNutricional";
import type { AlimentoEditable } from "./CorregirAlimentos";

/**
 * Experimental end-to-end UI bridge.
 * Analysis is explicitly initiated by the user; photo leaves the device only
 * after that action. Endpoint remains disabled until authentication is implemented.
 */
export default function MiPlatoDesdeFoto() {
  const [detectados, setDetectados] = useState<AlimentoEditable[] | null>(null);
  const [error, setError] = useState("");
  const [analizando, setAnalizando] = useState(false);

  async function analizar(photo: File) {
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type) || photo.size > 8 * 1024 * 1024) {
      throw new Error("Para analizar, selecciona JPEG, PNG o WebP de hasta 8 MB.");
    }
    setAnalizando(true);
    try {
      const form = new FormData();
      form.append("photo", photo);
      const response = await fetch("/api/mi-plato/analizar", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Análisis no disponible");
      if (!Array.isArray(data.alimentos)) throw new Error("Respuesta inesperada");
      setDetectados(data.alimentos as AlimentoEditable[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo analizar la fotografía");
      throw e;
    } finally { setAnalizando(false); }
  }

  return <div>
    {detectados ? <>
      <button type="button" onClick={() => setDetectados(null)}>← Fotografiar otro plato</button>
      <FlujoCorreccionNutricional detectados={detectados} />
    </> : <>
      <p>Al continuar, la fotografía se enviará al servicio de reconocimiento para analizar los alimentos. No se guardará automáticamente.</p>
      <CapturaPlato onSave={analizar} />
      {analizando && <p role="status">Analizando alimentos…</p>}
    </>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
