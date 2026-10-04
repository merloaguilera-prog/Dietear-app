"use client";
import { useEffect, useRef, useState } from "react";

export default function ProductScanner({ onAdd, onAsk }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const video = useRef(null), controls = useRef(null), generation = useRef(0), request = useRef(null);
  useEffect(() => () => {
    generation.current++;
    controls.current?.stop();
    request.current?.abort();
  }, []);
  function stop() {
    generation.current++;
    controls.current?.stop();
    controls.current = null;
    setScanning(false);
  }
  async function lookup(raw) {
    const code = String(raw).trim();
    if (!/^\d{8,14}$/.test(code)) {
      setStatus("El código debe tener entre 8 y 14 cifras. También puedes buscar por nombre.");
      return;
    }
    request.current?.abort();
    const abort = new AbortController(); request.current = abort;
    setQuery(code); setBusy(true); setProduct(null); setStatus("Consultando el producto…");
    try {
      const response = await fetch(`/api/product?code=${encodeURIComponent(code)}`, { signal: abort.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo consultar el producto.");
      setProduct(data.product); setStatus("Código leído y producto localizado.");
    } catch (error) { if (error.name !== "AbortError") setStatus(error.message); }
    finally { if (request.current === abort) setBusy(false); }
  }
  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) { setStatus("La cámara necesita un navegador compatible y conexión segura. Puedes escribir el código o subir una foto."); return; }
    setScanning(true); setStatus("Coloca el código de barras delante de la cámara.");
    const token = ++generation.current;
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      if (token !== generation.current) return;
      const reader = new BrowserMultiFormatReader();
      const active = await reader.decodeFromConstraints({ audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } } }, video.current, (result, error, current) => {
        if (!result || token !== generation.current) return;
        const value = result.getText();
        if (!/^\d{8,14}$/.test(value)) { setStatus("Código detectado, pero no es un código de producto. Acerca el código de barras."); return; }
        current.stop(); stop(); lookup(value);
      });
      if (token !== generation.current) active.stop(); else controls.current = active;
    } catch { if (token === generation.current) { stop(); setStatus("No se pudo abrir la cámara. Revisa el permiso o sube una foto del código."); } }
  }
  async function photo(event) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    stop(); setStatus("Leyendo el código de la foto…");
    const url = URL.createObjectURL(file), token = ++generation.current;
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const result = await new BrowserMultiFormatReader().decodeFromImageUrl(url);
      if (token === generation.current) await lookup(result.getText());
    } catch { if (token === generation.current) setStatus("No he encontrado un código legible. Prueba una foto más cercana o escribe las cifras."); }
    finally { URL.revokeObjectURL(url); }
  }
  function search(event) {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    if (/^\d+$/.test(text)) lookup(text);
    else if (onAsk) onAsk(`Busca información sobre ${text}: ingredientes, información nutricional y aspectos a tener en cuenta con mi perfil. Distingue los datos del producto de los que falten.`);
    else setStatus("Para escanear, escribe las cifras del código. Puedes añadir el nombre en el campo de productos.");
  }
  const name = product?.product_name_es || product?.product_name || "Producto " + query;
  return <section className="productScanner" aria-label="Conoce lo que comes">
    <div className="scannerActions"><button type="button" onClick={scanning ? stop : start}>{scanning ? "Cerrar cámara" : "📷 Escanear código de barras"}</button><label className="photoCode">Subir foto del código<input type="file" accept="image/*" onChange={photo}/></label></div>
    <video ref={video} hidden={!scanning} autoPlay muted playsInline aria-label="Cámara para leer el código"/>
    <form onSubmit={search}><label>{onAsk ? "Nombre del alimento o código de barras" : "Código de barras"}<input value={query} onChange={event=>setQuery(event.target.value)} placeholder={onAsk ? "Ej.: yogur natural o 841…" : "Escribe las cifras del código"}/></label><button type="submit" disabled={busy || !query.trim()}>{busy ? "Buscando…" : "Buscar producto"}</button></form>
    {status && <p role="status">{status}</p>}
    {product && <article className="productResult"><h3>{name}</h3><p>{product.brands}</p><p><b>Ingredientes:</b> {product.ingredients_text_es || product.ingredients_text || "No disponibles"}</p><p><b>Alérgenos declarados:</b> {product.allergens || "Sin datos declarados"}</p><p><b>Posibles trazas:</b> {product.traces || "Sin datos declarados"}</p><p><b>Nutri-Score:</b> {/^[a-e]$/.test(product.nutriscore_grade) ? product.nutriscore_grade.toUpperCase() : "No disponible"}</p><p>Información por 100 g / 100 ml: {Number.isFinite(product.nutriments?.["energy-kcal_100g"]) ? product.nutriments["energy-kcal_100g"] + " kcal" : "energía no disponible"}.</p><small>Comprueba la etiqueta y tus alergias. Que falten datos no significa que el producto sea apto.</small><p><a href={"https://world.openfoodfacts.org/product/" + (product.code || query)} target="_blank" rel="noreferrer">Datos de Open Food Facts · ODbL</a></p>{onAdd && <button type="button" onClick={()=>onAdd(name)}>＋ Añadir a Mi Compra</button>}{onAsk && <button type="button" onClick={()=>onAsk(`Ayúdame a entender la etiqueta de ${name}, con mi perfil y restricciones. Datos publicados: ${JSON.stringify(product)}. No afirmes que es apto si faltan datos.`)}>Consultar con DIETEAR →</button>}</article>}
  </section>;
}
