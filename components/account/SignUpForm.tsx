"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ACCOUNT_TYPES, INTENDED_USES, validateSignUp, type SignUpInput, type UserAccount } from "@/lib/auth";
import { useAuth } from "./AuthProvider";

const emptyForm: SignUpInput = { fullName: "", email: "", password: "", confirmPassword: "", intendedUse: "", accountType: "" };

export function SignUpForm({ onSuccess, onSignIn }: { onSuccess: (account: UserAccount) => void; onSignIn: () => void; }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpInput, string>>>({});
  const [formError, setFormError] = useState("");
  const update = (field: keyof SignUpInput, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateSignUp(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;
    try { onSuccess(signUp(form)); } catch (error) { setFormError(error instanceof Error ? error.message : "Account could not be created."); }
  };

  return <form className="auth-form" onSubmit={submit} noValidate>
    <div className="auth-form-heading"><p className="eyebrow">CREATE YOUR ACCOUNT</p><h2>Begin your publishing workspace.</h2><p>Set up your creator profile, then choose the plan you want to activate.</p></div>
    {formError && <div className="form-alert" role="alert">{formError}</div>}
    <div className="auth-field-grid">
      <label className="auth-field field-wide"><span>Full name</span><input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} autoComplete="name" placeholder="Your full name" />{errors.fullName && <small>{errors.fullName}</small>}</label>
      <label className="auth-field field-wide"><span>Email address</span><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" placeholder="you@example.com" />{errors.email && <small>{errors.email}</small>}</label>
      <label className="auth-field"><span>Password</span><input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} autoComplete="new-password" placeholder="8 characters minimum" />{errors.password && <small>{errors.password}</small>}</label>
      <label className="auth-field"><span>Confirm password</span><input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} autoComplete="new-password" placeholder="Repeat your password" />{errors.confirmPassword && <small>{errors.confirmPassword}</small>}</label>
      <label className="auth-field field-wide"><span>Intended use</span><select value={form.intendedUse} onChange={(e) => update("intendedUse", e.target.value)}><option value="">Choose your primary goal</option>{INTENDED_USES.map((item) => <option key={item}>{item}</option>)}</select>{errors.intendedUse && <small>{errors.intendedUse}</small>}</label>
      <label className="auth-field field-wide"><span>Account type</span><select value={form.accountType} onChange={(e) => update("accountType", e.target.value)}><option value="">Choose your account type</option>{ACCOUNT_TYPES.map((item) => <option key={item}>{item}</option>)}</select>{errors.accountType && <small>{errors.accountType}</small>}</label>
    </div>
    <button className="auth-submit" type="submit">Create account <ArrowRight size={17} /></button>
    <p className="auth-switch">Already have an account? <button type="button" onClick={onSignIn}>Sign in</button></p>
  </form>;
}
