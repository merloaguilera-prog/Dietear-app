"use client";

import { useEffect, useRef, useState } from "react";

export default function DietearAI({ profile, fridge, planner, history=[], careRecords=[], onPlan, incomingQuestion }) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [citations, setCitations] = useState([]);
  const [useContext, setUseContext] = useState(false);
  const controllerRef = useRef(null);
  useEffect(() => () => controllerRef.current?.abort(), []);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("buscar");
  const lastQuestion = useRef(null);
  const inFlight = useRef(false);

  async function ask(question = q, searchMode = mode) {
    const query = question.trim();
    if (!query || inFlight.current) return;
    inFlight.current = true;
    setQ(query);
    setLoading(true);
    setAnswer("");
    setSources([]);
    setCitations([]);
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          mode: searchMode,
          useContext,
          context: useContext ? { profile: Object.fromEntries(Object.entries(profile || {}).filter(([key]) => ["age", "sex", "height", "weight", "goal", "goals", "goalTargets", "activity", "allergies", "intolerances", "conditions", "medication", "likes", "dislikes", "healthArea", "healthAreaNotes"].includes(key))), fridge: (fridge || []).map(item => item.name), week: planner, history: history.slice(0,60), careRecords: careRecords.slice(0,20) } : {}
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo responder ahora.");
      setAnswer(data.text || "No he encontrado una respuesta útil.");
      setSources(data.sources || []);
      setCitations(data.citations || []);
    } catch (error) {
      setAnswer("🌿 " + (error.name === "AbortError" ? "La consulta ha tardado demasiado. Vuelve a intentarlo; tu pregunta sigue aquí." : error.message));
    } finally {
      clearTimeout(timeout);
      controllerRef.current = null;
      inFlight.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!incomingQuestion?.text || incomingQuestion.id === lastQuestion.current || inFlight.current) return;
    lastQuestion.current = incomingQuestion.id;
    ask(incomingQuestion.text);
    // Each incoming question represents one explicit action in Hoy or Cuida de ti.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingQuestion, loading]);

  return <section className="aiForest" id="dietear-assistant">
    <div className="aiCrown"><div><small>🌳 DIETEAR IA · BOSQUE DE CONOCIMIENTO</small><h2>Pregunta. Busca. Comprueba. Decide.</h2><p>Internet actualizado + tu contexto autorizado, explicado con calma y con fuentes.</p></div><span className="aiPulse">IA</span></div>
    <div className="aiModes"><button className={mode === "buscar" ? "selected" : ""} onClick={() => setMode("buscar")}>⚡ Buscar</button><button className={mode === "investigar" ? "selected" : ""} onClick={() => setMode("investigar")}>🔎 Investigar</button></div>
    <label className="aiContext"><input type="checkbox" checked={useContext} disabled={loading} onChange={event => setUseContext(event.target.checked)}/> Incluir mis datos de alimentación y salud, plan, nevera y registros en esta consulta a la IA. Puedes preguntar sin compartirlos.</label>
    <div className="aiComposer"><textarea aria-label="Pregunta para DIETEAR" value={q} onChange={event => setQ(event.target.value)} placeholder="Ej.: Busca una cena sencilla, económica y sin lactosa para cuatro personas…" onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); ask(); } }} /><button disabled={loading || !q.trim()} onClick={() => ask()}>{loading ? "Buscando entre las ramas…" : "Preguntar a DIETEAR →"}</button></div>
    <div className="aiPrompts">{["¿Qué puedo comer hoy?", "Busca opciones económicas", "Compara esta información de nutrición"].map(item => <button key={item} onClick={() => setQ(item)}>{item}</button>)}</div>
    {(loading || answer) && <div className="aiAnswer" role="status" aria-live="polite">{loading ? <div className="aiLoading"><i/><span>Consultando y contrastando información…</span></div> : <><small>RESPUESTA DIETEAR</small><div className="aiText">{renderCitations(answer, citations)}</div>{sources.length > 0 && <div className="aiSources"><b>Fuentes consultadas</b>{sources.map((source, index) => <a key={index} href={source.url} target="_blank" rel="noreferrer">{index + 1}. {source.title}</a>)}</div>}<div className="aiAct"><button onClick={() => onPlan?.()}>📅 Abrir Mi Plan</button></div></>}</div>}
  </section>;
}

function renderCitations(text, citations) {
  const parts = []; let cursor = 0;
  for (const citation of [...citations].sort((a,b) => a.start-b.start)) {
    if (citation.start < cursor || citation.end > text.length || citation.end <= citation.start || !/^https?:\/\//.test(citation.url)) continue;
    parts.push(text.slice(cursor, citation.start));
    parts.push(<a key={citation.start+"-"+citation.url} href={citation.url} title={citation.title} target="_blank" rel="noreferrer">{text.slice(citation.start, citation.end)}</a>);
    cursor = citation.end;
  }
  parts.push(text.slice(cursor)); return parts;
}
