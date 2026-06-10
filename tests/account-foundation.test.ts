import test from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_TYPES, INTENDED_USES, validateEmail, validateSignIn, validateSignUp } from "../lib/auth";
import { checkoutSessionPlaceholder, getPlan, getPlanBadgeLabel, plans } from "../lib/plans";

test("beta account validation requires every signup field and a matching eight-character password", () => {
  const errors = validateSignUp({ fullName: "", email: "invalid", password: "short", confirmPassword: "different", intendedUse: "", accountType: "" });
  assert.deepEqual(Object.keys(errors).sort(), ["accountType", "confirmPassword", "email", "fullName", "intendedUse", "password"]);
  assert.equal(validateEmail("author@example.com"), true);
  assert.equal(validateEmail("author.example.com"), false);
  assert.deepEqual(validateSignIn({ email: "", password: "", rememberMe: true }), { email: "Enter a valid email address.", password: "Enter your password." });
  assert.equal(INTENDED_USES.length, 7);
  assert.equal(ACCOUNT_TYPES.length, 7);
});

test("pre-Stripe plan catalog has stable IDs, null Stripe prices, and expected access limits", () => {
  assert.deepEqual(plans.map((plan) => plan.id), ["free_preview", "creator", "author_pro", "studio", "agency_enterprise"]);
  assert.ok(plans.every((plan) => plan.stripePriceId === null));
  assert.equal(getPlan("free_preview").limits.activeProjects, 1);
  assert.equal(getPlan("author_pro").limits.manuscriptUpload, true);
  assert.equal(getPlan("studio").limits.screenAdaptation, true);
  assert.equal(getPlanBadgeLabel("creator", "pending_payment"), "Creator Pending");
  assert.throws(checkoutSessionPlaceholder, /Stripe checkout is not implemented/);
});
