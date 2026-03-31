export type PaidPlanType = "pro" | "advance";

export type PaidPlanConfig = {
  amount: number;
  limit: number;
  userPlan: "pro" | "enterprise";
};

export const PAID_PLANS: Record<PaidPlanType, PaidPlanConfig> = {
  pro: {
    amount: 30,
    limit: 1000,
    userPlan: "pro",
  },
  advance: {
    amount: 50,
    limit: 10000,
    userPlan: "enterprise",
  },
};

export function isPaidPlanType(value: unknown): value is PaidPlanType {
  return value === "pro" || value === "advance";
}
