import { NextResponse } from "next/server";
import { getAdminAuthTokenFromCookies, verifyAdminAuthToken } from "@/lib/auth";

export async function GET() {
  const token = await getAdminAuthTokenFromCookies();
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifyAdminAuthToken(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user: payload }, { status: 200 });
}
