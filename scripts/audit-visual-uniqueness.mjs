#!/usr/bin/env node
// Auditoría de reutilización de imágenes en DIETEAR.
// Uso: node scripts/audit-visual-uniqueness.mjs
// Exit code 1 cuando hay reutilización de la misma imagen en distintos botones.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "components/SelectedArtwork.js"), "utf8");
const features = source.match(/export const featureArtwork\s*=\s*\{([\s\S]*?)\n\};/);
if (!features) throw new Error("No se encontró featureArtwork");
const entries = [...features[1].matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)].map((m) => ({button:m[1],art:m[2]}));
const groups = new Map();
for (const item of entries) groups.set(item.art, [...(groups.get(item.art)||[]), item.button]);
const duplicates = [...groups.entries()].filter(([,buttons])=>buttons.length>1);
console.log("Botones auditados:", entries.length);
console.log("Ilustraciones distintas asignadas:", groups.size);
for (const [art,buttons] of duplicates) console.log("REPETIDA", art, "=>", buttons.join(" | "));
if (duplicates.length) {
  console.error("PENDIENTE: asignar una imagen exclusiva a cada botón antes de aprobar el rediseño.");
  process.exitCode = 1;
} else {
  console.log("OK: sin nombres de ilustración repetidos en los accesos auditados.");
}
