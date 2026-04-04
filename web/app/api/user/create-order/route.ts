import { NextResponse } from "next/server";
import User from "@/lib/db/models/User";
import Order from "@/lib/db/models/Order";
import {
  getAuthCookieName,
  getAuthTokenFromCookies,
  verifyAuthToken,
} from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/db";
import {
  cashfree,
  getAppReturnUrl,
  getExternalOrderDataUrl,
  getWebhookUrl,
} from "@/lib/payments/cashfree";
import { isPaidPlanType } from "@/lib/payments/plans";
import { getPaidPlanRuntime } from "@/lib/plans/config";

function makeOrderId(userId: string) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `order_${userId.slice(-8)}_${Date.now()}_${suffix}`;
}

function sanitizeCustomerName(name?: string) {
  const cleaned = (name || "User").replace(/[^a-zA-Z0-9 ]/g, "").trim();
  return cleaned || "User";
}

function unauthorizedResponse() {
  const response = NextResponse.json(
    { success: false, message: "unauthorized" },
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

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const token = await getAuthTokenFromCookies();
    if (!token) {
      return unauthorizedResponse();
    }

    const payload = verifyAuthToken(token);

    if (!payload || !payload.userId) {
      return unauthorizedResponse();
    }
    
    const user = await User.findById(payload.userId).lean();
    if (!user || !user.active) {
      return unauthorizedResponse();
    }

    const body = (await request.json()) as { planType?: string };
    if (!isPaidPlanType(body.planType)) {
      return NextResponse.json(
        { success: false, message: "invalid plan type" },
        { status: 400 }
      );
    }

    const planConfig = await getPaidPlanRuntime(body.planType);
    if (!planConfig) {
      return NextResponse.json(
        { success: false, message: "plan config not found" },
        { status: 400 }
      );
    }
    const orderId = makeOrderId(user._id.toString());

    const cashfreeRequest = {
      order_id: orderId,
      order_amount: planConfig.amount,
      order_currency: "INR",
      customer_details: {
        customer_id: user._id.toString(),
        customer_name: sanitizeCustomerName(user.name),
        customer_email: user.email,
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url: getAppReturnUrl(),
        notify_url: getWebhookUrl(),
      },
      order_note: `${body.planType} plan for irctc-connect`,
      order_tags: {
        plan_type: body.planType,
      },
    };

    const cashfreeResponse = await cashfree.PGCreateOrder(cashfreeRequest);
    const cfOrder = cashfreeResponse.data;

    const createdOrderDoc = await Order.create({
      userId: user._id,
      orderId: cfOrder.order_id || orderId,
      cfOrderId:
        typeof cfOrder.cf_order_id === "number" ? cfOrder.cf_order_id : null,
      paymentSessionId: cfOrder.payment_session_id || null,
      planType: body.planType,
      amount: planConfig.amount,
      currency: "INR",
      status: cfOrder.order_status?.toLowerCase() === "active" ? "active" : "created",
      paymentStatus: "PENDING",
      cashfreeOrderStatus: cfOrder.order_status || "ACTIVE",
    });
    const createdOrder = {
      orderId: createdOrderDoc.orderId,
      paymentSessionId: createdOrderDoc.paymentSessionId,
      planType: createdOrderDoc.planType,
      amount: createdOrderDoc.amount,
      currency: createdOrderDoc.currency,
      status: createdOrderDoc.status,
    };

    const redirectUrl = new URL(getExternalOrderDataUrl());
    redirectUrl.searchParams.set("order_id", createdOrder.orderId);
    redirectUrl.searchParams.set(
      "payment_session_id",
      createdOrder.paymentSessionId || ""
    );
    redirectUrl.searchParams.set("plan_type", createdOrder.planType);
    redirectUrl.searchParams.set("amount", String(createdOrder.amount));
    redirectUrl.searchParams.set("currency", createdOrder.currency);
    redirectUrl.searchParams.set(
      "app_return_url",
      getAppReturnUrl().replace("{order_id}", createdOrder.orderId)
    );

    return NextResponse.json(
      {
        success: true,
        message: "order created",
        order: {
          orderId: createdOrder.orderId,
          paymentSessionId: createdOrder.paymentSessionId,
          planType: createdOrder.planType,
          amount: createdOrder.amount,
          currency: createdOrder.currency,
          status: createdOrder.status,
        },
        redirectUrl: redirectUrl.toString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { data?: { message?: string } } }).response
        ?.data?.message === "string"
        ? (error as { response?: { data?: { message?: string } } }).response!.data!
            .message!
        : "failed to create order";

    console.error("Create order route error:", error);
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
