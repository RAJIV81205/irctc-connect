"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type LoginApiResponse = {
  success: boolean;
  message?: string;
};

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const email = credential.user.email?.trim().toLowerCase();
      const name = credential.user.displayName?.trim();

      if (!email) {
        throw new Error("Google account email not found.");
      }

      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, name }),
      });

      const result = (await response.json()) as LoginApiResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed");
      }

      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#155e75_0%,transparent_40%),radial-gradient(circle_at_90%_100%,#1e3a8a_0%,transparent_35%),linear-gradient(160deg,#020617,#0f172a,#111827)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full rounded-3xl border border-slate-300/20 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur">
          <h1 className="font-jetbrains text-3xl font-bold">Sign in to get your API key</h1>
          <p className="mt-3 text-sm text-slate-300">
            Continue with Google to login/register and create your secure session.
          </p>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
