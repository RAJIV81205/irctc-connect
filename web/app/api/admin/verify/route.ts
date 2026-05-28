import { NextResponse } from "next/server";
import { getAdminAuthTokenFromCookies, verifyAdminAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/db";
import User from "@/lib/db/models/User";

export async function GET() {
  const token = await getAdminAuthTokenFromCookies();
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifyAdminAuthToken(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  await connectToDatabase();
  const email = payload.email?.trim().toLowerCase();
  const adminUser = email ? await User.findOne({ email }).select("apiKey").lean() : null;

  return NextResponse.json(
    { authenticated: true, user: { ...payload, apiKey: adminUser?.apiKey ?? null } },
    { status: 200 }
  );
}
