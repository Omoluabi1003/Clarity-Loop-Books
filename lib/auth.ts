import type { BillingStatus, PlanStatus, SelectedPlan } from "./plans";

export const USER_STORAGE_KEY = "clarityLoopUser";
export const SESSION_STORAGE_KEY = "clarityLoopAuthSession";
export const PLAN_STORAGE_KEY = "clarityLoopPlan";

export const INTENDED_USES = [
  "Writing my first book",
  "Improving an existing manuscript",
  "Creating fiction",
  "Creating nonfiction",
  "Creating screen adaptations",
  "Publishing and marketing assets",
  "Agency or client work",
] as const;

export const ACCOUNT_TYPES = [
  "Author",
  "Coach / Consultant",
  "Pastor / Ministry Leader",
  "Publisher / Editor",
  "Screenwriter / Producer",
  "Agency / Studio",
  "Educator / Trainer",
] as const;

export type IntendedUse = typeof INTENDED_USES[number];
export type AccountType = typeof ACCOUNT_TYPES[number];

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  accountType: AccountType;
  intendedUse: IntendedUse;
  selectedPlan: SelectedPlan;
  planStatus: PlanStatus;
  billingStatus: BillingStatus;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  authenticatedAt: string;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  intendedUse: IntendedUse | "";
  accountType: AccountType | "";
}

export interface SignInInput { email: string; password: string; rememberMe: boolean; }

interface BetaStoredUser {
  account: UserAccount;
  betaPassword: string;
}

// TEMPORARY BETA AUTH ONLY. localStorage credentials are not production security.
// Replace this entire adapter with Supabase, Clerk, Auth.js, or another production
// authentication service before public launch. Stripe must later attach to real,
// server-validated authenticated user records rather than this browser-only profile.
function readStoredUser(): BetaStoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as BetaStoredUser; } catch { return null; }
}

function writeStoredUser(stored: BetaStoredUser): void {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(stored));
  window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({
    selectedPlan: stored.account.selectedPlan,
    planStatus: stored.account.planStatus,
    billingStatus: stored.account.billingStatus,
  }));
}

function writeSession(account: UserAccount): AuthSession {
  const session = { userId: account.id, email: account.email, authenticatedAt: new Date().toISOString() };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function validateEmail(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()); }

export function validateSignUp(input: SignUpInput): Partial<Record<keyof SignUpInput, string>> {
  const errors: Partial<Record<keyof SignUpInput, string>> = {};
  if (!input.fullName.trim()) errors.fullName = "Enter your full name.";
  if (!validateEmail(input.email)) errors.email = "Enter a valid email address.";
  if (input.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (input.confirmPassword !== input.password) errors.confirmPassword = "Passwords do not match.";
  if (!input.intendedUse) errors.intendedUse = "Choose how you intend to use Clarity Loop.";
  if (!input.accountType) errors.accountType = "Choose an account type.";
  return errors;
}

export function validateSignIn(input: SignInInput): Partial<Record<"email" | "password", string>> {
  const errors: Partial<Record<"email" | "password", string>> = {};
  if (!validateEmail(input.email)) errors.email = "Enter a valid email address.";
  if (!input.password) errors.password = "Enter your password.";
  return errors;
}

export function createBetaAccount(input: SignUpInput): UserAccount {
  const existing = readStoredUser();
  if (existing) throw new Error(existing.account.email.toLowerCase() === input.email.trim().toLowerCase() ? "An account with this email already exists. Sign in instead." : "This beta browser already has an account. Sign in or clear the local beta profile first.");
  const now = new Date().toISOString();
  const account: UserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    accountType: input.accountType as AccountType,
    intendedUse: input.intendedUse as IntendedUse,
    selectedPlan: "free_preview",
    planStatus: "inactive",
    billingStatus: "not_configured",
    createdAt: now,
    lastLoginAt: now,
  };
  writeStoredUser({ account, betaPassword: input.password });
  writeSession(account);
  return account;
}

export function signInBetaAccount(input: SignInInput): UserAccount {
  const stored = readStoredUser();
  if (!stored || stored.account.email.toLowerCase() !== input.email.trim().toLowerCase() || stored.betaPassword !== input.password) {
    throw new Error("Email or password does not match the account saved in this browser.");
  }
  const account = { ...stored.account, lastLoginAt: new Date().toISOString() };
  writeStoredUser({ ...stored, account });
  writeSession(account);
  return account;
}

export function restoreBetaSession(): UserAccount | null {
  if (typeof window === "undefined" || !window.localStorage.getItem(SESSION_STORAGE_KEY)) return null;
  return readStoredUser()?.account ?? null;
}

export function signOutBetaAccount(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function selectBetaPlan(selectedPlan: SelectedPlan): UserAccount {
  const stored = readStoredUser();
  if (!stored) throw new Error("Sign in before selecting a plan.");
  const isFree = selectedPlan === "free_preview";
  const isEnterprise = selectedPlan === "agency_enterprise";
  const account: UserAccount = {
    ...stored.account,
    selectedPlan,
    planStatus: isFree ? "free_active" : isEnterprise ? "enterprise_contact_requested" : "pending_payment",
    billingStatus: isFree ? "active_without_payment" : isEnterprise ? "contact_requested" : "pending_stripe",
  };
  writeStoredUser({ ...stored, account });
  return account;
}
