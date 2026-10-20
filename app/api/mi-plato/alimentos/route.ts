import { NextRequest, NextResponse } from "next/server";
import { catalogoUSDA } from "../../../../lib/mi-plato/usda";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Must be protected with the app's authenticated session and per-user rate limits before production.
  if (process.env.MI_PLATO_NUTRITION_ENABLED !== "true") {
    return NextResponse.json({ error: "Búsqueda nutricional aún no activada" }, { status: 503 });
  }
  const key = process.env.USDA_API_KEY;
  if (!key) return NextResponse.json({ error: "Catálogo nutricional no configurado" }, { status: 503 });
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 100) {
    return NextResponse.json({ error: "Introduce entre 2 y 100 caracteres" }, { status: 400 });
  }
  try {
    const fichas = await catalogoUSDA(key).buscar(query);
    return NextResponse.json({ fichas }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No se ha podido consultar el catálogo" }, { status: 502 });
  }
}
