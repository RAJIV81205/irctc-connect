import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import { getPublicPlanConfig } from "@/lib/plans/config";

export async function GET() {
  try {
    await connectToDatabase();
    const config = await getPublicPlanConfig();

    return NextResponse.json(
      {
        success: true,
        offerEndsAt: config.offerEndsAt,
        contactEmail: config.contactEmail,
        plans: config.plans,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Public plans fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
