"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { validateSignIn, type SignInInput, type UserAccount } from "@/lib/auth";
import { useAuth } from "./AuthProvider";

export function SignInForm({ onSuccess, onSignUp, onForgot }: { onSuccess: (account: UserAccount) => void; onSignUp: () => void; onForgot: () => void; }) {
  const { signIn } = useAuth();
  const [form, setForm] = useState<SignInInput>({ email: "", password: "", rememberMe: true });
  const [errors, setErrors] = useState<Partial<Record<"email" | "password", string>>>({});
  const [formError, setFormError] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateSignIn(form);
    setErrors(nextErrors); setFormError("");
    if (Object.keys(nextErrors).length) return;
    try { onSuccess(signIn(form)); } catch (error) { setFormError(error instanceof Error ? error.message : "Sign in failed."); }
  };
  return <form className="auth-form auth-form-compact" onSubmit={submit} noValidate>
    <div className="auth-form-heading"><p className="eyebrow">WELCOME BACK</p><h2>Return to your studio.</h2><p>Sign in to continue your books, plans, and publishing workflow.</p></div>
    {formError && <div className="form-alert" role="alert">{formError}</div>}
    <label className="auth-field"><span>Email address</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" placeholder="you@example.com" />{errors.email && <small>{errors.email}</small>}</label>
    <label className="auth-field"><span>Password</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" placeholder="Your password" />{errors.password && <small>{errors.password}</small>}</label>
    <div className="auth-form-options"><label><input type="checkbox" checked={form.rememberMe} onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })} /> Remember me</label><button type="button" onClick={onForgot}>Forgot password?</button></div>
    <button className="auth-submit" type="submit">Sign in <ArrowRight size={17} /></button>
    <p className="auth-switch">New to Clarity Loop? <button type="button" onClick={onSignUp}>Create an account</button></p>
  </form>;
}
