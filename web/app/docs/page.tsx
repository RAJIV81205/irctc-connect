import type { Metadata } from "next";
import DocsPage from "../DocsPage";
import { buildMetadata, absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Documentation",
    description:
      "Read IRCTC Connect API documentation with endpoint references, request examples, SDK integration guides, and response formats.",
    path: "/docs",
  }),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Documentation", item: absoluteUrl("/docs") },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <DocsPage />
    </>
  );
}
