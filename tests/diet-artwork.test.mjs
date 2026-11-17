import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { dietArtworkPath } from "../lib/diet-artwork.js";

const source = fs.readFileSync(new URL("../app/page.js", import.meta.url), "utf8");
const selectors = [...source.matchAll(/\[\["🥗","Equilibrada"[\s\S]*?\]\](?=\.filter|\.map)/g)]
  .map(match => JSON.parse(match[0]));

test("all visible diet selectors have existing, different original illustrations", () => {
  assert.equal(selectors.length, 2, "Check Crear mi dieta and Todo Dietas");
  for (const selector of selectors) {
    const paths = selector.map(([, name]) => {
      const path = dietArtworkPath(name);
      assert.ok(path, `Missing illustration for ${name}`);
      const file = new URL(`../public${path}`, import.meta.url);
      assert.ok(fs.existsSync(file), `Missing image file for ${name}`);
      const bytes = fs.readFileSync(file);
      assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
      assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
      assert.ok(bytes.length < 100_000, `${name} should remain light on mobile`);
      return path;
    });
    assert.equal(new Set(paths).size, selector.length, "Repeated image in one selector");
    const contents = paths.map(path => fs.readFileSync(new URL(`../public${path}`, import.meta.url)).toString("base64"));
    assert.equal(new Set(contents).size, contents.length, "Duplicate image bytes under different filenames");
  }
});

test("an unknown diet does not silently reuse another diet's photo", () => {
  assert.equal(dietArtworkPath("Future diet"), null);
});
