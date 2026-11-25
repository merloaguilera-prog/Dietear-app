import test from 'node:test';
import assert from 'node:assert/strict';
import {validateMealPhoto,normalizeMealPhoto,readPhotoBody,MAX_PHOTO_JSON_BYTES} from '../lib/meal-photo.mjs';
import {createMealPhotoHandler} from '../lib/meal-photo-handler.mjs';
const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
const request=(value,headers={})=>new Request('https://dietear.test/api/meal-photo',{method:'POST',headers:{'content-type':'application/json',origin:'https://dietear.test',...headers},body:JSON.stringify(value)});
const response={name:'Arroz',ingredients:['Arroz'],notes:['Aceite y cantidad por confirmar'],nutrients:{energyKcal:200,proteinG:null,carbsG:40,fatG:null,fiberG:null}};
test('photo input accepts supported signatures and rejects disguised data or oversized streams',async()=>{
 assert.equal(validateMealPhoto(image),image);
 for(const invalid of ['https://example.com/a.jpg',image.replace('image/png','image/jpeg'),'data:image/png;base64,SGVsbG8='])assert.throws(()=>validateMealPhoto(invalid));
 const req=new Request('https://dietear.test',{method:'POST',body:' '.repeat(MAX_PHOTO_JSON_BYTES+1)});
 await assert.rejects(()=>readPhotoBody(req),/límite/);
});
test('missing, negative or invalid photo nutrients remain unknown',()=>{
 const value=normalizeMealPhoto({...response,nutrients:{energyKcal:-1,proteinG:'20',fatG:0}});
 assert.equal(value.nutrients.energyKcal,null);assert.equal(value.nutrients.proteinG,null);assert.equal(value.nutrients.fatG,0);assert.equal(value.nutrients.carbsG,null);
});
test('unconfigured analysis degrades to manual input without an upstream call',async()=>{
 const handler=createMealPhotoHandler({getRuntime:()=>null,fetchUpstream:()=>assert.fail()});
 const result=await handler(request({image}));assert.equal(result.status,503);assert.match((await result.json()).error,/manualmente/);
});
test('photo requests send only the selected image and return an unconfirmed draft',async()=>{
 let sent;
 const handler=createMealPhotoHandler({getRuntime:()=>({endpoint:'https://provider.test',model:'test',token:'test'}),fetchUpstream:async(url,options)=>{sent=JSON.parse(options.body);return Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(response)}]}]});}});
 const result=await handler(request({image,profile:{healthNotes:'must not leave device'}}));
 assert.equal(result.status,200);assert.deepEqual((await result.json()).draft,response);
 assert.equal(sent.store,false);assert.equal(JSON.stringify(sent).includes('must not leave device'),false);
 assert.equal(sent.input[0].content[1].image_url,image);assert.equal(result.headers.get('cache-control'),'no-store');
});
test('wrong origins, upstream failures and repeated requests are bounded',async()=>{
 const handler=createMealPhotoHandler({getRuntime:()=>({endpoint:'https://provider.test'}),fetchUpstream:async()=>{throw Error('private provider details');}});
 assert.equal((await handler(request({image},{origin:'https://other.test'}))).status,403);
 for(let i=0;i<3;i++){const result=await handler(request({image}));assert.equal(result.status,502);assert.equal((await result.text()).includes('private provider details'),false);}
 assert.equal((await handler(request({image}))).status,429);
});
