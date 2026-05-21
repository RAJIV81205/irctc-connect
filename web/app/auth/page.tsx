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
    <main
      className="relative min-h-screen overflow-hidden text-slate-100"
      style={{
        background:
          "radial-gradient(circle at 12% -5%, rgba(5,150,105,0.2), transparent 36%), radial-gradient(circle at 88% 110%, rgba(6,182,212,0.16), transparent 40%), #070910",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap');`}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(148,163,184,0.06) 0%, rgba(7,9,16,0.2) 18%, rgba(7,9,16,0.85) 100%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 py-16">
        <div
          className="w-full rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl md:p-10"
          style={{
            background: "rgba(15,17,23,0.9)",
            border: "1px solid #1e2330",
            boxShadow: "0 30px 60px rgba(2,6,23,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <p
            className="mb-3 text-xs uppercase tracking-[0.18em] text-emerald-300/80"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Secure Developer Access
          </p>
          <h1 className="text-3xl font-bold text-slate-100 md:text-4xl">Welcome to IRCTC Connect</h1>
          <p
            className="mt-4 text-sm text-slate-300"
            style={{ fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}
          >
            Continue with Google to access your dashboard, manage your API key,
            and start shipping railway data integrations in minutes.
          </p>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: loading ? "#1a1f2e" : "linear-gradient(135deg, #059669, #047857)",
              border: "1px solid rgba(16,185,129,0.45)",
              boxShadow: loading ? "none" : "0 14px 30px rgba(5,150,105,0.24)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.02em",
            }}
          >
            <span
              aria-hidden
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" role="img" aria-label="Google">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12S6.6 21.7 12 21.7c6.9 0 9.6-4.8 9.6-7.3 0-.5-.1-.9-.1-1.3H12z"
                />
                <path
                  fill="#34A853"
                  d="M3.4 7.4l3.2 2.4c.9-2.6 3.3-4.5 5.4-4.5 1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.3 12 2.3 8.1 2.3 4.7 4.5 3.4 7.4z"
                />
                <path
                  fill="#FBBC05"
                  d="M12 21.7c2.6 0 4.8-.9 6.4-2.5l-3-2.4c-.8.6-2 1.1-3.4 1.1-2.7 0-5-1.8-5.8-4.3l-3.2 2.5c1.3 2.9 4.7 5.6 9 5.6z"
                />
                <path
                  fill="#4285F4"
                  d="M21.6 14.4c.1-.4.1-.8.1-1.3S21.7 12 21.6 11H12v3.1h5.5c-.3 1.5-1.2 2.6-2.1 3.4l3 2.4c1.8-1.7 3.2-4.2 3.2-7.5z"
                />
              </svg>
            </span>
            {loading ? "Signing You In..." : "Continue with Google"}
          </button>

          {error && (
            <p
              className="mt-4 text-sm text-red-300"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {error}
            </p>
          )}

          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-slate-300 transition hover:text-slate-100"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Back to home page
          </Link>
        </div>
      </div>
    </main>
  );
}
