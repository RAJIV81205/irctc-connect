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
