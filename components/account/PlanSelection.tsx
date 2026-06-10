"use client";

import { Check, Clock3, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { plans, type SelectedPlan } from "@/lib/plans";
import { useAuth } from "./AuthProvider";

export function PlanSelection({ onComplete }: { onComplete: () => void }) {
  const { account, selectPlan } = useAuth();
  const [message, setMessage] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const choose = (id: SelectedPlan) => {
    if (id === "agency_enterprise") setContactOpen(true);
    selectPlan(id);
    setMessage(id === "free_preview" ? "Free Preview is active. Welcome to your studio." : id === "agency_enterprise" ? "Your contact interest has been saved. ETL GIS Consulting LLC contact options are coming soon." : "Payment activation is coming soon. Your selected plan has been saved.");
  };
  return <div className="plan-selection">
    <div className="plan-selection-heading"><p className="eyebrow"><Sparkles size={13} /> CHOOSE YOUR STUDIO</p><h2>Select the plan that fits your next chapter.</h2><p>No payment is collected during this beta. Paid plan choices are saved for future Stripe activation.</p></div>
    {message && <div className="plan-message" role="status"><Clock3 size={18} /><span>{message}</span><button onClick={onComplete}>Continue to dashboard</button></div>}
    <div className="plan-grid">{plans.map((plan) => <article className={`plan-card ${account?.selectedPlan === plan.id ? "selected" : ""}`} key={plan.id}>
      <div><p className="eyebrow">{plan.id === "free_preview" ? "START HERE" : plan.id === "studio" ? "CINEMATIC" : "CLARITY LOOP"}</p><h3>{plan.name}</h3><strong>{plan.priceLabel}</strong><p>{plan.positioning}</p></div>
      <ul>{plan.features.map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul>
      <button onClick={() => choose(plan.id)}>{plan.id === "agency_enterprise" && <Mail size={15} />}{plan.cta}</button>
    </article>)}</div>
    {contactOpen && <aside className="enterprise-intent"><Mail size={22} /><div><strong>Enterprise contact interest saved</strong><p>Team onboarding and direct contact activation will be connected before launch. No payment information is requested.</p></div></aside>}
  </div>;
}
