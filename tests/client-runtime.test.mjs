import test from "node:test";
import assert from "node:assert/strict";
import {matchesRestriction, tabForSearch, writeLocalJson} from "../lib/client-runtime.js";

test("restriction text containing symbols is literal and cannot break meal selection", () => {
  for (const term of ["frutos secos (nuez)", "soja+", "arroz [integral]", "huevo (", "a\\b", "cacao.*"]) {
    assert.equal(matchesRestriction(`Ensalada con ${term}`, [term]), true, term);
  }
  assert.equal(matchesRestriction("cacao puro", ["cacao.*"]), false);
  assert.equal(matchesRestriction("pollo al horno", ["huevo ("]), false);
});

test("restrictions keep accents, plurals, whitespace and word boundaries", () => {
  assert.equal(matchesRestriction("PURÉ CON PLÁTANOS", ["platano"]), true);
  assert.equal(matchesRestriction("frutos   secos", ["frutos secos"]), true);
  assert.equal(matchesRestriction("salmon al horno", ["sal"]), false);
  assert.equal(matchesRestriction("ensalada", []), false);
});

test("every published PWA shortcut selects its destination", () => {
  assert.equal(tabForSearch("?section=food&source=shortcut"), "alimentacion");
  assert.equal(tabForSearch("?section=plan&source=shortcut"), "plan");
  assert.equal(tabForSearch("?section=progress&source=shortcut"), "progreso");
  for (const value of ["", "?section=unknown", "?section=__proto__", "?section=toString"]) {
    assert.equal(tabForSearch(value), null);
  }
});

test("failed writes report failure and preserve existing storage", () => {
  const records = new Map([["family", "original"]]);
  globalThis.window = {localStorage: {setItem() { throw new DOMException("Full", "QuotaExceededError"); }}};
  try {
    assert.equal(writeLocalJson("family", [{name: "Ana"}]), false);
    assert.equal(records.get("family"), "original");
    Object.defineProperty(window, "localStorage", {get() { throw new DOMException("Denied", "SecurityError"); }});
    assert.equal(writeLocalJson("points", {}), false);
  } finally { delete globalThis.window; }
});

test("successful writes retain the full value and SSR needs no storage", () => {
  const records = new Map();
  const value = {daily: 30, entries: [{date: "2026-10-24", points: 4}]};
  globalThis.window = {localStorage: {setItem: (key, data) => records.set(key, data)}};
  try {
    assert.equal(writeLocalJson("points", value), true);
    assert.deepEqual(JSON.parse(records.get("points")), value);
  } finally { delete globalThis.window; }
  assert.equal(writeLocalJson("points", value), false);
});
