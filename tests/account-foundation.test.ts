import assert from "node:assert/strict";
import test from "node:test";
import { PLAN_STORAGE_KEY, SESSION_STORAGE_KEY, USER_STORAGE_KEY, accountTypeOptions, intendedUseOptions } from "../lib/account";
import { checkoutSessionPlaceholder, plans } from "../lib/plans";

test("pre-Stripe plan catalog includes all account tiers with disabled Stripe ids", () => {
  assert.deepEqual(plans.map((plan) => plan.id), ["free_preview", "creator", "author_pro", "studio", "agency_enterprise"]);
  assert.ok(plans.every((plan) => plan.stripePriceId === null));
  assert.equal(plans.find((plan) => plan.id === "free_preview")?.limits.activeProjects, 1);
  assert.equal(plans.find((plan) => plan.id === "author_pro")?.limits.manuscriptUpload, true);
  assert.equal(plans.find((plan) => plan.id === "studio")?.limits.screenAdaptation, true);
});

test("beta account storage keys and required profile choices are stable", () => {
  assert.equal(USER_STORAGE_KEY, "clarityLoopUser");
  assert.equal(SESSION_STORAGE_KEY, "clarityLoopAuthSession");
  assert.equal(PLAN_STORAGE_KEY, "clarityLoopPlan");
  assert.equal(intendedUseOptions.length, 7);
  assert.equal(accountTypeOptions.length, 7);
});

test("checkout placeholder cannot process a payment", () => {
  assert.throws(() => checkoutSessionPlaceholder(), /not implemented/i);
});
