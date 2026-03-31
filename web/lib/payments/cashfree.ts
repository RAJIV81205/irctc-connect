import { Cashfree, CFEnvironment } from "cashfree-pg";

const clientId = process.env.CASHFREE_CLIENT_ID;
const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET are required");
}

const envName = process.env.CASHFREE_ENVIRONMENT?.toLowerCase();
const environment =
  envName === "sandbox" ? CFEnvironment.SANDBOX : CFEnvironment.PRODUCTION;

export const cashfree = new Cashfree(environment, clientId, clientSecret);

export function getWebhookUrl() {
  const directWebhookUrl = process.env.PAYMENT_WEBHOOK_URL;
  if (directWebhookUrl) {
    return directWebhookUrl;
  }

  const appBaseUrl = process.env.APP_BASE_URL;
  if (!appBaseUrl) {
    throw new Error("Set PAYMENT_WEBHOOK_URL or APP_BASE_URL");
  }

  return `${appBaseUrl.replace(/\/$/, "")}/api/payment/cashfree-webhook`;
}

export function getAppReturnUrl() {
  const appBaseUrl = process.env.APP_BASE_URL;
  if (!appBaseUrl) {
    throw new Error("APP_BASE_URL is required");
  }

  return `${appBaseUrl.replace(/\/$/, "")}/pricing?payment_return=1&order_id={order_id}`;
}

export function getExternalOrderDataUrl() {
  return (
    process.env.PAYMENT_ORDER_DATA_URL ||
    "https://rapidbite.rajivdubey.tech/irctc-connect/orderData"
  );
}
