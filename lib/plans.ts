export type SelectedPlan = "free_preview" | "creator" | "author_pro" | "studio" | "agency_enterprise";
export type PlanStatus = "free_active" | "pending_payment" | "trial_placeholder" | "inactive" | "enterprise_contact_requested";
export type BillingStatus = "not_configured" | "pending_stripe" | "active_without_payment" | "contact_requested";

export interface PlanDefinition {
  id: SelectedPlan;
  name: string;
  priceLabel: string;
  positioning: string;
  features: string[];
  cta: string;
  stripePriceId: null;
  billingStatus: BillingStatus;
  limits: {
    activeProjects: number | null;
    fullExports: boolean;
    manuscriptUpload: boolean;
    screenAdaptation: boolean;
    coverStudio: "basic" | "full" | false;
  };
}

// Stripe-ready catalog. Real Stripe price IDs must only be attached after production
// authentication and server-side billing records exist; never expose secret keys here.
export const plans: PlanDefinition[] = [
  {
    id: "free_preview",
    name: "Free Preview",
    priceLabel: "$0",
    positioning: "Explore Clarity Loop and test the creative workflow.",
    features: ["1 active project", "Idea to outline", "Sample chapter generation", "Basic cover concept", "Basic export preview watermark placeholder"],
    cta: "Start Free",
    stripePriceId: null,
    billingStatus: "active_without_payment",
    limits: { activeProjects: 1, fullExports: false, manuscriptUpload: false, screenAdaptation: false, coverStudio: "basic" },
  },
  {
    id: "creator",
    name: "Creator",
    priceLabel: "Coming soon",
    positioning: "For authors creating full books from ideas.",
    features: ["Full book generation", "Nonfiction and fiction workflows", "PDF and DOCX export", "Designed cover placeholder", "Project dashboard", "Basic publishing pack"],
    cta: "Select Creator",
    stripePriceId: null,
    billingStatus: "pending_stripe",
    limits: { activeProjects: null, fullExports: true, manuscriptUpload: false, screenAdaptation: false, coverStudio: "basic" },
  },
  {
    id: "author_pro",
    name: "Author Pro",
    priceLabel: "Coming soon",
    positioning: "For serious authors refining manuscripts and preparing for publication.",
    features: ["Everything in Creator", "Upload manuscript analysis", "Deep repetition analysis", "Chapter rewrite tools", "Publishing readiness score", "Cover Studio", "Metadata and book description generator"],
    cta: "Select Author Pro",
    stripePriceId: null,
    billingStatus: "pending_stripe",
    limits: { activeProjects: null, fullExports: true, manuscriptUpload: true, screenAdaptation: false, coverStudio: "full" },
  },
  {
    id: "studio",
    name: "Studio",
    priceLabel: "Coming soon",
    positioning: "For creators turning books into screen-ready assets.",
    features: ["Everything in Author Pro", "Screen Adaptation Studio", "Movie or series pitch pack", "Logline generator", "Beat sheet", "Treatment", "Character and scene breakdown", "Documentary/docuseries assets"],
    cta: "Select Studio",
    stripePriceId: null,
    billingStatus: "pending_stripe",
    limits: { activeProjects: null, fullExports: true, manuscriptUpload: true, screenAdaptation: true, coverStudio: "full" },
  },
  {
    id: "agency_enterprise",
    name: "Agency / Enterprise",
    priceLabel: "Contact ETL GIS Consulting LLC",
    positioning: "For publishers, agencies, ministries, consultants, and creative teams.",
    features: ["Team workspace placeholder", "Multiple client projects", "White-label export placeholder", "Brand voice placeholder", "Priority support placeholder"],
    cta: "Contact Us",
    stripePriceId: null,
    billingStatus: "contact_requested",
    limits: { activeProjects: null, fullExports: true, manuscriptUpload: true, screenAdaptation: true, coverStudio: "full" },
  },
];

export const getPlan = (id: SelectedPlan) => plans.find((plan) => plan.id === id) ?? plans[0];

export function getPlanBadgeLabel(id: SelectedPlan, status: PlanStatus): string {
  if (id === "agency_enterprise" || status === "enterprise_contact_requested") return "Enterprise Contact";
  const plan = getPlan(id);
  return status === "pending_payment" ? `${plan.name} Pending` : plan.name;
}

// Future server-side checkout seam. Intentionally does not collect payment or create a session.
export function checkoutSessionPlaceholder(): never {
  throw new Error("Stripe checkout is not implemented. Attach checkout to a production authenticated user record later.");
}
