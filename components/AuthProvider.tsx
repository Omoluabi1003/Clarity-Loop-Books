"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PLAN_STORAGE_KEY, SESSION_STORAGE_KEY, USER_STORAGE_KEY, type AuthSession, type BetaStoredUser, type PlanSelectionRecord, type UserAccount } from "@/lib/account";
import type { BillingStatus, PlanStatus, SelectedPlan } from "@/lib/plans";

type SignUpInput = Pick<BetaStoredUser, "fullName" | "email" | "accountType" | "intendedUse" | "betaPassword">;

interface AuthContextValue {
  user: UserAccount | null;
  hydrated: boolean;
  signUp: (input: SignUpInput) => UserAccount;
  signIn: (email: string, password: string, rememberMe: boolean) => { ok: boolean; error?: string };
  signOut: () => void;
  selectPlan: (plan: SelectedPlan) => UserAccount | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function publicUser(stored: BetaStoredUser): UserAccount {
  const { betaPassword: _betaPassword, ...user } = stored;
  void _betaPassword;
  return user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // TEMPORARY BETA AUTH ONLY: localStorage is used so the prototype needs no external setup.
    // This is not production security. Replace before public launch with Supabase, Clerk, Auth.js, or equivalent.
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored && session) {
          const account = JSON.parse(stored) as BetaStoredUser;
          const authSession = JSON.parse(session) as AuthSession;
          if (account.id === authSession.userId) setUser(publicUser(account));
        }
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const signUp = (input: SignUpInput) => {
    const now = new Date().toISOString();
    const stored: BetaStoredUser = {
      ...input,
      id: `user-${Date.now()}`,
      email: input.email.trim().toLowerCase(),
      selectedPlan: null,
      planStatus: "inactive",
      billingStatus: "not_configured",
      createdAt: now,
      lastLoginAt: now,
    };
    const session: AuthSession = { userId: stored.id, email: stored.email, signedInAt: now, rememberMe: true };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(stored));
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    setUser(publicUser(stored));
    return publicUser(stored);
  };

  const signIn = (email: string, password: string, rememberMe: boolean) => {
    try {
      const storedValue = localStorage.getItem(USER_STORAGE_KEY);
      if (!storedValue) return { ok: false, error: "No local beta account was found. Create an account first." };
      const stored = JSON.parse(storedValue) as BetaStoredUser;
      if (stored.email !== email.trim().toLowerCase() || stored.betaPassword !== password) return { ok: false, error: "Email or password is incorrect." };
      const now = new Date().toISOString();
      const updated = { ...stored, lastLoginAt: now };
      const session: AuthSession = { userId: stored.id, email: stored.email, signedInAt: now, rememberMe };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      setUser(publicUser(updated));
      return { ok: true };
    } catch {
      return { ok: false, error: "Your local beta account could not be read. Please create a new account." };
    }
  };

  const signOut = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
  };

  const selectPlan = (selectedPlan: SelectedPlan) => {
    const storedValue = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedValue) return null;
    const stored = JSON.parse(storedValue) as BetaStoredUser;
    let planStatus: PlanStatus = "pending_payment";
    let billingStatus: BillingStatus = "pending_stripe";
    if (selectedPlan === "free_preview") { planStatus = "free_active"; billingStatus = "active_without_payment"; }
    if (selectedPlan === "agency_enterprise") { planStatus = "enterprise_contact_requested"; billingStatus = "contact_requested"; }
    const updated: BetaStoredUser = { ...stored, selectedPlan, planStatus, billingStatus };
    const planRecord: PlanSelectionRecord = { selectedPlan, planStatus, billingStatus, selectedAt: new Date().toISOString() };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planRecord));
    const nextUser = publicUser(updated);
    setUser(nextUser);
    return nextUser;
  };

  const value = useMemo(() => ({ user, hydrated, signUp, signIn, signOut, selectPlan }), [user, hydrated]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
