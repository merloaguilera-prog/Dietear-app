"use client";
import {useEffect, useRef, useState} from 'react';
import {applyEntryValue, dictationError, dictationValue, entryFields, fieldLabel, isEntryField, startDictation} from '../lib/data-entry';

export default function DataEntryAssistant() {
  const [field,setField] = useState(null), [supported,setSupported] = useState(false), [listening,setListening] = useState(false), [starting,setStarting] = useState(false);
  const [draft,setDraft] = useState(null), [undo,setUndo] = useState(null), [message,setMessage] = useState(''), [bottom,setBottom] = useState(90), [maxHeight,setMaxHeight] = useState(320);
  const cancel = useRef(null), current = useRef(null), timer = useRef(null);
  function stop() { cancel.current?.(); cancel.current=null; clearTimeout(timer.current); setListening(false); setStarting(false); }
  useEffect(() => {
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    const focus = event => {
      if (event.target.closest?.('[data-entry-assistant]') || event.target === current.current) return;
      stop(); setDraft(null); setUndo(null); setMessage('');
      current.current=isEntryField(event.target)?event.target:null; setField(current.current);
    };
    const hide = () => { if(document.hidden){stop();setDraft(null);} };
    const resize = () => {const v=window.visualViewport;setMaxHeight(Math.max(110,Math.min(320,(v?.height||window.innerHeight)*.42)));setBottom(v&&window.innerHeight-v.height>150?Math.max(12,window.innerHeight-v.height-v.offsetTop+12):90);};
    resize();document.addEventListener('focusin',focus);document.addEventListener('visibilitychange',hide);
    window.visualViewport?.addEventListener('resize',resize);window.visualViewport?.addEventListener('scroll',resize);
    const observer=new MutationObserver(()=>{if(current.current&&!current.current.isConnected){stop();current.current=null;setField(null);}});observer.observe(document.body,{childList:true,subtree:true});
    return()=>{cancel.current?.();clearTimeout(timer.current);observer.disconnect();document.removeEventListener('focusin',focus);document.removeEventListener('visibilitychange',hide);window.visualViewport?.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('scroll',resize);};
  },[]);
  if(!field)return null;
  function next(){
    stop();setDraft(null);const fields=entryFields(document),target=fields[fields.indexOf(field)+1];
    if(target){target.focus();target.scrollIntoView({block:'center',behavior:'smooth'});}
    else setMessage('Último campo. Revisa los datos y usa el botón de guardar o continuar de esta sección.');
  }
  function introduce(target,text,previous){
    if(current.current!==target)return;
    const value=dictationValue(target,text);
    setDraft({text,value,previous});
    if(target.value!==previous){setMessage('El campo ha cambiado mientras hablabas. Se conserva lo que has escrito.');return;}
    if(value===null||!applyEntryValue(target,value)){setMessage('He oído tu voz, pero el dato no encaja en este campo. Revisa el texto o elige el valor manualmente.');return;}
    setUndo({previous,value});setDraft(null);setMessage('Dato introducido. Puedes corregirlo, deshacer o pasar al siguiente campo.');
  }
  function dictate(){
    if(listening||starting){stop();setMessage('Dictado detenido.');return;}
    stop();setDraft(null);setUndo(null);setStarting(true);setMessage('Activando micrófono. Si el navegador pide permiso, permite el acceso y espera a «Escuchando».');
    const target=field,previous=field.value;
    try{
      cancel.current=startDictation(window.SpeechRecognition||window.webkitSpeechRecognition,{
        start:()=>{clearTimeout(timer.current);setStarting(false);setListening(true);setMessage('Escuchando: di el dato de este campo.');timer.current=setTimeout(()=>{stop();setMessage('Dictado detenido. Puedes intentarlo de nuevo.');},20000);},
        preview:text=>{if(current.current===target){setDraft({text,value:null,previous,provisional:true});setMessage('Escuchando…');}},
        result:text=>{stop();introduce(target,text,previous);},
        error:code=>{stop();setMessage(dictationError(code));},
        end:()=>{clearTimeout(timer.current);setStarting(false);setListening(false);setMessage(old=>old.startsWith('Escuchando')||old.startsWith('Activando')?'El navegador no ha devuelto un dato definitivo. Si hay texto debajo, revísalo; también puedes usar el micrófono del teclado.':old);},
      });
      timer.current=setTimeout(()=>{stop();setMessage('El micrófono no ha arrancado. Comprueba el permiso o utiliza el micrófono del teclado.');},45000);
    }catch{stop();setMessage('No se pudo iniciar el dictado. Puedes usar el micrófono del teclado o escribir.');}
  }
  return <aside className="dataEntryAssistant" data-entry-assistant="true" aria-label="Ayuda para introducir datos" style={{bottom,maxHeight}}>
    <div className="entryHeading"><strong>{fieldLabel(field).slice(0,90)}</strong><button type="button" aria-label="Cerrar ayuda de datos" onClick={()=>{stop();setField(null);current.current=null;}}>×</button></div>
    {supported&&<small>Al pulsar «Dictar», el servicio de voz del navegador procesa tu audio y puede enviarlo a su proveedor. DIETEAR no guarda grabaciones. El dato válido se introduce en este campo; puedes deshacerlo.</small>}
    <div className="entryButtons">{supported&&<button type="button" aria-pressed={listening||starting} onPointerDown={e=>e.preventDefault()} onClick={dictate}>{listening?'■ Detener':starting?'■ Cancelar activación':'🎙️ Dictar este dato'}</button>}<button type="button" onPointerDown={e=>e.preventDefault()} onClick={next}>Siguiente campo →</button></div>
    {!supported&&<small>Este navegador no admite dictado directo. Toca el campo y utiliza el micrófono del teclado de tu móvil.</small>}
    {message&&<p role="status">{message}</p>}
    {undo&&<button type="button" onClick={()=>{stop();if(field.value!==undo.value){setMessage('El dato se ha editado después. Se conserva tu última corrección.');setUndo(null);return;}applyEntryValue(field,undo.previous,{validate:false});setUndo(null);setMessage('Se ha restaurado el dato anterior.');}}>Deshacer dictado</button>}
    {draft&&<div className="entryDraft"><p>{draft.provisional?'Estoy entendiendo:':'He entendido:'} <b>{draft.text}</b></p>{draft.provisional&&<button type="button" onClick={()=>{stop();introduce(field,draft.text,draft.previous);}}>Usar este texto</button>}<button type="button" onClick={()=>{stop();setDraft(null);setMessage('Texto descartado.');}}>Descartar</button></div>}
  </aside>;
}
