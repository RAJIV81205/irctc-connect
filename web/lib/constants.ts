export type PaidPlanType = "pro" | "advance";

export type PricingFeature = {
  text: string;
  highlight?: boolean;
};

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  planType: PaidPlanType | "free";
  buttonText: string;
  popular?: boolean;
  colorTheme: "blue" | "slate" | "emerald";
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Tier",
    price: "₹0",
    period: "/month",
    description:
      "For developers exploring the platform and testing basic functionality.",
    planType: "free",
    buttonText: "Start for Free",
    colorTheme: "blue",
    features: [
      { text: "50 API requests per month", highlight: true },
      { text: "Basic endpoint access" },
      { text: "Email support" },
    ],
  },
  {
    id: "pro",
    name: "Pro Tier",
    price: "₹30",
    period: "/month",
    description:
      "For active developers building projects and scaling applications.",
    planType: "pro",
    buttonText: "Get Started",
    popular: true,
    colorTheme: "slate",
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
    price: "₹50",
    period: "/month",
    description:
      "For heavy users needing massive request limits and reliability.",
    planType: "advance",
    buttonText: "Go Advance",
    colorTheme: "emerald",
    features: [
      { text: "10k API requests per month", highlight: true },
      { text: "Dedicated support line" },
      { text: "Request to upgrade limit", highlight: true },
      { text: "Sponsor badge", highlight: true },
      { text: "Premium sponsor recognition" },
    ],
  },
];