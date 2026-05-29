"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
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
      if (!email) throw new Error("Google account email not found.");

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
      setError(err instanceof Error ? err.message : "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');

        .auth-root {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 48px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* Subtle radial atmosphere */
        .auth-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 20% 20%, rgba(0,0,0,0.025), transparent),
            radial-gradient(ellipse 50% 35% at 80% 80%, rgba(0,0,0,0.02), transparent);
          pointer-events: none;
          z-index: 0;
        }

        .auth-wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Eyebrow */
        .auth-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 20px;
          animation: auth-rise 0.7s ease both;
        }

        /* Heading */
        .auth-heading {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(32px, 6vw, 44px);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -0.025em;
          color: #000;
          text-align: center;
          margin-bottom: 12px;
          animation: auth-rise 0.7s ease 0.08s both;
        }
        .auth-heading em {
          font-style: italic;
          color: #6F6F6F;
        }

        /* Subtext */
        .auth-sub {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.7;
          color: #6F6F6F;
          text-align: center;
          max-width: 320px;
          margin-bottom: 32px;
          animation: auth-rise 0.7s ease 0.14s both;
        }

        /* Card */
        .auth-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
          animation: auth-rise 0.7s ease 0.2s both;
        }

        /* Google button */
        .auth-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 14px 20px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.18s, transform 0.18s;
          margin-bottom: 20px;
        }
        .auth-google-btn:hover:not(:disabled) {
          background: #1a1a1a;
          transform: scale(1.02);
        }
        .auth-google-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .auth-google-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #fff;
          flex-shrink: 0;
        }

        /* Error */
        .auth-error {
          margin-bottom: 16px;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid rgba(220,38,38,0.15);
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          line-height: 1.55;
        }

        /* Divider */
        .auth-divider {
          border: none;
          border-top: 1px solid rgba(0,0,0,0.06);
          margin: 0 0 18px;
        }

        /* Assurance list */
        .auth-assurance {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .auth-assurance-item {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 12.5px;
          color: #6F6F6F;
          line-height: 1.55;
          font-weight: 300;
        }
        .auth-assurance-icon {
          flex-shrink: 0;
          margin-top: 1px;
          color: #000;
        }

        /* Back link */
        .auth-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 24px;
          font-size: 13px;
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.15s;
          animation: auth-rise 0.7s ease 0.28s both;
        }
        .auth-back:hover { color: #000; }

        /* Animation */
        @keyframes auth-rise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-eyebrow, .auth-heading, .auth-sub,
          .auth-card, .auth-back { animation: none; }
          .auth-google-btn { transition: none; }
        }

        @media (max-width: 480px) {
          .auth-root { padding: 72px 20px 40px; }
          .auth-card { padding: 24px 20px; border-radius: 20px; }
        }
      `}</style>

      <div className="auth-wrap">
        <p className="auth-eyebrow">IRCTC Connect</p>

        <h1 className="auth-heading">
          Your API key,<br />
          <em>one click away.</em>
        </h1>

        <p className="auth-sub">
          Sign in with Google to access your developer workspace and start
          calling railway endpoints.
        </p>

        <div className="auth-card">
          {error && <p className="auth-error">{error}</p>}

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={loading}
            className="auth-google-btn"
          >
            <span className="auth-google-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="13" height="13">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12S6.6 21.7 12 21.7c6.9 0 9.6-4.8 9.6-7.3 0-.5-.1-.9-.1-1.3H12z"/>
                <path fill="#34A853" d="M3.4 7.4l3.2 2.4c.9-2.6 3.3-4.5 5.4-4.5 1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.3 12 2.3 8.1 2.3 4.7 4.5 3.4 7.4z"/>
                <path fill="#FBBC05" d="M12 21.7c2.6 0 4.8-.9 6.4-2.5l-3-2.4c-.8.6-2 1.1-3.4 1.1-2.7 0-5-1.8-5.8-4.3l-3.2 2.5c1.3 2.9 4.7 5.6 9 5.6z"/>
                <path fill="#4285F4" d="M21.6 14.4c.1-.4.1-.8.1-1.3S21.7 12 21.6 11H12v3.1h5.5c-.3 1.5-1.2 2.6-2.1 3.4l3 2.4c1.8-1.7 3.2-4.2 3.2-7.5z"/>
              </svg>
            </span>
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing in…
              </>
            ) : (
              "Continue with Google"
            )}
          </button>

          <hr className="auth-divider" />

          <div className="auth-assurance">
            {[
              "No password to remember.",
              "Your API key stays private inside your dashboard.",
              "Sign out or regenerate access anytime.",
            ].map((item) => (
              <div key={item} className="auth-assurance-item">
                <CheckCircle2 size={14} className="auth-assurance-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/" className="auth-back">
          <ArrowLeft size={13} />
          Back to home
        </Link>
      </div>
    </main>
  );
}
