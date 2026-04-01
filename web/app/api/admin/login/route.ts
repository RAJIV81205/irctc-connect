import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import { getAdminCookieName, signAdminAuthToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; name?: string };
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim() || "Admin";

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    
    if (!adminEmail || email !== adminEmail) {
      return NextResponse.json({ success: false, message: "Unauthorized: Not an admin" }, { status: 403 });
    }

    const token = signAdminAuthToken({
      email,
      name,
      role: "admin",
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin login successful",
      user: { email, name, role: "admin" },
    }, { status: 200 });

    response.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Admin Login route error:", error);
    return NextResponse.json({ success: false, message: "internal server error" }, { status: 500 });
  }
}