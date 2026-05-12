import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import User from "@/lib/db/models/User";
import { getAdminAuthTokenFromCookies, verifyAdminAuthToken } from "@/lib/auth";

async function verifyRequest() {
  const token = await getAdminAuthTokenFromCookies();
  if (!token) return null;
  const payload = verifyAdminAuthToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function GET() {
  try {
    const admin = await verifyRequest();
    if (!admin)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    await connectToDatabase();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await verifyRequest();
    if (!admin)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    await connectToDatabase();
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const { _id, ...rawUpdates } = body as Record<string, unknown>;

    if (!_id)
      return NextResponse.json(
        { success: false, message: "User ID missing" },
        { status: 400 },
      );


    const updates: Record<string, unknown> = {};
    const allowedFields = [
      "plan",
      "active",
      "usage",
      "limit",
      "billingDate",
      "expirationDate",
    ] as const;

    for (const field of allowedFields) {
      if (field in rawUpdates) updates[field] = rawUpdates[field];
    }

    const normalizeNullableDate = (value: unknown) => {
      if (value === null || value === "") return null;
      if (typeof value !== "string") return undefined;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return undefined;
      return parsed;
    };

    if ("billingDate" in updates) {
      const normalized = normalizeNullableDate(updates.billingDate);
      if (normalized === undefined) {
        return NextResponse.json(
          { success: false, message: "Invalid billingDate" },
          { status: 400 },
        );
      }
      updates.billingDate = normalized;
    }

    if ("expirationDate" in updates) {
      const normalized = normalizeNullableDate(updates.expirationDate);
      if (normalized === undefined) {
        return NextResponse.json(
          { success: false, message: "Invalid expirationDate" },
          { status: 400 },
        );
      }
      updates.expirationDate = normalized;
    }

    const user = await User.findByIdAndUpdate(_id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
