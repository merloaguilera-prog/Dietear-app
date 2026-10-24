"use client";

export default function RecoveryScreen({onRetry}) {
  return <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",padding:24,boxSizing:"border-box",background:"#f7fbf5",color:"#163d31",fontFamily:"system-ui,sans-serif"}}>
    <section aria-labelledby="recovery-title" style={{maxWidth:460,padding:28,border:"2px solid #57ae89",borderRadius:24,background:"white",textAlign:"center"}}>
      <p style={{fontWeight:800}}>DIETEAR · TODO SUMA</p>
      <h1 id="recovery-title" style={{fontSize:26}}>Vamos a volver a abrirlo</h1>
      <p style={{lineHeight:1.6}}>Esta pantalla no ha podido cargarse. Puedes intentarlo de nuevo o volver al inicio.</p>
      <p style={{lineHeight:1.6}}>Estas opciones no borran tus datos guardados.</p>
      <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
        <button type="button" onClick={onRetry} style={{padding:"12px 18px",borderRadius:14,border:"2px solid #147a4f",background:"#147a4f",color:"white",fontSize:16,fontWeight:700}}>Volver a intentar</button>
        <a href="/" style={{padding:"12px 18px",borderRadius:14,border:"2px solid #57ae89",color:"#163d31",fontSize:16,fontWeight:700}}>Abrir inicio</a>
      </div>
    </section>
  </main>;
}
