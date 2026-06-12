import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const authDialog = readFileSync(new URL("../components/AuthDialog.tsx", import.meta.url), "utf8");
const bookStudio = readFileSync(new URL("../components/BookStudio.tsx", import.meta.url), "utf8");
const rootLayout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

const heroDemo = readFileSync(new URL("../components/HeroBookDemo.tsx", import.meta.url), "utf8");

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

test("signed-out visitors can browse until a studio action opens the blurred auth gate", () => {
  assert.match(bookStudio, /useState<AuthMode \| null>\(null\)/);
  assert.match(bookStudio, /const requireAuthentication = \(action: \(\) => void\) =>/);
  assert.match(bookStudio, /if \(!authUser\) \{[\s\S]*?setAuthMode\(accounts\.length \? "signin" : "signup"\)/);
  assert.match(bookStudio, /const authenticationRequired = !authUser && authMode !== null/);
  assert.match(bookStudio, /dismissible=\{false\}/);
  assert.match(bookStudio, /className=\{`auth-gated-content\$\{authenticationRequired \? " is-locked" : ""\}`\}/);
  assert.match(css, /\.auth-gated-content\.is-locked\{[^}]*pointer-events:none[^}]*filter:blur\(10px\)/);
  assert.doesNotMatch(css, /\.auth-gated-content\{[^}]*transition:[^}]*filter/);
  assert.match(authDialog, /dismissible && event\.key === "Escape"/);
  assert.match(authDialog, /dismissible && event\.target === event\.currentTarget/);
});

test("the live demo advances on iOS without waiting on animation callbacks", () => {
  assert.doesNotMatch(heroDemo, /AnimatePresence|motion\.|useReducedMotion/);
  assert.match(heroDemo, /window\.setInterval\(\(\) => \{[\s\S]*?setActiveStage/);
  assert.match(heroDemo, /\}, 2600\);[\s\S]*?\}, \[\]\);/);
  assert.match(heroDemo, /className="demo-stage-content" key=\{activeStage\}/);
  assert.match(css, /\.demo-stage-content\{height:100%\}/);
  assert.match(css, /@media\(prefers-reduced-motion:no-preference\)\{[\s\S]*?\.demo-stage-content\{animation:demoStageEnter[^}]*will-change:transform/);
  assert.match(css, /@keyframes demoStageEnter\{from\{transform:translate3d\(0,12px,0\)\}to\{transform:translate3d\(0,0,0\)\}\}/);
});


test("mobile utilities use separate safe-area-aware surfaces", () => {
  assert.match(bookStudio, /<LanguageSelector compact id="mobile-language" \/>/);
  assert.match(css, /@media\(max-width:820px\)[\s\S]*?\.global-language-selector\{display:none\}/);
  assert.match(css, /\.mobile-language-selector\{display:grid/);
  assert.match(css, /\.feedback-launcher\{[^}]*bottom:calc\(16px \+ env\(safe-area-inset-bottom\)\)[^}]*width:48px/);
  assert.match(css, /@media\(max-width:430px\)[\s\S]*?\.feedback-panel\{width:calc\(100vw - 24px\)/);
});
