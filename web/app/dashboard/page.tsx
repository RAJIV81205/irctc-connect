"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import useSWR from "swr";
import SyntaxHighlighter from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { auth } from "../../lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────
type DbUser = {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  usage: number;
  limit: number;
  active: boolean;
  plan: string;
  billingDate?: string;
};

type Order = {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  credited: boolean;
  createdAt?: string;
};

type VerifyUserResponse = {
  success: boolean;
  user: DbUser;
  message?: string;
};

type UserOrdersResponse = {
  success: boolean;
  orders: Order[];
  message?: string;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || !data?.success) {
    throw new Error(data?.message || `Fetch failed: ${res.status}`);
  }

  return data as T;
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
      <p
        style={{
          color: "#94a3b8",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          letterSpacing: "0.08em",
        }}
      >
        {text}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconCopy = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconKey = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
const IconLogout = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconRefresh = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IconEye = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconShield = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ─── Plan Badge ───────────────────────────────────────────────────────────────
const PlanBadge = ({ plan }: { plan: string }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    free: { bg: "#1e2330", text: "#94a3b8", border: "#2d3548" },
    pro: { bg: "#0f2a1d", text: "#6ee7b7", border: "#1a4731" },
    enterprise: { bg: "#1a1060", text: "#a78bfa", border: "#2d1f8a" },
  };
  const s = styles[plan?.toLowerCase()] ?? styles.free;
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {plan}
    </span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<
    string,
    { bg: string; text: string; border: string; dot: string }
  > = {
    paid: { bg: "#0f2a1d", text: "#6ee7b7", border: "#1a4731", dot: "#34d399" },
    created: {
      bg: "#1e2330",
      text: "#94a3b8",
      border: "#2d3548",
      dot: "#64748b",
    },
    failed: {
      bg: "#2a0f0f",
      text: "#f87171",
      border: "#4a1f1f",
      dot: "#ef4444",
    },
    cancelled: {
      bg: "#2a1f0f",
      text: "#fb923c",
      border: "#4a3a1f",
      dot: "#f97316",
    },
    expired: {
      bg: "#1e2330",
      text: "#64748b",
      border: "#2d3548",
      dot: "#475569",
    },
  };
  const s = styles[status] ?? styles.created;
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        padding: "3px 10px",
        borderRadius: 4,
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {status.toUpperCase()}
    </span>
  );
};

// ─── Billing Timer ────────────────────────────────────────────────────────────
function useBillingTimer(user: DbUser | null) {
  const [display, setDisplay] = useState("");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      if (!user) {
        setDisplay("Not started");
        setPct(0);
        return;
      }
      if (user.plan === "free") {
        setDisplay("Free plan");
        setPct(100);
        return;
      }
      if (!user.billingDate) {
        setDisplay("Not started");
        setPct(0);
        return;
      }

      const CYCLE = 30 * 24 * 60 * 60 * 1000;
      const start = new Date(user.billingDate).getTime();
      if (Number.isNaN(start)) {
        setDisplay("Invalid date");
        setPct(0);
        return;
      }

      const end = start + CYCLE;
      const remaining = end - Date.now();
      if (remaining <= 0) {
        setDisplay("Expired");
        setPct(0);
        return;
      }

      setPct((remaining / CYCLE) * 100);
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      setDisplay(
        days > 0
          ? `${days}d ${hours}h left`
          : `${hours}h ${Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))}m left`,
      );
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [user?.plan, user?.billingDate]);

  const color =
    display === "Expired"
      ? "#f87171"
      : pct > 50
        ? "#34d399"
        : pct > 20
          ? "#fbbf24"
          : "#f87171";

  return { display, pct, color };
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f1117",
          border: "1px solid #1e2330",
          borderRadius: 12,
          padding: 28,
          width: "100%",
          maxWidth: 480,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>
            Order Details
          </span>
          <button
            onClick={onClose}
            style={{
              color: "#64748b",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <IconX />
          </button>
        </div>
        {[
          ["Order ID", order.orderId],
          ["Amount", `₹${order.amount.toFixed(2)} ${order.currency}`],
          ["Status", order.status],
          ["Credited", order.credited ? "Yes" : "No"],
          [
            "Date",
            order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-IN")
              : "—",
          ],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #1a1f2e",
            }}
          >
            <span
              style={{
                color: "#64748b",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {k}
            </span>
            <span style={{ color: "#cbd5e1", fontSize: 12 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "apikey" | "orders">(
    "overview",
  );
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
    isValidating: userValidating,
    mutate: mutateUser,
  } = useSWR<VerifyUserResponse>("/api/user/verify", fetcher, {
    revalidateOnFocus: true,
  });

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isValidating: ordersValidating,
    mutate: mutateOrders,
  } = useSWR<UserOrdersResponse>("/api/user/orders", fetcher, {
    revalidateOnFocus: true,
  });

  const dbUser = userData?.user ?? null;
  const orders = ordersData?.orders ?? [];
  const loading = userLoading || ordersLoading;
  const refreshing = userValidating || ordersValidating;
  const billing = useBillingTimer(dbUser);

  useEffect(() => {
    if (userError) {
      router.replace("/");
    }
  }, [userError, router]);

  const refreshAll = () => {
    mutateUser();
    mutateOrders();
  };

  const onLogout = async () => {
    try {
      await signOut(auth);
      await fetch("/api/user/verify", { method: "DELETE" });
    } catch {}
    router.replace("/");
  };

  const copyApiKey = () => {
    if (dbUser?.apiKey) {
      navigator.clipboard.writeText(dbUser.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <Loader text="Fetching your workspace..." />;
  if (!dbUser) return null;

  const usagePct = dbUser.limit > 0 ? (dbUser.usage / dbUser.limit) * 100 : 0;
  const usageLeft = Math.max(0, dbUser.limit - dbUser.usage);
  const usageColor =
    usagePct > 80 ? "#f97316" : usagePct > 60 ? "#fbbf24" : "#34d399";
  const maskedKey = dbUser.apiKey
    ? `${dbUser.apiKey.slice(0, 8)}${"•".repeat(24)}${dbUser.apiKey.slice(-6)}`
    : "";
  const paidOrders = orders.filter((o) => o.status === "paid");
  const totalSpent = paidOrders.reduce((a, o) => a + o.amount, 0);
  const usageExampleCode = `import {
  configure,
  checkPNRStatus,
  getTrainInfo,
  trackTrain,
} from "irctc-connect";

// Step 1: configure once with your API key
configure(process.env.IRCTC_API_KEY);

// Check PNR status
const pnrResult = await checkPNRStatus("1234567890");

// Get train information
const trainResult = await getTrainInfo("12345");

// Track Live Train
const liveTrainResult = await trackTrain("12345", "28-03-2026");`;
  const normalizedPlan = (dbUser.plan || "").toLowerCase();
  const isEnterpriseLikePlan =
    normalizedPlan === "enterprise" || normalizedPlan === "advanced";
  const planActionLabel = isEnterpriseLikePlan
    ? "Increase Limit"
    : "Upgrade Plan";
  const enterpriseContactUrl =
    process.env.NEXT_PUBLIC_PAYMENT_CONTACT_URL || "/pricing";

  const avatarHue = (dbUser.email.charCodeAt(0) * 7) % 360;

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
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ping { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .stat-card { animation: fadeUp 0.4s ease both; }
        .stat-card:nth-child(1){ animation-delay: 0.05s; }
        .stat-card:nth-child(2){ animation-delay: 0.1s; }
        .stat-card:nth-child(3){ animation-delay: 0.15s; }
        .stat-card:nth-child(4){ animation-delay: 0.2s; }
        .mobile-quick-links { display: none; }
        @media (max-width: 900px) {
          .dash-header-inner { padding: 0 14px !important; }
          .dash-shell { padding: 20px 14px !important; }
          .dash-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-overview-grid { grid-template-columns: 1fr !important; }
          .dash-tab-wrap { width: 100% !important; overflow-x: auto; }
          .dash-tab-wrap button { white-space: nowrap; }
          .dash-key-row { flex-direction: column; }
          .dash-key-row > button { width: 100%; justify-content: center; padding: 10px 14px !important; }
          .dash-usage-stats { grid-template-columns: 1fr !important; }
          .dash-header-actions { gap: 6px !important; }
          .dash-header-btn { padding: 6px 8px !important; }
          .mobile-hide { display: none; }
          .mobile-quick-links { display: flex; gap: 8px; margin-bottom: 14px; }
        }
        @media (max-width: 640px) {
          .dash-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {viewOrder && (
        <OrderModal order={viewOrder} onClose={() => setViewOrder(null)} />
      )}

      <main
        style={{
          minHeight: "100vh",
          background: "#070910",
          fontFamily: "'Syne', sans-serif",
          color: "#e2e8f0",
        }}
      >
        {/* ── Ambient glow ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "20%",
              width: 500,
              height: 300,
              background:
                "radial-gradient(ellipse, rgba(52,211,153,0.04) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              right: "15%",
              width: 400,
              height: 250,
              background:
                "radial-gradient(ellipse, rgba(96,165,250,0.04) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header
          style={{
            borderBottom: "1px solid #1e2330",
            background: "rgba(7,9,16,0.95)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            className="dash-header-inner"
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 60,
            }}
          >
            {/* Logo area */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "linear-gradient(135deg, #059669, #047857)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(5,150,105,0.3)",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#f1f5f9",
                }}
              >
                Dashboard
              </span>
            </div>

            {/* Right: refresh + avatar + logout */}
            <div className="dash-header-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {refreshing && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#34d399",
                      animation: "ping 1s infinite",
                    }}
                  />
                  <span
                    className="mobile-hide"
                    style={{
                      color: "#64748b",
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Syncing
                  </span>
                </div>
              )}
              <button
                className="dash-header-btn"
                onClick={refreshAll}
                style={{
                  background: "#1a1f2e",
                  border: "1px solid #2d3548",
                  color: "#94a3b8",
                  borderRadius: 6,
                  padding: "5px 12px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <IconRefresh />
                <span className="mobile-hide">Refresh</span>
              </button>

              <button
                className="dash-header-btn"
                onClick={onLogout}
                style={{
                  background: "#1a1f2e",
                  border: "1px solid #2d3548",
                  color: "#94a3b8",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <IconLogout />
                <span className="mobile-hide">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div
          className="dash-shell"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "28px 28px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="mobile-quick-links">
            <button
              onClick={() => router.push("/docs")}
              style={{
                flex: 1,
                background: "#1a1f2e",
                border: "1px solid #2d3548",
                color: "#94a3b8",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Docs
            </button>
            <button
              onClick={() => router.push("/pricing")}
              style={{
                flex: 1,
                background: "#1a1f2e",
                border: "1px solid #2d3548",
                color: "#94a3b8",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Pricing
            </button>
          </div>

          {/* Page title
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "-0.03em",
              }}
            >
              Dashboard
            </h1>
            <p
              style={{
                color: "#475569",
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                marginTop: 4,
              }}
            >
              {dbUser.email} ·{" "}
              <span style={{ color: dbUser.active ? "#34d399" : "#64748b" }}>
                {dbUser.active ? "● Active" : "○ Inactive"}
              </span>
            </p>
          </div> */}

          {/* ── Stats row ────────────────────────────────────────────────── */}
          <div
            className="dash-stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {[
              {
                label: "Current Plan",
                value: dbUser.plan.toUpperCase(),
                sub: dbUser.active ? "Account active" : "Inactive",
                color:
                  dbUser.plan === "enterprise"
                    ? "#a78bfa"
                    : dbUser.plan === "pro"
                      ? "#6ee7b7"
                      : "#94a3b8",
              },
              {
                label: "Requests Used",
                value: dbUser.usage.toLocaleString("en-IN"),
                sub: `of ${dbUser.limit.toLocaleString("en-IN")} total`,
                color: usageColor,
              },
              {
                label: "Requests Left",
                value: usageLeft.toLocaleString("en-IN"),
                sub: `${(100 - usagePct).toFixed(0)}% remaining`,
                color: "#60a5fa",
              },
              {
                label: "Billing Cycle",
                value: billing.display,
                sub: dbUser.billingDate
                  ? `since ${new Date(dbUser.billingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                  : "Not started",
                color: billing.color,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="stat-card"
                style={{
                  background: "#0f1117",
                  border: "1px solid #1e2330",
                  borderRadius: 10,
                  padding: "18px 20px",
                }}
              >
                <p
                  style={{
                    color: "#475569",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "'JetBrains Mono', monospace",
                    marginBottom: 8,
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: s.color,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    color: "#475569",
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: 6,
                  }}
                >
                  {s.sub}
                </p>
              </div>
            ))}
          </div>

          {/* ── Tabs ─────────────────────────────────────────────────────── */}
          <div
            className="dash-tab-wrap"
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 20,
              background: "#0f1117",
              border: "1px solid #1e2330",
              borderRadius: 8,
              padding: 4,
              width: "fit-content",
            }}
          >
            {(
              [
                { id: "overview", label: "Overview" },
                { id: "apikey", label: "API Key" },
                { id: "orders", label: `Orders (${orders.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? "#1e2a3a" : "none",
                  border:
                    activeTab === tab.id
                      ? "1px solid #2d4060"
                      : "1px solid transparent",
                  color: activeTab === tab.id ? "#60a5fa" : "#64748b",
                  borderRadius: 6,
                  padding: "6px 18px",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Overview ────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div
              className="dash-overview-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {/* Profile card */}
              <div
                style={{
                  background: "#0f1117",
                  border: "1px solid #1e2330",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <p
                  style={{
                    color: "#475569",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "'JetBrains Mono', monospace",
                    marginBottom: 16,
                  }}
                >
                  Profile
                </p>

                {/* Avatar row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `hsl(${avatarHue}, 60%, 18%)`,
                      border: `1px solid hsl(${avatarHue}, 60%, 28%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 800,
                      color: `hsl(${avatarHue}, 70%, 65%)`,
                    }}
                  >
                    {(dbUser.name || dbUser.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#e2e8f0",
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {dbUser.name || "—"}
                    </p>
                    <p
                      style={{
                        color: "#475569",
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        marginTop: 3,
                      }}
                    >
                      {dbUser.email}
                    </p>
                  </div>
                </div>

                {/* Details */}
                {[
                  { k: "Plan", v: <PlanBadge plan={dbUser.plan} /> },
                  {
                    k: "Status",
                    v: (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: dbUser.active ? "#34d399" : "#64748b",
                          }}
                        />
                        <span
                          style={{
                            color: dbUser.active ? "#6ee7b7" : "#64748b",
                          }}
                        >
                          {dbUser.active ? "Active" : "Inactive"}
                        </span>
                      </span>
                    ),
                  },
                  {
                    k: "Total Spent",
                    v: (
                      <span
                        style={{
                          color: "#6ee7b7",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        ₹{totalSpent.toFixed(2)}
                      </span>
                    ),
                  },
                ].map(({ k, v }) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderTop: "1px solid #141820",
                    }}
                  >
                    <span
                      style={{
                        color: "#475569",
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {k}
                    </span>
                    {v}
                  </div>
                ))}

                <button
                  onClick={() => {
                    if (isEnterpriseLikePlan) {
                      if (enterpriseContactUrl.startsWith("http")) {
                        window.open(
                          enterpriseContactUrl,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      } else {
                        router.push(enterpriseContactUrl);
                      }
                      return;
                    }
                    router.push("/pricing");
                  }}
                  style={{
                    marginTop: 18,
                    width: "100%",
                    background: isEnterpriseLikePlan ? "#0f2233" : "#0f2a1d",
                    border: `1px solid ${isEnterpriseLikePlan ? "#1a3a5c" : "#1a4731"}`,
                    color: isEnterpriseLikePlan ? "#60a5fa" : "#6ee7b7",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                  }}
                >
                  {planActionLabel}
                </button>
              </div>

              {/* Usage + Billing card */}
              <div
                style={{
                  background: "#0f1117",
                  border: "1px solid #1e2330",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <p
                  style={{
                    color: "#475569",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "'JetBrains Mono', monospace",
                    marginBottom: 20,
                  }}
                >
                  Usage & Billing
                </p>

                {/* Usage bar */}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: 12,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      API Requests
                    </span>
                    <span
                      style={{
                        color: usageColor,
                        fontSize: 12,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                      }}
                    >
                      {usagePct.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "#1e2330",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 3,
                        background: usageColor,
                        width: `${Math.min(100, usagePct)}%`,
                        transition: "width 0.6s ease",
                        boxShadow: `0 0 8px ${usageColor}50`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 6,
                    }}
                  >
                    <span
                      style={{
                        color: "#334155",
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {dbUser.usage.toLocaleString("en-IN")} used
                    </span>
                    <span
                      style={{
                        color: "#334155",
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {dbUser.limit.toLocaleString("en-IN")} total
                    </span>
                  </div>
                </div>

                {/* Billing cycle bar */}
                {dbUser.plan !== "free" && dbUser.billingDate && (
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: 12,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        Billing Cycle
                      </span>
                      <span
                        style={{
                          color: billing.color,
                          fontSize: 12,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600,
                        }}
                      >
                        {billing.display}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "#1e2330",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 3,
                          background: billing.color,
                          width: `${billing.pct}%`,
                          transition: "width 0.6s ease",
                          boxShadow: `0 0 8px ${billing.color}50`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Quick stats */}
                <div
                  className="dash-usage-stats"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 8,
                  }}
                >
                  {[
                    {
                      label: "Paid Orders",
                      value: paidOrders.length,
                      color: "#6ee7b7",
                    },
                    {
                      label: "Total Spent",
                      value: `₹${totalSpent.toFixed(0)}`,
                      color: "#fbbf24",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: "#0a0d13",
                        border: "1px solid #1e2330",
                        borderRadius: 8,
                        padding: "12px 14px",
                      }}
                    >
                      <p
                        style={{
                          color: "#475569",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontFamily: "'JetBrains Mono', monospace",
                          marginBottom: 6,
                        }}
                      >
                        {s.label}
                      </p>
                      <p
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: s.color,
                          fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: API Key ──────────────────────────────────────────────── */}
          {activeTab === "apikey" && (
            <div
              style={{
                background: "#0f1117",
                border: "1px solid #1e2330",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "#1a1f2e",
                    border: "1px solid #2d3548",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a78bfa",
                  }}
                >
                  <IconKey />
                </div>
                <p style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 700 }}>
                  Secret API Key
                </p>
              </div>
              <p
                style={{
                  color: "#475569",
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 24,
                  lineHeight: 1.7,
                  maxWidth: 800,
                }}
              >
                Install package{" "}
                <span
                  style={{
                    color: "#6ee7b7",
                    background: "#0f2a1d",
                    padding: "1px 6px",
                    borderRadius: 3,
                  }}
                >
                  npm install irctc-connect
                </span>{" "}
                → Configure API key → Call the function
              </p>

              {/* Security alert */}
              <div
                style={{
                  background: "#1a1060",
                  border: "1px solid #2d1f8a",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ color: "#a78bfa" }}>
                  <IconShield />
                </span>
                <span
                  style={{
                    color: "#a78bfa",
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Your key grants full package access. Rotate it immediately if you
                  believe it has been compromised.
                </span>
              </div>

              {/* Key display */}
              <div className="dash-key-row" style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "#0a0d13",
                    border: "1px solid #2d3548",
                    borderRadius: 8,
                    padding: "12px 12px 12px 16px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span
                    style={{ overflowX: "auto", whiteSpace: "nowrap", flex: 1, display: "block" }}
                  >
                    {keyVisible ? dbUser.apiKey : maskedKey}
                  </span>
                  <button
                    onClick={() => setKeyVisible(!keyVisible)}
                    title={keyVisible ? "Hide key" : "Reveal key"}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 4,
                      flexShrink: 0,
                    }}
                  >
                    <IconEye />
                  </button>
                </div>
                <button
                  onClick={copyApiKey}
                  style={{
                    background: copied ? "#0f2a1d" : "#059669",
                    border: `1px solid ${copied ? "#1a4731" : "#047857"}`,
                    color: copied ? "#6ee7b7" : "#fff",
                    borderRadius: 8,
                    padding: "0 20px",
                    cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s",
                    boxShadow: copied ? "none" : "0 0 16px rgba(5,150,105,0.3)",
                  }}
                >
                  {copied ? (
                    <>
                      <IconCheck /> Copied!
                    </>
                  ) : (
                    <>
                      <IconCopy /> Copy Key
                    </>
                  )}
                </button>
              </div>

              {/* Usage instructions */}
              <div
                style={{
                  marginTop: 28,
                  background: "#0d1117",
                  border: "1px solid #1f2937",
                  borderRadius: 10,
                  padding: "18px 20px",
                }}
              >
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "'JetBrains Mono', monospace",
                    marginBottom: 14,
                  }}
                >
                  Example Usage
                </p>

                <SyntaxHighlighter
                  language="typescript"
                  style={nightOwl}
                  customStyle={{
                    margin: 0,
                    background: "transparent",
                    fontSize: 12,
                    lineHeight: 1.8,
                    padding: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {usageExampleCode}
                </SyntaxHighlighter>
              </div>
            </div>
          )}

          {/* ── Tab: Orders ───────────────────────────────────────────────── */}
          {activeTab === "orders" && (
            <div
              style={{
                background: "#0f1117",
                border: "1px solid #1e2330",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Table header bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderBottom: "1px solid #1e2330",
                  background: "#0a0d13",
                }}
              >
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  All orders ·{" "}
                  <span style={{ color: "#6ee7b7" }}>
                    {paidOrders.length} paid
                  </span>
                </span>
                <span
                  style={{
                    color: "#475569",
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Total:{" "}
                  <span style={{ color: "#fbbf24" }}>
                    ₹{totalSpent.toFixed(2)}
                  </span>
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#0a0d13",
                        borderBottom: "1px solid #1e2330",
                      }}
                    >
                      {[
                        "Order ID",
                        "Amount",
                        "Status",
                        "Credited",
                        "Date",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            color: "#475569",
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: 48,
                            textAlign: "center",
                            color: "#334155",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 12,
                          }}
                        >
                          No orders found. Subscribe to a plan to get started.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr
                          key={o._id}
                          className="row-hover"
                          style={{
                            borderBottom: "1px solid #141820",
                            transition: "background 0.15s",
                          }}
                        >
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                color: "#94a3b8",
                                fontSize: 11,
                              }}
                            >
                              {o.orderId}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                color: "#6ee7b7",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 600,
                                fontSize: 13,
                              }}
                            >
                              ₹{o.amount.toFixed(2)}
                            </span>
                            <span
                              style={{
                                color: "#334155",
                                fontSize: 10,
                                marginLeft: 4,
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {o.currency}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <StatusBadge status={o.status} />
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 11,
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {o.credited ? (
                                <>
                                  <span style={{ color: "#34d399" }}>
                                    <IconCheck />
                                  </span>
                                  <span style={{ color: "#6ee7b7" }}>Yes</span>
                                </>
                              ) : (
                                <>
                                  <span style={{ color: "#64748b" }}>
                                    <IconX />
                                  </span>
                                  <span style={{ color: "#64748b" }}>No</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                color: "#64748b",
                                fontSize: 11,
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {o.createdAt
                                ? new Date(o.createdAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "—"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <button
                              className="action-btn"
                              onClick={() => setViewOrder(o)}
                              style={{
                                background: "#1a1f2e",
                                border: "1px solid #2d3548",
                                color: "#64748b",
                                borderRadius: 6,
                                padding: "6px 10px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 12,
                                fontFamily: "'JetBrains Mono', monospace",
                                transition: "all 0.15s",
                              }}
                            >
                              <IconEye />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))
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
