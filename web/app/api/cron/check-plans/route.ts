import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import User from "@/lib/db/models/User";

/**
 * Daily cron job to check and update user plans based on billing dates.
 * Triggered by GitHub Actions at midnight.
 * 
 * Rules:
 * - Pro/Enterprise: If 30 days passed since billing date, downgrade to free with limit 50 and usage 0
 * - Free: If 30 days passed since billing date, reset limit to 0
 * - Both cases: Update billing date to current time
 */

async function verifyCronSecret(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET not configured");
    return false;
  }

  if (!authHeader) {
    return false;
  }

  // Support "Bearer <secret>" format
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.slice(7) 
    : authHeader;

  return token === cronSecret;
}

export async function POST(req: Request) {
  try {
    // Verify cron secret
    const isAuthorized = await verifyCronSecret(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid cron secret" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get current time
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Find users with billing dates older than 30 days
    const users = await User.find({
      billingDate: { $lte: thirtyDaysAgo, $ne: null },
    });

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No users found with expired billing periods",
          updated: 0,
        },
        { status: 200 }
      );
    }

    // Process each user
    const updatePromises = users.map(async (user) => {
      if (user.plan === "pro" || user.plan === "enterprise") {
        // Downgrade pro/enterprise to free
        user.plan = "free";
        user.limit = 50;
        user.usage = 0;
        user.billingDate = now;
      } else if (user.plan === "free") {
        // Reset free plan limits
        user.limit = 0;
        user.usage = 0;
        user.billingDate = now;
      }
      return user.save();
    });

    const results = await Promise.all(updatePromises);

    return NextResponse.json(
      {
        success: true,
        message: "Plan check completed successfully",
        updated: results.length,
        details: results.map((user) => ({
          userId: user._id,
          email: user.email,
          plan: user.plan,
          limit: user.limit,
          usage: user.usage,
          billingDate: user.billingDate,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Allow GET for health checks
export async function GET(req: Request) {
  try {
    const isAuthorized = await verifyCronSecret(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cron endpoint is healthy and ready",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { success: false, message: "Service unavailable" },
      { status: 503 }
    );
  }
}
