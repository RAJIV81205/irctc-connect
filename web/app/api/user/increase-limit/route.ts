import { NextResponse } from "next/server";
import User from "@/lib/db/models/User";
import {
  getAuthCookieName,
  getAuthTokenFromCookies,
  verifyAuthToken,
} from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/db";
import { cashfree, getCashfreeCheckoutMode } from "@/lib/payments/cashfree";

const BASE_REQUESTS = 20_000;
const STEP_REQUESTS = 10_000;
const BASE_AMOUNT = 200;
const STEP_AMOUNT = 100;
const MAX_STEPS = 48;
const MAX_REQUESTS = BASE_REQUESTS + MAX_STEPS * STEP_REQUESTS;
const COLLECTION_NAME = "limit_topups";

type PaymentEntityLike = {
  payment_status?: string;
  cf_payment_id?: string | number;
};

type LimitTopup = {
  orderId: string;
  extraLimit: number;
  amount: number;
  credited: boolean;
};

function makeOrderId(userId: string) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `topup_${userId.slice(-8)}_${Date.now()}_${suffix}`;
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

function getDashboardReturnUrl() {
  const appBaseUrl = process.env.APP_BASE_URL;
  if (!appBaseUrl) {
    throw new Error("APP_BASE_URL is required");
  }

  return `${appBaseUrl.replace(
    /\/$/,
    ""
  )}/dashboard?payment_return=limit&order_id={order_id}`;
}

function getAddonQuote(extraLimit: number) {
  if (!Number.isInteger(extraLimit)) {
    return null;
  }

  if (extraLimit < BASE_REQUESTS || extraLimit > MAX_REQUESTS) {
    return null;
  }

  const extraAfterBase = extraLimit - BASE_REQUESTS;
  if (extraAfterBase % STEP_REQUESTS !== 0) {
    return null;
  }

  const steps = extraAfterBase / STEP_REQUESTS;
  return {
    extraLimit,
    amount: BASE_AMOUNT + steps * STEP_AMOUNT,
  };
}

function isPaidPlan(plan?: string | null) {
  const normalized = (plan || "").toLowerCase();
  return normalized === "pro" || normalized === "enterprise" || normalized === "advanced";
}

function normalizeOrderStatus(status?: string | null) {
  const normalized = status?.toUpperCase();
  if (normalized === "PAID") return "paid";
  if (normalized === "ACTIVE") return "active";
  if (normalized === "EXPIRED") return "expired";
  if (normalized === "FAILED") return "failed";
  if (normalized === "CANCELLED" || normalized === "USER_DROPPED") {
    return "cancelled";
  }
  return "created";
}

async function getAuthenticatedUser() {
  const token = await getAuthTokenFromCookies();
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload?.userId) return null;

  const user = await User.findById(payload.userId);
  if (!user?.active) return null;

  return user;
}

export async function POST(request: Request) {
  try {
    const connection = await connectToDatabase();
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    if (!isPaidPlan(user.plan)) {
      return NextResponse.json(
        { success: false, message: "limit add-ons are only available on paid plans" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { extraLimit?: number };
    const quote = getAddonQuote(Number(body.extraLimit));
    if (!quote) {
      return NextResponse.json(
        {
          success: false,
          message: `extraLimit must be between ${BASE_REQUESTS} and ${MAX_REQUESTS} in ${STEP_REQUESTS} request steps`,
        },
        { status: 400 }
      );
    }

    const orderId = makeOrderId(user._id.toString());
    const cashfreeRequest = {
      order_id: orderId,
      order_amount: quote.amount,
      order_currency: "INR",
      customer_details: {
        customer_id: user._id.toString(),
        customer_name: sanitizeCustomerName(user.name),
        customer_email: user.email,
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url: getDashboardReturnUrl(),
      },
      order_note: `${quote.extraLimit} extra API requests for irctc-connect`,
      order_tags: {
        order_type: "limit_topup",
        extra_limit: String(quote.extraLimit),
      },
    };

    const cashfreeResponse = await cashfree.PGCreateOrder(cashfreeRequest);
    const cfOrder = cashfreeResponse.data;

    if (!cfOrder.payment_session_id) {
      return NextResponse.json(
        { success: false, message: "payment session was not created" },
        { status: 502 }
      );
    }

    const now = new Date();
    await connection.collection(COLLECTION_NAME).insertOne({
      userId: user._id,
      orderId: cfOrder.order_id || orderId,
      cfOrderId:
        typeof cfOrder.cf_order_id === "number" ? cfOrder.cf_order_id : null,
      paymentSessionId: cfOrder.payment_session_id,
      extraLimit: quote.extraLimit,
      amount: quote.amount,
      currency: "INR",
      status:
        cfOrder.order_status?.toLowerCase() === "active" ? "active" : "created",
      paymentStatus: "PENDING",
      cashfreeOrderStatus: cfOrder.order_status || "ACTIVE",
      transactionReference: null,
      credited: false,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        message: "limit add-on order created",
        order: {
          orderId: cfOrder.order_id || orderId,
          paymentSessionId: cfOrder.payment_session_id,
          extraLimit: quote.extraLimit,
          amount: quote.amount,
          currency: "INR",
        },
        cashfreeMode: getCashfreeCheckoutMode(),
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
        : "failed to create limit add-on order";

    console.error("Increase limit create error:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const connection = await connectToDatabase();
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as { orderId?: string };
    const orderId = body.orderId?.trim();
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId is required" },
        { status: 400 }
      );
    }

    const topups = connection.collection<LimitTopup>(COLLECTION_NAME);
    const topup = await topups.findOne({ orderId, userId: user._id });
    if (!topup) {
      return NextResponse.json(
        { success: false, message: "limit add-on order not found" },
        { status: 404 }
      );
    }

    const [orderResponse, paymentsResponse] = await Promise.all([
      cashfree.PGFetchOrder(orderId),
      cashfree.PGOrderFetchPayments(orderId),
    ]);

    const cfOrderStatus = orderResponse.data.order_status;
    const payments = (paymentsResponse.data || []) as PaymentEntityLike[];
    const successPayment = payments.find(
      (payment) => payment?.payment_status === "SUCCESS"
    );
    const latestPayment = successPayment || payments[0];
    const paid =
      cfOrderStatus?.toUpperCase() === "PAID" ||
      latestPayment?.payment_status?.toUpperCase() === "SUCCESS";
    const paymentStatus = latestPayment?.payment_status || "PENDING";
    const now = new Date();

    await topups.updateOne(
      { orderId, userId: user._id },
      {
        $set: {
          status: paid ? "paid" : normalizeOrderStatus(cfOrderStatus),
          paymentStatus: paymentStatus.toUpperCase(),
          cashfreeOrderStatus: cfOrderStatus || null,
          transactionReference: latestPayment?.cf_payment_id
            ? String(latestPayment.cf_payment_id)
            : null,
          updatedAt: now,
        },
      }
    );

    if (!paid) {
      return NextResponse.json(
        {
          success: true,
          message: "payment is not completed yet",
          credited: Boolean(topup.credited),
          paid: false,
        },
        { status: 200 }
      );
    }

    const creditedTopup = await topups.findOneAndUpdate(
      { orderId, userId: user._id, credited: false },
      {
        $set: {
          credited: true,
          status: "paid",
          paymentStatus: "SUCCESS",
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );

    if (creditedTopup) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { limit: Math.max(0, Math.floor(creditedTopup.extraLimit || 0)) },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "limit add-on verified",
        credited: true,
        paid: true,
        extraLimit: topup.extraLimit,
      },
      { status: 200 }
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
        : "failed to verify limit add-on order";

    console.error("Increase limit verify error:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
