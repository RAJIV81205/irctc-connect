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
        { text: "SDK Access only" },
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
    userPlan: (plan.userPlan ||
      (planType === "advance" ? "enterprise" : "pro")) as "pro" | "enterprise",
  };
}

export const PRICING_PLANS: PricingPlan[] = PLAN_CONFIG.plans.map((plan) => ({
  id: plan.id,
  name: plan.name,
  originalPrice:
    typeof plan.originalPrice === "number"
      ? formatINR(plan.originalPrice)
      : undefined,
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




export type LegalSection = {
  heading: string;
  content?: string;
  items?: string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export const TERMS_AND_CONDITIONS: LegalDocument = {
  "title": "Terms and Conditions",
  "lastUpdated": "2026-06-18",
  "sections": [
    {
        "heading": "Acceptance of Terms",
        "items": [
        "By accessing or using IRCTC Connect, you agree to be bound by these Terms.",
        "If you do not agree, you must stop using the Service.",
        "Continued use after updates indicates acceptance of the revised Terms.",
      ]
      },
    {
        "heading": "Service Description",
        "items": [
        "IRCTC Connect provides APIs and developer tools that aggregate and process railway-related information.",
        "Access to the service does not grant ownership of any data, software, infrastructure, documentation, or intellectual property.",
      ]
      },
    {
        "heading": "API License",
        "items": [
        "IRCTC Connect grants a limited, non-exclusive, non-transferable, revocable license to access and use the API.",
        "The license is governed by your active subscription plan and these Terms.",
        "All rights not expressly granted are reserved by IRCTC Connect.",
      ]
      },
    {
      "heading": "API Key Security",
      "items": [
        "API keys are issued to a single account and must remain confidential.",
        "API keys may not be shared, transferred, sold, leased, sublicensed, or provided to any third party.",
        "Users are responsible for all activity performed using their API keys.",
        "Users must immediately notify IRCTC Connect if they suspect unauthorized access."
      ]
    },
    {
      "heading": "Prohibited Uses",
      "items": [
        "Reselling API access or API responses.",
        "Redistributing API data to third parties.",
        "Creating a competing railway API service.",
        "Providing API responses as a standalone product.",
        "Sharing API keys with clients, partners, or other organizations.",
        "Creating multiple accounts to bypass limits.",
        "Circumventing quotas, authentication systems, or rate limits.",
        "Reverse engineering platform functionality.",
        "Using the service for unlawful purposes."
      ]
    },
    {
      "heading": "Data Storage Restrictions",
      "items": [
        "Users may not copy, export, scrape, mirror, archive, or permanently store substantial portions of IRCTC Connect data.",
        "Users may not build independent databases using IRCTC Connect data.",
        "Users may not create historical datasets, analytics warehouses, or commercial repositories derived primarily from IRCTC Connect data.",
        "Temporary caching for application functionality is permitted when necessary.",
        "Stored data may not be redistributed, resold, or exposed through another service."
      ]
    },
    {
        "heading": "Commercial Usage",
        "items": [
        "Commercial use is permitted only under an active subscription.",
        "All restrictions in these Terms apply to both free and paid usage.",
        "Misuse may result in suspension, termination, or legal action.",
      ]
      },
    {
        "heading": "Rate Limits and Fair Usage",
        "items": [
        "All plans are subject to rate limits, quotas, and fair usage policies.",
        "Limits may be enforced per API key, per account, or per IP range.",
        "Excessive usage may result in throttling, suspension, or termination.",
      ]
      },
    {
      "heading": "Security and Suspicious Activity",
      "items": [
        "IRCTC Connect may monitor API activity to maintain platform security.",
        "Any suspicious, abusive, fraudulent, or unauthorized activity may result in immediate suspension or termination.",
        "Suspicious activity includes unusual request patterns, credential sharing, scraping, quota abuse, automated account creation, resale attempts, and security violations.",
        "Users may be asked to provide additional verification during investigations.",
        "IRCTC Connect reserves the sole right to determine whether activity is suspicious or abusive."
      ]
    },
    {
      "heading": "Account Suspension and Termination",
      "items": [
        "Accounts may be suspended or terminated without prior notice.",
        "Termination may occur due to key sharing, resale, abuse, data extraction, suspicious activity, or violations of these Terms.",
        "All licenses granted under these Terms immediately cease upon termination.",
        "Associated API keys, IP addresses, applications, and organizations may also be blocked."
      ]
    },
    {
      "heading": "Payments and Refunds",
      "items": [
        "All payments are final.",
        "Subscriptions are non-refundable.",
        "Unused API requests or credits are non-refundable.",
        "No refunds will be issued for account suspensions resulting from policy violations.",
        "Chargebacks or fraudulent payment disputes may result in immediate account termination.",
        "Users are responsible for evaluating the service before purchase."
      ]
    },
    {
        "heading": "Service Availability",
        "items": [
        "IRCTC Connect does not guarantee uninterrupted availability.",
        "Maintenance, outages, upgrades, or third-party failures may affect service.",
        "Service-level commitments, if any, are described separately in your plan.",
      ]
      },
    {
        "heading": "Intellectual Property",
        "items": [
        "All software, branding, APIs, and documentation are owned by IRCTC Connect.",
        "Infrastructure, logos, designs, and platform components are also included.",
        "No transfer of ownership is implied by use of the Service.",
      ]
      },
    {
        "heading": "Disclaimer",
        "items": [
        "The service is provided on an 'as-is' and 'as-available' basis.",
        "IRCTC Connect disclaims all warranties, express or implied.",
        "We do not guarantee accuracy, completeness, or availability of any information.",
      ]
      },
    {
        "heading": "Limitation of Liability",
        "items": [
        "IRCTC Connect is not liable for direct or indirect damages.",
        "This includes incidental, consequential, special, or punitive damages.",
        "This limitation applies to the maximum extent permitted by law.",
      ]
      },
    {
        "heading": "Changes to Terms",
        "items": [
        "IRCTC Connect may modify these Terms at any time.",
        "Updates will be reflected by revising the 'lastUpdated' value.",
        "Continued use of the service constitutes acceptance of the updated Terms.",
      ]
      },
    {
        "heading": "Governing Law",
        "items": [
        "These Terms are governed by the laws of India.",
        "Any disputes will be resolved in the competent courts of India.",
        "Mandatory consumer protection laws of your jurisdiction still apply where required.",
      ]
      }
  ]
}


export const PRIVACY_POLICY: LegalDocument = {
  "title": "Privacy Policy",
  "lastUpdated": "2026-06-18",
  "sections": [
    {
        "heading": "Introduction",
        "items": [
        "This Privacy Policy describes how IRCTC Connect handles your information.",
        "It applies to our website, APIs, dashboard, and Node.js SDK.",
        "By using the Service, you agree to the practices described here.",
      ]
      },
    {
      "heading": "Information We Collect",
      "items": [
        "Name and email address.",
        "Account information.",
        "API usage statistics.",
        "IP addresses and device information.",
        "Browser and operating system details.",
        "Payment transaction metadata."
      ]
    },
    {
        "heading": "Usage Logs",
        "items": [
        "IRCTC Connect records API requests, response metrics, and timestamps.",
        "We log IP addresses and other operational metadata for security and reliability.",
        "Logs are used to detect abuse, debug issues, and improve the Service.",
      ]
      },
    {
      "heading": "How We Use Information",
      "items": [
        "Provide and maintain services.",
        "Authenticate users.",
        "Monitor API usage.",
        "Enforce rate limits.",
        "Prevent abuse and fraud.",
        "Process payments.",
        "Communicate service updates."
      ]
    },
    {
        "heading": "Security Monitoring",
        "items": [
        "We analyze account activity, request patterns, and IP addresses.",
        "Usage behavior is reviewed to detect suspicious activity and enforce platform security.",
        "Monitoring helps protect both users and the platform from abuse.",
      ]
      },
    {
        "heading": "Data Sharing",
        "items": [
        "We do not sell personal information.",
        "Data may be shared with payment processors.",
        "We may also share data with legal authorities when required by law.",
      ]
      },
    {
        "heading": "Data Retention",
        "items": [
        "Information may be retained as long as necessary for operational purposes.",
        "We retain data for security, legal, and business needs.",
        "You may request deletion of your account data, subject to legal obligations.",
      ]
      },
    {
        "heading": "Cookies",
        "items": [
        "Cookies and similar technologies may be used to improve user experience.",
        "They help the website function correctly and remember preferences.",
        "You can control cookies through your browser settings.",
      ]
      },
    {
        "heading": "Data Security",
        "items": [
        "Reasonable security measures are implemented to protect stored information.",
        "Encryption, access controls, and monitoring are part of our security stack.",
        "No system can guarantee absolute security.",
      ]
      },
    {
        "heading": "Third-Party Services",
        "items": [
        "IRCTC Connect may integrate with third-party services.",
        "Each provider follows its own privacy practices.",
        "We are not responsible for the privacy practices of external providers.",
      ]
      },
    {
        "heading": "Policy Updates",
        "items": [
        "This Privacy Policy may be updated periodically.",
        "Updates will be reflected by revising the 'lastUpdated' value.",
        "Continued use of the service constitutes acceptance of any updates.",
      ]
      }
  ]
}
