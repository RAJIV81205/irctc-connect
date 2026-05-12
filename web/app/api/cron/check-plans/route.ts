import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import User from "@/lib/db/models/User";

/**
 * Daily cron job to check and update user plans based on billing dates.
 * Triggered by GitHub Actions at midnight.
 *
 * Rules:
 * - If expirationDate is set and in the future, skip 30-day billing checks
 * - If expirationDate is set and has passed, set expirationDate to null
 * - Pro/Enterprise: If 30 days passed since billing date, downgrade to free with limit 50 and usage 0
 * - Free: If 30 days passed since billing date, reset limit to 50
 * - On billing downgrade/reset: clear both expirationDate and billingDate to null
 *
 * FIXES APPLIED:
 * 1. Promise.all → Promise.allSettled: single user save failure no longer kills entire batch
 * 2. CRON_SECRET empty-string guard: "" now treated as misconfigured, not valid
 * 3. Idempotency: already-downgraded users safely skipped on retry
 * 4. Structured error logging per user failure
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

async function verifyCronSecret(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // FIX 2: Treat missing OR empty CRON_SECRET as misconfiguration.
  // Previously: !cronSecret only caught undefined/null, not "".
  // Now: .trim() ensures empty-string env var is also rejected with a clear error.
  if (!cronSecret || cronSecret.trim() === "") {
    console.error(
      "[cron] CRON_SECRET is not configured or is empty. " +
      "Set a non-empty CRON_SECRET environment variable."
    );
    return false;
  }

  if (!authHeader) {
    return false;
  }

  // Support "Bearer <secret>" or raw secret
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === cronSecret;
}

// ─── POST: main cron handler ──────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const isAuthorized = await verifyCronSecret(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid cron secret" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch users that need any kind of update:
    //   (a) expired manual expirationDate that needs clearing, OR
    //   (b) billingDate older than 30 days with no active expiration override
    const users = await User.find({
      $or: [
        // (a) manual expiry has passed → clear it
        { expirationDate: { $ne: null, $lte: now } },
        // (b) billing window elapsed and no active expiry override
        {
          billingDate: { $lte: thirtyDaysAgo, $ne: null },
          $or: [
            { expirationDate: null },
            { expirationDate: { $lte: now } },
          ],
        },
      ],
    });

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No users found requiring expiration/billing updates",
          updated: 0,
        },
        { status: 200 }
      );
    }

    // FIX 3 (idempotency) is inherent in the logic below:
    //   - After downgrade, billingDate = null → user excluded from next run's query
    //   - If a retry happens mid-batch, already-saved users are idempotently skipped
    //     because their billingDate is now null and won't match the query again.

    const updatePromises = users.map(async (user) => {
      // Snapshot booleans from DB state BEFORE any mutations
      const hasActiveExpiration =
        user.expirationDate != null &&
        new Date(user.expirationDate).getTime() > now.getTime();

      const hasExpiredExpiration =
        user.expirationDate != null &&
        new Date(user.expirationDate).getTime() <= now.getTime();

      const hasExpiredBilling =
        user.billingDate != null &&
        new Date(user.billingDate).getTime() <= thirtyDaysAgo.getTime();

      // Step 1: Clear expired manual expiry
      if (hasExpiredExpiration) {
        user.expirationDate = null;
      }

      // Step 2: Apply 30-day billing rules only when no active expiry override
      if (!hasActiveExpiration && hasExpiredBilling) {
        if (user.plan === "pro" || user.plan === "enterprise") {
          user.plan = "free";
          user.limit = 50;
          user.usage = 0;
          user.billingDate = null;
          user.expirationDate = null; // defensive clear
        } else if (user.plan === "free") {
          user.limit = 50;
          user.usage = 0;
          user.billingDate = null;
          user.expirationDate = null; // defensive clear
        }
      }

      return user.save();
    });

    // FIX 1: Promise.allSettled instead of Promise.all.
    // Old code: ONE failing user.save() threw → entire batch aborted → 500 returned,
    //   no users updated, cron reports failure even if 999/1000 were fine.
    // New code: each user processed independently; failures logged per-user;
    //   succeeded users counted separately; partial success returned as 207.
    const settled = await Promise.allSettled(updatePromises);

    const succeeded: any[] = [];
    const failed: { userId: string; reason: string }[] = [];

    settled.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        const user = result.value;
        succeeded.push({
          userId: user._id,
          email: user.email,
          plan: user.plan,
          limit: user.limit,
          usage: user.usage,
          billingDate: user.billingDate,
          expirationDate: user.expirationDate,
        });
      } else {
        // Log full error server-side; return only safe summary to caller
        const user = users[idx];
        console.error(
          `[cron] Failed to save user ${user?._id} (${user?.email}):`,
          result.reason
        );
        failed.push({
          userId: String(user?._id ?? "unknown"),
          reason:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        });
      }
    });

    // Return 207 Multi-Status when some updates failed so callers/monitors can alert
    const status = failed.length > 0 ? 207 : 200;

    return NextResponse.json(
      {
        success: failed.length === 0,
        message:
          failed.length === 0
            ? "Plan check completed successfully"
            : `Plan check completed with ${failed.length} error(s)`,
        updated: succeeded.length,
        failed: failed.length,
        details: succeeded,
        errors: failed,
      },
      { status }
    );
  } catch (error) {
    console.error("[cron] Unhandled error:", error);
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

// ─── GET: health check ────────────────────────────────────────────────────────

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
    console.error("[cron] Health check error:", error);
    return NextResponse.json(
      { success: false, message: "Service unavailable" },
      { status: 503 }
    );
  }
}