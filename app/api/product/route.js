export async function GET(request) {
  const code = new URL(request.url).searchParams.get("code") || "";
  if (!/^\d{8,14}$/.test(code)) return Response.json({ error: "Escribe un código de barras de 8 a 14 cifras." }, { status: 400 });
  try {
    const fields = "code,product_name,product_name_es,brands,ingredients_text_es,ingredients_text,allergens,traces,nutriments,nutriscore_grade";
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${fields}`, {
      headers: { "User-Agent": "DIETEAR/1.0 (https://dietear-app.vercel.app)" },
      signal: AbortSignal.timeout(12000), next: { revalidate: 3600 }
    });
    if (!response.ok) return Response.json({ error: "La base de productos no responde ahora. Puedes añadir el producto escribiendo su nombre." }, { status: 502 });
    const data = await response.json();
    if (data.status !== 1 || !data.product) return Response.json({ error: "Código leído, pero el producto aún no está en la base de datos. Puedes escribir su nombre." }, { status: 404 });
    return Response.json({ product: data.product });
  } catch {
    return Response.json({ error: "No se pudo consultar el producto ahora. Prueba de nuevo o escribe su nombre." }, { status: 502 });
  }
}
