import test from 'node:test';
import assert from 'node:assert/strict';
import {dictationValue,isEntryField,spokenNumber,startDictation} from '../lib/data-entry.js';
const field=(type='text',label='Dato')=>({tagName:'INPUT',type,inputMode:type==='number'?'decimal':'',getAttribute:()=>label,closest:()=>null});
test('dictation converts Spanish numbers and decimal measurements without guessing sentences',()=>{
 for(const [text,value] of [['cuarenta y seis',46],['setenta y cinco coma cinco',75.5],['ciento sesenta y nueve',169],['ciento veinte',120],['cero coma cero cinco',.05],['75,5',75.5],['seis mil quinientos',6500]])assert.equal(spokenNumber(text),value,text);
 for(const text of ['tengo cuarenta y seis y peso setenta','hola','uno dos tres','1.2.3','cuarenta y seis o siete'])assert.equal(spokenNumber(text),null,text);
 assert.equal(dictationValue(field('number','Altura (cm)'),'mido uno coma sesenta y nueve metros'),'169');
 assert.equal(dictationValue(field('number','Peso (kg)'),'peso setenta y cinco coma cinco kilos'),'75.5');
});
test('select dictation requires an existing enabled option and preserves its actual value',()=>{
 const node={tagName:'SELECT',options:[{value:'female',textContent:'Mujer'},{value:'other',textContent:'Otro',disabled:true}]};
 assert.equal(dictationValue(node,'mujer.'),'female');assert.equal(dictationValue(node,'otro'),null);assert.equal(dictationValue(node,'hombre'),null);
});
test('dates require a valid input shape and free text remains verbatim',()=>{
 assert.equal(dictationValue(field('date'),'2026-10-25'),'2026-10-25');assert.equal(dictationValue(field('date'),'mañana'),null);
 assert.equal(dictationValue(field(),'María del Mar'),'María del Mar');
});
test('passwords, files, disabled and read-only fields never receive the assistant',()=>{
 for(const type of ['password','file','checkbox','hidden','submit','range'])assert.equal(isEntryField(field(type)),false);
 assert.equal(isEntryField({...field(),disabled:true}),false);assert.equal(isEntryField({...field(),readOnly:true}),false);
 assert.equal(isEntryField(field()),true);assert.equal(isEntryField({tagName:'TEXTAREA',closest:()=>null}),true);
});
test('voice callbacks stop after cancel, including already queued results',()=>{
 let instance,starts=0,aborts=0;const received=[];
 class Speech{constructor(){instance=this;}start(){starts++;}abort(){aborts++;}}
 const cancel=startDictation(Speech,{result:x=>received.push(x),error:()=>assert.fail(),end:()=>received.push('end')});
 const result=instance.onresult,end=instance.onend;
 const event={results:[Object.assign([{transcript:'cuarenta y seis'}],{isFinal:true})]};
 result(event);assert.deepEqual(received,['cuarenta y seis']);assert.equal(starts,1);assert.equal(instance.lang,'es-ES');
 cancel();result(event);end();assert.deepEqual(received,['cuarenta y seis']);assert.equal(aborts,1);assert.equal(instance.onresult,null);
});
test('voice start failure is surfaced and partial results are not applied',()=>{
 class Broken{start(){throw new Error('denied');}}
 assert.throws(()=>startDictation(Broken,{}),/denied/);
 let instance;class Speech{constructor(){instance=this;}start(){}abort(){}}
 const results=[];const cancel=startDictation(Speech,{result:x=>results.push(x),end(){},error(){}});
 instance.onresult({results:[Object.assign([{transcript:'partial'}],{isFinal:false})]});assert.deepEqual(results,[]);cancel();
});
