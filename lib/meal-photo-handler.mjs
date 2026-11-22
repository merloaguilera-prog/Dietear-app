import {readPhotoBody,validateMealPhoto,MEAL_PHOTO_INSTRUCTIONS,MEAL_PHOTO_SCHEMA,normalizeMealPhoto} from './meal-photo.mjs';
export function createMealPhotoHandler({getRuntime,fetchUpstream=fetch}) {
 const attempts=new Map();
 return async function POST(request) {
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Abre el análisis desde DIETEAR.'},{status:403});
  const now=Date.now(),client=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';
  for(const [key,value] of attempts)if(now-value.start>60000)attempts.delete(key);
  const budget=attempts.get(client)||{start:now,count:0};
  if(budget.count>=3)return Response.json({error:'Espera un minuto antes de analizar otra foto.'},{status:429});
  budget.count++;attempts.set(client,budget);
  if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'Envía una fotografía desde el formulario.'},{status:415});
  let image;
  try {image=validateMealPhoto((await readPhotoBody(request))?.image);}
  catch(error){return Response.json({error:error.message},{status:error instanceof RangeError?413:400});}
  const runtime=getRuntime();
  if(!runtime)return Response.json({error:'El análisis de fotos no está conectado en esta versión. Puedes completar el diario manualmente.'},{status:503});
  try {
    const result=await fetchUpstream(runtime.endpoint,{method:'POST',headers:{Authorization:`Bearer ${runtime.token}`,'Content-Type':'application/json'},body:JSON.stringify({model:runtime.model,store:false,instructions:MEAL_PHOTO_INSTRUCTIONS,input:[{role:'user',content:[{type:'input_text',text:'Prepara un borrador de esta comida para revisar antes de guardarla.'},{type:'input_image',image_url:image,detail:'low'}]}],max_output_tokens:1600,text:{format:{type:'json_schema',name:'dietear_meal_photo',strict:true,schema:MEAL_PHOTO_SCHEMA}}}),signal:AbortSignal.timeout(35000)});
    if(!result.ok)throw new Error('upstream');
    const data=await result.json(),text=(data.output||[]).flatMap(item=>item.type==='message'?item.content||[]:[]).filter(item=>item.type==='output_text').map(item=>item.text).join('');
    return Response.json({draft:normalizeMealPhoto(JSON.parse(text))},{headers:{'Cache-Control':'no-store'}});
  } catch {return Response.json({error:'No se ha podido analizar la foto. Puedes reintentar o introducir la comida manualmente.'},{status:502});}
};
}
