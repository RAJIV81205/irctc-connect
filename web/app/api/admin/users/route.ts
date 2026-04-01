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
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    await connectToDatabase();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await verifyRequest();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    await connectToDatabase();
    const body = await req.json();
    const { _id, ...updates } = body;
    
    if (!_id) return NextResponse.json({ success: false, message: "User ID missing" }, { status: 400 });
    
    const user = await User.findByIdAndUpdate(_id, updates, { new: true });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
