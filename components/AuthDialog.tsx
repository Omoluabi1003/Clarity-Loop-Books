"use client";

import { Check, Eye, EyeOff, LockKeyhole, Mail, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { AuthUser, StoredAccount } from "@/lib/auth";
import { createLocalAccount, normalizeEmail, toAuthUser, verifyLocalPassword } from "@/lib/auth";

type AuthMode = "signin" | "signup";

type Props = {
  mode: AuthMode;
  accounts: StoredAccount[];
  onClose: () => void;
  onAuthenticated: (user: AuthUser, accounts: StoredAccount[]) => void;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthDialog({ mode, accounts, onClose, onAuthenticated, onModeChange }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.classList.add("auth-modal-open");
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.documentElement.classList.remove("auth-modal-open");
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [onClose]);

  const switchMode = (nextMode: AuthMode) => {
    setError("");
    setPassword("");
    setConfirmation("");
    onModeChange(nextMode);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) { setError("Enter your email and password to continue."); return; }

    if (isSignup) {
      if (name.trim().length < 2) { setError("Enter the name you want shown in the studio."); return; }
      if (password.length < 8) { setError("Use at least 8 characters for your password."); return; }
      if (password !== confirmation) { setError("The passwords do not match."); return; }
      if (accounts.some((account) => account.email === normalizedEmail)) { setError("An account already exists for this email. Sign in instead."); return; }
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        const account = await createLocalAccount(name, normalizedEmail, password);
        onAuthenticated(toAuthUser(account), [...accounts, account]);
        return;
      }

      const account = accounts.find((candidate) => candidate.email === normalizedEmail);
      if (!account || !(await verifyLocalPassword(account, password))) {
        setError("We could not match that email and password.");
        return;
      }
      onAuthenticated(toAuthUser(account), accounts);
    } catch {
      setError("The account could not be opened in this browser. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`auth-dialog auth-screen ${isSignup ? "signup-screen" : "signin-screen"} studio-dark-surface`} role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" aria-label="Close account dialog" onClick={onClose}><X size={18} /></button>
        <div className="auth-brand"><span className="brand-mark">CL</span><span><strong>Clarity Loop</strong><small>AI BOOK STUDIO</small></span></div>
        <div className="auth-heading">
          <span className="auth-icon"><UserRound size={20} /></span>
          <p className="eyebrow">{isSignup ? "YOUR PRIVATE STUDIO" : "WELCOME BACK"}</p>
          <h2 id="auth-title">{isSignup ? "Create your account." : "Sign in to your studio."}</h2>
          <p>{isSignup ? "Keep a recognizable studio identity on this browser and return to your writing workspace." : "Continue with the account you created on this browser."}</p>
        </div>

        <form onSubmit={submit}>
          {isSignup && <label><span>Name</span><div className="auth-input"><UserRound size={17} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></div></label>}
          <label><span>Email address</span><div className="auth-input"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>
          <label><span>Password</span><div className="auth-input"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isSignup ? "At least 8 characters" : "Your password"} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {isSignup && <label><span>Confirm password</span><div className="auth-input"><Check size={17} /><input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Repeat your password" /></div></label>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Opening your studio…" : isSignup ? "Create account" : "Sign in"}</button>
        </form>

        <p className="auth-switch">{isSignup ? "Already have an account?" : "New to Clarity Loop?"} <button type="button" onClick={() => switchMode(isSignup ? "signin" : "signup")}>{isSignup ? "Sign in" : "Create account"}</button></p>
        <p className="auth-local-note"><LockKeyhole size={14} /> Beta accounts and project data stay in this browser. Server-backed accounts are required before public launch.</p>
      </section>
    </div>
  );
}
