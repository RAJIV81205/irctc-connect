import type { Metadata } from "next";
import { getPublicPlanConfig } from "../../lib/constants";
import { buildMetadata } from "../../lib/seo";
import PricingClient from "./PricingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Pricing",
  description:
    "Compare IRCTC Connect pricing plans for Indian Railways API access, higher usage limits, and enterprise support.",
  path: "/pricing",
});

export default async function PricingPage() {
  const config = getPublicPlanConfig();

  const plans = JSON.parse(JSON.stringify(config?.plans || []));
  const offerEndsAt = config?.offerEndsAt ?? null;
  const contactEmail = config?.contactEmail || "lucky81205+irctc@gmail.com";

  return (
    <PricingClient
      initialPlans={plans}
      initialOfferEndsAt={offerEndsAt}
      initialContactEmail={contactEmail}
    />
  );
}
