import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
function worker({network = async () => new Response("fresh", {headers: {"Content-Type": "text/html"}}), blocked = false} = {}) {
  const handlers = {}, stores = new Map(), deleted = [], fetches = [];
  const key = request => typeof request === "string" ? new URL(request, "https://dietear.app").href : request.url;
  const caches = {
    async open(name) {
      if (blocked) throw new Error("Storage denied");
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {match: async request => store.get(key(request))?.clone(), put: async (request, response) => store.set(key(request), response), addAll: async () => {}};
    },
    keys: async () => [...stores.keys()],
    delete: async name => {deleted.push(name); return stores.delete(name);},
  };
  vm.runInNewContext(source, {URL, Response, caches, fetch: async request => {fetches.push(request.url); return network(request);}, self: {
    location: {origin: "https://dietear.app"}, clients: {claim: async () => {}}, skipWaiting() {},
    addEventListener: (name, handler) => {handlers[name] = handler;},
  }});
  async function dispatch(path, options = {}) {
    let response;
    const pending = [];
    const request = {url: new URL(path, "https://dietear.app").href, method: "GET", mode: "navigate", destination: "document", headers: new Headers(), ...options};
    handlers.fetch({request, respondWith: promise => {response = promise;}, waitUntil: promise => pending.push(promise)});
    const result = await response;
    await Promise.all(pending);
    return result;
  }
  return {dispatch, caches, stores, deleted, fetches, handlers};
}

test("a temporary server error never replaces the last working offline page", async () => {
  let fail = false;
  const w = worker({network: async () => {if (fail === "offline") throw new Error("offline"); return new Response(fail ? "error" : "working", {status: fail ? 500 : 200, headers: {"Content-Type": "text/html"}});}});
  assert.equal(await (await w.dispatch("/")).text(), "working");
  fail = true;
  assert.equal((await w.dispatch("/")).status, 500);
  fail = "offline";
  assert.equal(await (await w.dispatch("/")).text(), "working");
});

test("a blocked cache cannot prevent the online app from opening", async () => {
  const w = worker({blocked: true});
  assert.equal(await (await w.dispatch("/")).text(), "fresh");
  assert.equal(await (await w.dispatch("/photo.png", {mode: "cors", destination: "image"})).text(), "fresh");
});

test("offline first launch always returns a usable response", async () => {
  const w = worker({blocked: true, network: async () => {throw new Error("offline");}});
  const result = await w.dispatch("/");
  assert.equal(result.status, 503);
  assert.match(await result.text(), /Sin conexión/);
});

test("images at unchanged URLs refresh online and remain available offline", async () => {
  let value = "old";
  const w = worker({network: async () => {if (!value) throw new Error("offline"); return new Response(value);}});
  const options = {mode: "cors", destination: "image"};
  assert.equal(await (await w.dispatch("/photo.png", options)).text(), "old");
  value = "new";
  assert.equal(await (await w.dispatch("/photo.png", options)).text(), "new");
  value = null;
  assert.equal(await (await w.dispatch("/photo.png", options)).text(), "new");
});

test("hashed bundles reuse cache, while flight data, manifests and APIs reach the server", async () => {
  const w = worker();
  const options = {mode: "cors", destination: "script"};
  await w.dispatch("/_next/static/abc.js", options);
  await w.dispatch("/_next/static/abc.js", options);
  assert.equal(w.fetches.length, 1);
  for (const path of ["/?_rsc=123", "/api/product", "/manifest.webmanifest", "https://other.example/photo.png"]) {
    assert.equal(await w.dispatch(path, {mode: "cors", destination: ""}), undefined);
  }
  assert.equal(await w.dispatch("/", {mode: "cors", headers: new Headers({RSC: "1"})}), undefined);
});

test("activation removes only obsolete DIETEAR caches", async () => {
  const w = worker();
  for (const name of ["dietear-shell-v1", "dietear-shell-v2", "another-app"]) await w.caches.open(name);
  const pending = [];
  w.handlers.activate({waitUntil: promise => pending.push(promise)});
  await Promise.all(pending);
  assert.deepEqual(w.deleted, ["dietear-shell-v1"]);
  assert.equal(w.stores.has("another-app"), true);
});
