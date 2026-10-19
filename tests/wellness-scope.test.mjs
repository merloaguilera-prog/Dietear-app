import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { wellnessContext, wellnessHistory, consultationHistory, isWellnessStyle, isClinicalRequest, WELLNESS_ONLY_MESSAGE } from "../lib/wellness-context.js";
import { loadState, saveState } from "../lib/dietear-store.js";

const oldClinical = {
  profile: {
    name: "PRIVATE_NAME", weight: "80", allergens: "huevo", dietStyle: "Diabética",
    clinicalContext: { Analíticas: { text: "PRIVATE_LABS" } },
    healthAreaDetails: { Corazón: { medication: "PRIVATE_MEDICATION" } },
    healthNotes: "PRIVATE_HEALTH", dietaryGuidance: "PRIVATE_PROFESSIONAL_NOTE",
    familyMembers: [{ name: "PRIVATE_FAMILY_NAME", type: "adulto", allergens: "soja", medical: "PRIVATE_FAMILY_CLINICAL", professionalNotes: "PRIVATE_FAMILY_NOTE" }],
  },
  history: [
    { id: 1, type: "peso", value: 80, label: "PRIVATE_HISTORY_NOTE", notes: "PRIVATE_NOTE" },
    { id: 2, type: "glucose", value: 110, label: "PRIVATE_GLUCOSE" },
    { id: 3, type: "bienestar", value: 8, sleepStart: "2026-10-18T23:00" },
    { id: 4, type: "unknown", value: 1, label: "PRIVATE_UNKNOWN" },
  ],
  careRecords: [{ type: "Medicación", text: "PRIVATE_CARE_RECORD" }],
  week: [{ day: "Lunes", lunch: "Lentejas", clinical: "PRIVATE_WEEK_FIELD" }],
};

test("only permitted wellbeing fields cross the automatic context boundary", () => {
  const before = structuredClone(oldClinical);
  const context = wellnessContext(oldClinical);
  assert.equal(context.profile.weight, "80");
  assert.equal(context.profile.allergens, "huevo");
  assert.deepEqual(context.profile.familyMembers, [{ type: "adulto", allergens: "soja" }]);
  assert.deepEqual(context.history, [{ type: "peso", value: 80 }]);
  assert.deepEqual(context.week, [{ day: "Lunes", lunch: "Lentejas" }]);
  assert.equal(JSON.stringify(context).includes("PRIVATE_"), false);
  assert.deepEqual(oldClinical, before);
});

test("wellbeing views hide old clinical records while keeping the source data intact", () => {
  assert.deepEqual(wellnessHistory(oldClinical.history).map(item => item.id), [1, 3]);
  assert.deepEqual(consultationHistory(oldClinical.history), [{ type: "peso", value: 80 }]);
  assert.equal(oldClinical.history.length, 4);
  assert.equal(isWellnessStyle("Diabética"), false);
  assert.equal(isWellnessStyle("Baja en residuos"), false);
  assert.equal(isWellnessStyle("Mediterránea"), true);
  for (const bad of [null, false, [], 4, "bad", { profile: null, history: {}, week: [null], fridge: [null] }]) assert.doesNotThrow(() => wellnessContext(bad));
});

test("editing wellbeing data and saving does not delete archived clinical data", () => {
  let stored;
  globalThis.window = {};
  globalThis.localStorage = { getItem: () => stored, setItem: (_, value) => { stored = value; } };
  try {
    saveState(oldClinical);
    const loaded = loadState();
    const updated = { ...loaded, profile: { ...loaded.profile, avoid: "cebolla" }, history: [{ type: "agua", value: 0.25 }, ...loaded.history] };
    saveState(updated);
    const reloaded = loadState();
    assert.deepEqual(reloaded.careRecords, oldClinical.careRecords);
    assert.deepEqual(reloaded.profile.clinicalContext, oldClinical.profile.clinicalContext);
    assert.deepEqual(reloaded.profile.healthAreaDetails, oldClinical.profile.healthAreaDetails);
    assert.deepEqual(reloaded.history.slice(1), oldClinical.history);
    assert.equal(reloaded.profile.avoid, "cebolla");
  } finally { delete globalThis.window; delete globalThis.localStorage; }
});

test("explicit clinical requests stop at the wellbeing boundary", () => {
  for (const query of ["Interpreta mi analítica", "Mi HbA1c es 7", "¿Cambio mi medicación?", "Tengo glucosa alta", "Dosis de insulina", "Blood pressure 140/90"]) assert.equal(isClinicalRequest(query), true, query);
  for (const query of ["Cena económica sin huevo", "Ideas para caminar", "¿Qué recetas tienen más fibra?"]) assert.equal(isClinicalRequest(query), false, query);
});

// Load the actual handler with an isolated fake runtime and fetch mock. No key
// is read or created and no external request is made during these tests.
async function handler(name) {
  let source = await readFile(new URL(`../app/api/${name}/route.js`, import.meta.url), "utf8");
  source = source.replace(/import \{\s*getAIRuntime\s*\} from [^;]+;/, 'const getAIRuntime = () => ({ endpoint: "https://example.invalid/responses", token: "test-only", model: "test-only" });');
  source = source.replace(/from "\.\.\/\.\.\/\.\.\/lib\/([^"]+)"/g, (_, file) => `from ${JSON.stringify(new URL(`../lib/${file.endsWith(".js") ? file : file + ".js"}`, import.meta.url).href)}`);
  return (await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`)).POST;
}
const request = body => new Request("https://dietear.test/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("both server handlers reject overposted clinical context before the provider boundary", async () => {
  const originalFetch = globalThis.fetch;
  const sent = [];
  globalThis.fetch = async (_, options) => {
    const payload = JSON.parse(options.body);
    sent.push(payload);
    const text = payload.text ? JSON.stringify({ food: "Tomate", nutrients: [], diets: [], uses: [] }) : "Ideas de bienestar";
    return Response.json({ output: [{ type: "message", content: [{ type: "output_text", text }] }] });
  };
  try {
    for (const name of ["ai", "food-analysis"]) {
      const post = await handler(name);
      const response = await post(request({ query: "Tomate", context: oldClinical }));
      assert.equal(response.status, 200);
      const provider = sent.at(-1);
      assert.equal(JSON.stringify(provider).includes("PRIVATE_"), false);
      assert.equal(JSON.parse(provider.input).contexto.profile.weight, "80");
      assert.match(provider.instructions, /únicamente alimentación y bienestar/);
      const count = sent.length;
      const blocked = await post(request({ query: "Interpreta mi glucosa", context: oldClinical }));
      assert.equal(blocked.status, name === "ai" ? 200 : 422);
      assert.ok(JSON.stringify(await blocked.json()).includes(WELLNESS_ONLY_MESSAGE));
      assert.equal(sent.length, count);
    }
  } finally { globalThis.fetch = originalFetch; }
});
