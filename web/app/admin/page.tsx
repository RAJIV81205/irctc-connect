"use client";

import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import useSWR from "swr";

// ─── SWR Fetcher ──────────────────────────────────────────────────────────────
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  _id: string;
  email: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  active: boolean;
  usage: number;
  limit: number;
  apiKey?: string;
  billingDate?: string | null;
}

interface Order {
  _id: string;
  orderId: string;
  userId?: { email: string };
  amount: number;
  currency: string;
  status: string;
  credited: boolean;
  createdAt?: string;
}

interface GithubIssue {
  id: number;
  number: number;
  title: string;
  htmlUrl: string;
  state: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  comments: number;
  author: string;
  labels: Array<{ name: string; color: string }>;
  isNew: boolean;
  isRecentlyUpdated: boolean;
}

interface ManagedPlanFeature {
  text: string;
  highlight?: boolean;
}

interface ManagedPlan {
  id: string;
  name: string;
  originalPrice?: number | null;
  price: number;
  period: string;
  description: string;
  features: ManagedPlanFeature[];
  planType: "free" | "pro" | "advance";
  buttonText: string;
  popular?: boolean;
  colorTheme: "blue" | "slate" | "emerald";
  limit?: number;
  userPlan?: "pro" | "enterprise" | null;
}

interface PlansConfig {
  key: string;
  offerEndsAt: string | null;
  contactEmail: string;
  plans: ManagedPlan[];
}

type EmailAudienceFilter =
  | "all_users"
  | "free_users"
  | "pro_users"
  | "advance_users"
  | "paid_users"
  | "active_users"
  | "inactive_users"
  | "billing_7_days_left"
  | "billing_3_days_left"
  | "billing_1_day_left"
  | "billing_within_7_days"
  | "billing_expired";

const EMAIL_AUDIENCE_FILTER_OPTIONS: Array<{ value: EmailAudienceFilter; label: string }> = [
  { value: "all_users", label: "All users" },
  { value: "free_users", label: "Free users" },
  { value: "pro_users", label: "Pro users" },
  { value: "advance_users", label: "Advance users" },
  { value: "paid_users", label: "Paid users" },
  { value: "active_users", label: "Active users" },
  { value: "inactive_users", label: "Inactive users" },
  { value: "billing_7_days_left", label: "Billing: exactly 7 days left" },
  { value: "billing_3_days_left", label: "Billing: exactly 3 days left" },
  { value: "billing_1_day_left", label: "Billing: exactly 1 day left" },
  { value: "billing_within_7_days", label: "Billing: within next 7 days" },
  { value: "billing_expired", label: "Billing expired" },
];

const getEmailAudienceLabel = (filter: EmailAudienceFilter) =>
  EMAIL_AUDIENCE_FILTER_OPTIONS.find((option) => option.value === filter)?.label || "Selected users";

const BILLING_CYCLE_MS = 30 * 24 * 60 * 60 * 1000;

const getBillingDaysLeft = (billingDate?: string | null) => {
  if (!billingDate) return null;
  const billingStart = new Date(billingDate).getTime();
  if (Number.isNaN(billingStart)) return null;
  const remainingMs = billingStart + BILLING_CYCLE_MS - Date.now();
  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
};

const matchesEmailAudienceFilter = (user: User, filter: EmailAudienceFilter) => {
  const plan = user.plan?.toLowerCase();
  const isFree = plan === "free";
  const isPro = plan === "pro";
  const isAdvance = plan === "enterprise" || plan === "advance";
  const isPaid = isPro || isAdvance;
  const daysLeft = getBillingDaysLeft(user.billingDate || null);

  switch (filter) {
    case "all_users":
      return true;
    case "free_users":
      return isFree;
    case "pro_users":
      return isPro;
    case "advance_users":
      return isAdvance;
    case "paid_users":
      return isPaid;
    case "active_users":
      return user.active;
    case "inactive_users":
      return !user.active;
    case "billing_7_days_left":
      return isPaid && daysLeft === 7;
    case "billing_3_days_left":
      return isPaid && daysLeft === 3;
    case "billing_1_day_left":
      return isPaid && daysLeft === 1;
    case "billing_within_7_days":
      return isPaid && daysLeft !== null && daysLeft > 0 && daysLeft <= 7;
    case "billing_expired":
      return isPaid && daysLeft !== null && daysLeft <= 0;
    default:
      return true;
  }
};

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-[#0a0c10] flex flex-col items-center justify-center z-50">
      <div className="relative mb-6">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "2px solid #1e2330",
            borderTop: "2px solid #6ee7b7",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 6,
            borderRadius: "50%",
            border: "2px solid #1e2330",
            borderBottom: "2px solid #34d399",
            animation: "spin 1.2s linear infinite reverse",
          }}
        />
      </div>
      <p style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: "0.08em" }}>
        {text}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── Plan Badge ───────────────────────────────────────────────────────────────
const PlanBadge = ({ plan }: { plan: string }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    free:       { bg: "#1e2330", text: "#94a3b8", border: "#2d3548" },
    pro:        { bg: "#0f2a1d", text: "#6ee7b7", border: "#1a4731" },
    enterprise: { bg: "#1a1060", text: "#a78bfa", border: "#2d1f8a" },
  };
  const s = styles[plan] || styles.free;
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      padding: "2px 8px", borderRadius: 4, fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: "0.05em",
      textTransform: "uppercase",
    }}>{plan}</span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    paid:      { bg: "#0f2a1d", text: "#6ee7b7", border: "#1a4731", dot: "#34d399" },
    active:    { bg: "#0f2233", text: "#60a5fa", border: "#1a3a5c", dot: "#3b82f6" },
    created:   { bg: "#1e2330", text: "#94a3b8", border: "#2d3548", dot: "#64748b" },
    failed:    { bg: "#2a0f0f", text: "#f87171", border: "#4a1f1f", dot: "#ef4444" },
    cancelled: { bg: "#2a1f0f", text: "#fb923c", border: "#4a3a1f", dot: "#f97316" },
    expired:   { bg: "#1e2330", text: "#64748b", border: "#2d3548", dot: "#475569" },
  };
  const s = styles[status] || styles.created;
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      padding: "3px 10px", borderRadius: 4, fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status.toUpperCase()}
    </span>
  );
};

const formatCompactDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Modal ────────────────────────────────────────────────────────────────────
function OrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f1117", border: "1px solid #1e2330",
          borderRadius: 12, padding: 28, width: "100%", maxWidth: 480,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>Order Details</span>
          <button onClick={onClose} style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <IconX />
          </button>
        </div>
        {Object.entries(order).map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1f2e" }}>
            <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</span>
            <span style={{ color: "#cbd5e1", fontSize: 12, maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}>
              {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Billing Timer Component ──────────────────────────────────────────────────
function BillingTimer({ user }: { user: User }) {
  const [display, setDisplay] = useState<string>("");

  useEffect(() => {
    const updateDisplay = () => {
      if (user.plan === "free") {
        setDisplay("Free plan");
        return;
      }
      if (!user.billingDate) {
        setDisplay("Not started");
        return;
      }

      const BILLING_CYCLE_MS = 30 * 24 * 60 * 60 * 1000;
      const billingStart = new Date(user.billingDate).getTime();
      if (Number.isNaN(billingStart)) {
        setDisplay("Invalid date");
        return;
      }

      const billingEndsAt = billingStart + BILLING_CYCLE_MS;
      const remainingMs = billingEndsAt - Date.now();
      if (remainingMs <= 0) {
        setDisplay("Expired");
        return;
      }

      const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;

      if (days > 0) {
        setDisplay(`${days}d ${hours}h left`);
      } else {
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setDisplay(`${hours}h ${minutes}m left`);
      }
    };

    updateDisplay();
    const interval = setInterval(updateDisplay, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [user]);

  return (
    <span style={{ color: display === "Expired" ? "#f87171" : "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, whiteSpace: "nowrap", display: "block" }}>
      {display}
    </span>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user, onSave, onClose }: { user: User; onSave: (id: string, updates: Partial<User>) => void; onClose: () => void }) {
  const [draft, setDraft] = useState({ ...user });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f1117", border: "1px solid #1e2330",
          borderRadius: 12, padding: 28, width: "100%", maxWidth: 440,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, margin: 0 }}>Edit User</p>
            <p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>{user.email}</p>
          </div>
          <button onClick={onClose} style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <IconX />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Plan */}
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Plan</span>
            <select
              value={draft.plan}
              onChange={(e) => setDraft({ ...draft, plan: e.target.value as User["plan"] })}
              style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </label>

          {/* Usage / Limit */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Usage</span>
              <input
                type="number"
                value={draft.usage}
                onChange={(e) => setDraft({ ...draft, usage: Number(e.target.value) })}
                style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Limit</span>
              <input
                type="number"
                value={draft.limit}
                onChange={(e) => setDraft({ ...draft, limit: Number(e.target.value) })}
                style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
              />
            </label>
          </div>

          {/* Active */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div
              onClick={() => setDraft({ ...draft, active: !draft.active })}
              style={{
                width: 38, height: 20, borderRadius: 10,
                background: draft.active ? "#059669" : "#1e2330",
                border: `1px solid ${draft.active ? "#047857" : "#2d3548"}`,
                position: "relative", cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 2, left: draft.active ? 18 : 2,
                width: 14, height: 14, borderRadius: "50%",
                background: draft.active ? "#fff" : "#64748b",
                transition: "left 0.2s",
              }} />
            </div>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>Account Active</span>
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "1px solid #2d3548", color: "#94a3b8",
              borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(user._id, { plan: draft.plan, active: draft.active, usage: draft.usage, limit: draft.limit }); onClose(); }}
            style={{
              background: "#059669", border: "none", color: "#fff",
              borderRadius: 6, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email Composer Modal ────────────────────────────────────────────────────
function EmailComposerModal({
  mode,
  targetUser,
  audienceFilter,
  filteredCount,
  subject,
  html,
  sending,
  onSubjectChange,
  onHtmlChange,
  onSend,
  onClose,
}: {
  mode: "single" | "all";
  targetUser: User | null;
  audienceFilter: EmailAudienceFilter;
  filteredCount: number;
  subject: string;
  html: string;
  sending: boolean;
  onSubjectChange: (value: string) => void;
  onHtmlChange: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
}) {
  const title = mode === "all" ? "Send Product Email to Audience" : "Send Product Email";
  const recipientText = mode === "all"
    ? `${getEmailAudienceLabel(audienceFilter)} (${filteredCount})`
    : targetUser?.email || "Selected user";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110,
        backdropFilter: "blur(4px)", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f1117", border: "1px solid #1e2330",
          borderRadius: 12, padding: 24, width: "100%", maxWidth: 680,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, margin: 0 }}>{title}</p>
            <p style={{ color: "#64748b", fontSize: 12, margin: "5px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
              Recipient: {recipientText}
            </p>
          </div>
          <button onClick={onClose} style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <IconX />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Subject</span>
            <input
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="New updates in IRCTC Connect"
              style={{
                background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0",
                borderRadius: 6, padding: "9px 12px", fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Raw HTML</span>
            <textarea
              value={html}
              onChange={(e) => onHtmlChange(e.target.value)}
              rows={12}
              placeholder="<h1>Product Update</h1><p>Share your release notes here...</p>"
              style={{
                background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0",
                borderRadius: 6, padding: "11px 12px", fontSize: 12, resize: "vertical",
                fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5,
              }}
            />
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 18 }}>
          <p style={{ color: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
            HTML is sent as-is. Keep links and styles email-safe.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              disabled={sending}
              style={{
                background: "none", border: "1px solid #2d3548", color: "#94a3b8",
                borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: sending ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              disabled={sending}
              style={{
                background: sending ? "#1a1f2e" : "#059669", border: "none", color: sending ? "#64748b" : "#fff",
                borderRadius: 6, padding: "8px 18px", fontSize: 13, cursor: sending ? "not-allowed" : "pointer", fontWeight: 700,
              }}
            >
              {sending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [isAdmin, setIsAdmin]       = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab]   = useState<"users" | "orders" | "unpaid" | "plans" | "email" | "issues">("users");
  const [editingUser, setEditingUser]   = useState<User | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [clearingUnpaid, setClearingUnpaid] = useState(false);
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [emailScope, setEmailScope] = useState<"single" | "all">("single");
  const [emailAudienceFilter, setEmailAudienceFilter] = useState<EmailAudienceFilter>("all_users");
  const [emailTargetUser, setEmailTargetUser] = useState<User | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailHtml, setEmailHtml] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [planDraft, setPlanDraft] = useState<PlansConfig | null>(null);
  const [savingPlans, setSavingPlans] = useState(false);
  const [plansFeedback, setPlansFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── SWR hooks — only active once authenticated ──────────────────────────────
  const {
    data: usersData,
    isLoading: usersLoading,
    isValidating: usersValidating,
    mutate: mutateUsers,
  } = useSWR<{ success: boolean; users: User[] }>(
    isAdmin ? "/api/admin/users" : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 60_000 }
  );

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isValidating: ordersValidating,
    mutate: mutateOrders,
  } = useSWR<{ success: boolean; orders: Order[] }>(
    isAdmin ? "/api/admin/orders" : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 60_000 }
  );

  const {
    data: issuesData,
    isLoading: issuesLoading,
    isValidating: issuesValidating,
    mutate: mutateIssues,
    error: issuesError,
  } = useSWR<{
    success: boolean;
    owner: string;
    repo: string;
    windowDays: number;
    newCount: number;
    updatedCount: number;
    issues: GithubIssue[];
  }>(
    isAdmin ? "/api/admin/issues" : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 60_000 }
  );

  const {
    data: plansData,
    isLoading: plansLoading,
    isValidating: plansValidating,
    mutate: mutatePlans,
  } = useSWR<{ success: boolean; config: PlansConfig }>(
    isAdmin ? "/api/admin/plans" : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 60_000 }
  );

  const users      = usersData?.users ?? [];
  const paidOrders = (ordersData?.orders ?? []).filter((o) => o.status === "paid");
  const unpaidOrders = (ordersData?.orders ?? []).filter((o) => o.status !== "paid");
  const issues = issuesData?.issues ?? [];
  const filteredEmailUsers = users.filter((user) => matchesEmailAudienceFilter(user, emailAudienceFilter));
  const dataLoading = usersValidating || ordersValidating || issuesValidating || plansValidating;

  // ── Check session on mount ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/verify");
        if (res.ok) setIsAdmin(true);
      } catch (e) { console.error(e); }
      finally { setAuthLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (plansData?.config) {
      setPlanDraft(plansData.config);
    }
  }, [plansData]);

  const onGoogleLogin = async () => {
    setLoginError("");
    setAuthLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const email = credential.user.email?.trim().toLowerCase();
      const name  = credential.user.displayName?.trim();
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Admin login failed");
      setIsAdmin(true);
      // SWR keys become non-null now — data fetches automatically
    } catch (err: unknown) {
      setLoginError(getErrorMessage(err, "Login failed"));
    } finally { setAuthLoading(false); }
  };

  // Optimistic update: patch cache instantly, revalidate after PUT
  const updateUser = async (id: string, updates: Partial<User>) => {
    // Optimistically update local cache
    await mutateUsers(
      (prev) => prev
        ? { ...prev, users: prev.users.map((u) => u._id === id ? { ...u, ...updates } : u) }
        : prev,
      false
    );
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, ...updates }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (e) {
      console.error(e);
    } finally {
      // Revalidate to sync with server truth
      mutateUsers();
    }
  };

  const refreshAll = () => { mutateUsers(); mutateOrders(); mutateIssues(); mutatePlans(); };

  const clearAllUnpaidOrders = async () => {
    if (unpaidOrders.length === 0 || clearingUnpaid) return;

    const confirmed = window.confirm(
      `Delete ${unpaidOrders.length} unpaid order(s) older than 24 hours?`
    );
    if (!confirmed) return;

    setClearingUnpaid(true);
    try {
      const res = await fetch("/api/admin/remove-unpaid", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to clear unpaid orders");
      }
      await mutateOrders();
      window.alert(`Removed ${data.deletedCount ?? 0} unpaid order(s).`);
    } catch (error: unknown) {
      window.alert(getErrorMessage(error, "Failed to clear unpaid orders"));
    } finally {
      setClearingUnpaid(false);
    }
  };

  const openEmailComposer = (scope: "single" | "all", user?: User) => {
    setEmailScope(scope);
    setEmailTargetUser(scope === "single" ? (user || null) : null);
    setEmailSubject("");
    setEmailHtml("");
    setEmailComposerOpen(true);
  };

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailHtml.trim()) {
      setEmailFeedback({ type: "error", message: "Subject and raw HTML are required." });
      return;
    }

    if (emailScope === "single" && !emailTargetUser?._id) {
      setEmailFeedback({ type: "error", message: "No user selected for individual email." });
      return;
    }

    if (emailScope === "all" && filteredEmailUsers.length === 0) {
      setEmailFeedback({ type: "error", message: "No users match the selected filter." });
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: emailScope,
          userId: emailScope === "single" ? emailTargetUser?._id : undefined,
          filter: emailScope === "all" ? emailAudienceFilter : undefined,
          subject: emailSubject,
          html: emailHtml,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send email");
      }

      setEmailFeedback({ type: "success", message: data.message || "Email sent successfully." });
      setEmailComposerOpen(false);
    } catch (error: unknown) {
      setEmailFeedback({ type: "error", message: getErrorMessage(error, "Failed to send email.") });
    } finally {
      setSendingEmail(false);
    }
  };

  const savePlansConfig = async () => {
    if (!planDraft || savingPlans) return;

    setSavingPlans(true);
    setPlansFeedback(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planDraft),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save plans");
      }

      setPlanDraft(data.config);
      setPlansFeedback({ type: "success", message: "Plans updated successfully." });
      mutatePlans();
    } catch (error: unknown) {
      setPlansFeedback({ type: "error", message: getErrorMessage(error, "Failed to save plans.") });
    } finally {
      setSavingPlans(false);
    }
  };

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (authLoading) return <Loader text="Authenticating..." />;
  if (isAdmin && (usersLoading || ordersLoading || issuesLoading || plansLoading)) return <Loader text="Fetching data..." />;

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #070910; }
        `}</style>
        <main style={{
          minHeight: "100vh", background: "#070910",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Syne', sans-serif",
        }}>
          {/* Ambient glow */}
          <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
          </div>

          <div style={{
            width: "100%", maxWidth: 380, position: "relative",
            background: "linear-gradient(145deg, #0f1117 0%, #0a0d13 100%)",
            border: "1px solid #1e2330", borderRadius: 16, padding: 40,
            boxShadow: "0 0 0 1px #0d1117, 0 32px 64px rgba(0,0,0,0.6)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "linear-gradient(135deg, #059669, #047857)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(5,150,105,0.3)",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Admin Portal</h1>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>Restricted access only</p>
            </div>

            {loginError && (
              <div style={{ background: "#2a0f0f", border: "1px solid #4a1f1f", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
                <p style={{ color: "#f87171", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{loginError}</p>
              </div>
            )}

            <button
              onClick={onGoogleLogin}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                background: "#f8fafc", border: "none", borderRadius: 8,
                padding: "11px 16px", cursor: "pointer", fontFamily: "'Syne', sans-serif",
                fontSize: 14, fontWeight: 700, color: "#0f172a",
                transition: "transform 0.1s, box-shadow 0.2s",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              <IconGoogle />
              Continue with Google
            </button>
          </div>
        </main>
      </>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const totalRevenue  = paidOrders.reduce((acc, o) => acc + o.amount, 0);
  const creditedCount = paidOrders.filter((o) => o.credited).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070910; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f1117; }
        ::-webkit-scrollbar-thumb { background: #2d3548; border-radius: 3px; }
        .row-hover:hover { background: rgba(255,255,255,0.02) !important; }
        .action-btn:hover { background: #2d3548 !important; color: #e2e8f0 !important; }
        .tab-btn { transition: all 0.2s; }
      `}</style>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={updateUser}
          onClose={() => setEditingUser(null)}
        />
      )}
      {viewingOrder && (
        <OrderModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
      )}
      {emailComposerOpen && (
        <EmailComposerModal
          mode={emailScope}
          targetUser={emailTargetUser}
          audienceFilter={emailAudienceFilter}
          filteredCount={filteredEmailUsers.length}
          subject={emailSubject}
          html={emailHtml}
          sending={sendingEmail}
          onSubjectChange={setEmailSubject}
          onHtmlChange={setEmailHtml}
          onSend={sendEmail}
          onClose={() => setEmailComposerOpen(false)}
        />
      )}

      <main style={{ minHeight: "100vh", background: "#070910", fontFamily: "'Syne', sans-serif", color: "#e2e8f0" }}>
        {/* Header */}
        <header style={{
          borderBottom: "1px solid #1e2330",
          background: "rgba(7,9,16,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #059669, #047857)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: "#f1f5f9" }}>Admin</span>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#334155", padding: "1px 6px", background: "#1e2330", borderRadius: 4 }}>CONSOLE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {dataLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", animation: "ping 1s infinite" }} />
                  <span style={{ color: "#64748b", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>Syncing</span>
                </div>
              )}
              <button
                onClick={refreshAll}
                style={{
                  background: "#1a1f2e", border: "1px solid #2d3548", color: "#94a3b8",
                  borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 28px" }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Users", value: users.length, sub: `${users.filter((u) => u.active).length} active`, color: "#6ee7b7" },
              { label: "Pro / Enterprise", value: users.filter((u) => u.plan !== "free").length, sub: "paid plans", color: "#a78bfa" },
              { label: "Paid Orders", value: paidOrders.length, sub: `${creditedCount} credited`, color: "#60a5fa" },
              { label: "Total Revenue", value: `₹${(totalRevenue).toFixed(0)}`, sub: "from paid orders", color: "#fbbf24" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#0f1117", border: "1px solid #1e2330", borderRadius: 10, padding: "18px 20px" }}>
                <p style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>{s.label}</p>
                <p style={{ fontSize: 26, fontFamily: "'JetBrains Mono', monospace" ,fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</p>
                <p style={{ color: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#0f1117", border: "1px solid #1e2330", borderRadius: 8, padding: 4, width: "fit-content" }}>
            {(["users", "orders", "unpaid", "plans", "email", "issues"] as const).map((tab) => (
              <button
                key={tab}
                className="tab-btn"
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? "#1e2a3a" : "none",
                  border: activeTab === tab ? "1px solid #2d4060" : "1px solid transparent",
                  color: activeTab === tab ? "#60a5fa" : "#64748b",
                  borderRadius: 6, padding: "6px 18px", fontSize: 13,
                  cursor: "pointer", fontWeight: 700, letterSpacing: "0.02em",
                  textTransform: "capitalize",
                }}
              >
                {tab === "users"
                  ? `Users (${users.length})`
                  : tab === "orders"
                  ? `Paid Orders (${paidOrders.length})`
                  : tab === "unpaid"
                  ? `Unpaid Orders (${unpaidOrders.length})`
                  : tab === "plans"
                  ? "Plans"
                  : tab === "email"
                  ? "Email"
                  : `Issues (${issues.length})`}
              </button>
            ))}
          </div>

          {activeTab === "email" && emailFeedback && (
            <div
              style={{
                marginBottom: 14,
                padding: "10px 14px",
                borderRadius: 8,
                background: emailFeedback.type === "success" ? "#0f2a1d" : "#2a0f0f",
                border: `1px solid ${emailFeedback.type === "success" ? "#1a4731" : "#4a1f1f"}`,
              }}
            >
              <p style={{ color: emailFeedback.type === "success" ? "#6ee7b7" : "#f87171", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                {emailFeedback.message}
              </p>
            </div>
          )}

          {activeTab === "plans" && plansFeedback && (
            <div
              style={{
                marginBottom: 14,
                padding: "10px 14px",
                borderRadius: 8,
                background: plansFeedback.type === "success" ? "#0f2a1d" : "#2a0f0f",
                border: `1px solid ${plansFeedback.type === "success" ? "#1a4731" : "#4a1f1f"}`,
              }}
            >
              <p style={{ color: plansFeedback.type === "success" ? "#6ee7b7" : "#f87171", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                {plansFeedback.message}
              </p>
            </div>
          )}

          {activeTab === "issues" && issuesError && (
            <div
              style={{
                marginBottom: 14,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#2a0f0f",
                border: "1px solid #4a1f1f",
              }}
            >
              <p style={{ color: "#f87171", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                {getErrorMessage(issuesError, "Failed to fetch GitHub issues")}
              </p>
            </div>
          )}

          {/* Users Table */}
          {activeTab === "users" && (
            <div style={{ background: "#0f1117", border: "1px solid #1e2330", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#0a0d13", borderBottom: "1px solid #1e2330" }}>
                      {["User", "Plan", "Status", "Usage", "Billing Left", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="row-hover" style={{ borderBottom: "1px solid #141820", transition: "background 0.15s" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: `hsl(${u.email.charCodeAt(0) * 7 % 360}, 60%, 20%)`,
                              border: `1px solid hsl(${u.email.charCodeAt(0) * 7 % 360}, 60%, 30%)`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, fontWeight: 700, color: `hsl(${u.email.charCodeAt(0) * 7 % 360}, 70%, 65%)`,
                              flexShrink: 0,
                            }}>
                              {(u.name || u.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{u.name || "—"}</p>
                              <p style={{ color: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}><PlanBadge plan={u.plan} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: u.active ? "#34d399" : "#64748b", flexShrink: 0 }} />
                            <span style={{ color: u.active ? "#6ee7b7" : "#64748b" }}>{u.active ? "Active" : "Inactive"}</span>
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                              <span style={{ color: "#94a3b8" }}>{u.usage || 0}</span>
                              <span style={{ color: "#334155" }}>/ {u.limit || 0}</span>
                            </div>
                            <div style={{ height: 3, background: "#1e2330", borderRadius: 2, width: 100, overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 2, background: u.limit && u.usage / u.limit > 0.8 ? "#f97316" : "#34d399", width: `${Math.min(100, u.limit ? (u.usage / u.limit) * 100 : 0)}%`, transition: "width 0.3s" }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <BillingTimer user={u} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            className="action-btn"
                            onClick={() => setEditingUser(u)}
                            title="Edit user"
                            style={{
                              background: "#1a1f2e", border: "1px solid #2d3548",
                              color: "#64748b", borderRadius: 6, padding: "6px 10px",
                              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                              fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                              transition: "all 0.15s",
                            }}
                          >
                            <IconEdit />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#334155", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Table */}
          {activeTab === "orders" && (
            <div style={{ background: "#0f1117", border: "1px solid #1e2330", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#0a0d13", borderBottom: "1px solid #1e2330" }}>
                      {["Order ID", "User", "Amount", "Status", "Credited", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paidOrders.map((o) => (
                      <tr key={o._id} className="row-hover" style={{ borderBottom: "1px solid #141820", transition: "background 0.15s" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", fontSize: 11 }}>{o.orderId}</span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#cbd5e1", fontSize: 13 }}>
                          {o.userId?.email || <span style={{ color: "#334155" }}>N/A</span>}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ color: "#6ee7b7", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 13 }}>
                            ₹{(o.amount ).toFixed(2)}
                          </span>
                          <span style={{ color: "#334155", fontSize: 10, marginLeft: 4, fontFamily: "'JetBrains Mono', monospace" }}>{o.currency}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}><StatusBadge status={o.status} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                            {o.credited
                              ? <><span style={{ color: "#34d399" }}><IconCheck /></span><span style={{ color: "#6ee7b7" }}>Yes</span></>
                              : <><span style={{ color: "#64748b" }}><IconX /></span><span style={{ color: "#64748b" }}>No</span></>
                            }
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            className="action-btn"
                            onClick={() => setViewingOrder(o)}
                            style={{
                              background: "#1a1f2e", border: "1px solid #2d3548",
                              color: "#64748b", borderRadius: 6, padding: "6px 10px",
                              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                              fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                              transition: "all 0.15s",
                            }}
                          >
                            <IconEye />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {paidOrders.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#334155", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>No paid orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Unpaid Orders Table */}
          {activeTab === "unpaid" && (
            <div style={{ background: "#0f1117", border: "1px solid #1e2330", borderRadius: 12, overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: "1px solid #1e2330",
                  background: "#0a0d13",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  All unpaid orders (not paid)
                </span>
                <button
                  onClick={clearAllUnpaidOrders}
                  disabled={clearingUnpaid || unpaidOrders.length === 0}
                  style={{
                    background: clearingUnpaid || unpaidOrders.length === 0 ? "#1a1f2e" : "#2a0f0f",
                    border: `1px solid ${clearingUnpaid || unpaidOrders.length === 0 ? "#2d3548" : "#4a1f1f"}`,
                    color: clearingUnpaid || unpaidOrders.length === 0 ? "#64748b" : "#f87171",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    cursor: clearingUnpaid || unpaidOrders.length === 0 ? "not-allowed" : "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  title="Delete unpaid orders older than 24 hours"
                >
                  {clearingUnpaid ? "Clearing..." : "Clear Unpaid > 24h"}
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#0a0d13", borderBottom: "1px solid #1e2330" }}>
                      {["Order ID", "User", "Amount", "Status", "Credited", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidOrders.map((o) => (
                      <tr key={o._id} className="row-hover" style={{ borderBottom: "1px solid #141820", transition: "background 0.15s" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", fontSize: 11 }}>{o.orderId}</span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#cbd5e1", fontSize: 13 }}>
                          {o.userId?.email || <span style={{ color: "#334155" }}>N/A</span>}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ color: "#6ee7b7", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 13 }}>
                            ₹{(o.amount ).toFixed(2)}
                          </span>
                          <span style={{ color: "#334155", fontSize: 10, marginLeft: 4, fontFamily: "'JetBrains Mono', monospace" }}>{o.currency}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}><StatusBadge status={o.status} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                            {o.credited
                              ? <><span style={{ color: "#34d399" }}><IconCheck /></span><span style={{ color: "#6ee7b7" }}>Yes</span></>
                              : <><span style={{ color: "#64748b" }}><IconX /></span><span style={{ color: "#64748b" }}>No</span></>
                            }
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            className="action-btn"
                            onClick={() => setViewingOrder(o)}
                            style={{
                              background: "#1a1f2e", border: "1px solid #2d3548",
                              color: "#64748b", borderRadius: 6, padding: "6px 10px",
                              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                              fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                              transition: "all 0.15s",
                            }}
                          >
                            <IconEye />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {unpaidOrders.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#334155", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>No unpaid orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Plans Config */}
          {activeTab === "plans" && planDraft && (
            <div style={{ background: "#0f1117", border: "1px solid #1e2330", borderRadius: 12, overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: "1px solid #1e2330",
                  background: "#0a0d13",
                  gap: 12,
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  Manage pricing plans and offer settings shown on the pricing page
                </span>
                <button
                  onClick={savePlansConfig}
                  disabled={savingPlans}
                  style={{
                    background: savingPlans ? "#1a1f2e" : "#0f2a1d",
                    border: `1px solid ${savingPlans ? "#2d3548" : "#1a4731"}`,
                    color: savingPlans ? "#64748b" : "#6ee7b7",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    cursor: savingPlans ? "not-allowed" : "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                  }}
                >
                  {savingPlans ? "Saving..." : "Save Plans"}
                </button>
              </div>

              <div style={{ padding: 16, borderBottom: "1px solid #1e2330", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Offer Ends At (ISO)</span>
                  <input
                    value={planDraft.offerEndsAt || ""}
                    onChange={(e) => setPlanDraft({ ...planDraft, offerEndsAt: e.target.value || null })}
                    placeholder="2026-04-10T23:59:59+05:30"
                    style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "9px 10px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Contact Email</span>
                  <input
                    value={planDraft.contactEmail}
                    onChange={(e) => setPlanDraft({ ...planDraft, contactEmail: e.target.value })}
                    placeholder="owner@example.com"
                    style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "9px 10px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </label>
              </div>

              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                {planDraft.plans.map((plan, index) => (
                  <div key={plan.id} style={{ border: "1px solid #1e2330", borderRadius: 10, padding: 14, background: "#0b0f16" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700 }}>{plan.name} ({plan.planType})</p>
                      <span style={{ color: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>ID: {plan.id}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 10 }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Name</span>
                        <input
                          value={plan.name}
                          onChange={(e) =>
                            setPlanDraft({
                              ...planDraft,
                              plans: planDraft.plans.map((item, i) => (i === index ? { ...item, name: e.target.value } : item)),
                            })
                          }
                          style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 9px", fontSize: 12 }}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Offer Price</span>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) =>
                            setPlanDraft({
                              ...planDraft,
                              plans: planDraft.plans.map((item, i) => (i === index ? { ...item, price: Number(e.target.value) } : item)),
                            })
                          }
                          style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 9px", fontSize: 12 }}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Original Price</span>
                        <input
                          type="number"
                          value={plan.originalPrice ?? ""}
                          onChange={(e) =>
                            setPlanDraft({
                              ...planDraft,
                              plans: planDraft.plans.map((item, i) =>
                                i === index
                                  ? { ...item, originalPrice: e.target.value === "" ? null : Number(e.target.value) }
                                  : item
                              ),
                            })
                          }
                          style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 9px", fontSize: 12 }}
                        />
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 10 }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Button Text</span>
                        <input
                          value={plan.buttonText}
                          onChange={(e) =>
                            setPlanDraft({
                              ...planDraft,
                              plans: planDraft.plans.map((item, i) => (i === index ? { ...item, buttonText: e.target.value } : item)),
                            })
                          }
                          style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 9px", fontSize: 12 }}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Usage Limit</span>
                        <input
                          type="number"
                          value={plan.limit ?? 0}
                          onChange={(e) =>
                            setPlanDraft({
                              ...planDraft,
                              plans: planDraft.plans.map((item, i) => (i === index ? { ...item, limit: Number(e.target.value) } : item)),
                            })
                          }
                          style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 9px", fontSize: 12 }}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>User Plan</span>
                        <select
                          value={plan.userPlan || ""}
                          onChange={(e) =>
                            setPlanDraft({
                              ...planDraft,
                              plans: planDraft.plans.map((item, i) =>
                                i === index
                                  ? { ...item, userPlan: e.target.value === "" ? null : (e.target.value as "pro" | "enterprise") }
                                  : item
                              ),
                            })
                          }
                          style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 9px", fontSize: 12 }}
                        >
                          <option value="">None</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </label>
                    </div>

                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Description</span>
                      <textarea
                        rows={2}
                        value={plan.description}
                        onChange={(e) =>
                          setPlanDraft({
                            ...planDraft,
                            plans: planDraft.plans.map((item, i) => (i === index ? { ...item, description: e.target.value } : item)),
                          })
                        }
                        style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 9px", fontSize: 12, resize: "vertical" }}
                      />
                    </label>

                    <label style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                      <span style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Features (one per line)</span>
                      <textarea
                        rows={4}
                        value={(plan.features || []).map((feature) => feature.text).join("\n")}
                        onChange={(e) =>
                          setPlanDraft({
                            ...planDraft,
                            plans: planDraft.plans.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    features: e.target.value
                                      .split("\n")
                                      .map((line) => line.trim())
                                      .filter(Boolean)
                                      .map((text) => ({ text, highlight: false })),
                                  }
                                : item
                            ),
                          })
                        }
                        style={{ background: "#1a1f2e", border: "1px solid #2d3548", color: "#e2e8f0", borderRadius: 6, padding: "8px 9px", fontSize: 12, resize: "vertical", fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Table */}
          {activeTab === "email" && (
            <div style={{ background: "#0f1117", border: "1px solid #1e2330", borderRadius: 12, overflow: "hidden" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderBottom: "1px solid #1e2330", background: "#0a0d13",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                    Send product info emails individually or in batches by audience filter
                  </span>
                  <select
                    value={emailAudienceFilter}
                    onChange={(e) => setEmailAudienceFilter(e.target.value as EmailAudienceFilter)}
                    style={{
                      background: "#1a1f2e",
                      border: "1px solid #2d3548",
                      color: "#e2e8f0",
                      borderRadius: 6,
                      padding: "6px 9px",
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {EMAIL_AUDIENCE_FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span style={{ color: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    Recipients: {filteredEmailUsers.length}
                  </span>
                </div>
                <button
                  onClick={() => openEmailComposer("all")}
                  disabled={filteredEmailUsers.length === 0}
                  style={{
                    background: filteredEmailUsers.length === 0 ? "#1a1f2e" : "#0f2233",
                    border: `1px solid ${filteredEmailUsers.length === 0 ? "#2d3548" : "#1a3a5c"}`,
                    color: filteredEmailUsers.length === 0 ? "#64748b" : "#60a5fa",
                    borderRadius: 6, padding: "6px 12px", fontSize: 12,
                    cursor: filteredEmailUsers.length === 0 ? "not-allowed" : "pointer",
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                  }}
                >
                  Send to {getEmailAudienceLabel(emailAudienceFilter)}
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#0a0d13", borderBottom: "1px solid #1e2330" }}>
                      {["User", "Plan", "Status", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmailUsers.map((u) => (
                      <tr key={u._id} className="row-hover" style={{ borderBottom: "1px solid #141820", transition: "background 0.15s" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: 8,
                              background: `hsl(${u.email.charCodeAt(0) * 7 % 360}, 60%, 20%)`,
                              border: `1px solid hsl(${u.email.charCodeAt(0) * 7 % 360}, 60%, 30%)`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, fontWeight: 700, color: `hsl(${u.email.charCodeAt(0) * 7 % 360}, 70%, 65%)`,
                              flexShrink: 0,
                            }}>
                              {(u.name || u.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{u.name || "—"}</p>
                              <p style={{ color: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}><PlanBadge plan={u.plan} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: u.active ? "#34d399" : "#64748b", flexShrink: 0 }} />
                            <span style={{ color: u.active ? "#6ee7b7" : "#64748b" }}>{u.active ? "Active" : "Inactive"}</span>
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            className="action-btn"
                            onClick={() => openEmailComposer("single", u)}
                            style={{
                              background: "#1a1f2e", border: "1px solid #2d3548",
                              color: "#64748b", borderRadius: 6, padding: "6px 10px",
                              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                              fontSize: 12, fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s",
                            }}
                          >
                            <span>Send Email</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredEmailUsers.length === 0 && (
                      <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#334155", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>No users match this filter</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Issues Table */}
          {activeTab === "issues" && (
            <div style={{ background: "#0f1117", border: "1px solid #1e2330", borderRadius: 12, overflow: "hidden" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderBottom: "1px solid #1e2330", background: "#0a0d13",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  Recent new / updated GitHub issues (last {issuesData?.windowDays ?? 14} days)
                </span>
                <span style={{ color: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  New: {issuesData?.newCount ?? 0} | Updated: {issuesData?.updatedCount ?? 0}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#0a0d13", borderBottom: "1px solid #1e2330" }}>
                      {["Issue", "State", "Labels", "Updated", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue.id} className="row-hover" style={{ borderBottom: "1px solid #141820", transition: "background 0.15s" }}>
                        <td style={{ padding: "14px 16px", minWidth: 320 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>
                              #{issue.number} {issue.title}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ color: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                                @{issue.author}
                              </span>
                              {issue.isNew && (
                                <span style={{ background: "#0f2a1d", color: "#6ee7b7", border: "1px solid #1a4731", borderRadius: 999, padding: "2px 8px", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                                  NEW
                                </span>
                              )}
                              {issue.isRecentlyUpdated && (
                                <span style={{ background: "#0f2233", color: "#60a5fa", border: "1px solid #1a3a5c", borderRadius: 999, padding: "2px 8px", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                                  UPDATED
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <StatusBadge status={issue.state === "open" ? "active" : "expired"} />
                        </td>
                        <td style={{ padding: "14px 16px", minWidth: 210 }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {issue.labels.slice(0, 3).map((label) => (
                              <span
                                key={`${issue.id}-${label.name}`}
                                style={{
                                  background: "#1a1f2e",
                                  border: `1px solid #${label.color}`,
                                  color: "#cbd5e1",
                                  borderRadius: 999,
                                  padding: "2px 8px",
                                  fontSize: 10,
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                {label.name}
                              </span>
                            ))}
                            {issue.labels.length === 0 && (
                              <span style={{ color: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>—</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", minWidth: 175 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                              {formatCompactDate(issue.updatedAt)}
                            </span>
                            <span style={{ color: "#475569", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                              Created: {formatCompactDate(issue.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <a
                            className="action-btn"
                            href={issue.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: "#1a1f2e", border: "1px solid #2d3548",
                              color: "#64748b", borderRadius: 6, padding: "6px 10px",
                              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5,
                              fontSize: 12, fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s",
                              textDecoration: "none",
                            }}
                          >
                            Open
                          </a>
                        </td>
                      </tr>
                    ))}
                    {issues.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#334155", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>No recent new or updated issues found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
