import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const manifest = readFileSync(new URL("../app/manifest.ts", import.meta.url), "utf8");
const registration = readFileSync(new URL("../components/PWARegistration.tsx", import.meta.url), "utf8");
const serviceWorker = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../components/AuthorWorkspace.tsx", import.meta.url), "utf8");
const assetGenerator = readFileSync(new URL("../scripts/generate-social-assets.mjs", import.meta.url), "utf8");
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");

test("the application exposes installable PWA metadata", () => {
  assert.match(layout, /manifest: "\/manifest\.webmanifest"/);
  assert.match(manifest, /start_url: "\/"/);
  assert.match(manifest, /display: "standalone"/);
  assert.match(manifest, /purpose: "maskable"/);
});

test("brand images are served from public without binary source imports", () => {
  for (const file of ["clarity-loop-og.png", "favicon.ico", "icon.png", "apple-icon.png"]) {
    assert.equal(existsSync(new URL(`../public/${file}`, import.meta.url)), true);
  }

  assert.doesNotMatch(layout, /import .+\.(?:png|ico)/);
  assert.doesNotMatch(manifest, /import .+\.(?:png|ico)/);
  assert.match(manifest, /src: "\/icon\.png"/);
  assert.equal(existsSync(new URL("../public/offline.html", import.meta.url)), true);
});

test("npm lifecycle scripts generate public assets from text-only sources", () => {
  assert.match(packageJson, /"prebuild": "npm run assets"/);
  assert.match(packageJson, /"predev": "npm run assets"/);
  assert.match(packageJson, /"pretest": "npm run assets"/);

  for (const file of ["clarity-loop-og.png", "favicon.ico", "icon.png", "apple-icon.png"]) {
    assert.match(assetGenerator, new RegExp(`"${file.replaceAll(".", "\\.")}"`));
    assert.equal(existsSync(new URL(`../scripts/social-assets/${file}.base64`, import.meta.url)), true);
  }
});

test("social share metadata publishes absolute Open Graph and Twitter cards", () => {
  assert.match(layout, /const siteUrl = "https:\/\/clarity-loop-books\.vercel\.app"/);
  assert.match(layout, /metadataBase: new URL\(siteUrl\)/);
  assert.match(layout, /url: siteUrl/);
  assert.match(layout, /card: "summary_large_image"/);
  assert.match(layout, /width: 1200/);
  assert.match(layout, /height: 630/);
  assert.match(layout, /url: socialImageUrl/);
  assert.match(layout, /alt: "Clarity Loop AI Book Studio"/);
});

test("favicon metadata points to the required public assets", () => {
  assert.match(layout, /`\$\{siteUrl\}\/favicon\.ico`/);
  assert.match(layout, /`\$\{siteUrl\}\/icon\.png`/);
  assert.match(layout, /`\$\{siteUrl\}\/apple-icon\.png`/);
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
