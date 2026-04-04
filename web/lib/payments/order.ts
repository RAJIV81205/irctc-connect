import Order, { OrderDocument } from "@/lib/db/models/Order";
import User from "@/lib/db/models/User";
import { PaidPlanType } from "@/lib/payments/plans";
import { sendWelcomeEmail } from "../services/email";
import { getPaidPlanRuntime } from "@/lib/plans/config";

type PaymentStateInput = {
  orderId: string;
  orderStatus?: string | null;
  paymentStatus?: string | null;
  source: "webhook" | "status_sync";
};

function normalizeOrderStatus(status?: string | null) {
  if (!status) {
    return "created";
  }

  const normalized = status.toUpperCase();
  if (normalized === "PAID") return "paid";
  if (normalized === "ACTIVE") return "active";
  if (normalized === "EXPIRED") return "expired";
  if (normalized === "TERMINATED" || normalized === "CANCELLED") return "cancelled";
  if (normalized === "FAILED") return "failed";
  return "created";
}

function isSuccess(orderStatus?: string | null, paymentStatus?: string | null) {
  return (
    orderStatus?.toUpperCase() === "PAID" ||
    paymentStatus?.toUpperCase() === "SUCCESS"
  );
}

export async function applyOrderPaymentState(input: PaymentStateInput) {
  const order = await Order.findOne({ orderId: input.orderId });
  if (!order) {
    return { found: false, paid: false, credited: false };
  }

  const nextStatus = normalizeOrderStatus(input.orderStatus ?? order.cashfreeOrderStatus);
  const paymentStatus = (input.paymentStatus || order.paymentStatus || "PENDING").toUpperCase();
  const paid = isSuccess(input.orderStatus, paymentStatus);

  order.status = paid ? "paid" : nextStatus;
  order.paymentStatus = paymentStatus;
  if (input.orderStatus) {
    order.cashfreeOrderStatus = input.orderStatus;
  }
  if (input.source === "webhook") {
    order.lastWebhookAt = new Date();
  }
  await order.save();

  if (!paid) {
    return { found: true, paid: false, credited: order.credited };
  }

  const creditedOrder = await Order.findOneAndUpdate(
    {
      _id: order._id,
      credited: false,
    },
    {
      $set: {
        credited: true,
        status: "paid",
        paymentStatus: "SUCCESS",
      },
    },
    { new: true }
  );

  if (!creditedOrder) {
    return { found: true, paid: true, credited: true };
  }

  await grantPlanToUser(creditedOrder.userId.toString(), creditedOrder.planType);
  await sendWelcomeEmail(creditedOrder.userId.toString());
  return { found: true, paid: true, credited: true };
}

async function grantPlanToUser(userId: string, planType: PaidPlanType) {
  const planConfig = await getPaidPlanRuntime(planType);
  if (!planConfig) {
    return;
  }

  await User.findByIdAndUpdate(userId, {
    $set: {
      plan: planConfig.userPlan,
      limit: planConfig.limit,
      usage: 0,
      billingDate: new Date(),
    },
  });


}

export async function syncOrderWithCashfree(
  order: Pick<OrderDocument, "orderId">,
  cashfreeOrderStatus?: string,
  cashfreePaymentStatus?: string
) {
  return applyOrderPaymentState({
    orderId: order.orderId,
    orderStatus: cashfreeOrderStatus,
    paymentStatus: cashfreePaymentStatus,
    source: "status_sync",
  });
}
