export const BODY_MEASUREMENTS = [
  {key:"waist",type:"cintura",label:"Cintura",hint:"Contorno de la cintura."},
  {key:"hips",type:"cadera",label:"Cadera",hint:"Contorno de la cadera por su parte más ancha."},
  {key:"chest",type:"pecho",label:"Pecho",hint:"Contorno del pecho."},
  {key:"bothLegs",type:"dos-piernas",label:"Dos piernas juntas",hint:"Contorno de las dos piernas juntas por la parte más gruesa."},
  {key:"shoulders",type:"hombros",label:"De hombro a hombro",hint:"Distancia entre un hombro y el otro; no es un contorno."},
  {key:"thigh",type:"muslo",label:"Una pierna (muslo)",hint:"Contorno de una sola pierna por la parte más gruesa. Usa siempre la misma pierna."},
  {key:"arm",type:"brazo",label:"Brazo",hint:"Contorno del mismo brazo en cada registro."}
];

export function bodyHistory(history,type) {
  return history.filter(item=>item.type===type || (item.type==="medida"&&String(item.label||"").toLocaleLowerCase("es")===type));
}

export function decimalValue(value) {
  const text=String(value??"").trim().replace(",",".");
  return text?Number(text):null;
}
