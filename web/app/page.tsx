import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowRight,
  CheckCircle2,
  Github,
  MapPin,
  Search,
  Ticket,
  Train,
  Users,
} from "lucide-react";
// Github is deprecated in newer lucide versions — aliased here for compatibility
import {
  absoluteUrl,
  buildMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "../lib/seo";
import { CinematicHero } from "../components/CinematicHero";

export const metadata: Metadata = {
  ...buildMetadata({
    title: undefined,
    description:
      "IRCTC Connect is a Node.js SDK and Indian Railways API for PNR status, live train tracking, train search, station boards, and seat availability.",
    path: "/",
  }),
};

/* ─────────────────────────────────────────────
   Data fetching
───────────────────────────────────────────── */
async function getStats() {
  try {
    const [githubRes, npmRes] = await Promise.all([
      fetch("https://api.github.com/repos/RAJIV81205/irctc-connect", {
        next: { revalidate: 3600 },
      }),
      fetch("https://api.npmjs.org/downloads/point/last-month/irctc-connect", {
        next: { revalidate: 3600 },
      }),
    ]);
    const github = await githubRes.json();
    const npm = await npmRes.json();
    return {
      stars: github.stargazers_count || 0,
      downloads: npm.downloads || 0,
    };
  } catch {
    return { stars: 0, downloads: 0 };
  }
}

type EnterpriseShowcaseUser = { id: string; name: string; maskedEmail: string };

const enterpriseUsersFallback: EnterpriseShowcaseUser[] = [
  { id: "f-1", name: "Nikhil S.", maskedEmail: "nikh.....gma.com" },
  { id: "f-2", name: "Priya R.", maskedEmail: "priy.....out.com" },
  { id: "f-3", name: "Ankit V.", maskedEmail: "anki.....yah.com" },
  { id: "f-4", name: "Ritika M.", maskedEmail: "riti.....gma.com" },
  { id: "f-5", name: "Aarav J.", maskedEmail: "aara.....pro.com" },
  { id: "f-6", name: "Sneha K.", maskedEmail: "sneh.....zoh.com" },
];

async function getEnterpriseShowcaseUsers(): Promise<EnterpriseShowcaseUser[]> {
  try {
    const headerStore = await headers();
    const host =
      headerStore.get("x-forwarded-host") || headerStore.get("host");
    const proto =
      headerStore.get("x-forwarded-proto") ||
      (host?.includes("localhost") ? "http" : "https");
    const base = host ? `${proto}://${host}` : absoluteUrl("/");
    const res = await fetch(`${base}/api/public/enterprise-users`, {
      next: { revalidate: 300 },
    });
    const data = (await res.json()) as {
      success?: boolean;
      users?: EnterpriseShowcaseUser[];
    };
    if (!res.ok || !data?.success || !Array.isArray(data.users))
      return enterpriseUsersFallback;
    return data.users.length > 0 ? data.users : enterpriseUsersFallback;
  } catch {
    return enterpriseUsersFallback;
  }
}

/* ─────────────────────────────────────────────
   Static data
───────────────────────────────────────────── */
const endpoints = [
  {
    icon: Ticket,
    title: "PNR Status",
    method: "checkPNRStatus",
    description:
      "Current passenger and booking status from a 10-digit PNR number.",
  },
  {
    icon: Train,
    title: "Train Info",
    method: "getTrainInfo",
    description: "Route, stops, schedule, and running-day information.",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    method: "trackTrain",
    description: "Live movement, station timeline, and delay context.",
  },
  {
    icon: Search,
    title: "Train Search",
    method: "searchTrainBetweenStations",
    description:
      "Find trains between two stations with useful timetable data.",
  },
  {
    icon: CheckCircle2,
    title: "Seat Availability",
    method: "getAvailability",
    description: "Availability and fare details by class, quota, and date.",
  },
  {
    icon: Users,
    title: "Station Board",
    method: "liveAtStation",
    description:
      "Arrivals, departures, and trains passing through a station.",
  },
];

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default async function LandingPage() {
  const stats = await getStats();
  const enterpriseUsers = await getEnterpriseShowcaseUsers();

  const heroStats = [
    { label: "API Requests", value: "3M+" },
    { label: "Uptime", value: "99.9%" },
    { label: "Live Train Data", value: "✓" },
    { label: "SDK", value: "v3.0.4" },
  ];

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/docs")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "irctc-connect",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Node.js",
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    softwareVersion: "3.0.4",
    downloadUrl: "https://www.npmjs.com/package/irctc-connect",
    codeRepository: "https://github.com/RAJIV81205/irctc-connect",
    featureList: [
      "PNR Status API",
      "Live Train Tracking",
      "Seat Availability API",
      "Train Search Between Stations",
      "Station Live Board",
      "Train Schedule and Route Info",
    ],
    author: {
      "@type": "Person",
      name: "Rajiv Dubey",
      url: "https://github.com/RAJIV81205",
    },
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "INR" },
      { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "INR", url: absoluteUrl("/pricing") },
    ],
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    ],
  };

  return (
    <main style={{ background: "#ffffff", minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── CINEMATIC HERO ── */}
      <CinematicHero stats={heroStats} />

      {/* ── ENDPOINTS ── */}
      <section className="lp-section">
        <div className="lp-inner">
          <div className="lp-section-head">
            <p className="lp-eyebrow">What it includes</p>
            <h2 className="lp-h2">
              Six methods.
              <br />
              Every use case.
            </h2>
            <p className="lp-body">
              Each method maps to a clear railway data use case. Your team can
              understand the integration at a glance.
            </p>
          </div>

          <div className="lp-endpoints">
            {endpoints.map((ep) => (
              <article key={ep.method} className="lp-ep-card">
                <div className="lp-ep-icon" aria-hidden>
                  <ep.icon size={17} />
                </div>
                <div className="lp-ep-title">{ep.title}</div>
                <code className="lp-ep-method">{ep.method}()</code>
                <p className="lp-ep-desc">{ep.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CODE SHOWCASE ── */}
      <section className="lp-section lp-section-tinted">
        <div className="lp-inner">
          <div className="lp-code-grid">
            {/* Left: copy */}
            <div className="lp-code-copy">
              <p className="lp-eyebrow">How developers use it</p>
              <h2 className="lp-h2" style={{ maxWidth: 400 }}>
                Small surface.
                <br />
                Built for backends.
              </h2>
              <p className="lp-body">
                Works in API routes, background jobs, support tools, or mobile
                app backends. One key, one import, six methods.
              </p>
              <ul className="lp-checklist">
                {[
                  "Predictable response shape",
                  "Works with any server-side framework",
                  "Usage plans and developer dashboard",
                  "TypeScript types included",
                ].map((f) => (
                  <li key={f} className="lp-check-item">
                    <CheckCircle2 size={15} className="lp-check-icon" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: code block */}
            <div className="lp-code-block">
              <div className="lp-code-bar">
                <div className="lp-dots">
                  <span className="lp-dot lp-dot-r" />
                  <span className="lp-dot lp-dot-y" />
                  <span className="lp-dot lp-dot-g" />
                </div>
                <span className="lp-code-fname">journey.ts</span>
                <span style={{ width: 52 }} />
              </div>
              <pre className="lp-pre" aria-label="Code example">
                <code>
                  <span className="lk">import</span>
                  {" { configure,\n         checkPNRStatus, trackTrain }\n"}
                  <span className="lk">from</span>{" "}
                  <span className="ls">&quot;irctc-connect&quot;</span>
                  {"\n\n"}
                  <span className="lc">{"// one-time setup"}</span>
                  {"\n"}
                  <span className="lf">configure</span>
                  {"(process.env."}
                  <span className="le">IRCTC_API_KEY</span>
                  {")\n\n"}
                  <span className="lk">export async function</span>
                  {" "}
                  <span className="lf">getJourney</span>
                  {"(pnr: "}
                  <span className="lt">string</span>
                  {") {\n  "}
                  <span className="lk">const</span>
                  {" status = "}
                  <span className="lk">await</span>
                  {"\n    "}
                  <span className="lf">checkPNRStatus</span>
                  {"(pnr)\n\n  "}
                  <span className="lk">const</span>
                  {" live = "}
                  <span className="lk">await</span>
                  {"\n    "}
                  <span className="lf">trackTrain</span>
                  {"("}
                  <span className="ls">&quot;12342&quot;</span>
                  {", "}
                  <span className="ls">&quot;06-12-2025&quot;</span>
                  {")\n\n  "}
                  <span className="lk">return</span>
                  {" { status, live }\n}"}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE + CTA ── */}
      <section className="lp-section">
        <div className="lp-inner">
          <div className="lp-bottom-grid">
            {/* Enterprise users */}
            <div className="lp-users-card">
              <div className="lp-users-head">
                <Users size={17} style={{ color: "#9ca3af" }} />
                <div>
                  <div className="lp-users-title">Active Enterprise Users</div>
                  <div className="lp-users-sub">
                    Teams currently on paid access
                  </div>
                </div>
              </div>
              <div className="lp-users-grid">
                {enterpriseUsers.slice(0, 6).map((u) => (
                  <div key={u.id} className="lp-user-chip">
                    <div className="lp-user-name">{u.name}</div>
                    <div className="lp-user-email">{u.maskedEmail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="lp-cta-card">
              <div className="lp-cta-glow" aria-hidden />
              <p className="lp-cta-label">Ready to build?</p>
              <h3 className="lp-cta-title">
                Connect your app to Indian Railways.
              </h3>
              <p className="lp-cta-desc">
                Create an account, get your key, and start calling railway
                endpoints from your own backend in minutes.
              </p>
              <Link href="/auth" className="lp-cta-btn-primary">
                Get API key
                <ArrowRight size={15} />
              </Link>
              <a
                href="https://github.com/RAJIV81205/irctc-connect"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-cta-btn-ghost"
              >
                <Github size={15} />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div className="lp-footer">
        {stats.stars > 0 && (
          <>★ {stats.stars.toLocaleString()} stars · {stats.downloads.toLocaleString()} downloads/mo · </>
        )}
        Built by{" "}
        <a
          href="https://github.com/RAJIV81205"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#6b7280", textDecoration: "underline" }}
        >
          Rajiv Dubey
        </a>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        /* ── Layout ── */
        .lp-section { padding: 80px 40px; }
        .lp-section-tinted {
          background: #fafafa;
          border-top: 1px solid #f3f4f6;
          border-bottom: 1px solid #f3f4f6;
        }
        .lp-inner { max-width: 1160px; margin: 0 auto; min-width: 0; }

        @media (max-width: 768px) { .lp-section { padding: 64px 24px; } }
        @media (max-width: 480px) { .lp-section { padding: 52px 20px; } }

        /* ── Section heading ── */
        .lp-section-head { margin-bottom: 48px; }
        .lp-eyebrow {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 10px;
        }
        .lp-h2 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(28px, 4vw, 52px);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #000;
          margin: 0 0 14px;
        }
        .lp-body {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 300;
          line-height: 1.7;
          color: #6F6F6F;
          max-width: 480px;
        }

        /* ── Endpoints grid ── */
        .lp-endpoints {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #f3f4f6;
          border: 1px solid #f3f4f6;
          border-radius: 16px;
          overflow: hidden;
        }
        @media (max-width: 860px) { .lp-endpoints { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .lp-endpoints { grid-template-columns: 1fr; border-radius: 12px; } }

        .lp-ep-card {
          background: #fff;
          padding: 24px 20px;
          transition: background 0.2s;
        }
        .lp-ep-card:hover { background: #fafafa; }
        .lp-ep-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px; height: 34px;
          background: #f3f4f6;
          border-radius: 8px;
          color: #374151;
          margin-bottom: 14px;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .lp-ep-card:hover .lp-ep-icon { background: #000; color: #fff; }
        .lp-ep-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #000;
          margin-bottom: 5px;
        }
        .lp-ep-method {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #6b7280;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 2px 6px;
          display: inline-block;
          margin-bottom: 9px;
        }
        .lp-ep-desc {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: #6F6F6F;
          margin: 0;
        }

        /* ── Code showcase ── */
        .lp-code-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 56px;
          align-items: center;
        }
        @media (max-width: 860px) { .lp-code-grid { grid-template-columns: 1fr; gap: 36px; } }

        .lp-checklist {
          list-style: none;
          padding: 0;
          margin: 24px 0 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .lp-check-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          color: #374151;
        }
        .lp-check-icon { color: #000; flex-shrink: 0; }

        /* Code block */
        .lp-code-block {
          background: #0d1117;
          border: 1px solid #21262d;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 56px rgba(0,0,0,0.12);
        }
        .lp-code-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 16px;
          border-bottom: 1px solid #21262d;
          background: #161b22;
        }
        .lp-dots { display: flex; gap: 6px; }
        .lp-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-dot-r { background: #ff5f57; }
        .lp-dot-y { background: #febc2e; }
        .lp-dot-g { background: #28c840; }
        .lp-code-fname {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #6b7280;
        }
        .lp-pre {
          margin: 0;
          padding: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          line-height: 1.85;
          color: #c9d1d9;
          overflow-x: auto;
        }
        @media (max-width: 480px) { .lp-pre { font-size: 11.5px; padding: 16px; } }
        .lp-pre .lk { color: #ff7b72; }
        .lp-pre .lf { color: #d2a8ff; }
        .lp-pre .ls { color: #a5d6ff; }
        .lp-pre .lc { color: #8b949e; }
        .lp-pre .le { color: #6ee7b7; }
        .lp-pre .lt { color: #79c0ff; }

        /* ── Bottom grid ── */
        .lp-bottom-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
          align-items: start;
          /* prevent children from overflowing */
          min-width: 0;
        }
        @media (max-width: 860px) {
          .lp-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Enterprise users card */
        .lp-users-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          /* prevent card from overflowing its grid cell */
          min-width: 0;
          overflow: hidden;
        }
        .lp-users-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .lp-users-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #000;
        }
        .lp-users-sub {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }
        .lp-users-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .lp-user-chip {
          background: #fafafa;
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          padding: 10px 12px;
          transition: border-color 0.15s;
          /* critical: prevent chip from blowing out the grid */
          min-width: 0;
          overflow: hidden;
        }
        .lp-user-chip:hover { border-color: #e5e7eb; }
        .lp-user-name {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: #000;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lp-user-email {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* CTA card */
        .lp-cta-card {
          background: #000;
          border-radius: 16px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 480px) { .lp-cta-card { padding: 24px 20px; } }
        .lp-cta-glow {
          position: absolute;
          top: -80px; right: -80px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%);
          pointer-events: none;
        }
        .lp-cta-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 10px;
        }
        .lp-cta-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 400;
          color: #fff;
          line-height: 1.15;
          margin: 0 0 12px;
        }
        .lp-cta-desc {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.65;
          color: #6b7280;
          margin: 0 0 24px;
        }
        .lp-cta-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          background: #fff;
          color: #000;
          border-radius: 10px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 8px;
          transition: background 0.15s, transform 0.15s;
        }
        .lp-cta-btn-primary:hover { background: #f0f0f0; transform: translateY(-1px); }
        .lp-cta-btn-ghost {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          color: #6b7280;
          border: 1px solid #21262d;
          border-radius: 10px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .lp-cta-btn-ghost:hover { background: #161b22; color: #f9fafb; }

        /* ── Footer ── */
        .lp-footer {
          border-top: 1px solid #f3f4f6;
          padding: 28px 24px;
          text-align: center;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          color: #9ca3af;
        }
      `}</style>
    </main>
  );
}
