import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import User from "@/lib/db/models/User";
import { getAuthCookieName, signAuthToken } from "@/lib/auth";

function createApiKey() {
  return `irctc_${crypto.randomBytes(24).toString("hex")}`;
}

function fallbackNameFromEmail(email: string) {
  const localPart = email.split("@")[0] || "user";
  return localPart.replace(/[._-]+/g, " ").trim() || "user";
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = (await req.json()) as {
      email?: string;
      name?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "invalid email format" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email });
    let authAction: "login" | "register" = "login";
    let statusCode = 200;

    if (!user) {
      user = await User.create({
        name: name || fallbackNameFromEmail(email),
        email,
        apiKey: createApiKey(),
        plan: "free",
        active: true,
      });
      authAction = "register";
      statusCode = 201;
    }

    if (!user.active) {
      return NextResponse.json(
        { success: false, message: "user account is inactive" },
        { status: 403 }
      );
    }

    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      plan: user.plan,
    });

    const response = NextResponse.json(
      {
        success: true,
        message:
          authAction === "register"
            ? "registration successful"
            : "login successful",
        action: authAction,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          apiKey: user.apiKey,
          usage: user.usage,
          limit: user.limit,
          active: user.active,
          plan: user.plan,
          billingDate: user.billingDate,
        },
      },
      { status: statusCode }
    );

    response.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, message: "internal server error" },
      { status: 500 }
    );
  }
}
