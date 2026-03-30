"use client";

import React from "react";
import { Check, Star, Heart, Zap, Sparkles, Rocket } from "lucide-react";
import { Header } from "../../components/Header";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#0f172a_0%,transparent_40%),radial-gradient(circle_at_90%_100%,#082f49_0%,transparent_35%),linear-gradient(160deg,#020617,#0f172a,#0f172a)] font-noto-sans selection:bg-sky-500/30 text-slate-100 antialiased overflow-x-hidden">
      <Header />

      {/* Main Content */}
      <main className="pt-32 pb-24 px-6 relative">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 text-sm font-medium mb-8 uppercase tracking-widest shadow-sm ring-1 ring-inset ring-sky-500/20">
            <Heart className="w-4 h-4 fill-current animate-pulse" />
            <span>Sponsor the Project</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-sm">
            Plans & Pricing
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-4">
            Transparent pricing for all stages of your development—from experimentation to full-scale deployment.
          </p>

          {/* Pricing Cards */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-8xl mx-auto text-left">
            
            {/* Free Tier */}
            <div className="group relative overflow-hidden rounded-4xl border border-slate-800/60 bg-slate-900/40 p-8 backdrop-blur-xl transition hover:border-slate-700/80">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-slate-500/5 blur-3xl transition group-hover:bg-slate-500/10"></div>
              
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/50 text-slate-400 mb-8 ring-1 ring-white/5">
                <Rocket className="h-7 w-7" />
              </div>
              
              <h3 className="text-xl font-bold text-white/90 mb-1">Free Tier</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium uppercase tracking-wider italic">Best for testing</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold text-white tracking-tight">₹0</span>
                <span className="text-slate-500 font-medium tracking-tight">/month</span>
              </div>
              
              <button className="w-full py-3.5 px-6 rounded-xl font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 transition-all border border-slate-700/50 hover:border-slate-600 mb-10">
                Start for Free
              </button>
              
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Core Features</div>
                <ul className="space-y-3.5">
                  {[
                    "50 API requests per month",
                    "Basic endpoint access",
                    "Community support",
                    "Standard rate limits"
                  ].map((feat, i) => (
                    <li key={i} className="flex gap-3 text-slate-400 text-sm">
                      <Check className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="group relative overflow-hidden rounded-4xl border border-sky-500/40 bg-slate-900/60 p-8 backdrop-blur-2xl shadow-2xl scale-105 z-10">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl"></div>
              
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 rounded-full bg-sky-500 text-slate-950 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(14,165,233,0.4)]">
                <Star className="w-3.5 h-3.5 fill-current" />
                Most Popular
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 mb-8 ring-1 ring-sky-500/30">
                <Sparkles className="h-7 w-7" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">Pro Tier</h3>
              <p className="text-sm text-sky-400 mb-6 font-medium uppercase tracking-wider">Perfect for power users</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold text-white tracking-tight">₹20</span>
                <span className="text-sky-300/60 font-medium tracking-tight">/month</span>
              </div>
              
              <button className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-white hover:bg-sky-50 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all mb-10">
                Upgrade to Pro
              </button>
              
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] mb-4">Included Performance</div>
                <ul className="space-y-3.5">
                  {[
                    "1000 API requests per month",
                    "Priority email support",
                    "Advanced rate limits",
                    "Sponsor badge in dashboard",
                    "Exclusive API beta access"
                  ].map((feat, i) => (
                    <li key={i} className="flex gap-3 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span className={i === 0 ? "font-semibold text-white" : ""}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Advance Tier */}
            <div className="group relative overflow-hidden rounded-4xl border border-slate-800/60 bg-slate-900/40 p-8 backdrop-blur-xl transition hover:border-slate-700/80">
               <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl transition group-hover:bg-emerald-500/10"></div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-8 ring-1 ring-emerald-500/20">
                <Zap className="h-7 w-7" />
              </div>
              
              <h3 className="text-xl font-bold text-white/90 mb-1">Advance Plan</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium uppercase tracking-wider italic">Scale and scale</p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold text-white tracking-tight">₹50</span>
                <span className="text-slate-500 font-medium tracking-tight">/month</span>
              </div>
              
              <button className="w-full py-3.5 px-6 rounded-xl font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all border border-emerald-500/30 mb-10">
                Go Advance
              </button>
              
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">Enterprise Specs</div>
                <ul className="space-y-3.5">
                  {[
                    "10k API requests per month",
                    "Dedicated support line",
                    "Custom SLAs & availability",
                    "Premium sponsor recognition",
                    "Multi-key management"
                  ].map((feat, i) => (
                    <li key={i} className="flex gap-3 text-slate-400 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className={i === 0 ? "font-semibold text-emerald-200" : ""}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-20 p-8 rounded-3xl border border-slate-800/40 bg-slate-900/20 backdrop-blur-sm max-w-2xl mx-auto">
             <p className="text-slate-400 text-sm leading-relaxed">
              By choosing a premium plan, you&apos;re directly supporting the maintenance and scaling of this open-source project. Thank you for empowering developers! 🚀
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
