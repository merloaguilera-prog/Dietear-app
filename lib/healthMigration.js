import {encryptHealthRecords,decryptHealthRecords} from "./healthCrypto";
export const LEGACY_HEALTH_KEY="dietear-health-journal-v1";
export const ENCRYPTED_HEALTH_KEY="dietear-health-journal-encrypted-v1";
const readLegacy=()=>{const raw=localStorage.getItem(LEGACY_HEALTH_KEY);if(raw===null)return [];const data=JSON.parse(raw);if(!Array.isArray(data))throw new Error("El historial original no es válido. No se modificará.");return data;};
const removeVerifiedLegacy=()=>{
 localStorage.removeItem(LEGACY_HEALTH_KEY);
 if(localStorage.getItem(LEGACY_HEALTH_KEY)!==null)throw new Error("La copia cifrada es válida, pero no se pudo eliminar el historial antiguo. Bórralo desde los ajustes del navegador antes de continuar.");
};
/**
 * Migrates only after verifying that the encrypted payload restores exactly
 * the same records. Existing verified copies can finish an old migration.
 */
export async function prepareHealthMigration(passphrase){
 if(typeof window==="undefined")throw new Error("Solo disponible en el dispositivo del usuario.");
 const original=readLegacy();
 const existing=localStorage.getItem(ENCRYPTED_HEALTH_KEY);
 if(existing!==null){
  const restored=await decryptHealthRecords(existing,passphrase);
  if(localStorage.getItem(LEGACY_HEALTH_KEY)!==null&&JSON.stringify(restored)!==JSON.stringify(original))throw new Error("La copia cifrada no coincide con el historial antiguo. No se ha eliminado ningún dato.");
  removeVerifiedLegacy();
  return {records:restored.length,legacyPreserved:false,encryptedCopyVerified:true};
 }
 const ciphertext=await encryptHealthRecords(original,passphrase);
 const restored=await decryptHealthRecords(ciphertext,passphrase);
 if(JSON.stringify(restored)!==JSON.stringify(original))throw new Error("La verificación de la copia cifrada ha fallado.");
 localStorage.setItem(ENCRYPTED_HEALTH_KEY,ciphertext);
 const saved=localStorage.getItem(ENCRYPTED_HEALTH_KEY);
 const checked=await decryptHealthRecords(saved,passphrase);
 if(JSON.stringify(checked)!==JSON.stringify(original))throw new Error("No se ha podido verificar la copia almacenada. El historial original sigue intacto.");
 removeVerifiedLegacy();
 return {records:checked.length,legacyPreserved:false,encryptedCopyVerified:true};
}
export async function verifyEncryptedHealthCopy(passphrase){
 const saved=localStorage.getItem(ENCRYPTED_HEALTH_KEY);
 if(!saved)throw new Error("No hay copia cifrada.");
 const records=await decryptHealthRecords(saved,passphrase);
 return {records:records.length,verified:true};
}
