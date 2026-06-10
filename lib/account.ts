import type { BillingStatus, PlanStatus, SelectedPlan } from "./plans";

export const USER_STORAGE_KEY = "clarityLoopUser";
export const SESSION_STORAGE_KEY = "clarityLoopAuthSession";
export const PLAN_STORAGE_KEY = "clarityLoopPlan";

export const intendedUseOptions = [
  "Writing my first book", "Improving an existing manuscript", "Creating fiction", "Creating nonfiction",
  "Creating screen adaptations", "Publishing and marketing assets", "Agency or client work",
] as const;

export const accountTypeOptions = [
  "Author", "Coach / Consultant", "Pastor / Ministry Leader", "Publisher / Editor",
  "Screenwriter / Producer", "Agency / Studio", "Educator / Trainer",
] as const;

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  accountType: string;
  intendedUse: string;
  selectedPlan: SelectedPlan | null;
  planStatus: PlanStatus;
  billingStatus: BillingStatus;
  createdAt: string;
  lastLoginAt: string;
}

export interface BetaStoredUser extends UserAccount {
  // TEMPORARY BETA AUTH ONLY. Plain localStorage credentials are not production security.
  // Replace with production auth before public launch; Stripe must attach to real server-side user records later.
  betaPassword: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  signedInAt: string;
  rememberMe: boolean;
}

export interface PlanSelectionRecord {
  selectedPlan: SelectedPlan;
  planStatus: PlanStatus;
  billingStatus: BillingStatus;
  selectedAt: string;
}
