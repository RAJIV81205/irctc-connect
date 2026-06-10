import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the RailKit team for any questions or support.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "RailKit Contact",
    description:
    "Contact the RailKit team for API support, enterprise onboarding, billing, or technical help with the Indian Railways SDK.",
    url: absoluteUrl("/contact"),
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
