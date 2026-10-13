// Preparación del almacenamiento cifrado de DIETEAR. No activar sin migración y pruebas.
const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = bytes => btoa(String.fromCharCode(...bytes));
const unb64 = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
const derive = async (passphrase, salt) => {
  if (typeof passphrase !== "string" || passphrase.length < 12) throw new Error("La contraseña debe tener al menos 12 caracteres.");
  const material = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:310000,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
};
export async function encryptHealthRecords(records, passphrase) {
  if (!crypto?.subtle || !crypto.getRandomValues) throw new Error("Este navegador no permite cifrado seguro.");
  if (!Array.isArray(records)) throw new Error("Formato de historial no válido.");
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const key=await derive(passphrase,salt);
  const ciphertext=await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:enc.encode("dietear-health-v1")},key,enc.encode(JSON.stringify(records)));
  return JSON.stringify({version:1,kdf:"PBKDF2-SHA256",iterations:310000,cipher:"AES-256-GCM",salt:b64(salt),iv:b64(iv),data:b64(new Uint8Array(ciphertext))});
}
export async function decryptHealthRecords(payload, passphrase) {
  const envelope=typeof payload==="string"?JSON.parse(payload):payload;
  if (!envelope || envelope.version!==1 || envelope.kdf!=="PBKDF2-SHA256" || envelope.iterations!==310000 || envelope.cipher!=="AES-256-GCM") throw new Error("Versión de historial cifrado no compatible.");
  const salt=unb64(envelope.salt),iv=unb64(envelope.iv);
  if(salt.length!==16||iv.length!==12)throw new Error("Datos cifrados incompletos.");
  try {
    const key=await derive(passphrase,salt);
    const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv,additionalData:enc.encode("dietear-health-v1")},key,unb64(envelope.data));
    const records=JSON.parse(dec.decode(plain));
    if(!Array.isArray(records))throw new Error("Formato no válido");
    return records;
  } catch {throw new Error("Contraseña incorrecta o historial dañado. No se ha modificado ningún dato.");}
}
