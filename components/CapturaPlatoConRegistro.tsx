"use client";

import { useState } from "react";
import CapturaPlato from "./CapturaPlato";

const DB_NAME = "dietear-mi-plato-v1";
const STORE = "fotos-comidas";
export type RegistroFoto = { id: string; profileId: string; createdAt: number; photo: Blob };

function abrirBase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("profileId", "profileId");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function guardarFotoEnPerfil(profileId: string, photo: File): Promise<void> {
  if (!profileId.trim()) throw new Error("Selecciona un perfil");
  const db = await abrirBase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).add({
        id: crypto.randomUUID(), profileId, createdAt: Date.now(), photo
      } satisfies RegistroFoto);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}

export async function listarFotosDelPerfil(profileId: string): Promise<RegistroFoto[]> {
  if (!profileId.trim()) return [];
  const db = await abrirBase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).index("profileId").getAll(profileId);
      req.onsuccess = () => resolve((req.result as RegistroFoto[]).sort((a,b) => b.createdAt - a.createdAt));
      req.onerror = () => reject(req.error);
    });
  } finally { db.close(); }
}

/** Integrar únicamente con un profileId autenticado y autorizado, no con texto libre. */
export default function CapturaPlatoConRegistro({ profileId }: { profileId: string }) {
  const [mensaje, setMensaje] = useState("");
  return <div>
    <CapturaPlato onSave={async photo => {
      setMensaje("");
      await guardarFotoEnPerfil(profileId, photo);
      setMensaje("Foto guardada en este dispositivo para el perfil seleccionado.");
    }} />
    {mensaje && <p role="status">{mensaje}</p>}
  </div>;
}
