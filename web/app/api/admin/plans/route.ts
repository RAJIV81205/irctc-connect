import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import {
  DEFAULT_PLAN_CONFIG,
  getOrCreatePlanConfig,
  updatePlanConfig,
  type ManagedPlan,
  type PlanConfigShape,
} from "@/lib/plans/config";
import { getAdminAuthTokenFromCookies, verifyAdminAuthToken } from "@/lib/auth";

async function verifyRequest() {
  const token = await getAdminAuthTokenFromCookies();
  if (!token) return null;
  const payload = verifyAdminAuthToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

function sanitizePlans(value: unknown): ManagedPlan[] {
  if (!Array.isArray(value)) {
    return DEFAULT_PLAN_CONFIG.plans;
  }

  const planTypes = new Set(["free", "pro", "advance"]);
  const themes = new Set(["blue", "slate", "emerald"]);

  const sanitized = value
    .filter((plan) => {
      if (!plan || typeof plan !== "object") return false;
      const maybe = plan as Record<string, unknown>;
      return typeof maybe.id === "string" && planTypes.has(String(maybe.planType));
    })
    .map((plan) => {
      const source = plan as Record<string, unknown>;
      return {
        id: String(source.id),
        name: String(source.name || source.id),
        originalPrice:
          typeof source.originalPrice === "number" && Number.isFinite(source.originalPrice)
            ? source.originalPrice
            : null,
        price: Math.max(0, Number(source.price) || 0),
        period: String(source.period || "/month"),
        description: String(source.description || ""),
        features: Array.isArray(source.features)
          ? source.features
              .filter((feature) => feature && typeof feature === "object")
              .map((feature) => {
                const input = feature as Record<string, unknown>;
                return {
                  text: String(input.text || ""),
                  highlight: Boolean(input.highlight),
                };
              })
          : [],
        planType: source.planType as ManagedPlan["planType"],
        buttonText: String(source.buttonText || "Get Started"),
        popular: Boolean(source.popular),
        colorTheme: themes.has(String(source.colorTheme))
          ? (source.colorTheme as ManagedPlan["colorTheme"])
          : "slate",
        limit: Math.max(0, Number(source.limit) || 0),
        userPlan:
          source.userPlan === "pro" || source.userPlan === "enterprise"
            ? source.userPlan
            : null,
      } as ManagedPlan;
    });

  return sanitized.length > 0 ? sanitized : DEFAULT_PLAN_CONFIG.plans;
}

export async function GET() {
  try {
    const admin = await verifyRequest();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const config = await getOrCreatePlanConfig();
    return NextResponse.json({ success: true, config }, { status: 200 });
  } catch (error) {
    console.error("Fetch plans config error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await verifyRequest();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = (await request.json()) as Partial<PlanConfigShape>;
    const nextConfig: Partial<PlanConfigShape> = {
      key: "default",
      offerEndsAt: body.offerEndsAt || null,
      contactEmail:
        typeof body.contactEmail === "string" && body.contactEmail.trim()
          ? body.contactEmail.trim()
          : DEFAULT_PLAN_CONFIG.contactEmail,
      plans: sanitizePlans(body.plans),
    };

    const updated = await updatePlanConfig(nextConfig);
    return NextResponse.json({ success: true, config: updated }, { status: 200 });
  } catch (error) {
    console.error("Update plans config error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
