import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import User from "@/lib/db/models/User";
import {
  getAuthCookieName,
  getAuthTokenFromCookies,
  verifyAuthToken,
} from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();

    const token = await getAuthTokenFromCookies();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "unauthorized: missing token" },
        { status: 401 }
      );
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.userId).lean();

    if (!user || !user.active) {
      const response = NextResponse.json(
        { success: false, message: "unauthorized: invalid user" },
        { status: 401 }
      );
      response.cookies.set(getAuthCookieName(), "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json(
      {
        success: true,
        message: "token verified",
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
      { status: 200 }
    );
  } catch (error) {
    const response = NextResponse.json(
      { success: false, message: "unauthorized: invalid or expired token" },
      { status: 401 }
    );
    response.cookies.set(getAuthCookieName(), "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    console.error("Verify route error:", error);
    return response;
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    { success: true, message: "logged out successfully" },
    { status: 200 }
  );

  response.cookies.set(getAuthCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
