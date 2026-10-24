import {sanitizeSavedState} from "./state-validation.js";

export const STORE_KEY = "dietear-state-v2";
export const STORE_VERSION = 2;
let pendingRecovery = null;
let protectedState = false;
let recovered = false;

function storage() { return window.localStorage; }
function protectOriginal(raw) {
  pendingRecovery = {raw, key: null};
}
export function loadState() {
  pendingRecovery = null;
  protectedState = false;
  recovered = false;
  if (typeof window === "undefined") return null;
  let raw;
  try { raw = storage().getItem(STORE_KEY); } catch { return null; }
  if (raw === null) return null;
  let saved;
  try { saved = JSON.parse(raw); } catch { protectOriginal(raw); return {}; }
  if (saved?.version !== STORE_VERSION) {
    protectedState = true;
    return {};
  }
  const data = sanitizeSavedState(saved.data);
  if (JSON.stringify(data) !== JSON.stringify(saved.data) || (saved.savedAt != null && typeof saved.savedAt !== "string")) protectOriginal(raw);
  const date = new Date(typeof saved.savedAt === "string" ? saved.savedAt : NaN);
  return {...data, _savedDay: Number.isFinite(date.getTime()) ? date.toLocaleDateString("sv-SE") : null};
}
export function saveState(data) {
  if (typeof window === "undefined") return "unavailable";
  if (protectedState) return "protected";
  try {
    if (pendingRecovery) {
      if (storage().getItem(STORE_KEY) !== pendingRecovery.raw) return "protected";
      if (!pendingRecovery.key) {
        const key = STORE_KEY + "-recovery-" + Date.now() + "-" + Math.random().toString(36).slice(2);
        storage().setItem(key, pendingRecovery.raw);
        if (storage().getItem(key) !== pendingRecovery.raw) return "recovery-blocked";
        pendingRecovery.key = key;
      }
    }
    storage().setItem(STORE_KEY, JSON.stringify({version: STORE_VERSION, savedAt: new Date().toISOString(), data}));
    if (pendingRecovery) { recovered = true; pendingRecovery = null; }
    return recovered ? "recovered" : "saved";
  } catch {
    return pendingRecovery ? "recovery-blocked" : "unavailable";
  }
}
export function migrateLegacy() {
  if (typeof window === "undefined" || protectedState || pendingRecovery) return null;
  const get = key => { try { return JSON.parse(storage().getItem(key) || "null"); } catch { return null; } };
  const data = {goals: get("dietear-goals"), planner: get("dietear-plan"), shopping: get("dietear-shopping"), fridge: get("dietear-fridge"), profile: get("dietear-profile"), history: get("dietear-history")};
  return Object.values(data).some(Boolean) ? sanitizeSavedState(data) : null;
}
