export type PaidPlanType = "pro" | "advance";

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
  planType: PaidPlanType | "free";
  buttonText: string;
  popular?: boolean;
  colorTheme: "blue" | "slate" | "emerald";
};


export const TOPUP_OPTIONS = [
  { requests: 5000,  price: 50, perReq: 0.010 },
  { requests: 10000, price: 90,  perReq: 0.009 },
  { requests: 25000, price: 200,  perReq: 0.008 },
  { requests: 50000, price: 375,  perReq: 0.075 },
] as const;