"use client";
import {useState} from "react";

const offers=[
 {icon:"🥗",title:"Alimentación",description:"Ofertas y colaboraciones de alimentación que respeten nuestra política de bienestar."},
 {icon:"👟",title:"Movimiento",description:"Material deportivo y accesorios para distintos niveles de actividad."},
 {icon:"🌿",title:"Bienestar",description:"Productos y servicios útiles, con información comercial transparente."}
];
export default function DietearClub(){
 const [preferences,setPreferences]=useState({offers:false,commercial:false});
 return <section className="connectedModule" aria-label="Club DIETEAR">
  <div className="appsHead"><span>🎁</span><div><small>CLUB DIETEAR · OPCIONAL</small><h2>Ventajas a tu ritmo</h2><p>Un espacio voluntario para descubrir descuentos, colaboraciones y recomendaciones. Nunca tendrás que ver una oferta para usar tus funciones de salud, alimentación o ejercicio.</p></div></div>
  <div className="appsGrid">{offers.map(o=><article key={o.title}><span style={{fontSize:32}} aria-hidden="true">{o.icon}</span><div><b>{o.title}</b><small>{o.description}</small><small>Sin ofertas comerciales activas por ahora.</small></div><button type="button" disabled title="No hay colaboradores disponibles">Próximamente</button></article>)}</div>
  <div className="sourceRule"><b>🛡️ Publicidad responsable</b><span>Las futuras ofertas patrocinadas se identificarán como «Publicidad» o «Enlace de afiliado». No venderemos datos personales ni utilizaremos datos de salud para seleccionar anuncios. Nada de ventanas invasivas, vídeos automáticos o anuncios junto a datos médicos.</span></div>
  <div className="sourceRule"><b>💚 Tu experiencia, primero</b><span>DIETEAR seguirá siendo útil sin participar en el Club. Las preferencias comerciales se activarán solo cuando existan un sistema de consentimiento y una política de privacidad verificados.</span></div>
 </section>
}
