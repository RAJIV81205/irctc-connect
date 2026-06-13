import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "IRCTC Connect pricing plans for developers and teams building Indian Railways apps. Compare Free, Pro and Enterprise tiers and request a higher usage limit.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "IRCTC Connect Pricing",
    description: "Compare plans and choose the right IRCTC Connect subscription.",
    url: absoluteUrl("/pricing"),
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
