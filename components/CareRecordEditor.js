"use client";
import {useState} from "react";

const tests=[
  ["glucose","Glucosa (azúcar)","mg/dL"],["hba1c","Hemoglobina glucosilada (HbA1c)","%"],
  ["cholesterol","Colesterol total","mg/dL"],["hdl","Colesterol HDL","mg/dL"],["ldl","Colesterol LDL","mg/dL"],["triglycerides","Triglicéridos","mg/dL"],
  ["iron","Hierro sérico","µg/dL"],["ferritin","Ferritina","ng/mL"],["hemoglobin","Hemoglobina","g/dL"],
  ["proteins","Proteínas totales","g/dL"],["albumin","Albúmina","g/dL"],
  ["creatinine","Creatinina","mg/dL"],["vitaminD","Vitamina D","ng/mL"],["vitaminB12","Vitamina B12","pg/mL"],["tsh","TSH","mUI/L"]
];
const initialResults=()=>Object.fromEntries(tests.map(([key,,unit])=>[key,{value:"",unit,reference:""}]));

export default function CareRecordEditor({tool,records,onSave,onClose}) {
  const [date,setDate]=useState(()=>new Date().toLocaleDateString("sv-SE")),[note,setNote]=useState("");
  const [results,setResults]=useState(initialResults),[expanded,setExpanded]=useState(false),[extra,setExtra]=useState({label:"",value:"",unit:"",reference:""});
  const [details,setDetails]=useState({name:"",dose:"",schedule:"",change:"",since:"",guidance:""});
  const lab=tool==="Analíticas",medication=tool==="Medicación";
  const entries=tests.filter(([key])=>results[key].value.trim()).map(([key,label])=>({key,label,...results[key],value:results[key].value.trim()}));
  if(extra.label.trim()&&extra.value.trim())entries.push({...extra,key:"other",label:extra.label.trim(),value:extra.value.trim()});
  const hasData=(lab?entries.length>0||note.trim():medication?details.name.trim()||note.trim():details.change.trim()||note.trim())||details.guidance.trim();
  const validDate=/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(new Date(date+"T12:00:00").getTime());
  const save=()=>{
    if(!hasData||!validDate)return;
    const text=lab?entries.map(item=>item.label+": "+item.value+" "+item.unit+(item.reference?" · ref. "+item.reference:"")).concat(note.trim()).filter(Boolean).join("\n"):Object.entries(details).filter(([key,value])=>value.trim()).map(([key,value])=>({name:"Nombre",dose:"Dosis indicada",schedule:"Horario",change:"Cambio observado",since:"Desde cuándo",guidance:"Indicación profesional"}[key])+": "+value.trim()).concat(note.trim()).filter(Boolean).join("\n");
    onSave({type:tool,date:new Date(date+"T12:00:00").toISOString(),text,results:lab?entries:undefined,details:{...details,notes:note.trim()}});
    setNote("");setResults(initialResults());setExtra({label:"",value:"",unit:"",reference:""});setDetails({name:"",dose:"",schedule:"",change:"",since:"",guidance:""});
  };
  const current=records.filter(record=>record.type===tool).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
  const updateResult=(key,field,value)=>setResults(old=>({...old,[key]:{...old[key],[field]:value}}));
  return <section className="structuredCareEditor" aria-label={"Registro de "+tool}>
    <div className="structuredCareHeading"><h3>{tool}</h3><p>{lab?"Copia los resultados, las unidades y las referencias que figuran en tu informe. Puedes dejar vacíos los datos que no tengas.":"Añade los datos que quieras conservar para tu seguimiento."}</p></div>
    <label className="careDate">Fecha del registro<input type="date" value={date} onChange={event=>setDate(event.target.value)}/></label>
    {lab?<><div className="labResultGrid">{tests.filter((_,index)=>expanded||index<11).map(([key,label])=><article key={key}><h4>{label}</h4><div><label>Resultado<input aria-label={"Resultado de "+label} inputMode="decimal" value={results[key].value} onChange={event=>updateResult(key,"value",event.target.value)} placeholder="Según tu informe"/></label><label>Unidad<input aria-label={"Unidad de "+label} value={results[key].unit} onChange={event=>updateResult(key,"unit",event.target.value)}/></label></div><label>Referencia del laboratorio<input aria-label={"Referencia de "+label} value={results[key].reference} onChange={event=>updateResult(key,"reference",event.target.value)} placeholder="Copia el intervalo del informe"/></label></article>)}</div><button type="button" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?"Ver menos valores ↑":"Añadir vitaminas, creatinina y tiroides ↓"}</button><fieldset className="careExtraResult"><legend>Otro valor de tu analítica (opcional)</legend>{[["label","Nombre"],["value","Resultado"],["unit","Unidad"],["reference","Referencia"]].map(([field,label])=><label key={field}>{label}<input aria-label={label+" de otro valor"} value={extra[field]} onChange={event=>setExtra(old=>({...old,[field]:event.target.value}))}/></label>)}</fieldset></>:<div className="careDetailGrid">{(medication?[["name","Nombre del medicamento"],["dose","Dosis indicada"],["schedule","Horario / frecuencia"]]:[["change","Cambio observado en piel o cabello"],["since","Desde cuándo / duración"]]).map(([key,label])=><label key={key}>{label}<input value={details[key]} onChange={event=>setDetails(old=>({...old,[key]:event.target.value}))}/></label>)}</div>}
    <label>Indicaciones del profesional para la alimentación (opcional)<textarea aria-label="Indicaciones del profesional para la alimentación (opcional)" value={details.guidance} onChange={event=>setDetails(old=>({...old,guidance:event.target.value}))} placeholder="Ej.: pauta o restricción que te hayan indicado…"/></label>
    <label>Notas / seguimiento<textarea aria-label="Notas / seguimiento" value={note} onChange={event=>setNote(event.target.value)} placeholder="Observaciones, cambios o dudas que quieras consultar…"/></label>
    <div className="branchActions"><button type="button" disabled={!hasData||!validDate} onClick={save}>Guardar {tool.toLocaleLowerCase("es")} →</button><button type="button" onClick={onClose}>Cerrar</button></div>
    {lab&&<p className="labReferenceNote">Las unidades y referencias pueden variar entre laboratorios. Los resultados se conservan tal como los introduces; no se asigna una dieta clínica automáticamente.</p>}
    <div className="savedCareRecords">{current.map(record=><article key={record.id}><header><b>{record.type}</b><time dateTime={record.date}>{new Date(record.date).toLocaleDateString("es-ES")}</time></header><p>{record.text}</p>{record.details?.guidance&&<small>Indicación profesional: {record.details.guidance}</small>}</article>)}</div>
  </section>;
}
