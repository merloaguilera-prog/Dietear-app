"use client";
import Link from "next/link";
import ExerciseStudio from "../../components/ExerciseStudio";
export default function ExercisePage(){
 return <main style={{maxWidth:1080,margin:"0 auto",padding:"18px 14px 90px",background:"#fbfdf9",minHeight:"100vh"}}>
  <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:14}}>
   <Link href="/" style={{color:"#28623d",fontWeight:800,textDecoration:"none",border:"1px solid #9dcba5",borderRadius:14,padding:"11px 15px"}}>← Volver a DIETEAR</Link>
   <b style={{color:"#367a49",fontSize:20}}>🌿 DIETEAR</b>
  </header>
  <ExerciseStudio onProfile={()=>{window.location.href="/";}} onPrepareLog={()=>{window.location.href="/";}}/>
 </main>;
}
