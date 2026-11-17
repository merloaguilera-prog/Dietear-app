import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const worker=fs.readFileSync(new URL("../public/sw.js",import.meta.url),"utf8");

test("la navegación no recupera HTML antiguo de caché",()=>{
 const start=worker.indexOf('if (request.mode === "navigate")');
 const end=worker.indexOf('if (immutable)',start);
 assert.ok(start>=0&&end>start);
 const navigation=worker.slice(start,end);
 assert.match(navigation,/fetchNavigation\(request\)/);
 assert.doesNotMatch(navigation,/cached\(request\)/);
 assert.match(navigation,/cached\("\/offline\.html"\)/);
});

test("la actualización del service worker invalida la caché anterior",()=>{
 assert.match(worker,/CACHE_VERSION = "dietear-shell-v3"/);
 assert.match(worker,/keys\.filter\(key => key\.startsWith\("dietear-shell-"\) && key !== CACHE_VERSION\)/);
});

test("un recurso auxiliar ausente no bloquea la instalación de la PWA",()=>{
 const installStart=worker.indexOf('self.addEventListener("install"');
 const activateStart=worker.indexOf('self.addEventListener("activate"');
 assert.ok(installStart>=0 && activateStart>installStart);
 const install=worker.slice(installStart,activateStart);
 assert.ok(install.includes("Promise.allSettled(APP_SHELL.map(path => cache.add(path)))"));
 assert.doesNotMatch(install,/cache\.addAll\(APP_SHELL\)/);
});
