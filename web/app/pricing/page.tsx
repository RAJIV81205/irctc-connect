"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ArrowLeft, Star, Heart } from "lucide-react";
import Link from "next/link";

type PaidPlanType = "pro" | "advance";

type Notice = {
  kind: "success" | "error" | "info";
  text: string;
} | null;

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingPageFallback />}>
      <PricingPageContent />
    </Suspense>
  );
}

function PricingPageFallback() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black" aria-busy="true" />
  );
}

function PricingPageContent() {
  const searchParams = useSearchParams();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaidPlanType | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const contactUrl =
    process.env.NEXT_PUBLIC_PAYMENT_CONTACT_URL ||
    "mailto:rajivdubey.dev@gmail.com?subject=IRCTC Connect Payment Help";

  const orderIdFromQuery = searchParams.get("order_id");
  const isPaymentReturn = searchParams.get("payment_return") === "1";

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/user/verify", {
          method: "GET",
          cache: "no-store",
        });
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    if (!isPaymentReturn || !orderIdFromQuery || isCheckingAuth || !isAuthenticated) {
      return;
    }

    const syncOrder = async () => {
      try {
        setNotice({ kind: "info", text: "Checking payment status..." });

        const response = await fetch(
          `/api/user/get-order?orderId=${encodeURIComponent(orderIdFromQuery)}&sync=true`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Unable to verify payment status");
        }

        if (data?.order?.credited) {
          setNotice({
            kind: "success",
            text: "Payment successful. Your plan benefits are now active.",
          });
          return;
        }

        setNotice({
          kind: "info",
          text: "Payment is still processing. We will update your plan once webhook/status confirms success.",
        });
      } catch (error: unknown) {
        setNotice({
          kind: "error",
          text: getErrorMessage(
            error,
            "Unable to verify payment status right now."
          ),
        });
      }
    };

    syncOrder();
  }, [isPaymentReturn, orderIdFromQuery, isCheckingAuth, isAuthenticated]);

  const proButtonLabel = useMemo(() => {
    if (isCheckingAuth) return "Checking login...";
    if (!isAuthenticated) return "Login to Continue";
    return "Get Started";
  }, [isCheckingAuth, isAuthenticated]);

  const advanceButtonLabel = useMemo(() => {
    if (isCheckingAuth) return "Checking login...";
    if (!isAuthenticated) return "Login to Continue";
    return "Go Advance";
  }, [isCheckingAuth, isAuthenticated]);

  const openPaymentModal = (planType: PaidPlanType) => {
    if (!isAuthenticated || isCheckingAuth) {
      setNotice({
        kind: "info",
        text: "Please login first to continue with payment.",
      });
      return;
    }

    setSelectedPlan(planType);
    setShowPaymentNotice(true);
  };

  const startPayment = async () => {
    if (!selectedPlan) {
      return;
    }

    try {
      setIsCreatingOrder(true);
      setNotice(null);

      const response = await fetch("/api/user/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planType: selectedPlan }),
      });

      const data = await response.json();
      if (!response.ok || !data?.redirectUrl) {
        throw new Error(data?.message || "Unable to create order");
      }

      window.location.href = data.redirectUrl;
    } catch (error: unknown) {
      setNotice({
        kind: "error",
        text: getErrorMessage(error, "Unable to create order right now."),
      });
      setIsCreatingOrder(false);
    }
  };

  const paidButtonDisabled = isCheckingAuth || !isAuthenticated;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-inter selection:bg-blue-500/30 transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link
            href="/docs"
            className="flex items-center gap-2 group"
            title="Back to Docs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Back to Docs
            </span>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium mb-8 uppercase tracking-wider shadow-sm border border-blue-200 dark:border-blue-500/20">
            <Heart className="w-4 h-4" />
            <span>Sponsor the Project</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight font-inter">
            Plans and Pricing
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
            Choose a plan that fits your usage needs.
          </p>

          {notice && (
            <div
              className={`mb-8 mx-auto max-w-3xl rounded-2xl border px-5 py-4 text-left ${
                notice.kind === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : notice.kind === "error"
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-blue-300 bg-blue-50 text-blue-800"
              }`}
            >
              {notice.text}
            </div>
          )}

          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-8xl mx-auto text-left">
            <div className="relative group rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 p-10 hover:border-blue-500/50 transition-colors backdrop-blur-xl">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-100 dark:border-blue-500/20">
                <div className="w-6 h-6 rounded bg-blue-600 dark:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Free Tier
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">
                  ₹0
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  /month
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-8 h-12 leading-relaxed">
                For developers exploring the platform and testing basic
                functionality.
              </p>

              <button className="w-full py-4 px-6 rounded-2xl font-semibold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10 mb-10">
                Start for Free
              </button>

              <div className="space-y-5">
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
                  Features
                </div>
                <ul className="space-y-4">
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span>50 API requests per month</span>
                  </li>
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span>Basic endpoint access</span>
                  </li>
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span>Community support</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative group rounded-[2.5rem] border border-blue-300 dark:border-white/20 bg-white dark:bg-zinc-900 shadow-2xl dark:shadow-[0_0_50px_rgba(255,255,255,0.03)] p-10 transform md:-translate-y-4">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider shadow-lg border border-slate-800 dark:border-white/80">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                Popular
              </div>

              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-8 border border-slate-200 dark:border-white/10">
                <div className="w-6 h-6 rounded bg-slate-800 dark:bg-white shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Pro Tier
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">
                  ₹30
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  /month
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-8 h-12 leading-relaxed">
                For active developers building projects and scaling
                applications.
              </p>

              <button
                onClick={() => openPaymentModal("pro")}
                disabled={paidButtonDisabled}
                className={`w-full py-4 px-6 rounded-2xl font-semibold mb-10 shadow-lg transition-opacity ${
                  paidButtonDisabled
                    ? "bg-slate-400 text-white cursor-not-allowed"
                    : "text-white bg-slate-900 dark:bg-white dark:text-black hover:opacity-90"
                }`}
              >
                {proButtonLabel}
              </button>

              <div className="space-y-5">
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
                  Features
                </div>
                <ul className="space-y-4">
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-slate-900 dark:text-white shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      1000 API requests per month
                    </span>
                  </li>
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-slate-900 dark:text-white shrink-0 mt-0.5" />
                    <span>Priority email support</span>
                  </li>
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-slate-900 dark:text-white shrink-0 mt-0.5" />
                    <span>Advanced rate limits</span>
                  </li>
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-slate-900 dark:text-white shrink-0 mt-0.5" />
                    <span>Sponsor badge</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative group rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 p-10 hover:border-emerald-500/50 transition-colors backdrop-blur-xl">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-100 dark:border-emerald-500/20">
                <div className="w-6 h-6 rounded bg-emerald-600 dark:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Advance Plan
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">
                  ₹50
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  /month
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-8 h-12 leading-relaxed">
                For heavy users needing massive request limits and reliability.
              </p>

              <button
                onClick={() => openPaymentModal("advance")}
                disabled={paidButtonDisabled}
                className={`w-full py-4 px-6 rounded-2xl font-semibold mb-10 transition-colors border ${
                  paidButtonDisabled
                    ? "text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed"
                    : "text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border-slate-200 dark:border-white/10"
                }`}
              >
                {advanceButtonLabel}
              </button>

              <div className="space-y-5">
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
                  Features
                </div>
                <ul className="space-y-4">
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">
                      10k API requests per month
                    </span>
                  </li>
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Dedicated support line</span>
                  </li>
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Custom SLAs</span>
                  </li>
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Premium sponsor recognition</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-16 text-slate-500 dark:text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            By paying for a premium tier, you are directly helping in sponsoring
            and sustaining this open-source project. Thank you! 🚀
          </p>
        </div>
      </main>

      {showPaymentNotice && selectedPlan && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">
              Payment Gateway Update
            </h3>
            <p className="text-slate-700 leading-relaxed mb-6">
              Our in-app payment gateway setup is currently in process. You will
              now be redirected to another website to complete payment securely.
            </p>
            <p className="text-slate-600 mb-8">
              Selected plan: <span className="font-semibold uppercase">{selectedPlan}</span>
            </p>

            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => {
                  setShowPaymentNotice(false);
                  setSelectedPlan(null);
                }}
                disabled={isCreatingOrder}
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <a
                href={contactUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Contact Me
              </a>
              <button
                onClick={startPayment}
                disabled={isCreatingOrder}
                className="px-5 py-3 rounded-xl bg-slate-900 text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {isCreatingOrder ? "Creating Order..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
