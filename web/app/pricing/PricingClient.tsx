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
  Heart,
  Terminal,
  Sparkles,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
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
    <div className="relative min-h-screen bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="relative z-10 px-6 py-28">
        <div className="mx-auto max-w-7xl">
          {/* Hero skeleton */}
          <div className="mb-24 flex flex-col items-center gap-6">
            <div className="h-8 w-64 animate-pulse rounded-full bg-white/10" />
            <div className="h-20 w-96 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-6 w-80 animate-pulse rounded-xl bg-white/5" />
          </div>
          {/* Card skeletons */}
          <div className="grid gap-8 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[600px] animate-pulse rounded-[32px] border border-white/10 bg-white/[0.04]"
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
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    error: "border-red-500/30 bg-red-500/10 text-red-200",
    info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
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
      className={`mx-auto mb-10 flex max-w-3xl items-start gap-3 rounded-2xl border px-5 py-4 backdrop-blur-xl ${styles[notice.kind]}`}
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-xl"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCreatingOrder) onCancel();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg overflow-y-auto rounded-[32px] border border-white/10 bg-[#0b1220]/90 p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
        style={{ maxHeight: "90dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10">
          <ShieldCheck className="h-8 w-8 text-emerald-300" aria-hidden="true" />
        </div>

        <h3 id="modal-title" className="text-3xl font-bold">
          Secure Checkout
        </h3>

        <p className="mt-4 leading-relaxed text-slate-400">
          A secure Cashfree popup will open to complete payment for the{" "}
          <span className="font-semibold uppercase text-emerald-300">{selectedPlan}</span> plan.
          You can safely dismiss this at any time.
        </p>

        <ul className="mt-6 space-y-2 text-sm text-slate-400">
          {[
            "256-bit SSL encrypted transaction",
            "Payment processed by Cashfree — card data never stored here",
            "Instant plan activation on success",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            disabled={isCreatingOrder}
            className="rounded-2xl border border-white/10 px-5 py-3 text-slate-300 transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            disabled={isCreatingOrder}
            aria-busy={isCreatingOrder}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 font-bold text-black transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
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
  const [noticeIdCounter, setNoticeIdCounter] = useState(0);

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
      setNoticeIdCounter((c) => {
        const id = c + 1;
        setNotice({ id, kind, text });
        return id;
      });
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
      router.push("/login?redirect=/pricing");
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
        action: () => router.push("/signup"),
      };
    }

    if (isLoading) return { label: "Checking Login…", disabled: true, action: () => {} };

    if (!isAuthed) {
      return {
        label: "Login to Continue",
        disabled: false, // clickable — redirects to login
        action: () => router.push("/login?redirect=/pricing"),
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
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* ── Background ──────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[35rem] w-[35rem] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <main className="relative z-10 px-6 py-28">
        <div className="mx-auto max-w-7xl">

          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <header className="mb-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-2 text-sm font-medium text-emerald-300 backdrop-blur-xl">
              <Heart className="h-4 w-4 fill-emerald-400" aria-hidden="true" />
              Sponsor the Open Source Project
            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Simple Pricing
              <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-500 bg-clip-text text-transparent">
                Built for Scale
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Powerful request limits, premium support, and scalable
              infrastructure designed for modern applications.
            </p>
          </header>

          {/* ── Notice ────────────────────────────────────────────────────── */}
          <NoticeBar notice={notice} onDismiss={dismissNotice} />

          {/* ── Auth loading bar ───────────────────────────────────────────── */}
          {authState.status === "loading" && (
            <div
              role="status"
              aria-label="Checking login status"
              className="mx-auto mb-8 flex max-w-sm items-center justify-center gap-2 text-sm text-slate-500"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Checking login status…
            </div>
          )}

          {/* ── Pricing cards ─────────────────────────────────────────────── */}
          <section aria-label="Pricing plans">
            <div className="grid gap-8 lg:grid-cols-3">
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
                    className={`group relative overflow-hidden rounded-[32px] border backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 ${
                      isPopular
                        ? "border-emerald-400/30 bg-white/[0.08] shadow-[0_0_80px_rgba(16,185,129,0.15)]"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    {/* Glow */}
                    {isPopular && (
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-400/10 to-transparent"
                        aria-hidden="true"
                      />
                    )}

                    {/* Popular badge */}
                    {isPopular && (
                      <div
                        className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black"
                        aria-label="Most popular plan"
                      >
                        <Star className="h-3 w-3 fill-black" aria-hidden="true" />
                        POPULAR
                      </div>
                    )}

                    <div className="relative z-10 p-8">

                      {/* Icon */}
                      <div
                        className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${
                          isPopular
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-white/5 text-white"
                        }`}
                        aria-hidden="true"
                      >
                        {isPopular ? (
                          <Sparkles className="h-7 w-7" />
                        ) : (
                          <Terminal className="h-7 w-7" />
                        )}
                      </div>

                      {/* Title + description */}
                      <h2 className="text-3xl font-bold">{plan.name}</h2>
                      <p className="mt-4 text-sm leading-relaxed text-slate-400">{plan.description}</p>

                      {/* Price block */}
                      <div className="mt-10">
                        {isOfferActive && plan.originalPrice && discountPercent && (
                          <div className="mb-3 flex items-center gap-3">
                            <span className="text-lg text-slate-500 line-through" aria-label={`Original price ${plan.originalPrice}`}>
                              {plan.originalPrice}
                            </span>
                            <span
                              className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300"
                              aria-label={`${discountPercent}% discount`}
                            >
                              {discountPercent}% OFF
                            </span>
                          </div>
                        )}

                        <div className="flex items-end gap-2">
                          <span className="text-6xl font-black tracking-tight" aria-label={`Price: ${displayedPrice}`}>
                            {displayedPrice}
                          </span>
                          <span className="mb-2 text-slate-400">{plan.period}</span>
                        </div>

                        {/* Countdown */}
                        {!timeLeft.expired && plan.originalPrice && (
                          <div
                            className="mt-5 inline-flex rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-200"
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

                      {/* CTA button */}
                      <button
                        onClick={btnState.action}
                        disabled={btnState.disabled}
                        aria-label={`${btnState.label} — ${plan.name} plan`}
                        className={`mt-10 w-full rounded-2xl py-4 font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                          btnState.disabled
                            ? "cursor-not-allowed bg-white/5 text-slate-500"
                            : isPopular
                            ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.35)]"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {authState.status === "loading" && plan.planType !== "free" ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Checking…
                          </span>
                        ) : (
                          btnState.label
                        )}
                      </button>

                      {/* Features */}
                      <div className="mt-10 border-t border-white/10 pt-8">
                        <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                          Features
                        </div>

                        <ul className="space-y-4" role="list">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div
                                className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10"
                                aria-hidden="true"
                              >
                                <Check className="h-3 w-3 text-emerald-300" />
                              </div>
                              <span
                                className={`text-sm leading-relaxed ${
                                  feature.highlight ? "font-semibold text-white" : "text-slate-300"
                                }`}
                              >
                                {feature.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ── Enterprise / Contact ───────────────────────────────────────── */}
          <section
            aria-label="Enterprise pricing"
            className="mx-auto mt-20 max-w-4xl rounded-[32px] border border-cyan-400/20 bg-cyan-400/5 p-10 backdrop-blur-2xl"
          >
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
                  Need a Custom Plan?
                </p>
                <h2 className="mt-3 text-3xl font-bold">Enterprise &amp; Team Pricing</h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-slate-400">
                  Need higher request limits, dedicated support, or custom infrastructure?
                  Contact us and we&apos;ll create a custom plan for your business.
                </p>
              </div>

              <a
                href={contactUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-4 font-semibold text-cyan-200 transition-all hover:bg-cyan-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                Contact Support
              </a>
            </div>
          </section>

          {/* ── Footer note ───────────────────────────────────────────────── */}
          <p className="mx-auto mt-12 max-w-2xl text-center leading-relaxed text-slate-500">
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