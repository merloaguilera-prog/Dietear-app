"use client";
import Image from 'next/image';
import {useState} from 'react';
import {EXERCISE_LEVELS,guidesForLevel} from '../lib/exercise-foundation.mjs';
import ReadingControls from './ReadingControls';
const guideCategory={'movilidad-sentada':'silla','sentarse-levantarse':'silla','sentadilla':'fuerza'};
import {exerciseCategories,exerciseLoggingKind} from '../lib/exercise-catalog';
export default function ExerciseGallery({onChoose,onProfile,onAsk,profile={},onPreferencesChange}) {
 const [level,setLevel]=useState(EXERCISE_LEVELS.includes(profile.exerciseLevel)?profile.exerciseLevel:'suave');
 const guides=guidesForLevel(level);
 return <section className="exerciseGallery" aria-labelledby="exercise-gallery-title">
  <div className="exerciseIntro"><small>MOVERTE TAMBIÉN ES CUIDARTE</small><h2 id="exercise-gallery-title">Encuentra tu forma de moverte</h2><p>Ocho categorías con fotografías diferentes. Abre una tarjeta para ver sus movimientos y registrar el tiempo que hayas realizado.</p></div>
  <div className="exerciseLevels" role="group" aria-label="Nivel de las guías">{EXERCISE_LEVELS.map(value=><button type="button" key={value} aria-pressed={level===value} onClick={()=>{setLevel(value);onPreferencesChange?.({exerciseLevel:value});}}>{value==='suave'?'Suave / con apoyo':value==='intermedio'?'Intermedio':'Avanzado'}</button>)}</div>
  <p>Biblioteca inicial: tres guías paso a paso, disponibles según el nivel que elijas. La elección depende de tu capacidad y experiencia, no solo de tu edad.</p>
  <div className="exercisePhotoGrid">{exerciseCategories.map(category=><article key={category.id} className="exercisePhotoCard">
   <div className="exercisePhoto"><Image src={category.image} alt={category.alt} width={960} height={640} sizes="(max-width:600px) 100vw, (max-width:1000px) 50vw, 33vw" style={{objectFit:'contain'}}/><span>{String(category.number).padStart(2,'0')}</span></div>
   <div className="exerciseCopy"><h3>{category.title}</h3><p>{category.equipment}</p><details><summary>Ver {category.movements.length} movimientos</summary><ol>{category.movements.map(movement=><li key={movement}>{movement}</li>)}</ol>{guides.filter(guide=>guideCategory[guide.id]===category.id).map(guide=><div className="exerciseGuide" key={guide.id}><h4>{guide.title}</h4><p>Material: {guide.equipment}</p><ol>{guide.steps.map(step=><li key={step}>{step}</li>)}</ol><p>{guide.adaptations.join(' ')}</p><ReadingControls title={guide.title} summary={`${guide.title}. Material: ${guide.equipment}. ${guide.adaptations.join(' ')}`} steps={guide.steps} preferredRate={profile.readingRate} onRateChange={readingRate=>onPreferencesChange?.({readingRate})}/></div>)}<p>Ideas de movimiento: adapta la técnica con un profesional si lo necesitas. La fotografía representa la categoría.</p><button type="button" onClick={()=>onChoose(exerciseLoggingKind(category.id))}>Registrar minutos realizados →</button></details></div>
  </article>)}</div>
  <p className="exerciseNote">Elige movimientos que conozcas y puedas realizar con comodidad. Detente si aparece dolor o mareo. La lista no sustituye una rutina adaptada por un profesional.</p>
  <div className="exerciseActions"><button type="button" onClick={onProfile}>Revisar mis datos y objetivos</button><button type="button" onClick={onAsk}>Consultar mi rutina</button></div>
  <details className="exerciseCredits"><summary>Créditos de las fotografías</summary><p>Fotografías obtenidas de Wikimedia Commons; reducidas y convertidas a WebP. Las personas fotografiadas no patrocinan DIETEAR.</p><ul>{exerciseCategories.map(category=><li key={category.id}>{category.title}: {category.author} · <a href={category.source} target="_blank" rel="noreferrer">Fuente</a> · <a href={category.license} target="_blank" rel="noreferrer">{category.license.includes('/zero/')?'CC0':'CC BY 2.0'}</a></li>)}</ul></details>
 </section>;
}
