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

// Stripe-ready catalog. stripePriceId stays null until server-side Stripe checkout is implemented.
export const plans: PlanDefinition[] = [
  {
    id: "free_preview", name: "Free Preview", priceLabel: "$0", cta: "Start Free",
    positioning: "Explore Clarity Loop and test the creative workflow.",
    features: ["1 active project", "Idea to outline", "Sample chapter generation", "Basic cover concept", "Basic export preview watermark placeholder"],
    stripePriceId: null, billingStatus: "active_without_payment",
    limits: { activeProjects: 1, fullExports: false, manuscriptUpload: false, screenAdaptation: false, coverStudio: "basic" },
  },
  {
    id: "creator", name: "Creator", priceLabel: "Coming soon", cta: "Select Creator",
    positioning: "For authors creating full books from ideas.",
    features: ["Full book generation", "Nonfiction and fiction workflows", "PDF and DOCX export", "Designed cover placeholder", "Project dashboard", "Basic publishing pack"],
    stripePriceId: null, billingStatus: "pending_stripe",
    limits: { activeProjects: null, fullExports: true, manuscriptUpload: false, screenAdaptation: false, coverStudio: "basic" },
  },
  {
    id: "author_pro", name: "Author Pro", priceLabel: "Coming soon", cta: "Select Author Pro",
    positioning: "For serious authors refining manuscripts and preparing for publication.",
    features: ["Everything in Creator", "Upload manuscript analysis", "Deep repetition analysis", "Chapter rewrite tools", "Publishing readiness score", "Cover Studio", "Metadata and book description generator"],
    stripePriceId: null, billingStatus: "pending_stripe",
    limits: { activeProjects: null, fullExports: true, manuscriptUpload: true, screenAdaptation: false, coverStudio: "full" },
  },
  {
    id: "studio", name: "Studio", priceLabel: "Coming soon", cta: "Select Studio",
    positioning: "For creators turning books into screen-ready assets.",
    features: ["Everything in Author Pro", "Screen Adaptation Studio", "Movie or series pitch pack", "Logline generator", "Beat sheet", "Treatment", "Character and scene breakdown", "Documentary/docuseries assets"],
    stripePriceId: null, billingStatus: "pending_stripe",
    limits: { activeProjects: null, fullExports: true, manuscriptUpload: true, screenAdaptation: true, coverStudio: "full" },
  },
  {
    id: "agency_enterprise", name: "Agency / Enterprise", priceLabel: "Contact ETL GIS Consulting LLC", cta: "Contact Us",
    positioning: "For publishers, agencies, ministries, consultants, and creative teams.",
    features: ["Team workspace placeholder", "Multiple client projects", "White-label export placeholder", "Brand voice placeholder", "Priority support placeholder"],
    stripePriceId: null, billingStatus: "contact_requested",
    limits: { activeProjects: null, fullExports: true, manuscriptUpload: true, screenAdaptation: true, coverStudio: "full" },
  },
];

export const planById = (id: SelectedPlan | null | undefined) => plans.find((plan) => plan.id === id);

// Future Stripe integration boundary: replace this with a server-only checkout service.
export function checkoutSessionPlaceholder(): never {
  throw new Error("Stripe checkout is not implemented. Payment activation is coming soon.");
}
