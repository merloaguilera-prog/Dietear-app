const allowedTypes = new Set(['text','search','email','tel','url','number','date','datetime-local','time','month','week']);
export function isEntryField(node) {
  if (!node || node.disabled || node.readOnly || node.closest('[data-entry-assistant], [hidden], [inert]')) return false;
  return node.tagName === 'TEXTAREA' || (node.tagName === 'SELECT' && !node.multiple) || (node.tagName === 'INPUT' && allowedTypes.has(node.type));
}
export function entryFields(root) {
  return [...root.querySelectorAll('input, textarea, select')].filter(node => isEntryField(node) && node.getClientRects().length && root.defaultView.getComputedStyle(node).visibility !== 'hidden');
}
export function fieldLabel(node) {
  return node.getAttribute('aria-label') || [...(node.labels || [])].map(x => { const label = x.cloneNode(true); label.querySelectorAll('input,textarea,select,button').forEach(child => child.remove()); return label.textContent.trim(); }).join(' ') || node.placeholder || 'Este dato';
}
const clean = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
const small = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciseis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidos','veintitres','veinticuatro','veinticinco','veintiseis','veintisiete','veintiocho','veintinueve'];
const tens = {treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90};
const hundreds = {cien:100,ciento:100,doscientos:200,trescientos:300,cuatrocientos:400,quinientos:500,seiscientos:600,setecientos:700,ochocientos:800,novecientos:900};
function integer(text) {
  if (/^\d+$/.test(text)) return Number(text);
  if (text === 'un' || text === 'una') return 1;
  if (small.includes(text)) return small.indexOf(text);
  if (/\bmil\b/.test(text)) {
    const parts = text.split(/\bmil\b/).map(x=>x.trim());
    if (parts.length !== 2) return null;
    const thousands = parts[0] ? integer(parts[0]) : 1, rest = parts[1] ? integer(parts[1]) : 0;
    return thousands === null || rest === null || thousands < 1 || thousands > 999 ? null : thousands * 1000 + rest;
  }
  const words = text.split(/\s+/); let value = 0;
  if (words[0] in hundreds) value += hundreds[words.shift()];
  if (words[0] in tens) { value += tens[words.shift()]; if (words[0] === 'y') words.shift(); }
  if (words.length) {
    const rest = words.join(' ');
    if (!small.includes(rest) && rest !== 'un') return null;
    value += rest === 'un' ? 1 : small.indexOf(rest);
  }
  return value;
}
export function spokenNumber(text) {
  text = clean(text).replace(/\.$/,'').replace(/\b(coma|punto)\b/g,'.').replace(/,/g,'.').trim();
  if (/^\d+(\.\d+)?$/.test(text)) return Number(text);
  const parts = text.split('.').map(x => x.trim());
  if (parts.length > 2 || !parts[0]) return null;
  const whole = integer(parts[0]); if (whole === null) return null;
  if (parts.length === 1) return whole;
  if (!parts[1]) return null;
  const digits = parts[1].split(/\s+/);
  const decimal = digits.every(x => small.indexOf(x) >= 0 && small.indexOf(x) < 10) ? digits.map(x => small.indexOf(x)).join('') : /^\d+$/.test(parts[1]) ? parts[1] : integer(parts[1]);
  return decimal === null ? null : Number(`${whole}.${decimal}`);
}
export function dictationValue(node, transcript) {
  let text = transcript.trim();
  if (!text) return null;
  if (node.tagName === 'SELECT') {
    const option = [...node.options].find(x => !x.disabled && x.value && (clean(x.textContent) === clean(text.replace(/[.!]$/,'')) || clean(x.value) === clean(text.replace(/[.!]$/,''))));
    return option?.value ?? null;
  }
  if (node.type === 'number' || ['numeric','decimal'].includes(node.inputMode)) {
    text = clean(text).replace(/^(tengo|peso|mido|son)\s+/,'').replace(/\s*(anos|kg|kilos|kilogramos|cm|centimetros|metros|pasos|minutos|dias)(\s+de\s+edad)?\.?$/,'').trim();
    let number = spokenNumber(text);
    if (number === null || !Number.isFinite(number)) return null;
    if (/altura/i.test(fieldLabel(node)) && number > 0 && number < 3) number = Math.round(number * 1000) / 10;
    return String(number);
  }
  if (['date','time','month','week','datetime-local'].includes(node.type)) {
    const patterns = {date:/^\d{4}-\d{2}-\d{2}$/,time:/^\d{2}:\d{2}$/,month:/^\d{4}-\d{2}$/,week:/^\d{4}-W\d{2}$/, 'datetime-local':/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/};
    return patterns[node.type].test(text) ? text : null;
  }
  return text;
}
export function applyEntryValue(node, value, {validate = true} = {}) {
  const win = node.ownerDocument.defaultView;
  const prototype = node.tagName === 'SELECT' ? win.HTMLSelectElement.prototype : node.tagName === 'TEXTAREA' ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
  const before = node.value;
  Object.getOwnPropertyDescriptor(prototype,'value').set.call(node,value);
  if (node.value !== value || (validate && !node.checkValidity()) || (node.maxLength >= 0 && value.length > node.maxLength)) {
    Object.getOwnPropertyDescriptor(prototype,'value').set.call(node,before); return false;
  }
  node.dispatchEvent(new win.Event(node.tagName === 'SELECT' ? 'change' : 'input',{bubbles:true}));
  return true;
}
export function dictationError(code) {
  return ({
    'not-allowed':'El navegador ha bloqueado el permiso del micrófono. Permite el micrófono para DIETEAR o usa el micrófono del teclado.',
    'service-not-allowed':'Este navegador no permite su servicio de dictado aquí. Prueba con el micrófono del teclado del móvil.',
    'audio-capture':'No se puede acceder al micrófono. Comprueba que esté disponible y vuelve a intentarlo.',
    'network':'El servicio de voz no ha podido conectar. Comprueba Internet o usa el micrófono del teclado.',
    'no-speech':'No se ha detectado voz. Pulsa el micrófono y habla cuando aparezca «Escuchando».',
    'language-not-supported':'Este navegador no admite el dictado en español. Puedes usar el micrófono del teclado.',
    'aborted':'Dictado detenido. Puedes volver a pulsar el micrófono.',
  })[code] || 'No se pudo completar el dictado. Puedes usar el micrófono del teclado o escribir.';
}
export function startDictation(Speech, handlers) {
  const recognition = new Speech(); let active = true, completed = false;
  recognition.lang = 'es-ES'; recognition.continuous = false; recognition.interimResults = true; recognition.maxAlternatives = 1;
  recognition.onstart = () => { if (active) handlers.start?.(); };
  recognition.onresult = event => {
    if (!active || completed) return;
    const results = Array.from(event.results || []);
    const final = results.filter(x => x.isFinal).map(x => x[0]?.transcript || '').join(' ').trim();
    const provisional = results.map(x => x[0]?.transcript || '').join(' ').trim();
    if (final) { completed = true; handlers.result(final); }
    else if (provisional) handlers.preview?.(provisional);
  };
  recognition.onerror = event => { if (active) handlers.error(event.error); };
  recognition.onend = () => { if (active) handlers.end(); };
  const detach = () => { active = false; recognition.onstart = recognition.onresult = recognition.onerror = recognition.onend = null; };
  try { recognition.start(); } catch (error) { detach(); throw error; }
  return () => { detach(); try { recognition.abort(); } catch {} };
}
