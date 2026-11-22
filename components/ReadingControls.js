"use client";
import {useEffect, useRef, useState} from 'react';
import {createSpeechReader, READING_RATES, readingRate} from '../lib/speech-reader.mjs';

export default function ReadingControls({title, summary, steps = [], preferredRate = 1, onRateChange}) {
  const reader = useRef(null);
  const [supported, setSupported] = useState(false);
  const [mode, setMode] = useState('summary');
  const [step, setStep] = useState(0);
  const [state, setState] = useState({status:'idle', notice:''});
  useEffect(() => {
    const active = createSpeechReader({synthesis:window.speechSynthesis, Utterance:window.SpeechSynthesisUtterance,
      onChange: next => {setState(next); if (next.status === 'speaking') setStep(next.index);}});
    reader.current = active; setSupported(active.supported);
    const hide = () => {if (document.hidden) active.stop();};
    document.addEventListener('visibilitychange', hide);
    return () => {document.removeEventListener('visibilitychange', hide); active.destroy(); reader.current = null;};
  }, []);
  const rate = readingRate(preferredRate), busy = ['loading','speaking'].includes(state.status);
  function chooseMode(next) {reader.current?.stop(); setMode(next); setStep(0);}
  function move(next) {reader.current?.stop(); setStep(next);}
  function play(all = false, speed = rate) {
    const sections = mode === 'summary' ? [{text:summary, index:0}]
      : (all ? steps.slice(step).map((text, i) => ({text:`Paso ${step+i+1}. ${text}`, index:step+i}))
        : [{text:`Paso ${step+1}. ${steps[step]}`, index:step}]);
    reader.current?.play(sections, speed);
  }
  return <section className="readingControls" aria-label={'Lectura de '+title}>
    <div className="readingModes"><button type="button" aria-pressed={mode === 'summary'} onClick={()=>chooseMode('summary')}>Resúmelo</button>{steps.length > 0 && <button type="button" aria-pressed={mode === 'steps'} onClick={()=>chooseMode('steps')}>Paso a paso</button>}</div>
    <p className={busy ? 'readingActive' : ''} aria-current={mode === 'steps' ? 'step' : undefined}>{mode === 'summary' ? summary : <><b>Paso {step+1} de {steps.length}. </b>{steps[step]}</>}</p>
    <div className="readingButtons">
      <label>Velocidad<select aria-label={'Velocidad de lectura de '+title} value={rate} onChange={event=>{const next=Number(event.target.value);onRateChange?.(next);if(busy)play(false,next);else reader.current?.stop();}}>{READING_RATES.map(value=><option key={value} value={value}>×{value}{value===1?' · normal':value===2?' · rápida':' · muy rápida'}</option>)}</select></label>
      <button type="button" disabled={!supported} onClick={()=>state.status === 'paused' ? reader.current?.resume() : play()}>{state.status === 'paused' ? 'Continuar lectura' : 'Escuchar'}</button>
      <button type="button" disabled={!busy} onClick={()=>reader.current?.pause()}>Pausar</button>
      <button type="button" disabled={!busy && state.status !== 'paused'} onClick={()=>reader.current?.stop()}>Detener</button>
    </div>
    {mode === 'steps' && <div className="readingButtons"><button type="button" disabled={step === 0} onClick={()=>move(step-1)}>Paso anterior</button><button type="button" disabled={!supported} onClick={()=>play()}>Repetir paso</button><button type="button" disabled={step === steps.length-1} onClick={()=>move(step+1)}>Paso siguiente</button><button type="button" disabled={!supported} onClick={()=>play(true)}>Escuchar pasos restantes</button></div>}
    <small>{supported ? 'La voz y la velocidad real dependen del dispositivo. Si ×3 no se entiende o no cambia, elige ×2. Continuar repite el fragmento pausado.' : 'Este navegador no ofrece lectura en voz alta. El contenido completo sigue disponible en texto.'}</small>
    {state.notice && <p role="status">{state.notice}</p>}
  </section>;
}
