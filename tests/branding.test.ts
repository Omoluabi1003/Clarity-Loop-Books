import assert from "node:assert/strict";
import { lstatSync, readFileSync, readlinkSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root));
const readText = (path: string) => read(path).toString("utf8");

test("the public brand URL reuses the existing official logo without adding a duplicate binary", () => {
  const publicLogo = new URL("public/assets/branding/clarity-loop-logo.png", root);
  assert.equal(lstatSync(publicLogo).isSymbolicLink(), true);
  assert.equal(readlinkSync(publicLogo), "../../../CL AI Logo.png");

  const asset = read("public/assets/branding/clarity-loop-logo.png");
  assert.deepEqual([...asset.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("global metadata configures share previews and install branding from the canonical logo", () => {
  const layout = readText("app/layout.tsx");
  for (const marker of ["openGraph", "twitter", "summary_large_image", "manifest.webmanifest", "clarity-loop-logo.png"]) {
    assert.match(layout, new RegExp(marker.replace(".", "\\.")));
  }
  assert.doesNotMatch(layout, /clarity-loop-social-card|\/icons\//);

  const manifest = readText("app/manifest.ts");
  assert.match(manifest, /Clarity Loop AI Book Studio/);
  assert.match(manifest, /clarity-loop-logo\.png/);
  assert.match(manifest, /1024x1024/);
});

test("shared UI and publishing exports use the canonical logo instead of initial marks", () => {
  const componentFiles = ["BookStudio", "AuthDialog", "AuthorWorkspace", "BlueprintView", "ChapterStudio", "NewBookWizard", "StudioDirectory", "ExportCenter"];
  const combined = componentFiles.map((name) => readText(`components/${name}.tsx`)).join("\n");
  assert.match(combined, /BrandLogo/);
  assert.doesNotMatch(combined, /brand-mark|>CL<|◯━━◇/);

  const renderer = readText("lib/export-renderers.ts");
  assert.match(renderer, /clarity-loop-logo\.png/);
  assert.match(renderer, /ImageRun/);
  assert.match(renderer, /embedPng/);
});
