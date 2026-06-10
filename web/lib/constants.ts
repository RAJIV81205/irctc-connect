export type PaidPlanType = "pro" | "advance";

export type PlanTheme = "blue" | "slate" | "emerald";
export type PlanType = PaidPlanType | "free";

export type PricingFeature = {
  text: string;
  highlight?: boolean;
};

export type PricingPlan = {
  id: string;
  name: string;
  originalPrice?: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  planType: PlanType;
  buttonText: string;
  popular?: boolean;
  colorTheme: PlanTheme;
};

export type ManagedPlan = {
  id: string;
  name: string;
  originalPrice?: number | null;
  price: number;
  period: string;
  description: string;
  features: PricingFeature[];
  planType: PlanType;
  buttonText: string;
  popular?: boolean;
  colorTheme: PlanTheme;
  limit: number;
  userPlan?: "pro" | "enterprise" | null;
};

export type PlanConfigShape = {
  key: string;
  offerEndsAt: string | null;
  contactEmail: string;
  plans: ManagedPlan[];
};

export const PLAN_CONFIG: PlanConfigShape = {
  key: "default",
  offerEndsAt: null,
  contactEmail: "lucky81205+irctc@gmail.com",
  plans: [
    {
      id: "free",
      name: "Free Tier",
      price: 0,
      period: "/month",
      description:
        "For developers exploring the platform and testing basic functionality.",
      features: [
        { text: "50 API requests per month", highlight: true },
        { text: "100 requests / 10 min" },
        { text: "Basic endpoint access" },
        { text: "Email support" },
      ],
      planType: "free",
      buttonText: "Start for Free",
      colorTheme: "blue",
      limit: 50,
      userPlan: null,
    },
    {
      id: "pro",
      name: "Pro Tier",
      originalPrice: 79,
      price: 49,
      period: "/month",
      description:
        "For active developers building projects and scaling applications.",
      features: [
        { text: "5000 API requests per month", highlight: true },
        { text: "200 requests / 10 min" },
        { text: "SDK Access only" },
        { text: "Advanced rate limits" },
      ],
      planType: "pro",
      buttonText: "Upgrade Now",
      popular: false,
      colorTheme: "slate",
      limit: 5000,
      userPlan: "pro",
    },
    {
      id: "advance",
      name: "Advance Plan",
      originalPrice: 99,
      price: 79,
      period: "/month",
      description:
        "For heavy users needing massive request limits and reliability.",
      features: [
        { text: "10k API requests per month", highlight: true },
        { text: "600 requests / 10 min" },
        { text: "API endpoint access" },
        { text: "Sponsor badge" },
      ],
      planType: "advance",
      buttonText: "Upgrade Now",
      popular: true,
      colorTheme: "emerald",
      limit: 10000,
      userPlan: "enterprise",
    },
  ],
};

export function formatINR(value: number) {
  return `₹${Math.max(0, Number(value) || 0)}`;
}

export function isPaidPlanType(value: unknown): value is PaidPlanType {
  return value === "pro" || value === "advance";
}

export function getPublicPlanConfig() {
  return {
    offerEndsAt: PLAN_CONFIG.offerEndsAt,
    contactEmail: PLAN_CONFIG.contactEmail,
    plans: PRICING_PLANS.map((plan) => ({
      ...plan,
      features: plan.features.map((feature) => ({ ...feature })),
    })),
  };
}

export function getPaidPlanRuntime(planType: PaidPlanType) {
  const plan = PLAN_CONFIG.plans.find((item) => item.planType === planType);
  if (!plan) return null;

  return {
    amount: Math.max(0, Number(plan.price) || 0),
    limit: Math.max(0, Number(plan.limit) || 0),
    userPlan: (plan.userPlan || (planType === "advance" ? "enterprise" : "pro")) as
      | "pro"
      | "enterprise",
  };
}

export const PRICING_PLANS: PricingPlan[] = PLAN_CONFIG.plans.map((plan) => ({
  id: plan.id,
  name: plan.name,
  originalPrice:
    typeof plan.originalPrice === "number" ? formatINR(plan.originalPrice) : undefined,
  price: formatINR(plan.price),
  period: plan.period,
  description: plan.description,
  features: plan.features,
  planType: plan.planType,
  buttonText: plan.buttonText,
  popular: plan.popular,
  colorTheme: plan.colorTheme,
}));

export const TOPUP_OPTIONS = [
  { requests: 20000, price: 149, perReq: 0.007 },
  { requests: 30000, price: 209, perReq: 0.007 },
  { requests: 50000, price: 349, perReq: 0.007 },
  { requests: 100000, price: 699, perReq: 0.007 },
] as const;
