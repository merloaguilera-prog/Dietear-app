import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("the Android web association accepts both the upload build and Play-signed DIETEAR",()=>{
  const statements=JSON.parse(readFileSync(new URL("../public/.well-known/assetlinks.json",import.meta.url),"utf8"));
  const app=statements.find(entry=>entry.target?.namespace==="android_app"&&entry.target.package_name==="com.dietear.app");
  assert.ok(app?.relation.includes("delegate_permission/common.handle_all_urls"));
  const fingerprints=app.target.sha256_cert_fingerprints;
  assert.equal(new Set(fingerprints).size,fingerprints.length);
  assert.ok(fingerprints.every(value=>/^([A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(value)));
  assert.ok(fingerprints.includes("8A:60:21:94:04:B8:00:FD:B9:E1:76:82:9F:0D:E3:CB:D1:63:17:ED:22:14:3B:46:67:61:EC:8C:C4:FA:91:13"));
  // App-signing fingerprint copied from the user's Play Console evidence, 16 Oct.
  assert.ok(fingerprints.includes("E9:03:95:0B:19:A2:0E:40:27:C3:51:E3:7D:B0:10:32:B0:9C:51:BF:B6:28:02:CD:C4:AC:C8:D5:57:AA:E2:4A"));
});
