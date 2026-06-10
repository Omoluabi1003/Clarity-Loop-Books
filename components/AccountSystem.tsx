"use client";

import { ArrowLeft, ArrowRight, Building2, Check, ChevronDown, LockKeyhole, LogOut, Mail, Sparkles, UserRound, X } from "lucide-react";
import { useState } from "react";
import { accountTypeOptions, intendedUseOptions, type UserAccount } from "@/lib/account";
import { planById, plans, type SelectedPlan } from "@/lib/plans";
import { useAuth } from "./AuthProvider";

export type AccountScreen = "signin" | "signup" | "forgot" | "plans" | "account";

export function AuthShell({ title, eyebrow, description, onClose, children }: { title: string; eyebrow: string; description: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="account-overlay" role="dialog" aria-modal="true" aria-label={title}>
    <div className="auth-shell">
      <aside className="auth-story">
        <button className="brand brand-light" type="button" onClick={onClose}><span className="brand-mark">CL</span><span><strong>Clarity Loop</strong><small>AI BOOK STUDIO</small></span></button>
        <div><p className="eyebrow"><Sparkles size={13} /> {eyebrow}</p><h2>Your book deserves a studio built for the whole journey.</h2><p>Shape the idea, build the manuscript, and prepare publishing assets from one premium creative workspace.</p></div>
        <small>Developed by ETL GIS Consulting LLC</small>
      </aside>
      <section className="auth-panel"><button className="overlay-close" onClick={onClose} aria-label="Close"><X size={20} /></button><div className="auth-panel-copy"><h1>{title}</h1><p>{description}</p></div>{children}</section>
    </div>
  </div>;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpForm({ onComplete, onSignIn }: { onComplete: () => void; onSignIn: () => void }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", intendedUse: "", accountType: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "Enter your full name.";
    if (!emailPattern.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords must match.";
    if (!form.intendedUse) next.intendedUse = "Choose how you intend to use the studio.";
    if (!form.accountType) next.accountType = "Choose an account type.";
    setErrors(next);
    if (Object.keys(next).length) return;
    signUp({ fullName: form.fullName.trim(), email: form.email, betaPassword: form.password, intendedUse: form.intendedUse, accountType: form.accountType });
    onComplete();
  };
  return <form className="auth-form" onSubmit={submit} noValidate>
    <div className="form-field full"><label htmlFor="signup-name">Full name</label><input id="signup-name" autoComplete="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" />{errors.fullName && <span className="field-error">{errors.fullName}</span>}</div>
    <div className="form-field full"><label htmlFor="signup-email">Email address</label><input id="signup-email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />{errors.email && <span className="field-error">{errors.email}</span>}</div>
    <div className="form-field"><label htmlFor="signup-password">Password</label><input id="signup-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" />{errors.password && <span className="field-error">{errors.password}</span>}</div>
    <div className="form-field"><label htmlFor="signup-confirm">Confirm password</label><input id="signup-confirm" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat your password" />{errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}</div>
    <div className="form-field full"><label htmlFor="intended-use">Intended use</label><select id="intended-use" value={form.intendedUse} onChange={(e) => update("intendedUse", e.target.value)}><option value="">Select your primary goal</option>{intendedUseOptions.map((option) => <option key={option}>{option}</option>)}</select>{errors.intendedUse && <span className="field-error">{errors.intendedUse}</span>}</div>
    <div className="form-field full"><label htmlFor="account-type">Account type</label><select id="account-type" value={form.accountType} onChange={(e) => update("accountType", e.target.value)}><option value="">Select your role</option>{accountTypeOptions.map((option) => <option key={option}>{option}</option>)}</select>{errors.accountType && <span className="field-error">{errors.accountType}</span>}</div>
    <button className="primary-button auth-submit full" type="submit">Create account <ArrowRight size={16} /></button>
    <p className="auth-switch full">Already have an account? <button type="button" onClick={onSignIn}>Sign in</button></p>
  </form>;
}

export function SignInForm({ onComplete, onSignUp, onForgot }: { onComplete: () => void; onSignUp: () => void; onForgot: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [remember, setRemember] = useState(true); const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return setError("Enter your email address and password.");
    if (!emailPattern.test(email)) return setError("Enter a valid email address.");
    const result = signIn(email, password, remember);
    if (!result.ok) return setError(result.error || "Unable to sign in.");
    onComplete();
  };
  return <form className="auth-form sign-in-form" onSubmit={submit} noValidate>
    {error && <div className="form-alert full">{error}</div>}
    <div className="form-field full"><label htmlFor="signin-email">Email address</label><input id="signin-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
    <div className="form-field full"><label htmlFor="signin-password">Password</label><input id="signin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" /></div>
    <div className="auth-options full"><label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label><button type="button" onClick={onForgot}>Forgot password?</button></div>
    <button className="primary-button auth-submit full" type="submit">Sign in <ArrowRight size={16} /></button>
    <p className="auth-switch full">New to Clarity Loop? <button type="button" onClick={onSignUp}>Create an account</button></p>
  </form>;
}

export function ForgotPasswordPlaceholder({ onBack }: { onBack: () => void }) {
  return <div className="placeholder-panel"><span><Mail size={24} /></span><h3>Password reset is coming soon</h3><p>For this private beta, your account stays on this browser. Production password recovery will arrive with secure authentication.</p><button className="secondary-button" onClick={onBack}><ArrowLeft size={16} /> Back to sign in</button></div>;
}

export function PlanSelection({ onDone }: { onDone: () => void }) {
  const { user, selectPlan } = useAuth();
  const [message, setMessage] = useState("");
  const choose = (id: SelectedPlan) => {
    selectPlan(id);
    if (id === "free_preview") setMessage("Free Preview is active. Your studio is ready.");
    else if (id === "agency_enterprise") setMessage("Your contact interest has been saved. ETL GIS Consulting LLC contact options will be available soon.");
    else setMessage("Payment activation is coming soon. Your selected plan has been saved.");
  };
  return <div className="plan-selection">
    <div className="plan-heading"><div><p className="eyebrow"><Sparkles size={13} /> CHOOSE YOUR STUDIO</p><h1>Select the plan that fits your next chapter.</h1><p>No payment details are required. Paid plan activation will be added when Stripe is ready.</p></div>{user?.selectedPlan && <button className="secondary-button" onClick={onDone}>Go to dashboard <ArrowRight size={16} /></button>}</div>
    {message && <div className="plan-message"><Check size={18} /> <span>{message}</span></div>}
    <div className="plans-grid">{plans.map((plan) => <article className={`plan-card ${user?.selectedPlan === plan.id ? "selected" : ""}`} key={plan.id}>
      {plan.id === "author_pro" && <span className="plan-featured">PUBLICATION READY</span>}
      <div><p className="plan-name">{plan.name}</p><h2>{plan.priceLabel}</h2><p>{plan.positioning}</p></div>
      <ul>{plan.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul>
      <button className={plan.id === "free_preview" ? "primary-button" : "secondary-button"} onClick={() => choose(plan.id)}>{user?.selectedPlan === plan.id ? "Selected" : plan.cta}</button>
    </article>)}</div>
  </div>;
}

export function AccountBadge({ user }: { user: UserAccount }) {
  const label = getPlanBadgeLabel(user);
  return <span className={`account-plan-badge plan-${user.planStatus}`}>{label}</span>;
}

export function getPlanBadgeLabel(user: UserAccount) {
  if (user.selectedPlan === "creator") return "Creator Pending";
  if (user.selectedPlan === "author_pro") return "Author Pro Pending";
  if (user.selectedPlan === "studio") return "Studio Pending";
  if (user.selectedPlan === "agency_enterprise") return "Enterprise Contact";
  return "Free Preview";
}

export function UserMenu({ user, onAccount, onPlan, onSignOut }: { user: UserAccount; onAccount: () => void; onPlan: () => void; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const initials = user.fullName.split(/\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase();
  return <div className="user-menu"><button className="user-menu-trigger" onClick={() => setOpen(!open)} aria-expanded={open}><span>{initials}</span><strong>{user.fullName.split(" ")[0]}</strong><ChevronDown size={14} /></button>{open && <div className="user-menu-popover"><button onClick={() => { setOpen(false); onAccount(); }}><UserRound size={16} /> Account</button><button onClick={() => { setOpen(false); onPlan(); }}><Sparkles size={16} /> Plan</button><button onClick={() => { setOpen(false); onSignOut(); }}><LogOut size={16} /> Sign Out</button></div>}</div>;
}

export function LockedFeatureCard({ title, description, onUpgrade }: { title: string; description: string; onUpgrade: () => void }) {
  return <div className="locked-feature-card"><span><LockKeyhole size={18} /></span><div><strong>{title}</strong><p>{description}</p></div><button onClick={onUpgrade}>View plans</button></div>;
}

export function UpgradePrompt({ kind = "module", onUpgrade }: { kind?: "module" | "project"; onUpgrade: () => void }) {
  const text = kind === "project" ? "Free Preview includes 1 active project. Upgrade activation is coming soon." : "This module is part of Author Pro or Studio. Stripe activation is coming soon.";
  return <div className="upgrade-prompt"><LockKeyhole size={20} /><div><strong>{kind === "project" ? "Project limit reached" : "Premium studio preview"}</strong><p>{text}</p></div><button className="secondary-button" onClick={onUpgrade}>Explore plans</button></div>;
}

export function AccountPage({ user, onPlan }: { user: UserAccount; onPlan: () => void }) {
  const plan = planById(user.selectedPlan);
  return <div className="account-page"><div className="account-page-heading"><div><p className="eyebrow">YOUR CLARITY LOOP ACCOUNT</p><h1>Account & profile</h1><p>Review the profile attached to this beta workspace.</p></div><AccountBadge user={user} /></div><div className="account-details-grid"><section><span><UserRound size={21} /></span><h3>Profile</h3><dl><div><dt>Full name</dt><dd>{user.fullName}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Account type</dt><dd>{user.accountType}</dd></div><div><dt>Intended use</dt><dd>{user.intendedUse}</dd></div></dl></section><section><span><Building2 size={21} /></span><h3>Plan & access</h3><dl><div><dt>Selected plan</dt><dd>{plan?.name || "Not selected"}</dd></div><div><dt>Plan status</dt><dd>{user.planStatus.replaceAll("_", " ")}</dd></div><div><dt>Billing status</dt><dd>{user.billingStatus.replaceAll("_", " ")}</dd></div></dl><button className="primary-button" onClick={onPlan}>Manage plan</button></section></div></div>;
}
