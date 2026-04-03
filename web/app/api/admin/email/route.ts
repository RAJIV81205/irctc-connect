import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import User from "@/lib/db/models/User";
import { getAdminAuthTokenFromCookies, verifyAdminAuthToken } from "@/lib/auth";
import { sendRawHtmlEmail } from "@/lib/services/email";

const REQUEST_INTERVAL_MS = 250; // 4 req/s to stay under provider 5 req/s limit
const MAX_RATE_LIMIT_RETRIES = 3;

async function verifyRequest() {
  const token = await getAdminAuthTokenFromCookies();
  if (!token) return null;
  const payload = verifyAdminAuthToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRateLimitError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const maybeError = error as { name?: string; statusCode?: number; message?: string };
  return (
    maybeError.name === "rate_limit_exceeded" ||
    maybeError.statusCode === 429 ||
    maybeError.message?.toLowerCase().includes("too many requests") === true
  );
}

async function sendEmailWithRetry(params: { to: string; subject: string; html: string }) {
  let attempt = 0;
  while (attempt <= MAX_RATE_LIMIT_RETRIES) {
    try {
      await sendRawHtmlEmail(params);
      return;
    } catch (error) {
      if (!isRateLimitError(error) || attempt === MAX_RATE_LIMIT_RETRIES) {
        throw error;
      }
      attempt += 1;
      await sleep((attempt + 1) * REQUEST_INTERVAL_MS);
    }
  }
}

type EmailRequestBody = {
  scope?: "single" | "all";
  userId?: string;
  subject?: string;
  html?: string;
};

export async function POST(req: Request) {
  try {
    const admin = await verifyRequest();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as EmailRequestBody;
    const scope = body.scope;
    const subject = body.subject?.trim();
    const html = body.html?.trim();

    if (!scope || (scope !== "single" && scope !== "all")) {
      return NextResponse.json({ success: false, message: "Invalid email scope" }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ success: false, message: "Email subject is required" }, { status: 400 });
    }

    if (!html) {
      return NextResponse.json({ success: false, message: "Email HTML is required" }, { status: 400 });
    }

    await connectToDatabase();

    if (scope === "single") {
      if (!body.userId) {
        return NextResponse.json({ success: false, message: "userId is required for single email" }, { status: 400 });
      }

      const user = await User.findById(body.userId).select("email name");
      if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }

      await sendRawHtmlEmail({
        to: user.email,
        subject,
        html,
      });

      return NextResponse.json(
        {
          success: true,
          message: `Email sent to ${user.email}`,
          sentCount: 1,
          failedCount: 0,
        },
        { status: 200 }
      );
    }

    const users = await User.find({}).select("email");
    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "No users found" }, { status: 404 });
    }

    const failedEmails: string[] = [];

    for (const [index, user] of users.entries()) {
      if (index > 0) {
        await sleep(REQUEST_INTERVAL_MS);
      }
      try {
        await sendEmailWithRetry({
          to: user.email,
          subject,
          html,
        });
      } catch (error) {
        console.error(`Failed to send admin email to ${user.email}:`, error);
        failedEmails.push(user.email);
      }
    }

    const sentCount = users.length - failedEmails.length;

    return NextResponse.json(
      {
        success: true,
        message: `Sent ${sentCount} email(s)${failedEmails.length ? `, ${failedEmails.length} failed` : ""}`,
        sentCount,
        failedCount: failedEmails.length,
        failedEmails,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin email error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
