import {encryptHealthRecords,decryptHealthRecords} from "./healthCrypto";
export const LEGACY_HEALTH_KEY="dietear-health-journal-v1";
export const ENCRYPTED_HEALTH_KEY="dietear-health-journal-encrypted-v1";
const readLegacy=()=>{const raw=localStorage.getItem(LEGACY_HEALTH_KEY);if(raw===null)return [];const data=JSON.parse(raw);if(!Array.isArray(data))throw new Error("El historial original no es válido. No se modificará.");return data;};
/**
 * Creates and verifies a ciphertext copy without deleting the original.
 * Must be explicitly invoked after the user opts in and supplies a passphrase.
 * Does not switch the live journal to the encrypted copy.
 */
export async function prepareHealthMigration(passphrase){
 if(typeof window==="undefined")throw new Error("Solo disponible en el dispositivo del usuario.");
 if(localStorage.getItem(ENCRYPTED_HEALTH_KEY)!==null)throw new Error("Ya existe una copia cifrada. No se sobrescribirá.");
 const original=readLegacy();
 const ciphertext=await encryptHealthRecords(original,passphrase);
 const restored=await decryptHealthRecords(ciphertext,passphrase);
 if(JSON.stringify(restored)!==JSON.stringify(original))throw new Error("La verificación de la copia cifrada ha fallado.");
 localStorage.setItem(ENCRYPTED_HEALTH_KEY,ciphertext);
 const saved=localStorage.getItem(ENCRYPTED_HEALTH_KEY);
 const checked=await decryptHealthRecords(saved,passphrase);
 if(JSON.stringify(checked)!==JSON.stringify(original))throw new Error("No se ha podido verificar la copia almacenada. El historial original sigue intacto.");
 return {records:checked.length,legacyPreserved:true,encryptedCopyVerified:true};
}
export async function verifyEncryptedHealthCopy(passphrase){
 const saved=localStorage.getItem(ENCRYPTED_HEALTH_KEY);
 if(!saved)throw new Error("No hay copia cifrada.");
 const records=await decryptHealthRecords(saved,passphrase);
 return {records:records.length,verified:true};
}
