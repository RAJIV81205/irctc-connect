"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  KeyRound,
  Loader2,
  Route,
  ShieldCheck,
  Terminal,
} from "lucide-react";
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
    <main className="auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .auth-root {
          min-height: 100vh;
          padding: 112px 24px 56px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.92), rgba(249,250,251,0.96)),
            radial-gradient(circle at 12% 14%, rgba(5,150,105,0.12), transparent 34%),
            radial-gradient(circle at 88% 20%, rgba(15,23,42,0.08), transparent 32%);
          color: #0a0c10;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .auth-shell {
          width: 100%;
          max-width: 520px;
          min-height: calc(100vh - 168px);
          margin: 0 auto;
          display: grid;
          place-items: center;
        }

        .auth-story,
        .auth-card {
          border: 1px solid #e5e7eb;
          background: rgba(255,255,255,0.88);
          box-shadow: 0 22px 55px rgba(15,23,42,0.08);
        }

        .auth-story {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 18px;
          padding: 36px;
        }

        .auth-story:before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(#eef2f7 1px, transparent 1px),
            linear-gradient(90deg, #eef2f7 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(90deg, rgba(0,0,0,0.42), transparent 72%);
          pointer-events: none;
        }

        .auth-content {
          position: relative;
          z-index: 1;
          max-width: 680px;
        }

        .auth-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border: 1px solid #bbf7d0;
          border-radius: 999px;
          background: #ecfdf5;
          color: #047857;
          font-size: 12px;
          font-weight: 600;
        }

        .auth-title {
          margin-top: 24px;
          max-width: 720px;
          font-size: clamp(38px, 5vw, 66px);
          line-height: 1.02;
          letter-spacing: -0.035em;
          font-weight: 700;
        }

        .auth-copy {
          margin-top: 22px;
          max-width: 620px;
          color: #5b6472;
          font-size: 17px;
          line-height: 1.85;
        }

        .auth-preview {
          position: relative;
          z-index: 1;
          margin-top: 42px;
          max-width: 720px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 14px;
        }

        .auth-mini-card {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          background: #ffffff;
          padding: 16px;
        }

        .auth-mini-dark {
          border-color: #1f2937;
          background: #0d1117;
          color: #e5e7eb;
        }

        .auth-route {
          display: grid;
          gap: 13px;
          margin-top: 16px;
        }

        .auth-route-row {
          display: grid;
          grid-template-columns: 24px 1fr auto;
          gap: 10px;
          align-items: center;
          font-size: 13px;
          color: #374151;
        }

        .auth-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 5px #d1fae5;
          justify-self: center;
        }

        .auth-line {
          width: 1px;
          height: 24px;
          background: #d1d5db;
          justify-self: center;
        }

        .auth-code {
          margin-top: 14px;
          display: grid;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #9ca3af;
        }

        .auth-code strong {
          color: #6ee7b7;
          font-weight: 500;
        }

        .auth-card {
          width: min(100%, 440px);
          align-self: center;
          border-radius: 18px;
          padding: 26px;
        }

        .auth-card-icon {
          display: flex;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #ecfdf5;
          color: #047857;
        }

        .auth-card h2 {
          margin-top: 22px;
          font-size: 28px;
          line-height: 1.2;
          letter-spacing: -0.02em;
          font-weight: 700;
        }

        .auth-card p {
          margin-top: 12px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .auth-google {
          margin-top: 26px;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 0;
          border-radius: 10px;
          background: #0a0c10;
          color: #ffffff;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(15,23,42,0.18);
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
        }

        .auth-google:hover {
          transform: translateY(-2px);
          background: #1f2937;
          box-shadow: 0 18px 34px rgba(15,23,42,0.22);
        }

        .auth-google:disabled {
          cursor: not-allowed;
          opacity: 0.65;
          transform: none;
          box-shadow: none;
        }

        .auth-google-mark {
          display: inline-flex;
          width: 24px;
          height: 24px;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background: #ffffff;
        }

        .auth-error {
          margin-top: 14px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fef2f2;
          padding: 11px 12px;
          color: #b91c1c;
          font-size: 13px;
          line-height: 1.5;
        }

        .auth-assurance {
          margin-top: 22px;
          display: grid;
          gap: 10px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }

        .auth-assurance-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          color: #475569;
          font-size: 13px;
          line-height: 1.55;
        }

        .auth-back {
          margin-top: 22px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.18s ease;
        }

        .auth-back:hover {
          color: #0a0c10;
        }

        @keyframes auth-in {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes auth-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        .auth-anim-1 { animation: auth-in 0.65s ease both; }
        .auth-anim-2 { animation: auth-in 0.65s ease 0.12s both; }
        .auth-float { animation: auth-in 0.7s ease 0.18s both, auth-float 7s ease-in-out 1s infinite; }

        @media (max-width: 960px) {
          .auth-root { padding: 96px 16px 40px; }
          .auth-shell { min-height: auto; }
          .auth-card { align-self: stretch; }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-anim-1,
          .auth-anim-2,
          .auth-float,
          .auth-google,
          .auth-google:hover {
            animation: none;
            transform: none;
            transition: none;
          }
        }
      `}</style>

      <div className="auth-shell">
        <section className="auth-card auth-anim-2">
          <div className="auth-card-icon">
            <KeyRound size={22} />
          </div>
          <h2>Sign in to continue</h2>
          <p>
            Use the Google account you want attached to your IRCTC Connect
            developer workspace.
          </p>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={loading}
            className="auth-google"
          >
            <span className="auth-google-mark" aria-hidden>
              <svg viewBox="0 0 24 24" width="15" height="15" role="img" aria-label="Google">
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
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in
              </>
            ) : (
              "Continue with Google"
            )}
          </button>

          {error && <p className="auth-error">{error}</p>}

          <div className="auth-assurance">
            {[
              "No password to remember.",
              "Your API key remains private inside your dashboard.",
              "You can sign out or regenerate access anytime.",
            ].map((item) => (
              <div key={item} className="auth-assurance-item">
                <CheckCircle2 size={16} color="#059669" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <Link href="/" className="auth-back">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </section>
      </div>
    </main>
  );
}
