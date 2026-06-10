"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createBetaAccount, restoreBetaSession, selectBetaPlan, signInBetaAccount, signOutBetaAccount, type SignInInput, type SignUpInput, type UserAccount } from "@/lib/auth";
import type { SelectedPlan } from "@/lib/plans";

interface AuthContextValue {
  account: UserAccount | null;
  ready: boolean;
  signUp: (input: SignUpInput) => UserAccount;
  signIn: (input: SignInInput) => UserAccount;
  signOut: () => void;
  selectPlan: (plan: SelectedPlan) => UserAccount;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAccount(restoreBetaSession());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    account,
    ready,
    signUp(input) { const next = createBetaAccount(input); setAccount(next); return next; },
    signIn(input) { const next = signInBetaAccount(input); setAccount(next); return next; },
    signOut() { signOutBetaAccount(); setAccount(null); },
    selectPlan(plan) { const next = selectBetaPlan(plan); setAccount(next); return next; },
  }), [account, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
