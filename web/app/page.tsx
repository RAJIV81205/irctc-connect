import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  Github,
  KeyRound,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Star,
  Terminal,
  Ticket,
  Train,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  absoluteUrl,
  buildMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "../lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: undefined,
    description:
      "IRCTC Connect is a Node.js SDK and Indian Railways API for PNR status, live train tracking, train search, station boards, and seat availability.",
    path: "/",
  }),
};

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
    return { stars: github.stargazers_count || 0, downloads: npm.downloads || 0 };
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
    const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
    const proto = headerStore.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const base = host ? `${proto}://${host}` : absoluteUrl("/");
    const res = await fetch(`${base}/api/public/enterprise-users`, { next: { revalidate: 300 } });
    const data = (await res.json()) as { success?: boolean; users?: EnterpriseShowcaseUser[] };
    if (!res.ok || !data?.success || !Array.isArray(data.users)) return enterpriseUsersFallback;
    return data.users.length > 0 ? data.users : enterpriseUsersFallback;
  } catch {
    return enterpriseUsersFallback;
  }
}

const endpoints: Array<{ icon: LucideIcon; title: string; method: string; description: string }> = [
  { icon: Ticket,       title: "PNR Status",      method: "checkPNRStatus",              description: "Current passenger and booking status from a 10-digit PNR." },
  { icon: Train,        title: "Train Info",       method: "getTrainInfo",                description: "Route, stops, schedule, and running-day information." },
  { icon: MapPin,       title: "Live Tracking",    method: "trackTrain",                  description: "Live movement, station timeline, and delay context." },
  { icon: Search,       title: "Train Search",     method: "searchTrainBetweenStations",  description: "Find trains between two stations with useful timetable data." },
  { icon: CheckCircle2, title: "Seat Availability",method: "getAvailability",             description: "Availability and fare details by class, quota, and date." },
  { icon: Users,        title: "Station Board",    method: "liveAtStation",               description: "Arrivals, departures, and trains passing through a station." },
];

const setupSteps = [
  { step: "01", title: "Install",   description: "Add to any Node.js backend.",           code: "npm install irctc-connect" },
  { step: "02", title: "Configure", description: "One-time key setup at startup.",         code: "configure(process.env.IRCTC_API_KEY)" },
  { step: "03", title: "Call",      description: "Use methods directly from your backend.", code: 'await checkPNRStatus("1234567890")' },
];

export default async function LandingPage() {
  const stats = await getStats();
  const enterpriseUsers = await getEnterpriseShowcaseUsers();

  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/"), description: SITE_DESCRIPTION };
  const softwareSchema = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: "irctc-connect",
    applicationCategory: "DeveloperApplication", operatingSystem: "Node.js", url: absoluteUrl("/"),
    description: SITE_DESCRIPTION, softwareVersion: "3.0.4",
    downloadUrl: "https://www.npmjs.com/package/irctc-connect",
    codeRepository: "https://github.com/RAJIV81205/irctc-connect",
    author: { "@type": "Person", name: "Rajiv Dubey", url: "https://github.com/RAJIV81205" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };

  return (
    <main className="irctc-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .irctc-root {
          --em: #059669;
          --em-light: #d1fae5;
          --em-mid: #6ee7b7;
          --em-dark: #047857;
          --ink: #0a0c10;
          --ink-soft: #374151;
          --ink-muted: #6b7280;
          --ink-faint: #9ca3af;
          --bg: #f9fafb;
          --surface: #ffffff;
          --border: #e5e7eb;
          --border-soft: #f3f4f6;
          --dark-bg: #0d1117;
          --dark-surface: #161b22;
          --dark-border: #21262d;

          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        /* ── Typography ── */
        .irctc-display {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.08;
        }
        .irctc-heading {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        .irctc-mono {
          font-family: 'JetBrains Mono', monospace;
        }
        .irctc-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--em);
        }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .anim-1 { animation: fadeUp 0.6s ease both; }
        .anim-2 { animation: fadeUp 0.6s ease 0.1s both; }
        .anim-3 { animation: fadeUp 0.6s ease 0.2s both; }
        .anim-4 { animation: fadeUp 0.6s ease 0.3s both; }
        .anim-5 { animation: fadeUp 0.6s ease 0.4s both; }
        .panel-float { animation: fadeUp 0.7s ease 0.2s both, float 6s ease-in-out 1s infinite; }

        @media (prefers-reduced-motion: reduce) {
          .anim-1, .anim-2, .anim-3, .anim-4, .anim-5, .panel-float { animation: none; }
        }

        /* ── Sections ── */
        .irctc-hero {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 120px 40px 80px;
        }
        .irctc-inner { max-width: 1200px; margin: 0 auto; }
        .irctc-hero-grid {
          display: grid;
          grid-template-columns: 1fr 460px;
          gap: 64px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .irctc-hero-grid { grid-template-columns: 1fr; }
          .irctc-hero { padding: 100px 24px 60px; }
        }

        /* ── Badge ── */
        .irctc-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 100px;
          border: 1px solid var(--em-light);
          background: var(--em-light);
          color: var(--em-dark);
          font-size: 12px;
          font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          margin-bottom: 24px;
        }
        .irctc-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--em);
          animation: pulse-dot 2s ease infinite;
        }

        /* ── Hero headline ── */
        .irctc-h1 {
          font-size: clamp(36px, 5vw, 60px);
          max-width: 640px;
          color: var(--ink);
          margin: 0 0 20px;
        }
        .irctc-h1 em {
          font-style: normal;
          color: var(--em);
          position: relative;
        }
        .irctc-subtext {
          font-size: 17px;
          line-height: 1.7;
          color: var(--ink-soft);
          max-width: 540px;
          margin: 0 0 36px;
          font-weight: 300;
        }

        /* ── CTA buttons ── */
        .irctc-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 44px; }
        .irctc-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          background: var(--ink);
          color: #fff;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          text-decoration: none;
          transition: background 0.18s, transform 0.18s;
        }
        .irctc-btn-primary:hover { background: #1f2937; transform: translateY(-1px); }
        .irctc-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          background: transparent;
          color: var(--ink-soft);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          text-decoration: none;
          transition: border-color 0.18s, background 0.18s, transform 0.18s;
        }
        .irctc-btn-outline:hover { border-color: #9ca3af; background: var(--bg); transform: translateY(-1px); }

        /* ── Stat chips ── */
        .irctc-stats { display: flex; gap: 8px; flex-wrap: wrap; }
        .irctc-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
        }
        .irctc-stat-icon { color: var(--ink-faint); }
        .irctc-stat-val {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
        }
        .irctc-stat-label { font-size: 11px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.06em; }

        /* ── Terminal panel ── */
        .irctc-terminal {
          background: var(--dark-bg);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--dark-border);
          box-shadow: 0 32px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.04) inset;
        }
        .irctc-terminal-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid var(--dark-border);
          background: var(--dark-surface);
        }
        .irctc-terminal-dots { display: flex; gap: 6px; }
        .irctc-dot { width: 11px; height: 11px; border-radius: 50%; }
        .irctc-dot-r { background: #ff5f57; }
        .irctc-dot-y { background: #febc2e; }
        .irctc-dot-g { background: #28c840; }
        .irctc-terminal-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #6b7280;
        }
        .irctc-terminal-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .irctc-step-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--dark-border);
          border-radius: 10px;
          padding: 14px 16px;
          transition: border-color 0.2s, background 0.2s;
        }
        .irctc-step-card:hover { border-color: rgba(5,150,105,0.5); background: rgba(5,150,105,0.04); }
        .irctc-step-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
        .irctc-step-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          color: var(--em);
          background: rgba(5,150,105,0.12);
          border: 1px solid rgba(5,150,105,0.2);
          border-radius: 5px;
          padding: 2px 7px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .irctc-step-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; color: #f9fafb; }
        .irctc-step-desc { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .irctc-code-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 7px;
          padding: 9px 12px;
        }
        .irctc-code-text { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--em-mid); }
        .irctc-copy-icon { color: #374151; cursor: pointer; flex-shrink: 0; }

        /* ── Section wrapper ── */
        .irctc-section { padding: 80px 40px; }
        .irctc-section-alt { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        @media (max-width: 640px) { .irctc-section { padding: 60px 24px; } }

        /* ── Section heading ── */
        .irctc-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--em); margin-bottom: 8px; }
        .irctc-sh { font-size: clamp(26px, 3vw, 36px); color: var(--ink); margin: 0 0 12px; max-width: 520px; }
        .irctc-sdesc { font-size: 16px; line-height: 1.65; color: var(--ink-soft); max-width: 500px; font-weight: 300; }

        /* ── Endpoints grid ── */
        .irctc-endpoints { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 48px; }
        @media (max-width: 900px) { .irctc-endpoints { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .irctc-endpoints { grid-template-columns: 1fr; } }
        .irctc-endpoint-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 22px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
        }
        .irctc-endpoint-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0;
          width: 3px; height: 100%;
          background: var(--em);
          opacity: 0;
          transition: opacity 0.22s;
        }
        .irctc-endpoint-card:hover { border-color: #a7f3d0; transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.07); }
        .irctc-endpoint-card:hover::before { opacity: 1; }
        .irctc-endpoint-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; height: 40px;
          background: var(--em-light);
          border-radius: 10px;
          color: var(--em-dark);
          margin-bottom: 14px;
        }
        .irctc-endpoint-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 4px;
        }
        .irctc-endpoint-method {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--em);
          background: rgba(5,150,105,0.08);
          border-radius: 4px;
          padding: 2px 6px;
          display: inline-block;
          margin-bottom: 10px;
        }
        .irctc-endpoint-desc { font-size: 13px; line-height: 1.6; color: var(--ink-soft); }

        /* ── Code showcase ── */
        .irctc-code-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 860px) { .irctc-code-grid { grid-template-columns: 1fr; } }
        .irctc-code-block {
          background: var(--dark-bg);
          border: 1px solid var(--dark-border);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 48px rgba(0,0,0,0.14);
        }
        .irctc-code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          border-bottom: 1px solid var(--dark-border);
          background: var(--dark-surface);
        }
        .irctc-code-filename {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .irctc-code-pre {
          margin: 0;
          padding: 24px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.8;
          overflow-x: auto;
          color: #c9d1d9;
        }
        .irctc-code-pre .kw { color: #ff7b72; }
        .irctc-code-pre .fn { color: #d2a8ff; }
        .irctc-code-pre .str { color: #a5d6ff; }
        .irctc-code-pre .imp { color: #79c0ff; }
        .irctc-code-pre .cm { color: #8b949e; }
        .irctc-code-pre .em-green { color: var(--em-mid); }

        .irctc-feature-pills { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
        .irctc-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 13px;
          color: var(--ink-soft);
          transition: border-color 0.18s, background 0.18s;
        }
        .irctc-pill:hover { border-color: #a7f3d0; background: #f0fdf4; }
        .irctc-pill-check { color: var(--em); flex-shrink: 0; }

        /* ── Bottom grid ── */
        .irctc-bottom-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 24px;
        }
        @media (max-width: 860px) { .irctc-bottom-grid { grid-template-columns: 1fr; } }

        /* ── Enterprise card ── */
        .irctc-users-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .irctc-users-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .irctc-users-icon { color: var(--ink-faint); }
        .irctc-users-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 700; color: var(--ink); }
        .irctc-users-sub { font-size: 13px; color: var(--ink-muted); }
        .irctc-users-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media (max-width: 560px) { .irctc-users-grid { grid-template-columns: repeat(2, 1fr); } }
        .irctc-user-chip {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          transition: border-color 0.18s, background 0.18s;
        }
        .irctc-user-chip:hover { border-color: #a7f3d0; background: #f0fdf4; }
        .irctc-user-name { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .irctc-user-email { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* ── CTA dark card ── */
        .irctc-cta-card {
          background: var(--dark-bg);
          border: 1px solid var(--dark-border);
          border-radius: 16px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          overflow: hidden;
        }
        .irctc-cta-card::after {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(5,150,105,0.12), transparent 70%);
          pointer-events: none;
        }
        .irctc-cta-icon { color: var(--em); margin-bottom: 18px; }
        .irctc-cta-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 700; color: #f9fafb; margin-bottom: 10px; line-height: 1.2; }
        .irctc-cta-desc { font-size: 14px; line-height: 1.65; color: #6b7280; margin-bottom: 24px; font-weight: 300; }
        .irctc-btn-white {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          background: #fff;
          color: var(--ink);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          text-decoration: none;
          margin-bottom: 10px;
          transition: background 0.18s, transform 0.18s;
        }
        .irctc-btn-white:hover { background: #f0fdf4; transform: translateY(-1px); }
        .irctc-btn-ghost {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          color: #9ca3af;
          border: 1px solid var(--dark-border);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          text-decoration: none;
          transition: background 0.18s, color 0.18s, transform 0.18s;
        }
        .irctc-btn-ghost:hover { background: var(--dark-surface); color: #f9fafb; transform: translateY(-1px); }

        /* ── Divider line ── */
        .irctc-divider { border: none; border-top: 1px solid var(--border); margin: 0; }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      {/* ── HERO ── */}
      <section className="irctc-hero">
        <div className="irctc-inner">
          <div className="irctc-hero-grid">
            <div>
              <div className="anim-1 irctc-badge">
                <span className="irctc-badge-dot" />
                Node.js SDK · v3.0.4
              </div>

              <h1 className="irctc-display irctc-h1 anim-2">
                Railway data,<br />
                <em>without</em> the scraping.
              </h1>

              <p className="irctc-subtext anim-3">
                IRCTC Connect gives your backend a clean SDK for PNR status, live train tracking,
                seat availability, and more — one key, six methods.
              </p>

              <div className="irctc-ctas anim-4">
                <Link href="/docs" className="irctc-btn-primary">
                  <BookOpen size={15} />
                  Read the docs
                </Link>
                <Link href="/pricing" className="irctc-btn-outline">
                  See pricing
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="irctc-stats anim-5">
                {[
                  { icon: Package,  label: "Version",   val: "3.0.4" },
                  { icon: KeyRound, label: "Auth",      val: "API key" },
                  { icon: Star,     label: "Stars",     val: stats.stars.toLocaleString() },
                  { icon: Download, label: "Downloads", val: `${stats.downloads.toLocaleString()}/mo` },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="irctc-stat">
                    <Icon size={14} className="irctc-stat-icon" />
                    <div>
                      <div className="irctc-stat-label">{label}</div>
                      <div className="irctc-stat-val">{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal panel */}
            <div className="irctc-terminal panel-float">
              <div className="irctc-terminal-bar">
                <div className="irctc-terminal-dots">
                  <span className="irctc-dot irctc-dot-r" />
                  <span className="irctc-dot irctc-dot-y" />
                  <span className="irctc-dot irctc-dot-g" />
                </div>
                <span className="irctc-terminal-title">quick-start.ts</span>
                <Terminal size={13} color="#4b5563" />
              </div>
              <div className="irctc-terminal-body">
                {setupSteps.map((s) => (
                  <div key={s.step} className="irctc-step-card">
                    <div className="irctc-step-header">
                      <span className="irctc-step-num">{s.step}</span>
                      <div>
                        <div className="irctc-step-title">{s.title}</div>
                        <div className="irctc-step-desc">{s.description}</div>
                      </div>
                    </div>
                    <div className="irctc-code-line">
                      <span className="irctc-code-text">{s.code}</span>
                      <Copy size={13} className="irctc-copy-icon" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENDPOINTS ── */}
      <section className="irctc-section">
        <div className="irctc-inner">
          <div className="anim-1">
            <p className="irctc-eyebrow">What it includes</p>
            <h2 className="irctc-heading irctc-sh">Six endpoints, every use case covered</h2>
            <p className="irctc-sdesc">
              Each method maps to a clear use case. Your team can understand the integration at a glance.
            </p>
          </div>

          <div className="irctc-endpoints">
            {endpoints.map((ep) => (
              <article key={ep.method} className="irctc-endpoint-card">
                <div className="irctc-endpoint-icon">
                  <ep.icon size={18} />
                </div>
                <div className="irctc-endpoint-title">{ep.title}</div>
                <span className="irctc-endpoint-method">{ep.method}()</span>
                <p className="irctc-endpoint-desc">{ep.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CODE SHOWCASE ── */}
      <section className="irctc-section irctc-section-alt">
        <div className="irctc-inner">
          <div className="irctc-code-grid">
            <div>
              <p className="irctc-eyebrow">How developers use it</p>
              <h2 className="irctc-heading irctc-sh">Small surface. Built for backend code.</h2>
              <p className="irctc-sdesc">
                Works in API routes, background jobs, support tools, or mobile app backends.
              </p>
              <div className="irctc-feature-pills" style={{ marginTop: 28 }}>
                {["Predictable response shape", "Works with server-side apps", "Usage plans and dashboard"].map((f) => (
                  <div key={f} className="irctc-pill">
                    <CheckCircle2 size={15} className="irctc-pill-check" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="irctc-code-block">
              <div className="irctc-code-header">
                <span className="irctc-code-filename">
                  <span style={{ color: "#6ee7b7", fontSize: 12 }}>●</span>
                  journey.ts
                </span>
                <Copy size={13} color="#4b5563" style={{ cursor: "pointer" }} />
              </div>
              <pre className="irctc-code-pre">
                <code>
{`\x1b`}
<span className="kw">import</span> {`{ `}
  <span className="imp">configure</span>,{"\n"}
  <span className="imp">checkPNRStatus</span>,{"\n"}
  <span className="imp">trackTrain</span>{"\n"}
{`} `}<span className="kw">from</span> <span className="str">&quot;irctc-connect&quot;</span>;{"\n\n"}
<span className="cm">{"// one-time setup"}</span>{"\n"}
<span className="fn">configure</span>(<span className="imp">process</span>.env.<span className="em-green">IRCTC_API_KEY</span>);{"\n\n"}
<span className="kw">export async function</span> <span className="fn">getJourney</span>({"\n"}
  pnr: <span className="imp">string</span>{"\n"}
) {"{"}{"\n"}
  <span className="kw">const</span> status = <span className="kw">await</span>{"\n"}
    <span className="fn">checkPNRStatus</span>(pnr);{"\n\n"}
  <span className="kw">const</span> live = <span className="kw">await</span>{"\n"}
    <span className="fn">trackTrain</span>(<span className="str">&quot;12342&quot;</span>, <span className="str">&quot;06-12-2025&quot;</span>);{"\n\n"}
  <span className="kw">return</span> {"{ "}status, live {"}"};{"\n"}
{"}"}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ROW ── */}
      <section className="irctc-section">
        <div className="irctc-inner">
          <div className="irctc-bottom-grid">
            {/* Enterprise users */}
            <div className="irctc-users-card">
              <div className="irctc-users-header">
                <Users size={18} className="irctc-users-icon" />
                <div>
                  <div className="irctc-users-title">Active Enterprise Users</div>
                  <div className="irctc-users-sub">Teams currently on paid access</div>
                </div>
              </div>
              <div className="irctc-users-grid">
                {enterpriseUsers.slice(0, 6).map((u) => (
                  <div key={u.id} className="irctc-user-chip">
                    <div className="irctc-user-name">{u.name}</div>
                    <div className="irctc-user-email">{u.maskedEmail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="irctc-cta-card">
              <ShieldCheck size={28} className="irctc-cta-icon" />
              <div className="irctc-cta-title">Ready to connect your app?</div>
              <p className="irctc-cta-desc">
                Create an account, get your key, and start calling railway endpoints from your own backend.
              </p>
              <Link href="/auth" className="irctc-btn-white">
                Get API key
                <ArrowRight size={15} />
              </Link>
              <a
                href="https://github.com/RAJIV81205/irctc-connect"
                target="_blank"
                rel="noopener noreferrer"
                className="irctc-btn-ghost"
              >
                <Github size={15} />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
