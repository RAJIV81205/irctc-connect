"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Star, Heart, Terminal } from "lucide-react";
import type { PricingPlan, PaidPlanType } from "../../lib/constants";

type Notice = {
  kind: "success" | "error" | "info";
  text: string;
} | null;

type PublicPlansResponse = {
  success: boolean;
  offerEndsAt?: string | null;
  contactEmail?: string;
  plans?: PricingPlan[];
  message?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

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
    <Suspense fallback={<PricingPageFallback />}>
      <PricingPageContent
        initialPlans={initialPlans}
        initialOfferEndsAt={initialOfferEndsAt}
        initialContactEmail={initialContactEmail}
      />
    </Suspense>
  );
}

function PricingPageFallback() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#1f3b8f_0%,transparent_35%),radial-gradient(circle_at_80%_90%,#14532d_0%,transparent_30%),linear-gradient(145deg,#0f172a,#111827,#020617)]" aria-busy="true" />
  );
}

function PricingPageContent({
  initialPlans,
  initialOfferEndsAt,
  initialContactEmail,
}: {
  initialPlans: PricingPlan[];
  initialOfferEndsAt: string | null;
  initialContactEmail: string;
}) {
  const searchParams = useSearchParams();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<"free" | PaidPlanType | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaidPlanType | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [pricingPlans] = useState<PricingPlan[]>(initialPlans);
  const isLoadingPlans = false;
  const [offerEndsAt] = useState<string | null>(initialOfferEndsAt);
  const [planContactEmail] = useState(initialContactEmail);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  const contactUrl = `mailto:${planContactEmail}?subject=${encodeURIComponent(
    "IRCTC Connect Payment Help"
  )}`;

  const orderIdFromQuery = searchParams.get("order_id");
  const isPaymentReturn = searchParams.get("payment_return") === "1";

  const getNumericPrice = (value: string) =>
    Number(value.replace(/[^\d.]/g, "")) || 0;

  const getDiscountPercent = (originalPrice: string, discountedPrice: string) => {
    const original = getNumericPrice(originalPrice);
    const discounted = getNumericPrice(discountedPrice);
    if (!original || discounted >= original) return null;
    return Math.round(((original - discounted) / original) * 100);
  };

  useEffect(() => {
    if (!offerEndsAt) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
      });
      return;
    }

    const offerDeadline = new Date(offerEndsAt).getTime();
    if (!Number.isFinite(offerDeadline)) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
      });
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = offerDeadline - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [offerEndsAt]);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/user/verify", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          setCurrentPlan(null);
          return;
        }

        const data = await response.json();
        setIsAuthenticated(Boolean(data?.success));

        const rawPlan = String(data?.user?.plan || "").toLowerCase();
        const mappedPlan = rawPlan === "enterprise" ? "advance" : rawPlan;
        if (mappedPlan === "free" || mappedPlan === "pro" || mappedPlan === "advance") {
          setCurrentPlan(mappedPlan);
        } else {
          setCurrentPlan(null);
        }
      } catch {
        setIsAuthenticated(false);
        setCurrentPlan(null);
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

  const getButtonState = (plan: PricingPlan) => {
    // Enterprise/Advance users should not see upgrade actions here.
    if (!isCheckingAuth && isAuthenticated && currentPlan === "advance") {
      if (plan.planType === "advance") {
        return { label: "Current Plan", disabled: true };
      }
      if (plan.planType === "pro") {
        return { label: "Not Available", disabled: true };
      }
      return { label: "Included", disabled: true };
    }

    if (plan.planType === "free") {
      return { label: plan.buttonText, disabled: false };
    }

    if (isCheckingAuth) {
      return { label: "Checking login...", disabled: true };
    }

    if (!isAuthenticated) {
      return { label: "Login to Continue", disabled: true };
    }

    if (currentPlan === plan.planType) {
      return { label: "Current Plan", disabled: true };
    }

    return { label: "Upgrade Plan", disabled: false };
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#1f3b8f_0%,transparent_35%),radial-gradient(circle_at_80%_90%,#14532d_0%,transparent_30%),linear-gradient(145deg,#0f172a,#111827,#020617)] text-slate-100 selection:bg-emerald-500/30 font-sans">
      <main className="pt-32 pb-24 px-6 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-300/40 bg-emerald-300/15 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
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

          <div className="mt-16 grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto text-left items-stretch">
            {pricingPlans.map((plan) => {
              const buttonState = getButtonState(plan);
              const Icon = plan.colorTheme === "emerald" ? Terminal : plan.popular ? Star : Check;
              const isOfferActive = Boolean(plan.originalPrice) && !timeLeft.expired;
              const displayedPrice =
                isOfferActive && plan.originalPrice ? plan.price : plan.originalPrice || plan.price;
              const discountPercent = isOfferActive && plan.originalPrice
                ? getDiscountPercent(plan.originalPrice, plan.price)
                : null;
              return (
                <div 
                  key={plan.id}
                  className={`relative group rounded-3xl border bg-slate-900/60 p-8 transition-all hover:bg-slate-800/90 ${
                    plan.popular 
                      ? 'border-emerald-500/60 shadow-[0_0_35px_rgba(52,211,153,0.2)] transform lg:-translate-y-4' 
                      : 'border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-emerald-400 text-emerald-950 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Popular
                    </div>
                  )}

                  {isOfferActive && plan.originalPrice && discountPercent && (
                    <div className="absolute top-5 right-5 rounded-full border border-amber-300/40 bg-amber-300/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-200">
                      {discountPercent}% OFF
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
                  {plan.originalPrice ? (
                    <div className="mb-4">
                      {isOfferActive && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-base font-medium text-slate-400 line-through decoration-2 decoration-slate-500">
                            {plan.originalPrice}
                          </span>
                          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2 py-0.5 text-[10px] uppercase tracking-wide font-bold text-emerald-200">
                            Offer Price
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-extrabold text-white">
                          {displayedPrice}
                        </span>
                        <span className="text-slate-400 font-medium">
                          {plan.period}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-amber-200/90">
                        {!timeLeft.expired && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 font-semibold">
                            Ends in {timeLeft.days}d {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
                          </span>
                        ) }
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-extrabold text-white">
                          {plan.price}
                        </span>
                        <span className="text-slate-400 font-medium">
                          {plan.period}
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="text-slate-400 mb-8 min-h-12 leading-relaxed text-sm">
                    {plan.description}
                  </p>

                  <button
                    onClick={() => openPaymentModal(plan.planType)}
                    disabled={buttonState.disabled}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold mb-10 transition-all ${
                      buttonState.disabled
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                        : plan.popular 
                          ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                          : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                    }`}
                  >
                    {buttonState.label}
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
            {!isLoadingPlans && pricingPlans.length === 0 && (
              <div className="lg:col-span-3 rounded-2xl border border-slate-700 bg-slate-900/40 p-8 text-center text-slate-300">
                No plans available right now. Please check back shortly.
              </div>
            )}
          </div>

          <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-6 text-left shadow-[0_0_28px_rgba(34,211,238,0.08)]">
            <p className="text-xs uppercase tracking-wider text-cyan-200 font-semibold mb-2">
              Need More Than Current Plans?
            </p>
            <p className="text-slate-200 text-sm leading-relaxed mb-4">
              If you need a custom request limit, business support, or team pricing, contact the support directly and we can set up a custom plan for you.
            </p>
            <a
              href={contactUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-300/15 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/25"
            >
              Contact Support
            </a>
          </div>
          
          <p className="mt-10 text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            By paying for a premium tier, you are directly helping in sponsoring
            and sustaining this open-source project. Thank you.
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
