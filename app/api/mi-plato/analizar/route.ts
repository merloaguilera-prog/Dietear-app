import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Alimento = { nombre: string; gramos_estimados: number | null; confianza: "baja" | "media" | "alta" };
function isAlimento(x: unknown): x is Alimento {
  if (!x || typeof x !== "object") return false;
  const a = x as Record<string, unknown>;
  return typeof a.nombre === "string" && a.nombre.length > 0 && a.nombre.length < 120 &&
    (a.gramos_estimados === null || (typeof a.gramos_estimados === "number" && Number.isFinite(a.gramos_estimados) && a.gramos_estimados > 0 && a.gramos_estimados <= 5000)) &&
    ["baja", "media", "alta"].includes(String(a.confianza));
}

export async function POST(req: NextRequest) {
  // IMPORTANT: Mount this endpoint only behind the application's authenticated session
  // and implement per-user rate limiting before enabling for real users.
  if (process.env.MI_PLATO_AI_ENABLED !== "true") return NextResponse.json({ error: "Análisis aún no activado" }, { status: 503 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Servicio no configurado" }, { status: 503 });
  const type = req.headers.get("content-type") || "";
  if (!type.startsWith("multipart/form-data")) return NextResponse.json({ error: "Formato inválido" }, { status: 415 });
  let photo: FormDataEntryValue | null;
  try { photo = (await req.formData()).get("photo"); }
  catch { return NextResponse.json({ error: "Formulario inválido" }, { status: 400 }); }
  if (!(photo instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(photo.type) || photo.size > 8 * 1024 * 1024 || photo.size === 0) {
    return NextResponse.json({ error: "Usa una imagen JPEG, PNG o WebP de hasta 8 MB" }, { status: 400 });
  }
  const bytes = Buffer.from(await photo.arrayBuffer());
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.MI_PLATO_VISION_MODEL || "gpt-4.1-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: 'Analiza solo los alimentos visibles. Devuelve exclusivamente JSON: {"alimentos":[{"nombre":"...","gramos_estimados":null,"confianza":"baja"}],"observaciones":"..."}. Si no puedes estimar gramos con fundamento, usa null. Nunca inventes ingredientes ocultos ni afirmes conocer alérgenos. Máximo 20 alimentos. No calcules calorías ni macronutrientes; se calcularán con una base nutricional contrastada tras corrección humana.' },
          { role: "user", content: [
            { type: "text", text: "Identifica los alimentos de esta fotografía. Las cantidades son solo estimaciones visuales." },
            { type: "image_url", image_url: { url: `data:${photo.type};base64,${bytes.toString("base64")}` } }
          ] }
        ]
      })
    });
    if (!response.ok) return NextResponse.json({ error: "No se pudo analizar la imagen" }, { status: 502 });
    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}") as Record<string, unknown>;
    if (!Array.isArray(parsed.alimentos) || !parsed.alimentos.every(isAlimento)) throw new Error("Respuesta inválida");
    return NextResponse.json({ alimentos: parsed.alimentos.slice(0, 20), observaciones: typeof parsed.observaciones === "string" ? parsed.observaciones.slice(0, 500) : "", estimacion: true });
  } catch {
    return NextResponse.json({ error: "No se pudo completar el análisis" }, { status: 502 });
  } finally { clearTimeout(timer); }
}
