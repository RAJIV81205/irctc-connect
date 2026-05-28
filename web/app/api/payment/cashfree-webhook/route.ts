import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/db";
import { cashfree } from "@/lib/payments/cashfree";
import { applyOrderPaymentState } from "@/lib/payments/order";

type CashfreeWebhookPayload = {
  type?: string;
  data?: {
    order?: {
      order_id?: string;
      order_status?: string;
    };
    payment?: {
      cf_payment_id?: string | number;
      payment_status?: string;
    };
  };
};

function getVerifiedWebhookPayload(
  verified: unknown,
  rawBody: string
): CashfreeWebhookPayload {
  const objectPayload =
    typeof verified === "object" && verified !== null && "object" in verified
      ? (verified as { object?: unknown }).object
      : verified;

  if (typeof objectPayload === "string") {
    return JSON.parse(objectPayload) as CashfreeWebhookPayload;
  }

  if (typeof objectPayload === "object" && objectPayload !== null) {
    return objectPayload as CashfreeWebhookPayload;
  }

  return JSON.parse(rawBody) as CashfreeWebhookPayload;
}

function getOrderStatusForPaymentStatus(paymentStatus?: string | null) {
  const normalized = paymentStatus?.toUpperCase();
  if (normalized === "SUCCESS") return "PAID";
  if (normalized === "FAILED") return "FAILED";
  if (normalized === "USER_DROPPED") return "USER_DROPPED";
  return null;
}

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

    const eventPayload = getVerifiedWebhookPayload(verified, rawBody);
    const orderId = eventPayload?.data?.order?.order_id;
    const paymentStatus = eventPayload?.data?.payment?.payment_status || null;
    const orderStatus =
      eventPayload?.data?.order?.order_status ||
      getOrderStatusForPaymentStatus(paymentStatus);
    const transactionReference = eventPayload?.data?.payment?.cf_payment_id;

    if (!orderId) {
      return NextResponse.json(
        { success: true, message: "webhook accepted without order id" },
        { status: 200 }
      );
    }

    await applyOrderPaymentState({
      orderId,
      orderStatus,
      paymentStatus,
      transactionReference: transactionReference
        ? String(transactionReference)
        : null,
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
