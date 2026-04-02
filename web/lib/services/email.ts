import { Resend } from "resend";
import User from "../db/models/User";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface IUser {
  name: string;
  email: string;
  plan: string;
  billingDate?: Date | null;
  limit: number;
}

const senderEmail = "irctc-connect@contact.rajivdubey.tech";
const senderName = "IRCTC Connect";
const replyToEmail = "lucky81205@gmail.com";
const replyToName = "Rajiv Dubey";

// ─── Helpers ────────────────────────────────────────────────────────────────

function addOneMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysUntil(future: Date): number {
  const now = new Date();
  const diff = future.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ─── Template ────────────────────────────────────────────────────────────────

const newSubsTemplateHtml = (user: IUser): string => {
  const billingDate = user.billingDate ? new Date(user.billingDate) : new Date();
  const nextBillingDate = addOneMonth(billingDate);
  const daysLeft = daysUntil(nextBillingDate);
  const formattedNextBilling = formatDate(nextBillingDate);
  const firstName = user.name.split(" ")[0];

  // Badge colour based on days left
  const urgencyColor =
    daysLeft > 20 ? "#16a34a" : daysLeft > 10 ? "#0284c7" : "#b45309";
  const urgencyBg =
    daysLeft > 20 ? "#dcfce7" : daysLeft > 10 ? "#e0f2fe" : "#fef3c7";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to IRCTC Connect</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #e0f2fe 0%, #dcfce7 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center" valign="top">

        <!-- Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
          style="
            max-width: 600px;
            width: 100%;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(2, 132, 199, 0.12);
          ">

          <!-- ── Header ─────────────────────────────────────── -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #16a34a 100%);
              padding: 36px 40px 28px;
              text-align: center;
            ">
              <!-- Logo -->
              <img
                src="https://irctc.rajivdubey.tech/icon.png"
                alt="IRCTC Connect"
                width="64"
                height="64"
                style="
                  border-radius: 16px;
                  border: 3px solid rgba(255,255,255,0.4);
                  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                  display: block;
                  margin: 0 auto 14px;
                "
              />
              <h1 style="
                margin: 0 0 4px;
                color: #ffffff;
                font-size: 26px;
                font-weight: 700;
                letter-spacing: -0.3px;
              ">IRCTC Connect</h1>
              <p style="
                margin: 0;
                color: rgba(255,255,255,0.8);
                font-size: 13px;
                letter-spacing: 2px;
                text-transform: uppercase;
              ">Your Smart Rail Companion</p>
            </td>
          </tr>

          <!-- ── Greeting ───────────────────────────────────── -->
          <tr>
            <td style="padding: 36px 40px 0;">
              <h2 style="
                margin: 0 0 12px;
                font-size: 22px;
                font-weight: 700;
                color: #0c4a6e;
              ">Welcome aboard, ${firstName}! 🎉</h2>
              <p style="
                margin: 0;
                font-size: 15px;
                line-height: 1.7;
                color: #475569;
              ">
                Your <strong style="color: #0369a1;">${capitalize(user.plan)} Plan</strong>
                subscription is now active. Here's everything you need to know to get started.
              </p>
            </td>
          </tr>

          <!-- ── Plan Summary Card ──────────────────────────── -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="
                  background: linear-gradient(135deg, #f0f9ff, #f0fdf4);
                  border: 1px solid #bae6fd;
                  border-radius: 14px;
                  overflow: hidden;
                ">
                <tr>
                  <td style="padding: 24px;">
                    <p style="
                      margin: 0 0 16px;
                      font-size: 11px;
                      font-weight: 700;
                      letter-spacing: 2px;
                      text-transform: uppercase;
                      color: #0284c7;
                    ">📋 Your Subscription Details</p>

                    <!-- Row: Plan -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                      style="margin-bottom: 12px;">
                      <tr>
                        <td style="font-size: 13px; color: #64748b;">Plan</td>
                        <td align="right">
                          <span style="
                            background: linear-gradient(90deg, #0369a1, #0ea5e9);
                            color: #fff;
                            font-size: 12px;
                            font-weight: 700;
                            padding: 3px 12px;
                            border-radius: 20px;
                          ">${capitalize(user.plan)}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <hr style="border: none; border-top: 1px solid #bae6fd; margin: 12px 0;" />

                    <!-- Row: API Limit -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                      style="margin-bottom: 12px;">
                      <tr>
                        <td style="font-size: 13px; color: #64748b;">API / Request Limit</td>
                        <td align="right" style="
                          font-size: 14px;
                          font-weight: 700;
                          color: #16a34a;
                        ">${user.limit.toLocaleString("en-IN")} calls / month</td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <hr style="border: none; border-top: 1px solid #bae6fd; margin: 12px 0;" />

                    <!-- Row: Next Billing -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 13px; color: #64748b;">Next Billing Date</td>
                        <td align="right" style="
                          font-size: 14px;
                          font-weight: 700;
                          color: #0c4a6e;
                        ">${formattedNextBilling}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Days-left banner -->
                <tr>
                  <td style="
                    background: ${urgencyBg};
                    border-top: 1px solid #bae6fd;
                    padding: 12px 24px;
                    text-align: center;
                  ">
                    <span style="
                      display: inline-block;
                      width: 10px;
                      height: 10px;
                      border-radius: 50%;
                      background: ${urgencyColor};
                      margin-right: 8px;
                      vertical-align: middle;
                    "></span>
                    <span style="
                      font-size: 13px;
                      font-weight: 600;
                      color: ${urgencyColor};
                      vertical-align: middle;
                    ">
                      ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining in your current billing cycle
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Features ───────────────────────────────────── -->
          <tr>
            <td style="padding: 28px 40px 0;">
              <p style="
                margin: 0 0 16px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #0284c7;
              ">✨ What's Included</p>

              <!-- Feature 1 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="margin-bottom: 12px;">
                <tr>
                  <td width="40" valign="top">
                    <div style="
                      width: 32px; height: 32px;
                      background: linear-gradient(135deg, #0369a1, #0ea5e9);
                      border-radius: 10px;
                      text-align: center;
                      line-height: 32px;
                      font-size: 16px;
                    ">🚆</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0c4a6e;">
                      Real-Time Train Status
                    </p>
                    <p style="margin: 2px 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                      Live updates on arrivals, departures, and platform changes.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 2 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="margin-bottom: 12px;">
                <tr>
                  <td width="40" valign="top">
                    <div style="
                      width: 32px; height: 32px;
                      background: linear-gradient(135deg, #16a34a, #4ade80);
                      border-radius: 10px;
                      text-align: center;
                      line-height: 32px;
                      font-size: 16px;
                    ">🎯</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0c4a6e;">
                      Personalised Travel Recommendations
                    </p>
                    <p style="margin: 2px 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                      Smart suggestions tailored to your travel history and preferences.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 3 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="40" valign="top">
                    <div style="
                      width: 32px; height: 32px;
                      background: linear-gradient(135deg, #0369a1, #16a34a);
                      border-radius: 10px;
                      text-align: center;
                      line-height: 32px;
                      font-size: 16px;
                    ">🎟️</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0c4a6e;">
                      Exclusive Offers & Deals
                    </p>
                    <p style="margin: 2px 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                      Member-only discounts on tickets and travel packages.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CTA ────────────────────────────────────────── -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <a href="https://irctc.rajivdubey.tech/dashboard" target="_blank" rel="noopener noreferrer"
                style="
                  display: inline-block;
                  background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #16a34a 100%);
                  color: #ffffff;
                  text-decoration: none;
                  font-size: 15px;
                  font-weight: 700;
                  padding: 14px 36px;
                  border-radius: 50px;
                  letter-spacing: 0.3px;
                  box-shadow: 0 8px 24px rgba(3, 105, 161, 0.35);
                "
              >
                Explore Your Dashboard →
              </a>
            </td>
          </tr>

          <!-- ── Footer ─────────────────────────────────────── -->
          <tr>
            <td style="
              background: #f8fafc;
              border-top: 1px solid #e2e8f0;
              padding: 24px 40px;
              text-align: center;
            ">
              <p style="margin: 0 0 6px; font-size: 13px; color: #64748b;">
                Questions? Reply to this email — we're happy to help.
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} IRCTC Connect · 
                <a href="https://irctc.rajivdubey.tech" style="color: #0284c7; text-decoration: none;">irctc.rajivdubey.tech</a>
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #cbd5e1;">
                You're receiving this because you subscribed with ${user.email}
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
};

// ─── Send Function ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await resend.emails.send({
    from: `${senderName} <${senderEmail}>`,
    to: [user.email],
    replyTo: `${replyToName} <${replyToEmail}>`,
    subject: `Welcome to IRCTC Connect, ${user.name.split(" ")[0]}! Your ${capitalize(user.plan)} Plan is Active 🚆`,
    html: newSubsTemplateHtml(user),
  });

  if (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }

  console.log(`Welcome email sent to ${user.email} | ID: ${data?.id}`);
  return data;
}

