import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import Order from "@/lib/db/models/Order";
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
    // Use standard mongoose populate
    const orders = await Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
      
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("Fetch orders error:", error);
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
    
    if (!_id) return NextResponse.json({ success: false, message: "Order ID missing" }, { status: 400 });
    
    const order = await Order.findByIdAndUpdate(_id, updates, { new: true });
    if (!order) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
