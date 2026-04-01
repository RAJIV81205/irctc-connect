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

export async function DELETE() {
	try {
		const admin = await verifyRequest();
		if (!admin) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectToDatabase();

		const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

		const result = await Order.deleteMany({
			createdAt: { $lt: cutoffDate },
			status: { $ne: "paid" },
		});

		return NextResponse.json(
			{
				success: true,
				message: "Unpaid orders older than 24 hours removed",
				deletedCount: result.deletedCount,
				cutoffDate: cutoffDate.toISOString(),
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Remove unpaid orders error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
