import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Explore IRCTC Connect pricing plans for developers and teams building Indian Railways apps.",
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
