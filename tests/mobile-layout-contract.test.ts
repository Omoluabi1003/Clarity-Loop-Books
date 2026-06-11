import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const authDialog = readFileSync(new URL("../components/AuthDialog.tsx", import.meta.url), "utf8");
const bookStudio = readFileSync(new URL("../components/BookStudio.tsx", import.meta.url), "utf8");
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

test("sign in and sign up remain available inside mobile navigation", () => {
  assert.match(bookStudio, /className="mobile-account-actions"/);
  assert.match(bookStudio, /onClick=\{\(\) => openAuth\("signin"\)\}/);
  assert.match(bookStudio, /onClick=\{\(\) => openAuth\("signup"\)\}/);
  assert.match(bookStudio, /aria-controls="primary-navigation"/);
  assert.match(css, /@media\(max-width:820px\)[\s\S]*?\.mobile-account-actions\{display:block/);
  assert.match(css, /\.header-auth-actions\{display:none!important\}/);
});

test("signed-out visitors are immediately blocked by a non-dismissible blurred auth gate", () => {
  assert.match(bookStudio, /useState<AuthMode \| null>\("signin"\)/);
  assert.match(bookStudio, /authenticationRequired = !authUser/);
  assert.match(bookStudio, /dismissible=\{false\}/);
  assert.match(bookStudio, /className=\{`auth-gated-content\$\{authenticationRequired \? " is-locked" : ""\}`\}/);
  assert.match(css, /\.auth-gated-content\.is-locked\{[^}]*pointer-events:none[^}]*filter:blur\(10px\)/);
  assert.match(authDialog, /dismissible && event\.key === "Escape"/);
  assert.match(authDialog, /dismissible && event\.target === event\.currentTarget/);
});
