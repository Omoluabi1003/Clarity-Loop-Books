import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workspace = readFileSync(new URL("../components/AuthorWorkspace.tsx", import.meta.url), "utf8");
const studio = readFileSync(new URL("../components/StudioDirectory.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../components/BookStudio.tsx", import.meta.url), "utf8");
const environmentExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
const packageManifest = readFileSync(new URL("../package.json", import.meta.url), "utf8");

test("primary beta calls to action remain connected to real handlers", () => {
  assert.match(workspace, /Create New Book<\/button>/);
  assert.match(workspace, /className="blank-book" onClick=\{\(\) => onCreate\(\)\}/);
  assert.match(workspace, /<CreationPathSelector onSelect=\{onCreatePath\}/);
  assert.match(studio, /onClick=\{\(\) => openModule\(item\.id\)\}/);
  assert.match(studio, /onClick=\{\(\) => setSelectedAction\(label\)\}/);
});

test("browser-local sign-up, sign-in, and sign-out stay available for beta", () => {
  assert.match(shell, /openAuth\("signup"\)/);
  assert.match(shell, /openAuth\("signin"\)/);
  assert.match(shell, /onClick=\{signOut\}/);
  assert.match(shell, /localStorage\.removeItem\(AUTH_SESSION_KEY\)/);
});

test("the no-payment beta has no Stripe dependency or key requirement", () => {
  assert.doesNotMatch(packageManifest, /stripe/i);
  assert.doesNotMatch(environmentExample, /stripe|publishable.key|secret.key/i);
});
