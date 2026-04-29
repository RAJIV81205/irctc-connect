import type { Metadata } from "next";
import DocsPage from "../DocsPage";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Documentation",
    description:
      "Read IRCTC Connect API documentation with endpoint references, request examples, SDK integration guides, and response formats.",
    path: "/docs",
  }),
};

export default function Page() {
  return <DocsPage />;
}
