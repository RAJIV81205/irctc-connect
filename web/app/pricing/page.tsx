"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Star, Heart, Terminal } from "lucide-react";
import { PRICING_PLANS, PaidPlanType } from "../../lib/constants";

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#1f3b8f_0%,transparent_35%),radial-gradient(circle_at_80%_90%,#14532d_0%,transparent_30%),linear-gradient(145deg,#0f172a,#111827,#020617)]" aria-busy="true" />
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

  const openPaymentModal = (planType: PaidPlanType | "free") => {
    if (planType === "free") return;
    
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
    if (!selectedPlan) return;

    try {
      setIsCreatingOrder(true);
      setNotice(null);

      const response = await fetch("/api/user/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const getButtonLabel = (plan: typeof PRICING_PLANS[0]) => {
    if (plan.planType === "free") return plan.buttonText;
    if (isCheckingAuth) return "Checking login...";
    if (!isAuthenticated) return "Login to Continue";
    return plan.buttonText;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#1f3b8f_0%,transparent_35%),radial-gradient(circle_at_80%_90%,#14532d_0%,transparent_30%),linear-gradient(145deg,#0f172a,#111827,#020617)] text-slate-100 selection:bg-emerald-500/30 font-sans">
      <main className="pt-32 pb-24 px-6 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-300/40 bg-emerald-300/15 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <Heart className="w-4 h-4 fill-emerald-400" />
            <span>Sponsor the Project</span>
          </div>

          <h1 className="max-w-4xl mx-auto font-jetbrains text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl tracking-tight mb-6">
            Plans and Pricing
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
            Choose a plan that fits your usage needs and help sustain this open-source project.
          </p>

          {notice && (
            <div
              className={`mb-8 mx-auto max-w-3xl rounded-xl border px-5 py-4 text-left ${
                notice.kind === "success"
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                  : notice.kind === "error"
                    ? "border-red-500/50 bg-red-500/10 text-red-200"
                    : "border-cyan-500/50 bg-cyan-500/10 text-cyan-200"
              }`}
            >
              {notice.text}
            </div>
          )}

          <div className="mt-16 grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto text-left items-start">
            {PRICING_PLANS.map((plan) => {
              const Icon = plan.colorTheme === "emerald" ? Terminal : plan.popular ? Star : Check;
              return (
                <div 
                  key={plan.id}
                  className={`relative group rounded-3xl border bg-slate-900/50 p-8 transition-all hover:bg-slate-800 ${
                    plan.popular 
                      ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(52,211,153,0.15)] transform lg:-translate-y-4' 
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-emerald-400 text-emerald-950 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Popular
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-8 border ${
                    plan.popular ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-slate-800 border-slate-700'
                  }`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-emerald-400' : 'text-slate-300'}`} />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2 font-jetbrains">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-slate-400 mb-8 h-12 leading-relaxed text-sm">
                    {plan.description}
                  </p>

                  <button
                    onClick={() => openPaymentModal(plan.planType)}
                    disabled={plan.planType !== "free" && paidButtonDisabled}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold mb-10 transition-all ${
                      plan.planType !== "free" && paidButtonDisabled
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                        : plan.popular 
                          ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                          : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                    }`}
                  >
                    {getButtonLabel(plan)}
                  </button>

                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                      Features
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-emerald-400' : 'text-slate-400'}`} />
                          <span className={`text-sm ${feature.highlight ? 'text-white font-semibold' : 'text-slate-300'}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="mt-16 text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            By paying for a premium tier, you are directly helping in sponsoring
            and sustaining this open-source project. Thank you! 🚀
          </p>
        </div>
      </main>

      {showPaymentNotice && selectedPlan && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-md flex items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4 font-jetbrains">
              Secure Checkout
            </h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              You will be redirected securely to complete the payment for the <span className="font-semibold text-emerald-400 uppercase">{selectedPlan}</span> plan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8">
              <button
                onClick={() => {
                  setShowPaymentNotice(false);
                  setSelectedPlan(null);
                }}
                disabled={isCreatingOrder}
                className="px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium"
              >
                Cancel
              </button>
               <a
                  href={contactUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 text-center rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium sm:hidden"
                >
                  Contact Me
               </a>
              <button
                onClick={startPayment}
                disabled={isCreatingOrder}
                className="px-5 py-3 rounded-xl bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-colors font-bold disabled:opacity-60 flex justify-center items-center gap-2"
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
