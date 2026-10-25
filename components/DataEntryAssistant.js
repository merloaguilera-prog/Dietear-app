"use client";
import {useEffect, useRef, useState} from 'react';
import {applyEntryValue, dictationValue, entryFields, fieldLabel, isEntryField, startDictation} from '../lib/data-entry';

export default function DataEntryAssistant() {
  const [field,setField] = useState(null), [supported,setSupported] = useState(false), [listening,setListening] = useState(false);
  const [consent,setConsent] = useState(false), [explain,setExplain] = useState(false), [draft,setDraft] = useState(null), [message,setMessage] = useState(''), [bottom,setBottom] = useState(90), [maxHeight,setMaxHeight] = useState(320);
  const cancel = useRef(null), current = useRef(null), timer = useRef(null);
  function stop() { cancel.current?.(); cancel.current = null; clearTimeout(timer.current); setListening(false); }
  useEffect(() => {
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    const focus = event => {
      if (event.target.closest?.('[data-entry-assistant]')) return;
      if (event.target === current.current) return;
      stop(); setDraft(null); setExplain(false); setMessage('');
      current.current = isEntryField(event.target) ? event.target : null; setField(current.current);
    };
    const hide = () => { if (document.hidden) { stop(); setDraft(null); } };
    const resize = () => { const v = window.visualViewport; setMaxHeight(Math.max(110,Math.min(320,(v?.height || window.innerHeight)*.42))); setBottom(v && window.innerHeight - v.height > 150 ? Math.max(12,window.innerHeight-v.height-v.offsetTop+12) : 90); };
    resize();
    document.addEventListener('focusin',focus); document.addEventListener('visibilitychange',hide);
    window.visualViewport?.addEventListener('resize',resize); window.visualViewport?.addEventListener('scroll',resize);
    const observer = new MutationObserver(() => { if (current.current && !current.current.isConnected) { stop(); current.current=null; setField(null); } });
    observer.observe(document.body,{childList:true,subtree:true});
    return () => { cancel.current?.(); clearTimeout(timer.current); observer.disconnect(); document.removeEventListener('focusin',focus); document.removeEventListener('visibilitychange',hide); window.visualViewport?.removeEventListener('resize',resize); window.visualViewport?.removeEventListener('scroll',resize); };
  },[]);
  if (!field) return null;
  function next() {
    stop(); setDraft(null);
    const fields = entryFields(document), index = fields.indexOf(field), target = fields[index+1];
    if (target) { target.focus(); target.scrollIntoView({block:'center',behavior:'smooth'}); }
    else { setMessage('Has llegado al último campo. Revisa los datos y usa el botón de guardar o continuar de esta sección.'); }
  }
  function dictate() {
    if (listening) { stop(); setMessage('Dictado detenido.'); return; }
    if (!consent) { setExplain(true); return; }
    stop(); setDraft(null); setMessage('Escuchando: di solo el dato de este campo.');
    const target = field;
    try {
      cancel.current = startDictation(window.SpeechRecognition || window.webkitSpeechRecognition,{
        result: text => { if (current.current !== target) return; setDraft({text,value:dictationValue(target,text),previous:target.value}); setMessage('Revisa lo que he entendido antes de usarlo.'); },
        error: code => { stop(); setMessage(code === 'not-allowed' || code === 'service-not-allowed' ? 'El micrófono no tiene permiso. Puedes habilitarlo en el navegador o seguir escribiendo.' : 'No se ha podido completar el dictado. Puedes intentarlo otra vez o escribir.'); },
        end: () => { clearTimeout(timer.current); setListening(false); setMessage(old => old.startsWith('Escuchando') ? 'No se ha reconocido ningún dato. Prueba otra vez o escribe.' : old); },
      });
      setListening(true); timer.current = setTimeout(() => { stop(); setMessage('Dictado detenido. Puedes volver a pulsar el micrófono.'); },20000);
    } catch { stop(); setMessage('No se pudo iniciar el micrófono. Puedes seguir escribiendo.'); }
  }
  function useValue(advance) {
    stop();
    if (field.value !== draft.previous) { setDraft(null); setMessage('El campo ha cambiado. Se conserva lo que has escrito; vuelve a dictar si lo necesitas.'); return; }
    if (!applyEntryValue(field,draft.value)) { setMessage('Ese dato no encaja con el formato o los límites del campo. Revisa el valor o escríbelo.'); return; }
    setDraft(null); setMessage('Dato introducido.'); if (advance) next();
  }
  return <aside className="dataEntryAssistant" data-entry-assistant="true" aria-label="Ayuda para introducir datos" style={{bottom,maxHeight}}>
    <div className="entryHeading"><strong>{fieldLabel(field).slice(0,90)}</strong><button type="button" aria-label="Cerrar ayuda de datos" onClick={() => {stop(); setField(null); current.current=null;}}>×</button></div>
    <div className="entryButtons">
      {supported && <button type="button" aria-pressed={listening} onPointerDown={e=>e.preventDefault()} onClick={dictate}>{listening?'■ Detener':'🎙️ Dictar este dato'}</button>}
      <button type="button" onPointerDown={e=>e.preventDefault()} onClick={next}>Siguiente campo →</button>
    </div>
    {!supported && <small>Puedes usar el micrófono del teclado de tu móvil o escribir.</small>}
    {explain && <div><p>El dictado usa el servicio de voz del navegador, que puede enviar el audio a su proveedor. DIETEAR no guarda grabaciones. Se escucha solo al pulsar y puedes detenerlo.</p><label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Quiero usar el dictado de voz en esta sesión.</label><button type="button" disabled={!consent} onClick={()=>{setExplain(false);dictate();}}>Empezar a dictar</button></div>}
    {message && <p role="status">{message}</p>}
    {draft && <div className="entryDraft"><p>He entendido: <b>{draft.text}</b></p>{draft.value === null ? <p>No puedo convertirlo con seguridad a este campo. Prueba diciendo solo el número o elige la opción manualmente.</p> : <><p>Valor a introducir: <b>{field.tagName === 'SELECT' ? [...field.options].find(x=>x.value===draft.value)?.textContent : draft.value}</b>{draft.previous && ' (sustituirá el contenido actual)'}</p><button type="button" onClick={()=>useValue(true)}>Usar y siguiente →</button><button type="button" onClick={()=>useValue(false)}>Usar en este campo</button></>}<button type="button" onClick={()=>{stop();setDraft(null);setMessage('Dictado descartado.');}}>Descartar</button></div>}
  </aside>;
}
