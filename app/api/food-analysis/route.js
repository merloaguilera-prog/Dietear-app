import { FOOD_SCHEMA, FOOD_INSTRUCTIONS, normalizeFoodAnalysis } from "../../../lib/food-analysis";
import { getAIRuntime } from "../../../lib/ai-runtime";
import { wellnessContext, isClinicalRequest, WELLNESS_ONLY_MESSAGE, WELLNESS_SCOPE } from "../../../lib/wellness-context.js";

export const maxDuration = 60;
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Escribe un alimento para analizar." }, { status: 400 }); }
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query || query.length > 500) return Response.json({ error: "Escribe un alimento y, si lo conoces, su marca (hasta 500 caracteres)." }, { status: 400 });
  if (isClinicalRequest(query)) return Response.json({ error: WELLNESS_ONLY_MESSAGE }, { status: 422 });
  const runtime = getAIRuntime();
  if (!runtime) return Response.json({ error: "El análisis nutricional no tiene una conexión activa en este despliegue." }, { status: 503 });
  try {
    const response = await fetch(runtime.endpoint, {
      method: "POST", headers: { Authorization: `Bearer ${runtime.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: runtime.model, instructions: `${FOOD_INSTRUCTIONS}\n${WELLNESS_SCOPE}`, input: JSON.stringify({ alimento: query, contexto: wellnessContext(body.context) }), tools: [{ type: "web_search" }], tool_choice: "required", include: ["web_search_call.action.sources"], text: { format: { type: "json_schema", name: "dietear_food_analysis", strict: true, schema: FOOD_SCHEMA } } }),
      signal: AbortSignal.timeout(55000),
    });
    if (!response.ok) return Response.json({ error: "No se ha podido consultar la información nutricional. Inténtalo de nuevo." }, { status: 502 });
    const data = await response.json();
    const output = (data.output || []).flatMap(item => item.type === "message" ? item.content || [] : []);
    const text = output.filter(item => item.type === "output_text").map(item => item.text).join("");
    const sources = [...(data.output || []).flatMap(item => item.type === "web_search_call" ? item.action?.sources || [] : []), ...output.flatMap(item => item.annotations || [])].filter(item => item.url).map(item => ({ url: item.url, title: item.title || item.url }));
    return Response.json({ analysis: normalizeFoodAnalysis(JSON.parse(text), [...new Map(sources.map(item => [item.url, item])).values()]) });
  } catch { return Response.json({ error: "No se ha podido completar la ficha. Prueba con el nombre y la marca exactos." }, { status: 502 }); }
}
