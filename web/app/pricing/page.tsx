import { connectToDatabase } from "../../lib/db/db";
import { getPublicPlanConfig } from "../../lib/plans/config";
import PricingClient from "./PricingClient";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  await connectToDatabase();
  const config = await getPublicPlanConfig();

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