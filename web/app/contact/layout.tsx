import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the IRCTC Connect team for any questions or support.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "IRCTC Connect Contact",
    description: "Get in touch with the IRCTC Connect team for any questions or support.",
    url: absoluteUrl("/contact"),
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
