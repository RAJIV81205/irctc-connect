"use client";
import React from "react";
import { Check, ArrowLeft, Star, Heart } from "lucide-react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export default function PricingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-inter selection:bg-blue-500/30 transition-colors duration-300">
      {/* Simple Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" title="Back to Docs">
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Back to Docs
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
             {/* Dark mode toggle copied */}
             <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-6 relative">
        {/* Background glow effects */}
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

          {/* Pricing Cards */}
          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            
            {/* Free Plan */}
            <div className="relative group rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 p-10 hover:border-blue-500/50 transition-colors backdrop-blur-xl">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-100 dark:border-blue-500/20">
                 <div className="w-6 h-6 rounded bg-blue-600 dark:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Free Tier</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">₹0</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/month</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-8 h-12 leading-relaxed">
                For developers exploring the platform and testing basic functionality.
              </p>
              
              <button className="w-full py-4 px-6 rounded-2xl font-semibold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10 mb-10">
                Start for Free
              </button>
              
              <div className="space-y-5">
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Features</div>
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

            {/* Pro Plan */}
            <div className="relative group rounded-[2.5rem] border border-blue-300 dark:border-white/20 bg-white dark:bg-zinc-900 shadow-2xl dark:shadow-[0_0_50px_rgba(255,255,255,0.03)] p-10 transform md:-translate-y-4">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider shadow-lg border border-slate-800 dark:border-white/80">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                Popular
              </div>

              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-8 border border-slate-200 dark:border-white/10">
                 <div className="w-6 h-6 rounded bg-slate-800 dark:bg-white shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro Tier</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">₹20</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/month</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-8 h-12 leading-relaxed">
                For active developers building projects and scaling applications.
              </p>
              
              <button className="w-full py-4 px-6 rounded-2xl font-semibold text-white bg-slate-900 dark:bg-white dark:text-black hover:opacity-90 transition-opacity mb-10 shadow-lg">
                Get Started
              </button>
              
              <div className="space-y-5">
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Features</div>
                <ul className="space-y-4">
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-slate-900 dark:text-white shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900 dark:text-white">1000 API requests per month</span>
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

            {/* Advance Plan */}
            <div className="relative group rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 p-10 hover:border-emerald-500/50 transition-colors backdrop-blur-xl">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-100 dark:border-emerald-500/20">
                 <div className="w-6 h-6 rounded bg-emerald-600 dark:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Advance Plan</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">₹50</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/month</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-8 h-12 leading-relaxed">
                For heavy users needing massive request limits and reliability.
              </p>
              
              <button className="w-full py-4 px-6 rounded-2xl font-semibold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10 mb-10">
                Go Advance
              </button>
              
              <div className="space-y-5">
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Features</div>
                <ul className="space-y-4">
                  <li className="flex gap-4 text-slate-600 dark:text-slate-300">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">10k API requests per month</span>
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
            By paying for a premium tier, you are directly helping in sponsoring and sustaining this open-source project. Thank you! 🚀
          </p>

        </div>
      </main>
    </div>
  );
}