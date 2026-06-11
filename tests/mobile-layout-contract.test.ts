import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const authDialog = readFileSync(new URL("../components/AuthDialog.tsx", import.meta.url), "utf8");
const rootLayout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("the application declares a device-width, safe-area-aware viewport", () => {
  assert.match(rootLayout, /width: "device-width"/);
  assert.match(rootLayout, /viewportFit: "cover"/);
});

test("account dialogs scroll inside the dynamic mobile viewport", () => {
  assert.match(css, /\.auth-overlay\{[^}]*min-height:100dvh[^}]*overflow-y:auto/);
  assert.match(css, /\.auth-dialog\{[^}]*max-height:calc\(100dvh - 48px\)/);
  assert.match(css, /@media\(max-width:820px\)[\s\S]*?\.auth-dialog\{[^}]*max-height:none/);
  assert.match(css, /env\(safe-area-inset-top\)/);
});

test("opening account dialogs prevents the page behind them from scrolling", () => {
  assert.match(authDialog, /document\.documentElement\.classList\.add\("auth-modal-open"\)/);
  assert.match(authDialog, /document\.body\.style\.overflow = "hidden"/);
  assert.match(authDialog, /document\.documentElement\.classList\.remove\("auth-modal-open"\)/);
});

test("auth fields do not summon the mobile keyboard before the user interacts", () => {
  assert.doesNotMatch(authDialog, /autoFocus/);
});
