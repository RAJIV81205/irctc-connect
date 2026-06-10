import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RailKit pricing plans for developers and teams building Indian Railways apps. Compare Free, Pro and Enterprise tiers and request a higher usage limit.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "RailKit Pricing",
    description: "Compare plans and choose the right RailKit subscription.",
    url: absoluteUrl("/pricing"),
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
