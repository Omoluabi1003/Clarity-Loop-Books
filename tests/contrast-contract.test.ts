import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const heroDemo = readFileSync(new URL("../components/HeroBookDemo.tsx", import.meta.url), "utf8");

const requiredRoles = [
  "studio-dark-heading",
  "studio-dark-subheading",
  "studio-dark-body",
  "studio-muted-on-dark",
  "studio-eyebrow",
  "studio-text-button-on-dark",
  "studio-readable-card-title",
  "studio-readable-card-body",
  "studio-contrast-panel",
  "studio-contrast-link",
  "studio-contrast-label",
];

test("dark-surface typography roles remain available", () => {
  for (const role of requiredRoles) assert.match(css, new RegExp(`\\.${role}\\b`));
});

test("the final dark-surface palette uses the approved navy, ivory, and gold colors", () => {
  const finalPalette = css.slice(css.indexOf("/* Beta contrast and accessibility contract"));
  assert.match(finalPalette, /--deep-ink:#07111f/);
  assert.match(finalPalette, /--midnight-navy:#0b162e/);
  assert.match(finalPalette, /--rich-navy:#162844/);
  assert.match(finalPalette, /--studio-dark-heading:#fbf7ef/);
  assert.match(finalPalette, /--studio-dark-heading-bright:#f6f1e7/);
  assert.match(finalPalette, /--studio-dark-body:#d9e2f1/);
  assert.match(finalPalette, /--studio-dark-muted:#cbd5e1/);
  assert.match(finalPalette, /--studio-dark-gold:#e0b968/);
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

test("approved dark-surface text colors meet WCAG AA against midnight navy surfaces", () => {
  for (const background of ["#07111f", "#0b162e", "#162844"]) {
    for (const foreground of ["#fbf7ef", "#f6f1e7", "#d9e2f1", "#cbd5e1", "#e0b968"]) {
      assert.ok(contrast(foreground, background) >= 4.5, `${foreground} must remain readable on ${background}`);
    }
  }
});

test("approved light-surface text colors meet WCAG AA on every paper surface", () => {
  for (const background of ["#fffefa", "#fbfaf6", "#f4f0e8"]) {
    for (const foreground of ["#07111f", "#344154", "#5d6673", "#636c77", "#8a5f17"]) {
      assert.ok(contrast(foreground, background) >= 4.5, `${foreground} must remain readable on ${background}`);
    }
  }
});

test("the website-wide audit scopes accessible foregrounds to all major light surfaces", () => {
  const audit = css.slice(css.lastIndexOf("/* Website-wide foreground audit"));
  for (const surface of [
    "hero-demo",
    "method-section",
    "templates-section",
    "publishing-pack-card",
    "final-cta",
    "studio-page",
    "creation-studio-main",
    "studio-live-preview",
    "feedback-panel",
    "delete-draft-modal",
    "export-modal",
  ]) assert.match(audit, new RegExp(`\\.${surface}\\b`));
  assert.match(audit, /--studio-light-muted:#5d6673/);
  assert.match(audit, /--studio-light-accent:#8a5f17/);
});


test("hero demo transitions never fade readable content below full opacity", () => {
  assert.doesNotMatch(heroDemo, /initial=\{\{[^}]*opacity:\s*0/);
  assert.doesNotMatch(heroDemo, /exit=\{\{[^}]*opacity:\s*0/);
});

test("rendered light islands and compact metadata keep explicit readable foregrounds", () => {
  const renderedAudit = css.slice(css.indexOf("/* Rendered contrast audit"));
  for (const selector of [
    "workspace-section.studio-dark-section .workspace-actions .secondary-button",
    "workspace-section.studio-dark-section .book-card",
    "templates-section .section-heading",
    "outline-chips span",
    "theme-list span",
    "empty-page>p",
    "empty-page>small",
    "context-section>small",
    "publishing-metrics small",
    "permanent-delete-option small",
    "chapter-nav button>span",
    "preview-modules article>span",
    "intelligence-card>span",
  ]) assert.match(renderedAudit, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("disabled controls remain fully opaque because their text still requires contrast", () => {
  const renderedAudit = css.slice(css.indexOf("/* Rendered contrast audit"));
  assert.match(renderedAudit, /button:disabled,\[aria-disabled="true"\]\{opacity:1;filter:none\}/);
});

test("supporting UI text has a site-wide readable size and opacity floor", () => {
  const baseline = css.slice(css.indexOf("/* Legibility baseline"));
  assert.match(baseline, /font-size:\.6875rem!important/);
  assert.match(baseline, /small\{[\s\S]*?opacity:1!important/);
});

test("every live-demo stage explicitly uses readable text colors", () => {
  const baseline = css.slice(css.indexOf("/* Legibility baseline"));
  for (const selector of [
    "demo-window-bar",
    "demo-progress button",
    "demo-idea small",
    "demo-export>small",
    "mini-pages>small",
    "manuscript-count span",
    "demo-caption p",
  ]) assert.match(baseline, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(baseline, /\.hero-demo :where\(p,small,span,strong,label,button,h3\)\{opacity:1\}/);
});

test("light surfaces isolate headings from dark ancestor foreground rules", () => {
  const isolation = css.slice(css.indexOf("/* Light-surface isolation"));
  for (const surface of [
    "hero-demo",
    "book-card",
    "template-card",
    "method-section",
    "publishing-pack-card",
    "final-cta",
    "creation-studio-main",
    "studio-form-panel",
    "book-identity-card",
    "studio-page",
    "paper-editor",
    "studio-live-preview",
    "feedback-panel",
    "delete-draft-modal",
    "export-modal",
    "success-main",
  ]) assert.match(isolation, new RegExp(`\\.${surface}\\b`));

  assert.match(isolation, /:where\(h1,h2,h3,h4,h5,h6,legend\)\{[\s\S]*?color:var\(--studio-light-heading\)!important/);
  assert.match(isolation, /text-shadow:none!important/);
  for (const darkIsland of ["book-cover", "mini-book-cover", "readiness-card", "featured-plan", "studio-plan-summary", "wizard-aside"]) {
    assert.match(isolation, new RegExp(`\\.${darkIsland}\\b`));
  }
});

test("the live demo title has a guaranteed dark foreground on its paper stage", () => {
  const isolation = css.slice(css.indexOf("/* Light-surface isolation"));
  assert.match(isolation, /\.hero-demo/);
  assert.match(isolation, /color:var\(--studio-light-heading\)!important/);
  assert.ok(contrast("#07111f", "#fffefa") >= 4.5);
});
