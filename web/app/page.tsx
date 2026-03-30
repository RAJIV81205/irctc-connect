"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  const authMessage = useMemo(() => {
    if (!authReady) return "Checking your sign-in status...";
    if (user) return `Signed in as ${user.email}`;
    return "Not signed in";
  }, [authReady, user]);

  const onGetApiKey = () => {
    if (!authReady) return;

    if (user) {
      router.push("/dashboard");
      return;
    }

    router.push("/auth");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#1f3b8f_0%,transparent_35%),radial-gradient(circle_at_80%_90%,#14532d_0%,transparent_30%),linear-gradient(145deg,#0f172a,#111827,#020617)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-5 rounded-full border border-emerald-300/40 bg-emerald-300/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
          irctc-connect
        </span>

        <h1 className="max-w-4xl font-jetbrains text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          Build Faster With The IRCTC API Toolkit
        </h1>

        <p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
          Complete ticket booking, PNR checks, station search, trains, and seat availability with a clean API and production-focused docs.
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onGetApiKey}
            disabled={!authReady}
            className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Get API Key
          </button>

          <Link
            href="/docs"
            className="rounded-xl border border-slate-300/30 bg-slate-300/10 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-300/20"
          >
            View Docs
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-400">{authMessage}</p>

      </div>
    </main>
  );
}
