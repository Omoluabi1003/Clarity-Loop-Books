import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

const requiredRoles = [
  "studio-dark-heading",
  "studio-dark-subheading",
  "studio-dark-body",
  "studio-muted-on-dark",
  "studio-eyebrow",
  "studio-text-button-on-dark",
  "studio-readable-card-title",
  "studio-readable-card-body",
];

test("dark-surface typography roles remain available", () => {
  for (const role of requiredRoles) assert.match(css, new RegExp(`\\.${role}\\b`));
});

test("dark-surface typography uses approved palette colors", () => {
  assert.match(css, /--studio-dark-heading:#f6f1e7/);
  assert.match(css, /--studio-dark-heading-bright:#fbf7ef/);
  assert.match(css, /--studio-dark-body:#d9e2f1/);
  assert.match(css, /--studio-dark-muted:#cbd5e1/);
  assert.match(css, /--studio-dark-gold:#e0b968/);
});

test("auth, plan, account, locked, upgrade, and empty-state hooks share the contrast contract", () => {
  for (const hook of ["auth-screen", "signup-screen", "signin-screen", "plan-selection-screen", "account-page-placeholder", "locked-feature-card", "upgrade-prompt", "studio-empty-state"]) {
    assert.match(css, new RegExp(`\\.${hook}\\b`));
  }
});

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * channel(value >> 16) + 0.7152 * channel((value >> 8) & 255) + 0.0722 * channel(value & 255);
}

function contrast(foreground: string, background: string) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

test("approved dark-surface text colors meet WCAG AA against studio navies", () => {
  for (const background of ["#07111f", "#0b162e", "#101d35", "#162844"]) {
    for (const foreground of ["#f6f1e7", "#fbf7ef", "#d9e2f1", "#cbd5e1", "#e0b968"]) {
      assert.ok(contrast(foreground, background) >= 4.5, `${foreground} must remain readable on ${background}`);
    }
  }
});
