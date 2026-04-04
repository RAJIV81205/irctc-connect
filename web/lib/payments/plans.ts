export type PaidPlanType = "pro" | "advance";

export function isPaidPlanType(value: unknown): value is PaidPlanType {
  return value === "pro" || value === "advance";
}
