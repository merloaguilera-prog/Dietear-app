// Run after npm run build; requires Playwright and an installed Chromium.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(require.resolve("playwright", { paths: [process.cwd(), process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean) }));
const port = 3210;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: ["ignore", "pipe", "pipe"] });
let output = "";
server.stdout.on("data", data => output += data);
server.stderr.on("data", data => output += data);
let browser;
const passed = [];
try {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}`)).ok) break; } catch { /* server warming up */ }
    if (i === 99) throw new Error("Server not ready: " + output);
    await pause(100);
  }
  browser = await chromium.launch({ headless: true, executablePath: process.env.DIETEAR_CHROMIUM_EXECUTABLE || undefined, args: ["--no-sandbox", "--no-zygote", "--single-process", "--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: "Europe/Madrid" });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(20000);
  const errors = [], apiRequests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/")) apiRequests.push(request.url()); });
  page.on("dialog", dialog => dialog.accept());
  await page.clock.setFixedTime(new Date("2026-10-19T06:40:00Z"));
  await page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("dietear-state-v2", JSON.stringify({ version: 2, savedAt: "2026-10-19T06:00:00Z", data: {
      profile: { name: "Prueba", people: 1 },
      history: [{ id: "legacy-weight", type: "peso", value: 80, label: "Peso de prueba", date: "2026-10-18T10:00:00Z" }],
      fridge: [{ name: "Tomate", expiryDate: "2026-10-18", dateType: "use-by", quantity: "300", unit: "g", cost: "1" }, { name: "Garbanzos cocidos", expiryDate: "2026-10-20", dateType: "best-before", quantity: "200", unit: "g", cost: "2.50" }, { name: "Pan", expiryDate: "2026-10-18", dateType: "best-before", quantity: "100", unit: "g" }],
      shopping: [{ text: "Tomate", qty: 300, unit: "g", days: [], done: false }, { text: "Garbanzos cocidos", qty: 400, unit: "g", days: [], done: false }],
    }}));
  });
  const rootState = () => page.evaluate(() => JSON.parse(localStorage.getItem("dietear-state-v2")).data);
  const habitState = () => page.evaluate(() => JSON.parse(localStorage.getItem("dietear-daily-habits")));
  const home = async () => { await page.getByRole("button", { name: "Hoy", exact: true }).click(); await page.getByRole("heading", { name: "Hoy me propongo…" }).waitFor(); };
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "+ Cuidar mi hidratación", exact: true }).click();
  await page.getByRole("button", { name: "+ Añadir fruta o verdura", exact: true }).click();
  await page.getByRole("button", { name: "+ Cuidar mi descanso", exact: true }).click();
  await page.getByRole("button", { name: "+ Moverme a mi ritmo", exact: true }).click();
  assert.equal((await habitState()).active.length, 3);
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Marcar como hecho", exact: true }).first().click();
  await page.getByRole("button", { name: "Revisar mi día", exact: true }).click();
  await page.getByText("Mi revisión de los últimos 7 días", { exact: true }).click();
  await page.getByText("Logrado · 3/3", { exact: true }).waitFor();
  assert.equal(await page.getByText("Sin evaluar", { exact: true }).count(), 6);
  await page.reload({ waitUntil: "networkidle" });
  assert.equal((await habitState()).days["2026-10-19"].completed.length, 3);
  passed.push("Habit selection, max 3, completion, review, missing data and reload");

  await page.getByRole("button", { name: /Salud y descanso/ }).click();
  await page.getByRole("heading", { name: "Tu descanso, con horarios reales" }).waitFor();
  await page.getByLabel("Me acosté el", { exact: true }).fill("2026-10-18T23:00");
  await page.getByLabel("Me levanté el", { exact: true }).fill("2026-10-19T07:00");
  await page.getByLabel("¿Cómo he descansado?", { exact: true }).selectOption("Reparador");
  await page.getByLabel("Energía al levantarme", { exact: true }).selectOption("Media");
  await page.getByRole("button", { name: "Guardar descanso →", exact: true }).click();
  await page.getByText("8.0 h de intervalo medio", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Guardar descanso →", exact: true }).click();
  let state = await rootState();
  assert.equal(state.history.filter(item => item.type === "bienestar").length, 1);
  assert.equal(state.history.find(item => item.type === "bienestar").value, 8);
  assert.ok(state.history.some(item => item.id === "legacy-weight"));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const box = await page.locator(".sleepPanel").boundingBox();
    assert.ok(box.x >= -1 && box.x + box.width <= width + 1, `Sleep panel overflows at ${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  if (process.env.DIETEAR_SCREENSHOT_DIR) await page.locator(".sleepPanel").screenshot({ path: `${process.env.DIETEAR_SCREENSHOT_DIR}/sleep-check.png` });
  await page.reload({ waitUntil: "networkidle" });
  assert.equal((await rootState()).history.filter(item => item.type === "bienestar").length, 1);
  passed.push("Sleep UI → history → persistence, duplicate prevention, legacy preservation and four widths");

  await page.getByRole("button", { name: /Actividad →/ }).click();
  await page.getByRole("heading", { name: "Tengo unos minutos" }).waitFor();
  await page.getByRole("button", { name: "3 min", exact: true }).click();
  const movement = page.getByRole("button", { name: "He realizado 3 min · guardar", exact: true });
  await movement.click();
  await page.getByRole("button", { name: "✓ Sesión registrada", exact: true }).waitFor();
  assert.equal((await rootState()).history.filter(item => item.type === "actividad").length, 1);
  passed.push("Movement records only after confirmation and prevents accidental double click");

  await home();
  await page.getByRole("region", { name: "Mi día conectado", exact: true }).getByRole("button", { name: /Mi Nevera/ }).click();
  await page.getByRole("heading", { name: "Primero, revisa lo que ya tienes" }).waitFor();
  const expired = page.locator(".pantryFood").filter({ has: page.getByRole("heading", { name: "Tomate", exact: true }) });
  assert.equal(await expired.getByRole("button", { name: "He aprovechado este lote", exact: true }).isDisabled(), true);
  const bestBefore = page.locator(".pantryFood").filter({ has: page.getByRole("heading", { name: "Pan", exact: true }) });
  assert.ok((await bestBefore.innerText()).includes("Consumo preferente superado"));
  assert.equal((await bestBefore.innerText()).includes("Caducado:"), false);
  await page.getByLabel("Fecha de apertura de Garbanzos cocidos", { exact: true }).fill("2026-10-18");
  await page.getByLabel("Fecha de congelación de Garbanzos cocidos", { exact: true }).fill("2026-10-19");
  state = await rootState();
  assert.equal(state.fridge.find(item => item.name === "Garbanzos cocidos").frozenOn, "2026-10-19");
  passed.push("Pantry date types, unsafe lot blocked, opening/freezing metadata persisted");

  await home();
  await page.getByRole("region", { name: "Mi día conectado", exact: true }).getByRole("button", { name: /Mi Compra/ }).click();
  await page.getByRole("button", { name: "🧊 Descontar cantidades conocidas", exact: true }).click();
  state = await rootState();
  assert.equal(state.shopping.find(item => item.text === "Tomate").qty, 300);
  assert.equal(state.shopping.find(item => item.text === "Garbanzos cocidos").qty, 200);
  assert.equal(await page.getByRole("button", { name: "🧊 Descontar cantidades conocidas", exact: true }).isDisabled(), true);
  passed.push("Shopping subtracts usable quantities once, never expired stock");

  await home();
  await page.getByRole("region", { name: "Mi día conectado", exact: true }).getByRole("button", { name: /Mi Nevera/ }).click();
  const available = page.locator(".pantryFood").filter({ has: page.getByRole("heading", { name: "Garbanzos cocidos", exact: true }) });
  await available.getByRole("button", { name: "He aprovechado este lote", exact: true }).click();
  state = await rootState();
  assert.equal(state.pantryLog.length, 1);
  assert.equal(state.pantryLog[0].kg, 0.2);
  assert.equal(state.pantryLog[0].cost, 2.5);
  assert.equal(state.fridge.some(item => item.name === "Garbanzos cocidos"), false);
  await page.reload({ waitUntil: "networkidle" });
  state = await rootState();
  assert.equal(state.pantryLog.length, 1);
  passed.push("Declared food usage → monthly ledger → inventory removal → reload");

  assert.equal(apiRequests.length, 0, "The wellness modules must not send personal records to an API");
  let consultation;
  await page.route("**/api/ai", route => {
    consultation = route.request().postDataJSON();
    return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({text:"Respuesta simulada de prueba, sin proveedor externo",sources:[]})});
  });
  await page.getByRole("textbox", {name:"Pregunta para DIETEAR",exact:true}).fill("Pregunta de prueba sin datos personales");
  await page.getByRole("button", {name:"Preguntar a DIETEAR →",exact:true}).click();
  await page.getByText("Respuesta simulada de prueba, sin proveedor externo",{exact:true}).waitFor();
  assert.ok(consultation.context.history.every(item=>!item.sleepStart&&!item.sleepEnd&&item.type!=="bienestar"));
  assert.equal(consultation.context.profile.pantryLog,undefined);
  passed.push("Explicit AI query uses a mocked response and excludes new rest and pantry records");

  await page.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException("Full", "QuotaExceededError"); }; });
  await page.getByRole("button", { name: "+ Moverme a mi ritmo", exact: true }).click();
  // Goal cap may reject before storage; explicitly unselect an existing goal to exercise quota.
  await page.getByRole("button", { name: "✓ Cuidar mi hidratación", exact: true }).click();
  await page.getByText(/No se pudo guardar. Revisa el espacio/).waitFor();
  assert.deepEqual(errors, []);
  passed.push("Quota failure is visible and no browser runtime errors occur");
  console.log(JSON.stringify({ passed, status: "PASS" }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ passed, status: "FAIL", error: error.message, server: output }, null, 2));
  process.exitCode = 1;
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
