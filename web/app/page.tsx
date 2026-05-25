import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import {
  Star, Download, Terminal, Train, MapPin,
  Search, Ticket, CheckCircle2, Github, BookOpen,
} from "lucide-react";
import { absoluteUrl, buildMetadata, SITE_DESCRIPTION, SITE_NAME } from "../lib/seo";
import CanvasSequencer from "@/components/CanvasSequencer";

export const metadata: Metadata = {
  ...buildMetadata({
    title: undefined,
    description: "IRCTC Connect is a Node.js SDK and Indian Railways API for PNR status, live train tracking, train search, station boards, and seat availability.",
    path: "/",
  }),
};

async function getStats() {
  try {
    const [githubRes, npmRes] = await Promise.all([
      fetch("https://api.github.com/repos/RAJIV81205/irctc-connect", { next: { revalidate: 3600 } }),
      fetch("https://api.npmjs.org/downloads/point/last-month/irctc-connect", { next: { revalidate: 3600 } }),
    ]);
    const github = await githubRes.json();
    const npm    = await npmRes.json();
    return { stars: github.stargazers_count || 0, downloads: npm.downloads || 0 };
  } catch { return { stars: 0, downloads: 0 }; }
}

type EnterpriseShowcaseUser = { id: string; name: string; maskedEmail: string };
const enterpriseUsersFallback: EnterpriseShowcaseUser[] = [
  { id: "f-1", name: "Nikhil S.",  maskedEmail: "nikh.....gma.com" },
  { id: "f-2", name: "Priya R.",   maskedEmail: "priy.....out.com" },
  { id: "f-3", name: "Ankit V.",   maskedEmail: "anki.....yah.com" },
  { id: "f-4", name: "Ritika M.",  maskedEmail: "riti.....gma.com" },
  { id: "f-5", name: "Aarav J.",   maskedEmail: "aara.....pro.com" },
  { id: "f-6", name: "Sneha K.",   maskedEmail: "sneh.....zoh.com" },
];

async function getEnterpriseShowcaseUsers(): Promise<EnterpriseShowcaseUser[]> {
  try {
    const headerStore = await headers();
    const host  = headerStore.get("x-forwarded-host") || headerStore.get("host");
    const proto = headerStore.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const base  = host ? `${proto}://${host}` : absoluteUrl("/");
    const res   = await fetch(`${base}/api/public/enterprise-users`, { next: { revalidate: 300 } });
    const data  = (await res.json()) as { success?: boolean; users?: EnterpriseShowcaseUser[] };
    if (!res.ok || !data?.success || !Array.isArray(data.users)) return enterpriseUsersFallback;
    return data.users.length > 0 ? data.users : enterpriseUsersFallback;
  } catch { return enterpriseUsersFallback; }
}

export default async function LandingPage() {
  const stats           = await getStats();
  const enterpriseUsers = await getEnterpriseShowcaseUsers();
  const marqueeUsers    = [...enterpriseUsers, ...enterpriseUsers];

  const websiteSchema  = { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/"), description: SITE_DESCRIPTION };
  const softwareSchema = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: "irctc-connect",
    applicationCategory: "DeveloperApplication", operatingSystem: "Node.js",
    url: absoluteUrl("/"), description: SITE_DESCRIPTION, softwareVersion: "3.0.3",
    downloadUrl: "https://www.npmjs.com/package/irctc-connect",
    codeRepository: "https://github.com/RAJIV81205/irctc-connect",
    author: { "@type": "Person", name: "Rajiv Dubey", url: "https://github.com/RAJIV81205" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --white:     #ffffff;
          --off:       rgba(255,255,255,0.92);
          --muted:     rgba(255,255,255,0.72);
          --sage:      #7ec8a4;
          --gold:      #e2b96f;
          --glass-bg:  rgba(0,0,0,0.58);
          --glass-br:  rgba(255,255,255,0.22);
          --glass-br2: rgba(255,255,255,0.07);
        }

        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-line {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 1; }
        }

        .fu  { animation: fade-up 0.85s ease both; }
        .d1  { animation-delay: 0.10s; }
        .d2  { animation-delay: 0.22s; }
        .d3  { animation-delay: 0.34s; }
        .d4  { animation-delay: 0.46s; }
        .d5  { animation-delay: 0.58s; }

        .feat-row {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          border-top: 1px solid var(--glass-br2);
          padding: 1.75rem 0;
          transition: background 0.2s;
        }
        .feat-row:hover { background: rgba(255,255,255,0.03); }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      <CanvasSequencer />

      <main style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--white)" }}>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">

          {/* Badge */}
          <a
            href="https://www.npmjs.com/package/irctc-connect"
            target="_blank" rel="noopener noreferrer"
            className="fu d1 mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-br)", color: "var(--sage)", backdropFilter: "blur(12px)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span style={{ color: "var(--gold)" }}>◆</span>
            v3.0.3 — Open Source
          </a>

          {/* Title */}
          <h1
            className="fu d2 leading-none"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3rem, 8.5vw, 6.8rem)",
              fontWeight: 400,
              color: "var(--white)",
              letterSpacing: "0.03em",
              textShadow: "0 2px 40px rgba(0,0,0,0.7)",
            }}
          >
            IRCTC{" "}
            <span style={{ color: "var(--sage)" }}>Connect</span>
          </h1>

          {/* Tagline */}
          <p
            className="fu d3 mt-6"
            style={{ fontSize: "0.82rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--off)", fontWeight: 500 }}
          >
            Reliable Node.js SDK for Indian Railways API
          </p>

          {/* npm */}
          <div
            className="fu d4 mt-10 flex items-center gap-4 rounded-2xl px-6 py-3.5"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-br)", backdropFilter: "blur(20px)" }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", color: "var(--sage)" }}>
              npm install irctc-connect
            </span>
            <Terminal style={{ width: 15, height: 15, color: "var(--muted)" }} />
          </div>

          {/* CTA buttons */}
          <div className="fu d5 mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/docs"
              className="flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "var(--white)", color: "#0a0f0a" }}
            >
              <BookOpen style={{ width: 14, height: 14 }} />
              Documentation
            </Link>
            <a
              href="https://github.com/RAJIV81205/irctc-connect"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition-all hover:opacity-70"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-br)", backdropFilter: "blur(12px)", color: "var(--white)" }}
            >
              <Github style={{ width: 14, height: 14 }} />
              GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="fu d5 mt-12 flex items-center gap-10">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Star style={{ width: 14, height: 14, fill: "var(--gold)", color: "var(--gold)" }} />
                <span className="text-xl font-semibold">{stats.stars.toLocaleString()}</span>
              </div>
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>Stars</span>
            </div>
            <div style={{ width: 1, height: 30, background: "var(--glass-br)" }} />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Download style={{ width: 14, height: 14, color: "var(--sage)" }} />
                <span className="text-xl font-semibold">{stats.downloads.toLocaleString()}</span>
              </div>
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase" }}>Monthly</span>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: "var(--muted)" }}>
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Scroll</span>
            <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)", animation: "pulse-line 2s ease-in-out infinite" }} />
          </div>
        </section>

        {/* ── CAPABILITIES ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-8 py-28">
          {/* Section header */}
          <div className="mb-4 flex items-center gap-5">
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--sage)", fontFamily: "'JetBrains Mono', monospace" }}>
              Capabilities
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--glass-br2)" }} />
          </div>
          <h2
            className="mb-14"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, color: "var(--white)", letterSpacing: "-0.01em" }}
          >
            Everything you need<br />
            to build train apps
          </h2>

          <div className="grid sm:grid-cols-2">
            {[
              { icon: Ticket,       title: "PNR Status",        desc: "Real-time passenger info and booking details." },
              { icon: Train,        title: "Train Information",  desc: "Full route maps, halts and live schedules."    },
              { icon: MapPin,       title: "Live Tracking",      desc: "Exact GPS position updated in real time."      },
              { icon: MapPin,       title: "Station Board",      desc: "All arrivals and departures at any station."   },
              { icon: Search,       title: "Train Search",       desc: "Direct and connecting trains between stations."},
              { icon: CheckCircle2, title: "Seat Availability",  desc: "Fare breakdown across all travel classes."     },
            ].map((feat, i) => (
              <div key={i} className="feat-row px-2">
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-br)" }}
                >
                  <feat.icon style={{ width: 15, height: 15, color: "var(--sage)" }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", fontWeight: 400, color: "var(--white)", marginBottom: "0.2rem" }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--off)", lineHeight: 1.65, fontWeight: 300 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ENTERPRISE ────────────────────────────────────────────────── */}
        <section className="overflow-hidden pb-32">
          <div className="mx-auto mb-4 flex max-w-5xl items-center gap-5 px-8">
            <div style={{ flex: 1, height: 1, background: "var(--glass-br2)" }} />
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--sage)", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>
              Enterprise
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--glass-br2)" }} />
          </div>
          <h2
            className="mb-12 text-center"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: "var(--white)" }}
          >
            Trusted by developers worldwide
          </h2>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.5), transparent)" }} />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.5), transparent)" }} />
            <div className="flex w-max gap-3" style={{ animation: "marquee-scroll 30s linear infinite" }}>
              {marqueeUsers.map((user, idx) => (
                <div
                  key={`${user.id}-${idx}`}
                  className="flex min-w-[210px] items-center gap-3 rounded-2xl px-4 py-3"
                  style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-br)", backdropFilter: "blur(12px)" }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "rgba(126,200,164,0.15)", border: "1px solid rgba(126,200,164,0.3)", color: "var(--sage)", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", fontWeight: 400 }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "var(--white)", fontWeight: 500 }}>{user.name}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "'JetBrains Mono', monospace" }}>{user.maskedEmail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="border-t px-8 py-10 text-center" style={{ borderColor: "var(--glass-br2)" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            irctc-connect · MIT License · Built by{" "}
            <a href="https://github.com/RAJIV81205" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" style={{ color: "var(--sage)" }}>
              Rajiv Dubey
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}
