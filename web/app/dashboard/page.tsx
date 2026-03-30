"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import {
  Copy,
  Key,
  Mail,
  User as UserIcon,
  LogOut,
  Check,
  Zap,
  Activity,
  Clock,
} from "lucide-react";

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

export default function DashboardPage() {
  const router = useRouter();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/verify");
        const data = await response.json();

        if (response.ok && data.success && data.user) {
          setDbUser(data.user);
        } else {
          router.replace("/");
        }
      } catch (err) {
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const onLogout = async () => {
    try {
      await signOut(auth);
      await fetch("/api/user/verify", { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
    router.replace("/");
  };

  const copyApiKey = () => {
    if (dbUser?.apiKey) {
      navigator.clipboard.writeText(dbUser.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-8 w-8 animate-spin text-sky-500" />
          <p className="text-sm font-medium animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (!dbUser) return null;

  const usageLeft = Math.max(0, dbUser.limit - dbUser.usage);
  const usagePercentage =
    dbUser.limit > 0 ? (dbUser.usage / dbUser.limit) * 100 : 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#0f172a_0%,transparent_40%),radial-gradient(circle_at_90%_100%,#082f49_0%,transparent_35%),linear-gradient(160deg,#020617,#0f172a,#0f172a)] px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              Manage your API keys and usage
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white backdrop-blur-md self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-xl transition hover:border-slate-600/80">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl transition group-hover:bg-teal-500/20"></div>

            <h2 className="mb-6 text-lg font-semibold text-white/90">
              Profile Details
            </h2>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-teal-400 shadow-inner ring-1 ring-white/5">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Name</p>
                  <p className="truncate font-medium text-slate-100">
                    {dbUser.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sky-400 shadow-inner ring-1 ring-white/5">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="truncate font-medium text-slate-100">
                    {dbUser.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-xl transition hover:border-slate-600/80">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl transition group-hover:bg-sky-500/20"></div>

            <div className="mb-6 flex items-center justify-between relative z-10">
              <h2 className="text-lg font-semibold text-white/90">API Usage</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-sky-300 ring-1 ring-inset ring-sky-500/20">
                <Clock className="h-3 w-3" /> Plan: {dbUser.plan.toUpperCase()}
              </span>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-light text-white tracking-tight">
                    {usageLeft}{" "}
                    <span className="text-xl font-normal text-slate-500">
                      left
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    from {dbUser.limit} total requests
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
                  <Zap className="h-6 w-6" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-inset ring-white/5">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
                    usagePercentage > 90
                      ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      : usagePercentage > 75
                        ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        : "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                  }`}
                  style={{ width: `${Math.min(100, usagePercentage)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* API Key Section */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-xl transition hover:border-slate-600/80">
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl transition group-hover:bg-indigo-500/20"></div>
          <div className="mb-4 flex items-center gap-3 relative z-10">
            <Key className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white/90">
              Your Secret API Key
            </h2>
          </div>
          <p className="mb-6 text-sm text-slate-400 max-w-2xl relative z-10">
            Include this key in your requests to authenticate with the API. Keep
            it safe and do not share it publicly.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
            <div className="flex-1 overflow-x-auto rounded-xl border border-slate-700 bg-black/40 px-4 py-3 font-mono text-sm text-slate-300 shadow-inner scrollbar-hide">
              {dbUser.apiKey}
            </div>
            <button
              onClick={copyApiKey}
              className="group flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 sm:w-auto w-full shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy Key
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
