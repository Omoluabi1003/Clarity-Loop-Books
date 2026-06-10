import { ArrowRight, Check } from "lucide-react";
import { plans } from "@/lib/plans";
export function PlanPreview({ onChoose }: { onChoose: () => void }) {
  return <section className="pricing-preview" id="plans"><div className="page-shell"><div className="pricing-preview-heading"><div><p className="eyebrow">PLANS FOR EVERY PUBLISHING STAGE</p><h2>Start free. Choose your next studio when you are ready.</h2></div><p>Payments are not active in the beta. Explore each plan and save your selection without entering card details.</p></div><div className="pricing-preview-grid">{plans.map((plan) => <article key={plan.id}><p>{plan.name}</p><strong>{plan.priceLabel}</strong><span>{plan.positioning}</span><ul>{plan.features.slice(0, 3).map((feature) => <li key={feature}><Check size={12} />{feature}</li>)}</ul></article>)}</div><button className="gold-button" onClick={onChoose}>Compare plans <ArrowRight size={15} /></button></div></section>;
}
