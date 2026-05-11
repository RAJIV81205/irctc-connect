"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Star,
  Heart,
  Terminal,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import type { PricingPlan, PaidPlanType } from "../../lib/constants";

type Notice = {
  kind: "success" | "error" | "info";
  text: string;
} | null;

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
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
    <div className="min-h-screen bg-[#050816] animate-pulse" />
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
  const [currentPlan, setCurrentPlan] = useState<
    "free" | PaidPlanType | null
  >(null);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [showPaymentNotice, setShowPaymentNotice] = useState(false);

  const [selectedPlan, setSelectedPlan] =
    useState<PaidPlanType | null>(null);

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [notice, setNotice] = useState<Notice>(null);

  const [pricingPlans] =
    useState<PricingPlan[]>(initialPlans);

  const [offerEndsAt] =
    useState<string | null>(initialOfferEndsAt);

  const [planContactEmail] =
    useState(initialContactEmail);

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

  const orderIdFromQuery =
    searchParams.get("order_id");

  const isPaymentReturn =
    searchParams.get("payment_return") === "1";

  const getNumericPrice = (value: string) =>
    Number(value.replace(/[^\d.]/g, "")) || 0;

  const getDiscountPercent = (
    originalPrice: string,
    discountedPrice: string
  ) => {
    const original = getNumericPrice(originalPrice);
    const discounted = getNumericPrice(discountedPrice);

    if (!original || discounted >= original)
      return null;

    return Math.round(
      ((original - discounted) / original) * 100
    );
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

    const offerDeadline =
      new Date(offerEndsAt).getTime();

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

      const days = Math.floor(
        diff / (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (diff / (1000 * 60 * 60)) % 24
      );

      const minutes = Math.floor(
        (diff / (1000 * 60)) % 60
      );

      const seconds = Math.floor(
        (diff / 1000) % 60
      );

      setTimeLeft({
        days,  
        hours,
        minutes,
        seconds,
        expired: false,
      });
    };

    updateTimer();

    const intervalId = setInterval(
      updateTimer,
      1000
    );

    return () => clearInterval(intervalId);
  }, [offerEndsAt]);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(
          "/api/user/verify",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setIsAuthenticated(false);
          setCurrentPlan(null);

          return;
        }

        const data = await response.json();

        setIsAuthenticated(Boolean(data?.success));

        const rawPlan = String(
          data?.user?.plan || ""
        ).toLowerCase();

        const mappedPlan =
          rawPlan === "enterprise"
            ? "advance"
            : rawPlan;

        if (
          mappedPlan === "free" ||
          mappedPlan === "pro" ||
          mappedPlan === "advance"
        ) {
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
    if (
      !isPaymentReturn ||
      !orderIdFromQuery ||
      isCheckingAuth ||
      !isAuthenticated
    ) {
      return;
    }

    const syncOrder = async () => {
      try {
        setNotice({
          kind: "info",
          text: "Checking payment status...",
        });

        const response = await fetch(
          `/api/user/get-order?orderId=${encodeURIComponent(
            orderIdFromQuery
          )}&sync=true`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to verify payment status"
          );
        }

        if (data?.order?.credited) {
          setNotice({
            kind: "success",
            text: "Payment successful. Your plan is now active.",
          });

          return;
        }

        setNotice({
          kind: "info",
          text: "Payment is still processing.",
        });
      } catch (error: unknown) {
        setNotice({
          kind: "error",
          text: getErrorMessage(
            error,
            "Unable to verify payment."
          ),
        });
      }
    };

    syncOrder();
  }, [
    isPaymentReturn,
    orderIdFromQuery,
    isCheckingAuth,
    isAuthenticated,
  ]);

  const openPaymentModal = (
    planType: PaidPlanType | "free"
  ) => {
    if (planType === "free") return;

    if (!isAuthenticated || isCheckingAuth) {
      setNotice({
        kind: "info",
        text: "Please login first.",
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

      const response = await fetch(
        "/api/user/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            planType: selectedPlan,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.redirectUrl) {
        throw new Error(
          data?.message ||
            "Unable to create order"
        );
      }

      window.location.href = data.redirectUrl;
    } catch (error: unknown) {
      setNotice({
        kind: "error",
        text: getErrorMessage(
          error,
          "Unable to create order."
        ),
      });

      setIsCreatingOrder(false);
    }
  };

  const getButtonState = (
    plan: PricingPlan
  ) => {
    if (
      !isCheckingAuth &&
      isAuthenticated &&
      currentPlan === "advance"
    ) {
      if (plan.planType === "advance") {
        return {
          label: "Current Plan",
          disabled: true,
        };
      }

      if (plan.planType === "pro") {
        return {
          label: "Not Available",
          disabled: true,
        };
      }

      return {
        label: "Included",
        disabled: true,
      };
    }

    if (plan.planType === "free") {
      return {
        label: plan.buttonText,
        disabled: false,
      };
    }

    if (isCheckingAuth) {
      return {
        label: "Checking Login...",
        disabled: true,
      };
    }

    if (!isAuthenticated) {
      return {
        label: "Login to Continue",
        disabled: true,
      };
    }

    if (currentPlan === plan.planType) {
      return {
        label: "Current Plan",
        disabled: true,
      };
    }

    return {
      label: "Upgrade Plan",
      disabled: false,
    };
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="absolute bottom-[-10rem] right-[-10rem] h-[35rem] w-[35rem] rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <main className="relative z-10 px-6 py-28">

        <div className="mx-auto max-w-7xl">

          {/* HERO */}
          <div className="mb-24 text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-2 text-sm font-medium text-emerald-300 backdrop-blur-xl">
              <Heart className="h-4 w-4 fill-emerald-400" />
              Sponsor the Open Source Project
            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Simple Pricing
              <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-500 bg-clip-text text-transparent">
                Built for Scale
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Powerful request limits, premium support,
              and scalable infrastructure designed for
              modern applications.
            </p>

          </div>

          {/* NOTICE */}
          {notice && (
            <div
              className={`mx-auto mb-10 max-w-3xl rounded-2xl border px-5 py-4 backdrop-blur-xl ${
                notice.kind === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : notice.kind === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
              }`}
            >
              {notice.text}
            </div>
          )}

          {/* PRICING */}
          <div className="grid gap-8 lg:grid-cols-3">

            {pricingPlans.map((plan) => {

              const buttonState =
                getButtonState(plan);

              const isPopular =
                plan.planType === "advance";

              const isOfferActive =
                Boolean(plan.originalPrice) &&
                !timeLeft.expired;

              const discountPercent =
                isOfferActive &&
                plan.originalPrice
                  ? getDiscountPercent(
                      plan.originalPrice,
                      plan.price
                    )
                  : null;

              const displayedPrice =
                isOfferActive &&
                plan.originalPrice
                  ? plan.price
                  : plan.originalPrice || plan.price;

              return (
                <div
                  key={plan.id}
                  className={`group relative overflow-hidden rounded-[32px] border backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 ${
                    isPopular
                      ? "border-emerald-400/30 bg-white/[0.08] shadow-[0_0_80px_rgba(16,185,129,0.15)]"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >

                  {/* glow */}
                  {isPopular && (
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/10 to-transparent" />
                  )}

                  {/* badge */}
                  {isPopular && (
                    <div className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">
                      <Star className="h-3 w-3 fill-black" />
                      POPULAR
                    </div>
                  )}

                  <div className="relative z-10 p-8">

                    {/* ICON */}
                    <div
                      className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${
                        isPopular
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-white/5 text-white"
                      }`}
                    >
                      {isPopular ? (
                        <Sparkles className="h-7 w-7" />
                      ) : (
                        <Terminal className="h-7 w-7" />
                      )}
                    </div>

                    {/* TITLE */}
                    <h3 className="text-3xl font-bold">
                      {plan.name}
                    </h3>

                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                      {plan.description}
                    </p>

                    {/* PRICE */}
                    <div className="mt-10">

                      {plan.originalPrice &&
                        isOfferActive &&
                        discountPercent && (
                          <div className="mb-3 flex items-center gap-3">

                            <span className="text-lg text-slate-500 line-through">
                              {plan.originalPrice}
                            </span>

                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                              {discountPercent}% OFF
                            </span>

                          </div>
                        )}

                      <div className="flex items-end gap-2">

                        <span className="text-6xl font-black tracking-tight">
                          {displayedPrice}
                        </span>

                        <span className="mb-2 text-slate-400">
                          {plan.period}
                        </span>

                      </div>

                      {!timeLeft.expired &&
                        plan.originalPrice && (
                          <div className="mt-5 inline-flex rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-200">

                            Ends in&nbsp;

                            {timeLeft.days}d{" "}
                            {String(
                              timeLeft.hours
                            ).padStart(2, "0")}
                            h{" "}
                            {String(
                              timeLeft.minutes
                            ).padStart(2, "0")}
                            m{" "}
                            {String(
                              timeLeft.seconds
                            ).padStart(2, "0")}
                            s

                          </div>
                        )}
                    </div>

                    {/* BUTTON */}
                    <button
                      onClick={() =>
                        openPaymentModal(
                          plan.planType
                        )
                      }
                      disabled={
                        buttonState.disabled
                      }
                      className={`mt-10 w-full rounded-2xl py-4 font-semibold transition-all duration-300 ${
                        buttonState.disabled
                          ? "cursor-not-allowed bg-white/5 text-slate-500"
                          : isPopular
                          ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.35)]"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {buttonState.label}
                    </button>

                    {/* FEATURES */}
                    <div className="mt-10 border-t border-white/10 pt-8">

                      <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <ShieldCheck className="h-4 w-4" />
                        Features
                      </div>

                      <div className="space-y-4">

                        {plan.features.map(
                          (feature, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3"
                            >

                              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10">
                                <Check className="h-3 w-3 text-emerald-300" />
                              </div>

                              <span
                                className={`text-sm leading-relaxed ${
                                  feature.highlight
                                    ? "font-semibold text-white"
                                    : "text-slate-300"
                                }`}
                              >
                                {feature.text}
                              </span>

                            </div>
                          )
                        )}

                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* CONTACT */}
          <div className="mx-auto mt-20 max-w-4xl rounded-[32px] border border-cyan-400/20 bg-cyan-400/5 p-10 backdrop-blur-2xl">

            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

              <div>

                <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
                  Need a Custom Plan?
                </p>

                <h3 className="mt-3 text-3xl font-bold">
                  Enterprise & Team Pricing
                </h3>

                <p className="mt-4 max-w-2xl leading-relaxed text-slate-400">
                  Need higher request limits,
                  dedicated support, or custom
                  infrastructure? Contact us and
                  we’ll create a custom plan for
                  your business.
                </p>

              </div>

              <a
                href={contactUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-4 font-semibold text-cyan-200 transition-all hover:bg-cyan-400/20"
              >
                Contact Support
              </a>

            </div>
          </div>

          {/* FOOTER */}
          <p className="mx-auto mt-12 max-w-2xl text-center leading-relaxed text-slate-500">
            By purchasing a premium plan, you are
            directly helping support and sustain
            this open-source project. Thank you.
          </p>

        </div>
      </main>

      {/* MODAL */}
      {showPaymentNotice && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-xl">

          <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#0b1220]/90 p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)]">

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10">
              <ShieldCheck className="h-8 w-8 text-emerald-300" />
            </div>

            <h3 className="text-3xl font-bold">
              Secure Checkout
            </h3>

            <p className="mt-4 leading-relaxed text-slate-400">
              You will now be redirected to
              complete payment securely for the{" "}
              <span className="font-semibold uppercase text-emerald-300">
                {selectedPlan}
              </span>{" "}
              plan.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end">

              <button
                onClick={() => {
                  setShowPaymentNotice(false);
                  setSelectedPlan(null);
                }}
                disabled={isCreatingOrder}
                className="rounded-2xl border border-white/10 px-5 py-3 text-slate-300 transition-all hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                onClick={startPayment}
                disabled={isCreatingOrder}
                className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 font-bold text-black transition-all hover:scale-[1.02]"
              >
                {isCreatingOrder
                  ? "Creating Order..."
                  : "Proceed to Payment"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
