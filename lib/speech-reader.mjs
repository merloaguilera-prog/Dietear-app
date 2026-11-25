export const READING_RATES = Object.freeze([1, 2, 3]);
export const readingRate = value => READING_RATES.includes(Number(value)) ? Number(value) : 1;

// Short utterances avoid long-text cutoffs on mobile speech engines. Keep every
// word, including unbroken names/URLs, and expose the source step for highlighting.
export function speechChunks(text, limit = 180) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const chunks = [];
  let chunk = '';
  for (const word of words) {
    if (chunk && chunk.length + word.length + 1 > limit) { chunks.push(chunk); chunk = ''; }
    chunk += (chunk ? ' ' : '') + word;
    if (/[.!?…]$/.test(word)) { chunks.push(chunk); chunk = ''; }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

let owner = null;

export function createSpeechReader({synthesis, Utterance, onChange = () => {}}) {
  let queue = [], cursor = 0, rate = 1, status = 'idle', generation = 0;
  let fallback = false, notice = '';
  const supported = Boolean(synthesis?.speak && Utterance);
  const emit = () => onChange({status, index: queue[cursor]?.index ?? 0, rate, notice});
  const cancel = () => { generation++; if (owner === api) { owner = null; synthesis.cancel(); } };
  function stop() { cancel(); status = 'idle'; emit(); }
  function speak() {
    if (!supported || cursor >= queue.length) { status = 'idle'; emit(); return; }
    if (owner && owner !== api) owner.stop();
    owner = api;
    const token = ++generation;
    const utterance = new Utterance(queue[cursor].text);
    utterance.lang = 'es-ES';
    utterance.rate = rate;
    const voices = synthesis.getVoices?.() || [];
    const voice = voices.find(item => item.lang === 'es-ES') || voices.find(item => item.lang?.startsWith('es'));
    if (voice) utterance.voice = voice;
    status = 'loading'; emit();
    utterance.onstart = () => { if (generation === token) { status = 'speaking'; emit(); } };
    utterance.onend = () => {
      if (generation !== token) return;
      cursor++;
      if (cursor < queue.length) speak();
      else { owner = null; status = 'idle'; emit(); }
    };
    utterance.onerror = event => {
      if (generation !== token) return;
      if (rate > 1 && event.error === 'invalid-argument' && !fallback) {
        rate = rate === 3 ? 2 : 1; fallback = true;
        notice = `Esta voz ha rechazado la velocidad elegida. Se usa ×${rate}.`;
        cancel(); speak(); return;
      }
      cancel(); status = 'error';
      notice = event.error === 'not-allowed'
        ? 'Pulsa Escuchar para permitir la lectura. También puedes seguir el texto.'
        : 'No se pudo reproducir la voz. Puedes reintentar o seguir el texto.';
      emit();
    };
    try { synthesis.speak(utterance); } catch { utterance.onerror({error: 'synthesis-failed'}); }
  }
  const api = {
    supported,
    play(sections, preferredRate = 1) {
      cancel();
      queue = sections.flatMap((section, index) => speechChunks(section.text).map(text => ({text, index: section.index ?? index})));
      cursor = 0; rate = readingRate(preferredRate); fallback = false; notice = '';
      speak();
    },
    // Cancel/resume at the current short fragment also works on Android engines
    // whose native pause() discards the utterance. No unexpected background audio.
    pause() { if (status === 'speaking' || status === 'loading') { cancel(); status = 'paused'; emit(); } },
    resume() { if (status === 'paused') speak(); },
    stop,
    destroy() { cancel(); status = 'idle'; },
  };
  return api;
}
