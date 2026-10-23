import test from "node:test";
import assert from "node:assert/strict";
import { localDay, validDay, shiftDay, dayNumber } from "../lib/local-day.js";
import { normalizeHabits, updateHabitDay, habitWeek } from "../lib/daily-habits.js";
import { sleepSession, saveSleepRecord, sleepWeek } from "../lib/sleep.js";
import { foodDateStatus, ingredientMatches, migratePantry, rankPantryRecipes, subtractPantry, wasteTotals } from "../lib/pantry.js";
import { loadState, saveState } from "../lib/dietear-store.js";
import { consultationHistory } from "../lib/wellness-context.js";

process.env.TZ = "Europe/Madrid";
const today = "2026-10-19";

test("local day is Madrid's day near UTC midnight", () => {
  assert.equal(localDay(new Date("2026-10-18T22:30:00Z")), today);
  assert.equal(localDay(new Date("2026-10-18T21:59:00Z")), "2026-10-18");
});
test("calendar arithmetic survives DST and validates leap days", () => {
  assert.equal(shiftDay("2026-10-25", 1), "2026-10-26");
  assert.equal(dayNumber("2026-10-26") - dayNumber("2026-10-25"), 1);
  assert.equal(validDay("2026-02-30"), false);
  assert.equal(validDay("2024-02-29"), true);
});
test("old habit check marks migrate without inventing past objectives", () => {
  const state = normalizeHabits({ day: "2026-10-18", items: ["water", "walk", "walk", "bad"] }, today);
  assert.deepEqual(state.days["2026-10-18"].completed, ["water", "walk"]);
  assert.deepEqual(state.items, []);
  assert.equal(habitWeek(state, today)[5].status, "Sin evaluar");
});
test("at most three goals, no false success before review", () => {
  const state = updateHabitDay({}, today, { active: ["walk", "rest", "fiber", "water"] });
  assert.equal(state.active.length, 3);
  assert.equal(habitWeek(state, today).at(-1).status, "Sin evaluar");
  const reviewed = updateHabitDay(state, today, { review: true });
  assert.equal(habitWeek(reviewed, today).at(-1).status, "Reajustar");
});
test("completion, changing goals and rolling day preserve history", () => {
  let state = updateHabitDay({}, "2026-10-18", { active: ["water", "rest"] });
  state = updateHabitDay(state, "2026-10-18", { toggle: "water" });
  assert.equal(habitWeek(state, "2026-10-18").at(-1).status, "Parcialmente logrado");
  state = updateHabitDay(state, "2026-10-18", { toggle: "rest" });
  assert.equal(habitWeek(state, "2026-10-18").at(-1).status, "Logrado");
  state = updateHabitDay(state, today, { active: ["walk"] });
  assert.deepEqual(state.days["2026-10-18"].completed, ["water", "rest"]);
  assert.deepEqual(state.days[today].completed, []);
  assert.equal(habitWeek(state, today).at(-1).status, "Sin evaluar");
});
test("malformed habit values do not crash or invent data", () => {
  for (const value of [null, [], 4, "bad", { version: 2, days: { bad: {}, [today]: null } }]) assert.equal(habitWeek(normalizeHabits(value), today).length, 7);
});

const session = (start, end, now = "2026-10-20T15:00:00Z") => sleepSession({ start, end, quality: "Reparador", energy: "Media" }, new Date(now));
test("sleep spans midnight and accepts daytime rest for shifts", () => {
  assert.equal(session("2026-10-18T23:00", "2026-10-19T07:00").value, 8);
  assert.equal(session("2026-10-19T08:00", "2026-10-19T15:00").value, 7);
});
test("sleep calculates elapsed time across daylight saving transitions", () => {
  const record = session("2026-10-24T23:00", "2026-10-25T07:00", "2026-10-26T10:00:00Z");
  assert.equal(record.value, 9);
  assert.match(session("2026-03-29T02:30", "2026-03-29T07:00").error, /no existe/);
});
test("sleep rejects future, inverted, missing and >24h sessions", () => {
  for (const [start, end] of [["", ""], ["2026-10-18T08:00", "2026-10-18T07:00"], ["2026-10-18T07:00", "2026-10-19T08:00"], ["2026-11-01T23:00", "2026-11-02T07:00"], ["2026-02-30T23:00", "2026-03-01T07:00"]]) assert.ok(session(start, end).error);
});
test("updating a rest record does not duplicate it or delete old records", () => {
  let history = [{ id: 1, type: "bienestar", label: "Legacy", date: "2026-10-18", value: 7 }];
  history = saveSleepRecord(history, session("2026-10-18T23:00", "2026-10-19T07:00"));
  history = saveSleepRecord(history, session("2026-10-18T23:00", "2026-10-19T08:00"));
  assert.equal(history.length, 2);
  assert.equal(history[0].value, 9);
  assert.equal(history[1].id, 1);
});
test("sleep weekly spread handles midnight instead of a 23h jump", () => {
  const history = [session("2026-10-16T23:40", "2026-10-17T07:00"), session("2026-10-18T00:10", "2026-10-18T07:00"), session("2026-10-19T00:05", "2026-10-19T07:00")].map(item => saveSleepRecord([], item)[0]);
  const week = sleepWeek(history, today);
  assert.equal(week.spreadMinutes, 30);
  assert.equal(week.count, 3);
  assert.equal(sleepWeek([], today).average, null);
  assert.equal(sleepWeek(history.slice(0, 2), today).spreadMinutes, null);
});

test("use-by blocks unsafe food regardless of smell or freezing metadata", () => {
  const state = foodDateStatus({ expiryDate: "2026-10-18", dateType: "use-by", frozenOn: "2026-10-17" }, today);
  assert.equal(state.blocked, true);
  assert.match(state.label, /no consumir/);
});
test("best-before is not labelled unsafe but is excluded pending review", () => {
  const state = foodDateStatus({ expiryDate: "2026-10-18", dateType: "best-before" }, today);
  assert.equal(state.blocked, true);
  assert.match(state.label, /revisar calidad/);
  assert.equal(state.label.includes("Caducado"), false);
});
test("unknown expired dates fail closed; future and absent dates are transparent", () => {
  assert.equal(foodDateStatus({ expiryDate: "2026-10-18" }, today).blocked, true);
  assert.equal(foodDateStatus({ expiryDate: today, dateType: "use-by" }, today).days, 0);
  assert.equal(foodDateStatus({ expiryDate: "2026-02-30" }, today).days, null);
  assert.match(foodDateStatus({}, today).label, /Sin fecha/);
});
test("migration preserves known dates and does not invent date type", () => {
  const items = migratePantry([{ name: "Limón" }, { name: "Pan", expiryDate: today, dateType: "best-before" }], { limon: "2026-10-18", pan: "2026-10-01" });
  assert.equal(items[0].dateType, "unknown");
  assert.equal(items[1].expiryDate, today);
  assert.equal(migratePantry([{ name: "Limón", expiryDate: "" }], { limon: today })[0].expiryDate, "");
});
const recipe = { id: "a", name: "Ensalada", ingredients: [["Tomate", 100, "g"], ["Huevo", 1, "ud"]] };
test("expired stock never counts as an available ingredient", () => {
  const ranked = rankPantryRecipes([recipe], [{ name: "Tomate", expiryDate: "2026-10-18", dateType: "use-by" }, { name: "Huevo" }], today);
  assert.equal(ranked[0].hits, 1);
  assert.deepEqual(ranked[0].missing, ["Tomate"]);
});
test("fridge recipe ranking applies restrictions to all ingredients", () => {
  assert.equal(rankPantryRecipes([recipe], [{ name: "Tomate" }], today, text => text === "Huevo").length, 0);
});
test("ingredient matching does not mistake salt for salmon", () => {
  assert.equal(ingredientMatches("Sal", "Salmón"), false);
  assert.equal(ingredientMatches("Garbanzos", "Garbanzos cocidos"), true);
});
test("shopping subtracts exact names and same units only", () => {
  const list = [{ text: "Tomate", qty: 300, unit: "g", estimatedPrice: "2.50" }];
  assert.equal(subtractPantry(list, [{ name: "Tomate", quantity: 100, unit: "g" }], today)[0].qty, 200);
  assert.equal(subtractPantry(list, [{ name: "Tomate", quantity: 1, unit: "kg" }], today)[0].qty, 300);
  assert.equal(subtractPantry(list, [{ name: "Tomate cherry", quantity: 100, unit: "g" }], today)[0].qty, 300);
  assert.equal(subtractPantry(list, [{ name: "Tomate" }], today)[0].qty, 300);
  assert.equal(subtractPantry([{...list[0],done:true}], [{ name: "Tomate", quantity: 100, unit: "g" }], today)[0].qty, 300);
});
test("shopping excludes expired food, free-text dishes and corrections stay idempotent", () => {
  const list = [{ text: "Tomate", qty: 100, unit: "g" }, { text: "Tomate", qty: 100, unit: "g" }];
  const stock = [{ name: "Tomate", quantity: 150, unit: "g" }];
  const once = subtractPantry(list, stock, today);
  assert.equal(once[0].coveredByStock, true);
  assert.equal(once[1].qty, 50);
  assert.deepEqual(subtractPantry(once, stock, today), once);
  const extra = [...once, { text: "Tomate", qty: 50, unit: "g" }];
  assert.equal(subtractPantry(extra, stock, today).at(-1).qty, 50);
  assert.equal(subtractPantry(list, [{ ...stock[0], expiryDate: "2026-10-18" }], today)[0].qty, 100);
  assert.equal(subtractPantry([{ ...list[0], review: true }], stock, today)[0].qty, 100);
});
test("monthly declared food value is not presented as verified savings", () => {
  const totals = wasteTotals([{ date: today, outcome: "used", kg: 0.5, cost: 2 }, { date: today, outcome: "used", kg: null, cost: null }, { date: today, outcome: "discarded", kg: 0.2, cost: 1 }, { date: "2026-09-01", outcome: "used", kg: 10, cost: 40 }], today);
  assert.deepEqual(totals, { kgUsed: 0.5, costUsed: 2, kgDiscarded: 0.2, costDiscarded: 1 });
});
test("local storage failures are explicit and corrupted data is not overwritten", () => {
  globalThis.window = {};
  globalThis.localStorage = { getItem: () => "{broken", setItem: () => { throw new Error("QuotaExceeded"); } };
  assert.equal(loadState()._storageError, true);
  assert.equal(saveState({ history: [] }), false);
  globalThis.localStorage.getItem = () => JSON.stringify({version:2,data:{history:"not-an-array"}});
  assert.equal(loadState()._storageError, true);
  let saved;
  globalThis.localStorage = { getItem: () => JSON.stringify({ version: 2, data: { history: [1] } }), setItem: (key, value) => { saved = value; } };
  assert.deepEqual(loadState().history, [1]);
  assert.equal(saveState({ history: [1] }), true);
  assert.deepEqual(JSON.parse(saved).data.history, [1]);
  delete globalThis.localStorage; delete globalThis.window;
});
test("new sleep details do not silently enter AI or food-analysis context", () => {
  const history = [{type:"peso",value:80}, {type:"bienestar",value:8}, {type:"imported",sleepStart:"2026-10-18",sleepEnd:"2026-10-19"}];
  assert.deepEqual(consultationHistory(history), [{type:"peso",value:80}]);
});
