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

// Play Console already contains codes 1, 2 and 3 (checked 25 Nov 2026).
// A replacement bundle must use a new code, including after regeneration by Bubblewrap.
test("the next Play bundle uses an unused version and agrees with Bubblewrap",()=>{
  const manifest=JSON.parse(readFileSync(new URL("../android/twa-manifest.json",import.meta.url),"utf8"));
  const native=readFileSync(new URL("../android/native/app/build.gradle.kts",import.meta.url),"utf8");
  const code=Number(native.match(/versionCode\s*=\s*(\d+)/)?.[1]);
  const name=native.match(/versionName\s*=\s*"([^"]+)"/)?.[1];
  assert.ok(Number.isInteger(code)&&code>3,"Codes through 3 are already used in Play");
  assert.equal(manifest.appVersionCode,code);
  assert.equal(manifest.appVersionName,name);
  const smoke=readFileSync(new URL("../android/native/scripts/smoke-update.sh",import.meta.url),"utf8");
  assert.ok(smoke.includes(`versionCode=${code} `));
  assert.ok(smoke.includes(`versionName=${name}`));
});
