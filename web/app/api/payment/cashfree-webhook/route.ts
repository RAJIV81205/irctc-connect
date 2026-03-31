import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import { cashfree } from "@/lib/payments/cashfree";
import { applyOrderPaymentState } from "@/lib/payments/order";

type CashfreeWebhookPayload = {
  data?: {
    order?: {
      order_id?: string;
      order_status?: string;
    };
    payment?: {
      payment_status?: string;
    };
  };
};

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const signature = request.headers.get("x-webhook-signature");
    const timestamp = request.headers.get("x-webhook-timestamp");

    if (!signature || !timestamp) {
      return NextResponse.json(
        { success: false, message: "missing webhook signature headers" },
        { status: 400 }
      );
    }

    const rawBody = await request.text();
    const verified = cashfree.PGVerifyWebhookSignature(
      signature,
      rawBody,
      timestamp
    );

    const eventPayload = verified.object as CashfreeWebhookPayload;
    const orderId = eventPayload?.data?.order?.order_id;
    const paymentStatus = eventPayload?.data?.payment?.payment_status || null;
    const orderStatus = eventPayload?.data?.order?.order_status || null;

    if (!orderId) {
      return NextResponse.json(
        { success: true, message: "webhook accepted without order id" },
        { status: 200 }
      );
    }

    await applyOrderPaymentState({
      orderId,
      orderStatus:
        orderStatus || (paymentStatus === "SUCCESS" ? "PAID" : null),
      paymentStatus,
      source: "webhook",
    });

    return NextResponse.json(
      { success: true, message: "webhook processed" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "unknown webhook error";

    console.error("Cashfree webhook error:", errorMessage);

    const invalidSignature =
      errorMessage.toLowerCase().includes("signature");

    return NextResponse.json(
      {
        success: false,
        message: invalidSignature
          ? "invalid webhook signature"
          : "failed to process webhook",
      },
      { status: invalidSignature ? 401 : 500 }
    );
  }
}
