
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { 
  Star, 
  Download, 
  Terminal, 
  Train, 
  MapPin, 
  Search, 
  Ticket, 
  CheckCircle2, 
  Github, 
  BookOpen 
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
        next: { revalidate: 3600 }
      }),
      fetch("https://api.npmjs.org/downloads/point/last-month/irctc-connect", {
        next: { revalidate: 3600 }
      })
    ]);

    const github = await githubRes.json();
    const npm = await npmRes.json();

    return {
      stars: github.stargazers_count || 0,
      downloads: npm.downloads || 0
    };
  } catch (error) {
    console.error("Failed to fetch stats", error);
    return { stars: 0, downloads: 0 };
  }
}

type EnterpriseShowcaseUser = {
  id: string;
  name: string;
  maskedEmail: string;
};

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
    if (!res.ok || !data?.success || !Array.isArray(data.users)) {
      return enterpriseUsersFallback;
    }

    return data.users.length > 0 ? data.users : enterpriseUsersFallback;
  } catch (error) {
    console.error("Failed to fetch enterprise showcase users", error);
    return enterpriseUsersFallback;
  }
}

export default async function LandingPage() {
  const stats = await getStats();
  const enterpriseUsers = await getEnterpriseShowcaseUsers();
  const marqueeUsers = [...enterpriseUsers, ...enterpriseUsers];
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
  };
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "irctc-connect",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Node.js",
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    softwareVersion: "3.0.3",
    downloadUrl: "https://www.npmjs.com/package/irctc-connect",
    codeRepository: "https://github.com/RAJIV81205/irctc-connect",
    author: {
      "@type": "Person",
      name: "Rajiv Dubey",
      url: "https://github.com/RAJIV81205",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#1f3b8f_0%,transparent_35%),radial-gradient(circle_at_80%_90%,#14532d_0%,transparent_30%),linear-gradient(145deg,#0f172a,#111827,#020617)] text-slate-100 selection:bg-emerald-500/30">
      <style>{`
        @keyframes enterprise-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {/* Hero Section */}
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-24 sm:py-20 text-center">
        <a 
          href="https://www.npmjs.com/package/irctc-connect" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mb-6 flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-200 backdrop-blur-sm transition-colors hover:bg-emerald-300/20"
        >
          <Terminal className="h-4 w-4" />
          <span>NPM PACKAGE — v3.0.3</span>
        </a>

        <h1 className="max-w-4xl font-jetbrains text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl">
          IRCTC Connect: Node.js SDK for
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            {" "}Indian Railways API
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg text-slate-300 sm:text-xl leading-relaxed">
          A developer-first Indian Railways API and Node.js package for real-time
          PNR status, live train tracking, train search, station boards, and
          seat availability with a simple integration flow.
        </p>

        {/* Command Copy Snippet */}
        <div className="mt-10 flex w-full max-w-md items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 p-4 font-mono text-sm text-emerald-400 shadow-2xl">
          <span>npm install irctc-connect</span>
          <Terminal className="h-5 w-5 text-slate-500" />
        </div>

        <div className="mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/docs"
            className="group flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-emerald-950 transition-all hover:bg-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]"
          >
            <BookOpen className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
             Documentation
          </Link>

          <a
            href="https://github.com/RAJIV81205/irctc-connect"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800/50 px-6 py-3.5 text-sm font-bold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>

        {/* Stats Section */}
        <div className="mt-16 flex items-center justify-center gap-8 text-center sm:gap-16">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-slate-100">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <span>{stats.stars.toLocaleString()}</span>
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">GitHub Stars</span>
          </div>

          <div className="h-10 w-px bg-slate-700/50"></div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-slate-100">
              <Download className="h-6 w-6 text-cyan-400" />
              <span>{stats.downloads.toLocaleString()}/mo</span>
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">NPM Downloads</span>
          </div>
        </div>
      </div>

      {/* Enterprise Recognition */}
      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Enterprise Customers
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-100 sm:text-3xl">
            Trusted by teams on Enterprise plan
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/55 py-4 shadow-[0_16px_40px_rgba(2,6,23,0.4)]">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-950 to-transparent" />

          <div
            className="flex w-max gap-3 px-3 sm:gap-4 sm:px-4"
            style={{ animation: "enterprise-marquee 26s linear infinite" }}
          >
            {marqueeUsers.map((user, index) => (
              <div
                key={`${user.id}-${index}`}
                className="flex min-w-[190px] items-center gap-3 rounded-xl border border-emerald-400/20 bg-slate-900/90 px-3 py-2 sm:min-w-[220px] sm:px-4 sm:py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30 sm:h-9 sm:w-9">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {user.name}
                  </p>
                  <p className="truncate font-mono text-[11px] text-slate-400 sm:text-xs">
                    {user.maskedEmail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-100 sm:text-4xl">Everything you need to build train apps</h2>
          <p className="mt-4 text-slate-400">Powerful functions wrapping the underlying railways system.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[
            { icon: Ticket, title: "PNR Status", desc: "Real-time PNR status with detailed passenger information." },
            { icon: Train, title: "Train Information", desc: "Complete train details with full route maps and schedules." },
            { icon: MapPin, title: "Live Tracking", desc: "Real-time train status and exact live location tracking." },
            { icon: MapPin, title: "Station Updates", desc: "View all live trains currently arriving or departing at any given station." },
            { icon: Search, title: "Train Search", desc: "Find reliable direct or connecting trains between any two stations." },
            { icon: CheckCircle2, title: "Seat Availability", desc: "Get availability with exact fare breakdowns for different classes." },
          ].map((feat, i) => (
            <div key={i} className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition-colors hover:border-emerald-500/30 hover:bg-slate-800">
              <div className="mb-4 inline-flex rounded-xl bg-slate-800/80 p-3 text-emerald-400 ring-1 ring-slate-700">
                <feat.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-200">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
