import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpeechReader, speechChunks, readingRate} from '../lib/speech-reader.mjs';
const mock = () => {
  const spoken=[], changes=[];
  let cancelled=0;
  const synthesis={speak:item=>spoken.push(item),cancel:()=>cancelled++,getVoices:()=>[{lang:'en-US'},{lang:'es-ES',name:'Español'}]};
  class Utterance {constructor(text){this.text=text;}}
  const reader=createSpeechReader({synthesis,Utterance,onChange:state=>changes.push(state)});
  return {reader,spoken,changes,cancelled:()=>cancelled};
};
test('long content is chunked without dropping or duplicating words',()=>{
  const text=('Paso uno. Mezcla despacio los ingredientes y revisa el resultado. ').repeat(20);
  const chunks=speechChunks(text);
  assert.ok(chunks.length>1);
  assert.ok(chunks.every(item=>item.length<=180));
  assert.equal(chunks.join(' '),text.trim());
  assert.equal(readingRate('3'),3);assert.equal(readingRate(99),1);
});
test('all offered speeds reach the speech engine and Spanish voice is preferred',()=>{
  for (const rate of [1,2,3]) {
    const {reader,spoken}=mock();reader.play([{text:'Lee este paso.',index:2}],rate);
    assert.equal(spoken[0].rate,rate);assert.equal(spoken[0].lang,'es-ES');assert.equal(spoken[0].voice.name,'Español');reader.destroy();
  }
});
test('pause and resume repeat only the interrupted fragment and ignore stale events',()=>{
  const {reader,spoken,changes}=mock();
  reader.play([{text:'Primera frase. Segunda frase.',index:1}],2);
  spoken[0].onstart();spoken[0].onend();
  const interrupted=spoken[1];interrupted.onstart();reader.pause();
  assert.equal(changes.at(-1).status,'paused');
  interrupted.onend();assert.equal(spoken.length,2);
  reader.resume();assert.equal(spoken[2].text,'Segunda frase.');
  spoken[2].onstart();assert.equal(changes.at(-1).index,1);
  reader.stop();spoken[2].onend();assert.equal(changes.at(-1).status,'idle');reader.destroy();
});
test('another reader stops the previous one without sharing its progress',()=>{
  const first=mock(),second=mock();
  first.reader.play([{text:'Receta.'}],1);first.spoken[0].onstart();
  second.reader.play([{text:'Ejercicio.'}],3);
  assert.equal(first.changes.at(-1).status,'idle');assert.equal(first.cancelled(),1);
  first.spoken[0].onend();assert.equal(first.spoken.length,1);
  first.reader.destroy();assert.equal(second.cancelled(),0);second.reader.destroy();
});
test('rejected high rate falls back explicitly; missing speech remains usable as text',()=>{
  const {reader,spoken,changes}=mock();reader.play([{text:'Prueba.'}],3);
  spoken[0].onerror({error:'invalid-argument'});
  assert.equal(spoken[1].rate,2);assert.match(changes.at(-1).notice,/×2/);
  reader.destroy();
  const unsupported=createSpeechReader({});assert.equal(unsupported.supported,false);unsupported.play([{text:'Texto'}]);unsupported.destroy();
});
