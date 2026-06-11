import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const manifest = readFileSync(new URL("../app/manifest.ts", import.meta.url), "utf8");
const registration = readFileSync(new URL("../components/PWARegistration.tsx", import.meta.url), "utf8");
const serviceWorker = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../components/AuthorWorkspace.tsx", import.meta.url), "utf8");

test("the application exposes installable PWA metadata", () => {
  assert.match(layout, /manifest: "\/manifest\.webmanifest"/);
  assert.match(manifest, /start_url: "\/"/);
  assert.match(manifest, /display: "standalone"/);
  assert.match(manifest, /purpose: "maskable"/);
});

test("the existing supplied logo is reused without adding unsupported binary assets", () => {
  assert.match(layout, /import logo from "\.\.\/CL AI Logo\.png"/);
  assert.match(manifest, /import logo from "\.\.\/CL AI Logo\.png"/);
  assert.match(manifest, /const logoUrl = logo\.src\.replaceAll/);
  assert.match(manifest, /src: logoUrl/);
  assert.equal(existsSync(new URL("../public/offline.html", import.meta.url)), true);

  const publicFiles = readdirSync(new URL("../public", import.meta.url), { recursive: true });
  assert.deepEqual(publicFiles.filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(String(file))), []);
});

test("the production shell registers a same-origin service worker", () => {
  assert.match(layout, /<PWARegistration \/>/);
  assert.match(registration, /serviceWorker\.register\("\/sw\.js"\)/);
  assert.match(serviceWorker, /self\.addEventListener\("install"/);
  assert.match(serviceWorker, /self\.addEventListener\("fetch"/);
  assert.match(serviceWorker, /\/offline\.html/);
});

test("the final call to action renders the supplied brand artwork", () => {
  assert.match(workspace, /<BrandMark priority \/>/);
  assert.doesNotMatch(workspace, /final-ornament">CL/);
});
