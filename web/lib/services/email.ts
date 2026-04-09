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

type SendRawHtmlEmailParams = {
  to: string;
  subject: string;
  html: string;
};

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
  const billingDate = user.billingDate
    ? new Date(user.billingDate)
    : new Date();
  const nextBillingDate = addOneMonth(billingDate);
  const daysLeft = daysUntil(nextBillingDate);
  const formattedNextBilling = formatDate(nextBillingDate);
  const firstName = user.name.split(" ")[0];

  // Badge colour based on days left
  const urgencyColor =
    daysLeft > 20 ? "#166534" : daysLeft > 10 ? "#1e40af" : "#92400e";
  const urgencyBg =
    daysLeft > 20 ? "#f0fdf4" : daysLeft > 10 ? "#eff6ff" : "#fffbeb";
  const urgencyBorder =
    daysLeft > 20 ? "#bbf7d0" : daysLeft > 10 ? "#bfdbfe" : "#fde68a";

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
  background: #f4f4f5;
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
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e4e4e7;
          ">

          <!-- ── Header ─────────────────────────────────────── -->
          <tr>
            <td style="
              background: #18181b;
              padding: 36px 40px 28px;
              text-align: center;
            ">
              <!-- Logo -->
              <img
                src="https://irctc.rajivdubey.tech/icon.png"
                alt="IRCTC Connect"
                width="56"
                height="56"
                style="
                  border-radius: 12px;
                  border: 1px solid rgba(255,255,255,0.12);
                  display: block;
                  margin: 0 auto 14px;
                "
              />
              <h1 style="
                margin: 0 0 4px;
                color: #ffffff;
                font-size: 22px;
                font-weight: 600;
                letter-spacing: -0.3px;
              ">IRCTC Connect</h1>
              <p style="
                margin: 0;
                color: #a1a1aa;
                font-size: 12px;
                letter-spacing: 1.5px;
                text-transform: uppercase;
              ">Your Smart Rail Companion</p>
            </td>
          </tr>

          <!-- ── Greeting ───────────────────────────────────── -->
          <tr>
            <td style="padding: 36px 40px 0;">
              <h2 style="
                margin: 0 0 10px;
                font-size: 20px;
                font-weight: 600;
                color: #18181b;
              ">Welcome aboard, ${firstName}! 🎉</h2>
              <p style="
                margin: 0;
                font-size: 14px;
                line-height: 1.7;
                color: #71717a;
              ">
                Your <strong style="color: #18181b;">${capitalize(user.plan)} Plan</strong>
                subscription is now active. Here's everything you need to know to get started.
              </p>
            </td>
          </tr>

          <!-- ── Plan Summary Card ──────────────────────────── -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="
                  background: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 12px;
                  overflow: hidden;
                ">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="
                      margin: 0 0 16px;
                      font-size: 11px;
                      font-weight: 600;
                      letter-spacing: 1.5px;
                      text-transform: uppercase;
                      color: #71717a;
                    ">📋 Your Subscription Details</p>

                    <!-- Row: Plan -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                      style="margin-bottom: 12px;">
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Plan</td>
                        <td align="right">
                          <span style="
                            background: #18181b;
                            color: #ffffff;
                            font-size: 11px;
                            font-weight: 600;
                            padding: 3px 10px;
                            border-radius: 20px;
                          ">${capitalize(user.plan)}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 12px 0;" />

                    <!-- Row: API Limit -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                      style="margin-bottom: 12px;">
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">API / Request Limit</td>
                        <td align="right" style="
                          font-size: 13px;
                          font-weight: 600;
                          color: #18181b;
                        ">${user.limit.toLocaleString("en-IN")} calls / month</td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 12px 0;" />

                    <!-- Row: Next Billing -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Next Billing Date</td>
                        <td align="right" style="
                          font-size: 13px;
                          font-weight: 600;
                          color: #18181b;
                        ">${formattedNextBilling}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Days-left banner -->
                <tr>
                  <td style="
                    background: ${urgencyBg};
                    border-top: 1px solid ${urgencyBorder};
                    padding: 10px 24px;
                    text-align: center;
                  ">
                    <span style="
                      display: inline-block;
                      width: 8px;
                      height: 8px;
                      border-radius: 50%;
                      background: ${urgencyColor};
                      margin-right: 7px;
                      vertical-align: middle;
                    "></span>
                    <span style="
                      font-size: 13px;
                      font-weight: 500;
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
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #71717a;
    ">✨ What's Included in the Latest Update</p>

    <!-- Feature 1 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="margin-bottom: 14px;">
      <tr>
        <td width="40" valign="top">
          <div style="
            width: 32px; height: 32px;
            background: #f4f4f5;
            border: 1px solid #e4e4e7;
            border-radius: 8px;
            text-align: center;
            line-height: 32px;
            font-size: 15px;
          ">🎫</div>
        </td>
        <td style="padding-left: 12px;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #18181b;">
            PNR Status & Journey Details
          </p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #71717a; line-height: 1.5;">
            Real-time booking status, passenger confirmation, seat and journey information.
          </p>
        </td>
      </tr>
    </table>

    <!-- Feature 2 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="margin-bottom: 14px;">
      <tr>
        <td width="40" valign="top">
          <div style="
            width: 32px; height: 32px;
            background: #f4f4f5;
            border: 1px solid #e4e4e7;
            border-radius: 8px;
            text-align: center;
            line-height: 32px;
            font-size: 15px;
          ">🚆</div>
        </td>
        <td style="padding-left: 12px;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #18181b;">
            Live Train Tracking
          </p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #71717a; line-height: 1.5;">
            Track live train location, delays, station-wise timings and real-time running status.
          </p>
        </td>
      </tr>
    </table>

    <!-- Feature 3 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="margin-bottom: 14px;">
      <tr>
        <td width="40" valign="top">
          <div style="
            width: 32px; height: 32px;
            background: #f4f4f5;
            border: 1px solid #e4e4e7;
            border-radius: 8px;
            text-align: center;
            line-height: 32px;
            font-size: 15px;
          ">🔍</div>
        </td>
        <td style="padding-left: 12px;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #18181b;">
            Train Search & Availability
          </p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #71717a; line-height: 1.5;">
            Search trains between stations and check seat availability with fare breakdown.
          </p>
        </td>
      </tr>
    </table>

    <!-- Feature 4 -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="40" valign="top">
          <div style="
            width: 32px; height: 32px;
            background: #f4f4f5;
            border: 1px solid #e4e4e7;
            border-radius: 8px;
            text-align: center;
            line-height: 32px;
            font-size: 15px;
          ">🏢</div>
        </td>
        <td style="padding-left: 12px;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #18181b;">
            Live at Station
          </p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #71717a; line-height: 1.5;">
            View upcoming trains at any station with real-time arrival and departure information.
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>

          <!-- ── CTA ────────────────────────────────────────── -->
          <tr>
            <td style="padding: 32px 40px 0; text-align: center;">
              <a href="https://irctc.rajivdubey.tech/dashboard" target="_blank" rel="noopener noreferrer"
                style="
                  display: inline-block;
                  background: #18181b;
                  color: #ffffff;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 600;
                  padding: 12px 32px;
                  border-radius: 8px;
                  letter-spacing: 0.2px;
                "
              >
                Explore Your Dashboard →
              </a>
            </td>
          </tr>

          <!-- ── Signal CTA ─────────────────────────────────── -->
          <tr>
            <td style="padding: 12px 40px 0; text-align: center;">
              <a href="https://signal.me/#eu/F8kHmQ5nKhO1ifpDuDcFXpAMg05zBLyi5GXx6MdLmNH9U1plPehLiKIkFp4aVHtw" target="_blank" rel="noopener noreferrer"
                style="
                  display: inline-block;
                  background: #ffffff;
                  color: #3d3d3d;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 500;
                  padding: 11px 32px;
                  border-radius: 8px;
                  border: 1px solid #d4d4d8;
                  letter-spacing: 0.2px;
                "
              >
                Contact me on Signal
              </a>
            </td>
          </tr>

          <!-- ── Footer ─────────────────────────────────────── -->
          <tr>
            <td style="
              background: #fafafa;
              border-top: 1px solid #e4e4e7;
              padding: 24px 40px;
              margin-top: 32px;
              text-align: center;
            ">
              <p style="margin: 0 0 6px; font-size: 13px; color: #71717a;">
                Questions? Reply to this email — we're happy to help.
              </p>
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                © ${new Date().getFullYear()} IRCTC Connect · 
                <a href="https://irctc.rajivdubey.tech" style="color: #18181b; text-decoration: none;">irctc.rajivdubey.tech</a>
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #d4d4d8;">
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

export async function sendRawHtmlEmail({
  to,
  subject,
  html,
}: SendRawHtmlEmailParams) {
  const { data, error } = await resend.emails.send({
    from: `${senderName} <${senderEmail}>`,
    to: [to],
    replyTo: `${replyToName} <${replyToEmail}>`,
    subject,
    html,
  });

  if (error) {
    console.error(`Failed to send custom email to ${to}:`, error);
    throw error;
  }

  return data;
}
