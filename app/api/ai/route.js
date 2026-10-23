import { getAIRuntime } from "../../../lib/ai-runtime";
import { wellnessContext, isClinicalRequest, WELLNESS_ONLY_MESSAGE, WELLNESS_SCOPE } from "../../../lib/wellness-context.js";

export const maxDuration = 60;
const SYSTEM = `Eres DIETEAR, asistente de alimentación y bienestar. Responde en español claro, cálido y práctico. Distingue evidencia de opinión, prioriza fuentes científicas y primarias y expresa incertidumbre. Usa solo el contexto recibido. ${WELLNESS_SCOPE} Cuando ayude, termina con pasos pequeños y realistas. TODO SUMA.`;

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Escribe una pregunta válida." }, { status: 400 }); }
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query || query.length > 2000) return Response.json({ error: "Escribe una pregunta de hasta 2000 caracteres." }, { status: 400 });
  if (isClinicalRequest(query)) return Response.json({ text: WELLNESS_ONLY_MESSAGE, sources: [] });
  const runtime = getAIRuntime();
  if (!runtime) return Response.json({ error: "DIETEAR IA no tiene una conexión activa en este despliegue." }, { status: 503 });
  try {
    const response = await fetch(runtime.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${runtime.token}` },
      signal: AbortSignal.timeout(55000),
      body: JSON.stringify({
        model: runtime.model, instructions: SYSTEM, tools: [{ type: "web_search" }],
        include: ["web_search_call.action.sources"],
        input: JSON.stringify({ consulta: query, contexto: wellnessContext(body.context) }),
      }),
    });
    const data = await response.json();
    if (!response.ok) return Response.json({ error: "No se pudo consultar DIETEAR IA. Inténtalo de nuevo." }, { status: response.status });
    const text = (data.output || []).flatMap(item => item.content || []).filter(item => item.type === "output_text").map(item => item.text).join("\n").trim();
    const sources = (data.output || []).filter(item => item.type === "web_search_call").flatMap(item => item.action?.sources || []).map(item => ({ title: item.title || item.url, url: item.url })).filter(item => /^https?:\/\//.test(item.url || "")).slice(0, 8);
    return Response.json({ text: text || "No he encontrado una respuesta útil.", sources });
  } catch (error) {
    const timeout = error?.name === "TimeoutError";
    return Response.json({ error: timeout ? "La consulta está tardando demasiado. Inténtalo de nuevo." : "No se pudo completar la consulta." }, { status: timeout ? 504 : 500 });
  }
}
