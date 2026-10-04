"use client";
import { useEffect, useRef, useState } from "react";

export default function ShoppingEntry({ onAdd, flash }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recognition = useRef(null);
  useEffect(() => () => recognition.current?.abort(), []);
  function add(event) {
    event?.preventDefault();
    const names = text.split(/[,;\n]/).map(x => x.trim()).filter(Boolean);
    if (!names.length) return;
    onAdd(names);
    setText("");
  }
  function dictate() {
    if (listening) { recognition.current?.stop(); return; }
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) { flash("Puedes escribir los productos en este navegador."); return; }
    const rec = new Speech();
    recognition.current = rec;
    rec.lang = "es-ES";
    rec.onresult = event => setText(old => [old, event.results[0][0].transcript].filter(Boolean).join(", "));
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); flash("Revisa el permiso del micrófono o escribe el producto."); };
    try { rec.start(); setListening(true); } catch { setListening(false); }
  }
  return <form className="shoppingEntry" onSubmit={add}>
    <label>Escribir productos<input value={text} onChange={event => setText(event.target.value)} placeholder="Ej.: tomates, arroz, manzanas" /></label>
    <button type="submit" disabled={!text.trim()}>＋ Añadir producto</button>
    <button type="button" aria-pressed={listening} onClick={dictate}>{listening ? "Terminar dictado" : "🎙️ Dictar"}</button>
  </form>;
}
