import type { Metadata } from "next";
import DocsPage from "../DocsPage";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Read IRCTC Connect API documentation with endpoint references, request examples, and integration guides.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "IRCTC Connect Documentation",
    description:
      "Endpoint-by-endpoint docs for IRCTC Connect with examples and response formats.",
    url: absoluteUrl("/docs"),
    type: "article",
  },
};

export default function Page() {
  return <DocsPage />;
}
