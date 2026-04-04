import PlanConfig from "@/lib/db/models/PlanConfig";
import type { PaidPlanType } from "@/lib/payments/plans";

export type PlanTheme = "blue" | "slate" | "emerald";
export type PlanType = "free" | PaidPlanType;

export type ManagedFeature = {
  text: string;
  highlight?: boolean;
};

export type ManagedPlan = {
  id: string;
  name: string;
  originalPrice?: number | null;
  price: number;
  period: string;
  description: string;
  features: ManagedFeature[];
  planType: PlanType;
  buttonText: string;
  popular?: boolean;
  colorTheme: PlanTheme;
  limit?: number;
  userPlan?: "pro" | "enterprise" | null;
};

export type PlanConfigShape = {
  key: string;
  offerEndsAt: string | null;
  contactEmail: string;
  plans: ManagedPlan[];
};

const DEFAULT_PLAN_CONFIG: PlanConfigShape = {
  key: "default",
  offerEndsAt: "2026-04-10T23:59:59+05:30",
  contactEmail: "lucky81205+irctc@gmail.com",
  plans: [
    {
      id: "free",
      name: "Free Tier",
      price: 0,
      period: "/month",
      description:
        "For developers exploring the platform and testing basic functionality.",
      planType: "free",
      buttonText: "Start for Free",
      colorTheme: "blue",
      limit: 50,
      userPlan: null,
      features: [
        { text: "50 API requests per month", highlight: true },
        { text: "Basic endpoint access" },
        { text: "Email support" },
      ],
    },
    {
      id: "pro",
      name: "Pro Tier",
      originalPrice: 50,
      price: 30,
      period: "/month",
      description:
        "For active developers building projects and scaling applications.",
      planType: "pro",
      buttonText: "Get Started",
      popular: true,
      colorTheme: "slate",
      limit: 1000,
      userPlan: "pro",
      features: [
        { text: "1000 API requests per month", highlight: true },
        { text: "Priority email support" },
        { text: "Advanced rate limits" },
        { text: "Faster response priority" },
      ],
    },
    {
      id: "advance",
      name: "Advance Plan",
      originalPrice: 100,
      price: 50,
      period: "/month",
      description: "For heavy users needing massive request limits and reliability.",
      planType: "advance",
      buttonText: "Go Advance",
      colorTheme: "emerald",
      limit: 10000,
      userPlan: "enterprise",
      features: [
        { text: "5k API requests per month", highlight: true },
        { text: "API endpoint access", highlight: true },
        { text: "Request to upgrade limit", highlight: true },
        { text: "Sponsor badge", highlight: true },
      ],
    },
  ],
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toPlainConfig(doc: unknown): PlanConfigShape {
  const source = asRecord(doc);
  const offerEndsAt = source.offerEndsAt
    ? new Date(String(source.offerEndsAt)).toISOString()
    : null;
  const rawPlans = Array.isArray(source.plans) ? source.plans : [];
  return {
    key: typeof source.key === "string" ? source.key : "default",
    offerEndsAt,
    contactEmail:
      typeof source.contactEmail === "string"
        ? source.contactEmail
        : DEFAULT_PLAN_CONFIG.contactEmail,
    plans: rawPlans.map((plan) => {
      const planSource = asRecord(plan);
      const rawFeatures = Array.isArray(planSource.features) ? planSource.features : [];

      return {
        id: String(planSource.id),
        name: String(planSource.name),
        originalPrice:
          typeof planSource.originalPrice === "number" &&
          Number.isFinite(planSource.originalPrice)
            ? planSource.originalPrice
            : null,
        price: Number(planSource.price) || 0,
        period: String(planSource.period || "/month"),
        description: String(planSource.description || ""),
        features: rawFeatures.map((feature) => {
          const featureSource = asRecord(feature);
          return {
            text: String(featureSource.text || ""),
            highlight: Boolean(featureSource.highlight),
          };
        }),
        planType: planSource.planType as PlanType,
        buttonText: String(planSource.buttonText || "Get Started"),
        popular: Boolean(planSource.popular),
        colorTheme: (planSource.colorTheme || "slate") as PlanTheme,
        limit: typeof planSource.limit === "number" ? planSource.limit : 0,
        userPlan: (planSource.userPlan || null) as "pro" | "enterprise" | null,
      };
    }),
  };
}

function toDocumentPayload(config: Partial<PlanConfigShape>) {
  const offerEndsAt = config.offerEndsAt ? new Date(config.offerEndsAt) : null;
  return {
    key: "default",
    offerEndsAt,
    contactEmail: config.contactEmail || DEFAULT_PLAN_CONFIG.contactEmail,
    plans: (config.plans || DEFAULT_PLAN_CONFIG.plans).map((plan) => ({
      id: plan.id,
      name: plan.name,
      originalPrice:
        typeof plan.originalPrice === "number" && Number.isFinite(plan.originalPrice)
          ? plan.originalPrice
          : null,
      price: Number(plan.price) || 0,
      period: plan.period,
      description: plan.description,
      features: (plan.features || []).map((feature) => ({
        text: feature.text,
        highlight: Boolean(feature.highlight),
      })),
      planType: plan.planType,
      buttonText: plan.buttonText,
      popular: Boolean(plan.popular),
      colorTheme: plan.colorTheme,
      limit: typeof plan.limit === "number" ? plan.limit : 0,
      userPlan: plan.userPlan || null,
    })),
  };
}

export function formatINR(value: number) {
  return `₹${Math.max(0, Number(value) || 0)}`;
}

export function isOfferActive(offerEndsAt: string | null, now = Date.now()) {
  if (!offerEndsAt) return false;
  const deadline = new Date(offerEndsAt).getTime();
  return Number.isFinite(deadline) && deadline > now;
}

export async function getOrCreatePlanConfig() {
  let doc = await PlanConfig.findOne({ key: "default" });

  if (!doc) {
    doc = await PlanConfig.create(toDocumentPayload(DEFAULT_PLAN_CONFIG));
  }

  return toPlainConfig(doc.toObject());
}

export async function updatePlanConfig(config: Partial<PlanConfigShape>) {
  const payload = toDocumentPayload(config);
  const doc = await PlanConfig.findOneAndUpdate(
    { key: "default" },
    { $set: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return toPlainConfig(doc.toObject());
}

export async function getPublicPlanConfig() {
  const config = await getOrCreatePlanConfig();
  return {
    offerEndsAt: config.offerEndsAt,
    contactEmail: config.contactEmail,
    plans: config.plans.map((plan) => ({
      ...plan,
      originalPrice:
        typeof plan.originalPrice === "number" ? formatINR(plan.originalPrice) : undefined,
      price: formatINR(plan.price),
    })),
  };
}

export async function getPaidPlanRuntime(planType: PaidPlanType) {
  const config = await getOrCreatePlanConfig();
  const plan = config.plans.find((item) => item.planType === planType);
  if (!plan) return null;

  const offerActive = isOfferActive(config.offerEndsAt);
  const amount =
    offerActive || typeof plan.originalPrice !== "number"
      ? plan.price
      : plan.originalPrice;

  return {
    amount: Math.max(0, Number(amount) || 0),
    limit: Math.max(0, Number(plan.limit) || 0),
    userPlan: (plan.userPlan || (planType === "advance" ? "enterprise" : "pro")) as
      | "pro"
      | "enterprise",
  };
}

export { DEFAULT_PLAN_CONFIG };
