"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Star,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
  Package,
  Zap,
} from "lucide-react";

import type { PricingPlan, PaidPlanType } from "../../lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

type NoticeKind = "success" | "error" | "info";

type Notice = {
  id: number;
  kind: NoticeKind;
  text: string;
} | null;

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; plan: "free" | PaidPlanType };

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

type CashfreeCheckoutMode = "sandbox" | "production";

type CashfreeCheckoutClient = {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget: "_modal";
  }) => Promise<unknown>;
};

type CreatedPaymentOrder = {
  orderId?: string;
  paymentSessionId?: string;
  planType?: PaidPlanType;
  cashfreeMode?: CashfreeCheckoutMode;
};

declare global {
  interface Window {
    Cashfree?: (options: { mode: CashfreeCheckoutMode }) => CashfreeCheckoutClient;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function getNumericPrice(value: string): number {
  return Number(value.replace(/[^\d.]/g, "")) || 0;
}

function getDiscountPercent(originalPrice: string, discountedPrice: string): number | null {
  const original = getNumericPrice(originalPrice);
  const discounted = getNumericPrice(discountedPrice);
  if (!original || discounted >= original) return null;
  return Math.round(((original - discounted) / original) * 100);
}

function normalizePlan(raw: string): "free" | PaidPlanType | null {
  const lower = raw.toLowerCase();
  const mapped = lower === "enterprise" ? "advance" : lower;
  if (mapped === "free" || mapped === "pro" || mapped === "advance") {
    return mapped as "free" | PaidPlanType;
  }
  return null;
}

// ─── SDK loader (singleton promise) ──────────────────────────────────────────

let cashfreeLoadPromise: Promise<void> | null = null;

function loadCashfreeSdk(): Promise<void> {
  if (typeof window === "undefined")
    return Promise.reject(new Error("Cashfree checkout is unavailable on server"));

  if (window.Cashfree) return Promise.resolve();

  if (cashfreeLoadPromise) return cashfreeLoadPromise;

  cashfreeLoadPromise = new Promise<void>((resolve, reject) => {
    const CASHFREE_SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CASHFREE_SDK_URL}"]`,
    );

    if (existing) {
      if (window.Cashfree) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Cashfree SDK")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = CASHFREE_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.head.appendChild(script);
  });

  cashfreeLoadPromise.catch(() => {
    cashfreeLoadPromise = null; // allow retry on failure
  });

  return cashfreeLoadPromise;
}

// ─── Root export ─────────────────────────────────────────────────────────────

export default function PricingClient({
  initialPlans,
  initialOfferEndsAt,
  initialContactEmail,
}: {
  initialPlans: PricingPlan[];
  initialOfferEndsAt: string | null;
  initialContactEmail: string;
}) {
  return (
    <Suspense fallback={<PricingPageSkeleton />}>
      <PricingPageContent
        initialPlans={initialPlans}
        initialOfferEndsAt={initialOfferEndsAt}
        initialContactEmail={initialContactEmail}
      />
    </Suspense>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PricingPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f6f7f9] px-5 pt-28 pb-14 text-slate-950 sm:px-6 lg:pt-32">
      <div>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="h-8 w-56 animate-pulse rounded-md bg-slate-200" />
            <div className="mt-6 h-16 max-w-2xl animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-4 h-6 max-w-xl animate-pulse rounded-md bg-slate-200" />
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[520px] animate-pulse rounded-lg border border-slate-200 bg-white"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notice component ─────────────────────────────────────────────────────────

function NoticeBar({
  notice,
  onDismiss,
}: {
  notice: Notice;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!notice) return;
    if (notice.kind === "success" || notice.kind === "info") {
      const t = setTimeout(onDismiss, 6000);
      return () => clearTimeout(t);
    }
  }, [notice, onDismiss]);

  if (!notice) return null;

  const styles: Record<NoticeKind, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-sky-200 bg-sky-50 text-sky-800",
  };

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[notice.kind];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-8 flex max-w-3xl items-start gap-3 rounded-lg border px-4 py-3 ${styles[notice.kind]}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm leading-relaxed">{notice.text}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function useCountdown(offerEndsAt: string | null): TimeLeft {
  const EXPIRED: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    if (!offerEndsAt) return EXPIRED;
    const deadline = new Date(offerEndsAt).getTime();
    if (!Number.isFinite(deadline)) return EXPIRED;
    const diff = deadline - Date.now();
    if (diff <= 0) return EXPIRED;
    return {
      days: Math.floor(diff / 864e5),
      hours: Math.floor((diff / 36e5) % 24),
      minutes: Math.floor((diff / 6e4) % 60),
      seconds: Math.floor((diff / 1e3) % 60),
      expired: false,
    };
  });

  useEffect(() => {
    if (!offerEndsAt) return;
    const deadline = new Date(offerEndsAt).getTime();
    if (!Number.isFinite(deadline)) return;

    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setTimeLeft(EXPIRED);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 864e5),
        hours: Math.floor((diff / 36e5) % 24),
        minutes: Math.floor((diff / 6e4) % 60),
        seconds: Math.floor((diff / 1e3) % 60),
        expired: false,
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerEndsAt]);

  return timeLeft;
}

// ─── Payment modal ────────────────────────────────────────────────────────────

function PaymentModal({
  selectedPlan,
  isCreatingOrder,
  onConfirm,
  onCancel,
}: {
  selectedPlan: PaidPlanType;
  isCreatingOrder: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap + ESC close
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    confirmBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isCreatingOrder) {
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [isCreatingOrder, onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-6 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCreatingOrder) onCancel();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 text-slate-950 shadow-2xl sm:p-8"
        style={{ maxHeight: "90dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50">
          <ShieldCheck className="h-6 w-6 text-emerald-700" aria-hidden="true" />
        </div>

        <h3 id="modal-title" className="text-2xl font-semibold">
          Secure Checkout
        </h3>

        <p className="mt-3 leading-7 text-slate-600">
          A secure Cashfree popup will open to complete payment for the{" "}
          <span className="font-semibold uppercase text-emerald-700">{selectedPlan}</span> plan.
          You can safely dismiss this at any time.
        </p>

        <ul className="mt-6 space-y-2 text-sm text-slate-600">
          {[
            "256-bit SSL encrypted transaction",
            "Payment processed by Cashfree — card data never stored here",
            "Instant plan activation on success",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            disabled={isCreatingOrder}
            className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            disabled={isCreatingOrder}
            aria-busy={isCreatingOrder}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCreatingOrder && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {isCreatingOrder ? "Opening Checkout…" : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page content ────────────────────────────────────────────────────────

function PricingPageContent({
  initialPlans,
  initialOfferEndsAt,
  initialContactEmail,
}: {
  initialPlans: PricingPlan[];
  initialOfferEndsAt: string | null;
  initialContactEmail: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  const [notice, setNotice] = useState<Notice>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaidPlanType | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const timeLeft = useCountdown(initialOfferEndsAt);

  const contactUrl = `mailto:${initialContactEmail}?subject=${encodeURIComponent(
    "IRCTC Connect Payment Help",
  )}`;

  const orderIdFromQuery = searchParams.get("order_id");
  const isPaymentReturn = searchParams.get("payment_return") === "1";

  // ── Helpers ──────────────────────────────────────────────────────────────

  const showNotice = useCallback(
    (kind: NoticeKind, text: string) => {
      setNotice({ id: Date.now(), kind, text });
    },
    [],
  );

  const dismissNotice = useCallback(() => setNotice(null), []);

  // ── Payment verify ────────────────────────────────────────────────────────

  const verifyPayment = useCallback(
    async (orderId: string, paidPlanType?: PaidPlanType) => {
      showNotice("info", "Verifying payment status…");

      const response = await fetch(
        `/api/user/get-order?orderId=${encodeURIComponent(orderId)}&sync=true`,
        { method: "GET", cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to verify payment status");
      }

      if (data?.order?.credited) {
        showNotice("success", "Payment successful! Your plan is now active.");
        if (paidPlanType) {
          setAuthState({ status: "authenticated", plan: paidPlanType });
        }
        // Clean up payment query params without full reload
        const url = new URL(window.location.href);
        url.searchParams.delete("order_id");
        url.searchParams.delete("payment_return");
        router.replace(url.pathname + url.search, { scroll: false });
        return;
      }

      if (data?.order?.paymentStatus === "FAILED") {
        showNotice("error", "Payment failed. Please try again or contact support.");
        return;
      }

      if (data?.order?.paymentStatus === "USER_DROPPED") {
        showNotice("info", "Payment was cancelled. You can try again anytime.");
        return;
      }

      showNotice("info", "Payment is still processing — please check back shortly.");
    },
    [showNotice, router],
  );

  // ── Auth check ────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/user/verify", {
          method: "GET",
          cache: "no-store",
        });

        if (cancelled) return;

        if (!response.ok) {
          setAuthState({ status: "unauthenticated" });
          return;
        }

        const data = await response.json();

        if (!data?.success) {
          setAuthState({ status: "unauthenticated" });
          return;
        }

        const plan = normalizePlan(String(data?.user?.plan || ""));
        setAuthState({
          status: "authenticated",
          plan: plan ?? "free",
        });
      } catch {
        if (!cancelled) setAuthState({ status: "unauthenticated" });
      }
    };

    verifyAuth();
    return () => { cancelled = true; };
  }, []);

  // ── Payment return handling ───────────────────────────────────────────────

  useEffect(() => {
    if (!isPaymentReturn || !orderIdFromQuery) return;
    if (authState.status === "loading") return;          // wait for auth
    if (authState.status === "unauthenticated") return;  // can't verify anon

    let cancelled = false;

    const handleReturn = async () => {
      try {
        if (!cancelled) await verifyPayment(orderIdFromQuery);
      } catch (error: unknown) {
        if (!cancelled) showNotice("error", getErrorMessage(error, "Unable to verify payment."));
      }
    };

    handleReturn();
    return () => { cancelled = true; };
  }, [isPaymentReturn, orderIdFromQuery, authState.status, verifyPayment, showNotice]);

  // ── Open payment modal ────────────────────────────────────────────────────

  const openPaymentModal = (planType: PaidPlanType | "free") => {
    if (planType === "free") return;

    if (authState.status === "loading") {
      showNotice("info", "Please wait while we check your login status.");
      return;
    }

    if (authState.status === "unauthenticated") {
      router.push("/auth?redirect=/pricing");
      return;
    }

    setSelectedPlan(planType);
    setShowPaymentModal(true);
  };

  // ── Start payment ─────────────────────────────────────────────────────────

  const startPayment = async () => {
    if (!selectedPlan) return;

    setIsCreatingOrder(true);
    dismissNotice();

    try {
      const response = await fetch("/api/user/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: selectedPlan }),
      });

      const data = await response.json();
      const order = data?.order as CreatedPaymentOrder | undefined;

      if (!response.ok || !order?.orderId || !order?.paymentSessionId) {
        throw new Error(data?.message || "Unable to create order. Please try again.");
      }

      await loadCashfreeSdk();

      if (!window.Cashfree) {
        throw new Error("Cashfree checkout failed to load. Please refresh and try again.");
      }

      setShowPaymentModal(false);
      showNotice("info", "Opening secure payment popup…");

      const cashfree = window.Cashfree({
        mode: data?.cashfreeMode === "sandbox" ? "sandbox" : "production",
      });

      try {
        await cashfree.checkout({
          paymentSessionId: order.paymentSessionId,
          redirectTarget: "_modal",
        });
      } catch {
        // Modal close throws — always verify backend status regardless
      }

      await verifyPayment(order.orderId, order.planType);
    } catch (error: unknown) {
      setShowPaymentModal(false);
      showNotice("error", getErrorMessage(error, "Something went wrong. Please try again."));
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // ── Button state logic ────────────────────────────────────────────────────

  const getButtonState = (plan: PricingPlan): { label: string; disabled: boolean; action: () => void } => {
    const isLoading = authState.status === "loading";
    const isAuthed = authState.status === "authenticated";
    const currentPlan = isAuthed ? (authState as { plan: "free" | PaidPlanType }).plan : null;

    // Advance plan holder: everything downgrade/same is locked
    if (isAuthed && currentPlan === "advance") {
      if (plan.planType === "advance") return { label: "Current Plan", disabled: true, action: () => {} };
      if (plan.planType === "pro") return { label: "Downgrade Unavailable", disabled: true, action: () => {} };
      return { label: "Included", disabled: true, action: () => {} };
    }

    if (plan.planType === "free") {
      return {
        label: plan.buttonText,
        disabled: false,
        action: () => router.push("/auth?redirect=/pricing"),
      };
    }

    if (isLoading) return { label: "Checking Login…", disabled: true, action: () => {} };

    if (!isAuthed) {
      return {
        label: "Login to Continue",
        disabled: false, // clickable — redirects to login
        action: () => router.push("/auth?redirect=/pricing"),
      };
    }

    if (currentPlan === plan.planType) {
      return { label: "Current Plan", disabled: true, action: () => {} };
    }

    return {
      label: currentPlan && currentPlan !== "free" ? "Change Plan" : "Upgrade Now",
      disabled: false,
      action: () => openPaymentModal(plan.planType),
    };
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950">
      <style>{`
        @keyframes pricing-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pricing-reveal {
          animation: pricing-fade-up 0.65s ease both;
        }

        .pricing-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
          border-color: #a7f3d0;
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
        }

        .pricing-action {
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
        }

        .pricing-action:hover {
          transform: translateY(-2px);
        }

        @media (prefers-reduced-motion: reduce) {
          .pricing-reveal {
            animation: none;
          }

          .pricing-card,
          .pricing-action,
          .pricing-card:hover,
          .pricing-action:hover {
            transform: none;
            transition: none;
          }
        }
      `}</style>

      <main className="px-5 pt-28 pb-14 sm:px-6 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <header className="pricing-reveal mb-10 max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
              <Package className="h-4 w-4" aria-hidden="true" />
              Pricing for railway API access
            </div>

            <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Choose the right request limit for your app.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Start free, then upgrade when your product needs higher usage,
              paid access, and support for production railway integrations.
            </p>
          </header>

          <NoticeBar notice={notice} onDismiss={dismissNotice} />

          {authState.status === "loading" && (
            <div
              role="status"
              aria-label="Checking login status"
              className="mb-8 flex max-w-sm items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Checking login status...
            </div>
          )}

          <section aria-label="Pricing plans" className="pricing-reveal" style={{ animationDelay: "120ms" }}>
            <div className="grid gap-5 lg:grid-cols-3">
              {initialPlans.map((plan) => {
                const btnState = getButtonState(plan);
                const isPopular = plan.planType === "advance";
                const isOfferActive = Boolean(plan.originalPrice) && !timeLeft.expired;
                const discountPercent =
                  isOfferActive && plan.originalPrice
                    ? getDiscountPercent(plan.originalPrice, plan.price)
                    : null;
                const displayedPrice =
                  isOfferActive && plan.originalPrice ? plan.price : plan.originalPrice ?? plan.price;

                return (
                  <article
                    key={plan.id}
                    aria-label={`${plan.name} plan`}
                    className={`pricing-card relative flex min-h-[540px] flex-col rounded-lg border bg-white p-6 shadow-sm ${
                      isPopular
                        ? "border-emerald-300 ring-1 ring-emerald-200"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                        {isPopular ? (
                          <Zap className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <Package className="h-5 w-5" aria-hidden="true" />
                        )}
                      </div>
                      {isPopular && (
                        <div
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                          aria-label="Most popular plan"
                        >
                          <Star className="h-3 w-3 fill-emerald-700" aria-hidden="true" />
                          Popular
                        </div>
                      )}
                    </div>

                    <h2 className="text-2xl font-semibold text-slate-950">{plan.name}</h2>
                    <p className="mt-3 min-h-[52px] text-sm leading-6 text-slate-600">{plan.description}</p>

                    <div className="mt-7">
                      {isOfferActive && plan.originalPrice && discountPercent && (
                        <div className="mb-3 flex items-center gap-3">
                          <span className="text-base text-slate-400 line-through" aria-label={`Original price ${plan.originalPrice}`}>
                            {plan.originalPrice}
                          </span>
                          <span
                            className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                            aria-label={`${discountPercent}% discount`}
                          >
                            {discountPercent}% off
                          </span>
                        </div>
                      )}

                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-semibold text-slate-950" aria-label={`Price: ${displayedPrice}`}>
                          {displayedPrice}
                        </span>
                        <span className="mb-1 text-sm text-slate-500">{plan.period}</span>
                      </div>

                      {!timeLeft.expired && plan.originalPrice && (
                        <div
                          className="mt-4 inline-flex rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"
                          aria-live="polite"
                          aria-label={`Offer ends in ${timeLeft.days} days ${timeLeft.hours} hours ${timeLeft.minutes} minutes ${timeLeft.seconds} seconds`}
                        >
                          Offer ends in&nbsp;
                          <span aria-hidden="true">
                            {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={btnState.action}
                      disabled={btnState.disabled}
                      aria-label={`${btnState.label} — ${plan.name} plan`}
                      className={`pricing-action mt-7 w-full rounded-md px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                        btnState.disabled
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : isPopular
                            ? "bg-slate-950 text-white shadow-sm hover:bg-slate-800 hover:shadow-lg"
                            : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
                      }`}
                    >
                      {authState.status === "loading" && plan.planType !== "free" ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Checking...
                        </span>
                      ) : (
                        btnState.label
                      )}
                    </button>

                    <div className="mt-7 border-t border-slate-200 pt-6">
                      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Includes
                      </div>

                      <ul className="space-y-3" role="list">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span
                              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50"
                              aria-hidden="true"
                            >
                              <Check className="h-3 w-3 text-emerald-700" />
                            </span>
                            <span
                              className={`text-sm leading-6 ${
                                feature.highlight ? "font-semibold text-slate-950" : "text-slate-600"
                              }`}
                            >
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            aria-label="Enterprise pricing"
            className="pricing-reveal mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            style={{ animationDelay: "220ms" }}
          >
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase text-emerald-700">
                  Need a custom plan?
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Enterprise and team pricing</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  Need higher request limits, dedicated support, or custom infrastructure?
                  Contact us and we&apos;ll create a custom plan for your business.
                </p>
              </div>

              <a
                href={contactUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="pricing-action inline-flex shrink-0 items-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Contact Support
              </a>
            </div>
          </section>

          <p className="mt-8 max-w-2xl leading-7 text-slate-500">
            By purchasing a premium plan, you are directly helping support and sustain this
            open-source project. Thank you.
          </p>
        </div>
      </main>

      {/* ── Payment modal ─────────────────────────────────────────────────── */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          selectedPlan={selectedPlan}
          isCreatingOrder={isCreatingOrder}
          onConfirm={startPayment}
          onCancel={() => {
            if (!isCreatingOrder) {
              setShowPaymentModal(false);
              setSelectedPlan(null);
            }
          }}
        />
      )}
    </div>
  );
}
