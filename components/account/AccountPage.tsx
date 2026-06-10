import { CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";
import type { UserAccount } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { AccountBadge } from "./AccountBadge";

export function AccountPage({ account, onPlan }: { account: UserAccount; onPlan: () => void }) {
  const plan = getPlan(account.selectedPlan);
  return <div className="account-page">
    <div className="account-page-heading"><span><UserRound size={26} /></span><div><p className="eyebrow">ACCOUNT & PROFILE</p><h2>{account.fullName}</h2><p>Your Clarity Loop creator profile and beta plan details.</p></div></div>
    <div className="account-profile-grid">
      <section><p className="eyebrow">PROFILE</p><dl><div><dt><Mail size={15} /> Email</dt><dd>{account.email}</dd></div><div><dt><UserRound size={15} /> Account type</dt><dd>{account.accountType}</dd></div><div><dt><ShieldCheck size={15} /> Intended use</dt><dd>{account.intendedUse}</dd></div><div><dt><CalendarDays size={15} /> Member since</dt><dd>{new Date(account.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</dd></div></dl></section>
      <section className="account-plan-panel"><p className="eyebrow">CURRENT PLAN</p><AccountBadge account={account} /><h3>{plan.name}</h3><p>{plan.positioning}</p>{account.planStatus === "pending_payment" && <div className="activation-note">Payment activation coming soon.</div>}<button onClick={onPlan}>Review plans</button></section>
    </div>
  </div>;
}
