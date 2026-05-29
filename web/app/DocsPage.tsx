"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  packageInfo,
  responseFormats,
  sidebarGroups,
} from "./docsData";
import { useTheme } from "./ThemeProvider";
import {
  AlertTriangle,
  Armchair,
  BarChart3,
  Building2,
  CheckCircle,
  ChevronRight,
  Gamepad2,
  MapPin,
  Package,
  Rocket,
  Search,
  Ticket,
  Train,
  type LucideIcon,
} from "lucide-react";

type EndpointSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  signature: string;
  params: Array<{ name: string; type: string; desc: string }>;
  example: string;
};

const endpointSections: EndpointSection[] = [
  {
    id: "pnr-status",
    title: "PNR Status",
    icon: Ticket,
    description:
      "Get complete PNR status with passenger details, journey route, and confirmation updates.",
    signature: "checkPNRStatus(pnr: string)",
    params: [{ name: "pnr", type: "string", desc: "10-digit PNR number" }],
    example: `const result = await checkPNRStatus("1234567890");

if (result.success) {
  console.log(result.data.status);
  console.log(result.data.train.name);
  console.log(result.data.passengers);
}`,
  },
  {
    id: "train-info",
    title: "Train Information",
    icon: Train,
    description:
      "Retrieve route details, running schedule, stoppages, and station-level metadata.",
    signature: "getTrainInfo(trainNumber: string)",
    params: [
      {
        name: "trainNumber",
        type: "string",
        desc: "5-digit train number",
      },
    ],
    example: `const result = await getTrainInfo("12345");

if (result.success) {
  console.log(result.data.trainInfo.train_name);
  console.log(result.data.route.length);
}`,
  },
  {
    id: "live-tracking",
    title: "Live Tracking",
    icon: MapPin,
    description:
      "Track live train movement with station-by-station arrival and delay context.",
    signature: "trackTrain(trainNumber: string, date: string)",
    params: [
      { name: "trainNumber", type: "string", desc: "5-digit train number" },
      { name: "date", type: "string", desc: "Journey date in DD-MM-YYYY" },
    ],
    example: `const result = await trackTrain("12342", "06-12-2025");

if (result.success) {
  console.log(result.data.statusNote);
  console.log(result.data.timeline);
}`,
  },
  {
    id: "station-live",
    title: "Live At Station",
    icon: Building2,
    description:
      "Get upcoming and passing trains at a station with near real-time status.",
    signature: "liveAtStation(stationCode: string)",
    params: [
      {
        name: "stationCode",
        type: "string",
        desc: "Station code such as NDLS, BCT, HWH",
      },
    ],
    example: `const result = await liveAtStation("NDLS");

if (result.success) {
  console.log(result.data[0]?.trainname);
}`,
  },
  {
    id: "train-search",
    title: "Train Search",
    icon: Search,
    description:
      "Find available trains between stations with timetable and running-day data.",
    signature: "searchTrainBetweenStations(from: string, to: string, date?: string)",
    params: [
      { name: "from", type: "string", desc: "Origin station code" },
      { name: "to", type: "string", desc: "Destination station code" },
      { name: "date", type: "string", desc: "Journey date in DD-MM-YYYY (optional)" },
    ],
    example: `const result = await searchTrainBetweenStations("NDLS", "BCT", "25-12-2025");

if (result.success) {
  console.log(result.data.map((t) => t.train_name));
}`,
  },
  {
    id: "seat-availability",
    title: "Seat Availability",
    icon: Armchair,
    description:
      "Check availability forecasts and detailed fare breakup by quota and class.",
    signature:
      "getAvailability(trainNo, fromStnCode, toStnCode, date, coach, quota)",
    params: [
      { name: "trainNo", type: "string", desc: "5-digit train number" },
      { name: "fromStnCode", type: "string", desc: "Origin station code" },
      { name: "toStnCode", type: "string", desc: "Destination station code" },
      { name: "date", type: "string", desc: "Journey date in DD-MM-YYYY" },
      { name: "coach", type: "string", desc: "SL, 3A, 2A, 1A, CC, EC, 2S" },
      { name: "quota", type: "string", desc: "GN, TQ, LD, SS" },
    ],
    example: `const result = await getAvailability(
  "12496",
  "ASN",
  "DDU",
  "27-12-2025",
  "2A",
  "GN"
);`,
  },
];

const installSnippet = "npm install irctc-connect";

const quickStartSnippet = `import {
  configure,
  checkPNRStatus,
  getTrainInfo,
  trackTrain,
  liveAtStation,
  searchTrainBetweenStations,
  getAvailability
} from "irctc-connect";

configure(process.env.IRCTC_API_KEY);

const pnr = await checkPNRStatus("1234567890");
const train = await getTrainInfo("12345");
const live = await trackTrain("12345", "06-12-2025");
const station = await liveAtStation("NDLS");
const between = await searchTrainBetweenStations("NDLS", "BCT");
const seats = await getAvailability("12496", "ASN", "DDU", "27-12-2025", "2A", "GN");`;

const docsBaseUrl = "https://irctc.rajivdubey.tech/docs";

export default function DocsPage() {
  const { sidebarOpen, setSidebarOpen } = useTheme();
  const [activeSection, setActiveSection] = useState("introduction");
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedAIMarkdown, setCopiedAIMarkdown] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const flatSections = useMemo(
    () => sidebarGroups.flatMap((group) => group.items),
    [],
  );

  const aiDocsMarkdown = useMemo(() => {
    const endpointDetails = endpointSections
      .map((endpoint) => {
        const params = endpoint.params
          .map(
            (param) =>
              `- \`${param.name}\` (\`${param.type}\`): ${param.desc}`,
          )
          .join("\n");

        return `### ${endpoint.title}
Link: [${docsBaseUrl}#${endpoint.id}](${docsBaseUrl}#${endpoint.id})
Signature: \`${endpoint.signature}\`
Parameters:
${params}

Example:
\`\`\`javascript
${endpoint.example}
\`\`\``;
      })
      .join("\n\n");

    const sectionLinks = [
      "installation",
      "quickstart",
      "pnr-status",
      "train-info",
      "live-tracking",
      "station-live",
      "train-search",
      "seat-availability",
      "validation",
      "errors",
    ]
      .map((id) => {
        const section = flatSections.find((item) => item.id === id);
        return section
          ? `- [${section.label}](${docsBaseUrl}#${section.id})`
          : null;
      })
      .filter(Boolean)
      .join("\n");

    return `# IRCTC Connect - Implementation Essentials

Use this for coding and integration only.

## Official Links
- Docs: [${docsBaseUrl}](${docsBaseUrl})
- NPM: [${packageInfo.links.npm}](${packageInfo.links.npm})
- GitHub: [${packageInfo.links.github}](${packageInfo.links.github})
- Issues: [${packageInfo.links.issues}](${packageInfo.links.issues})

## Quick Setup
\`\`\`bash
${installSnippet}
\`\`\`

- Runtime: Node.js 14+
- Required: call \`configure(apiKey)\` once before SDK methods

\`\`\`javascript
${quickStartSnippet}
\`\`\`

## Section Links
${sectionLinks}

## Endpoint Contracts
${endpointDetails}

## Required Input Rules
- PNR: exactly 10 digits, numeric only
- Train number: exactly 5 digits (string)
- Date: DD-MM-YYYY
- Station code: uppercase (e.g., NDLS, BCT, HWH)

## Response Handling
Success:
\`\`\`ts
{
  success: true,
  data: { ... }
}
\`\`\`

Error:
\`\`\`ts
{
  success: false,
  message: "Error message"
}
\`\`\`

Also handle alternate error shape:
\`\`\`ts
${responseFormats.error}
\`\`\`

## Common Failure Cases
- Missing \`configure(apiKey)\` call
- Invalid or expired API key (401)
- Inactive API key (403)
- Rate limit (429)
- Invalid PNR/train/date/station input
- Upstream timeout/outage
`;
  }, [flatSections]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${sectionId}`);
    }
    setSidebarOpen(false);
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(hash);
    }, 120);
  }, []);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const sections = flatSections
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.1, 0.3, 0.5, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [flatSections]);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(installSnippet);
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 1400);
    } catch {}
  };

  const copyAIDocsMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(aiDocsMarkdown);
      setCopiedAIMarkdown(true);
      setTimeout(() => setCopiedAIMarkdown(false), 1800);
    } catch {}
  };

  const sectionClass = "docs-section";

  return (
    <div className="min-h-screen bg-[#f6f7f9] pt-16 text-slate-950">
      <style>{`
        .docs-code-wrap pre { background: transparent !important; margin: 0 !important; }
        .docs-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .docs-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
        .docs-section { margin-bottom: 30px; scroll-margin-top: 104px; }
        .docs-card {
          min-width: 0;
          max-width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 12px 28px rgba(15,23,42,0.04);
        }
        .docs-card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .docs-card-hover:hover {
          transform: translateY(-3px);
          border-color: #a7f3d0;
          box-shadow: 0 16px 34px rgba(15,23,42,0.08);
        }
        .docs-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          padding: 9px 13px;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .docs-chip:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow: 0 12px 24px rgba(15,23,42,0.08);
        }
        .docs-chip-primary {
          border-color: #0f172a;
          background: #0f172a;
          color: #ffffff;
        }
        @keyframes docs-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .docs-reveal { animation: docs-fade-up 0.55s ease both; }
        @media (max-width: 1024px) {
          .docs-shell { padding: 20px 14px 40px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .docs-reveal,
          .docs-card-hover,
          .docs-card-hover:hover,
          .docs-chip,
          .docs-chip:hover {
            animation: none;
            transform: none;
            transition: none;
          }
        }
      `}</style>

      <div className="docs-shell relative z-[2] mx-auto max-w-[1320px] px-6 py-8">
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: isDesktop ? "280px minmax(0, 1fr)" : "1fr",
          }}
        >
          <aside
            className="docs-scroll rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            style={{
              position: isDesktop ? "sticky" : "fixed",
              top: isDesktop ? 84 : 74,
              left: isDesktop ? "auto" : 12,
              width: isDesktop ? "auto" : "calc(100vw - 24px)",
              alignSelf: "start",
              maxHeight: isDesktop ? "calc(100vh - 100px)" : "calc(100vh - 88px)",
              overflowY: "auto",
              zIndex: 20,
              transform: sidebarOpen || isDesktop ? "translateX(0)" : "translateX(-120%)",
              transition: "transform 0.22s ease",
            }}
          >
            {sidebarGroups.map((group) => (
              <div key={group.title} className="mb-4 last:mb-0">
                <p className="mx-2 mb-2 text-xs font-semibold uppercase text-slate-400">
                  {group.title}
                </p>
                <div className="grid gap-1">
                  {group.items.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        type="button"
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                          isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                        }`}
                      >
                        <Icon size={15} />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>

          <main className="min-w-0 max-w-full overflow-x-hidden">
            <section id="introduction" className={`${sectionClass} docs-reveal`}>
              <div className="docs-card p-6 sm:p-8">
                <p className="mb-3 inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
                  IRCTC Connect SDK
                </p>
                <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                  Clean railway API documentation for production apps.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                  Install the Node.js SDK, configure your API key, and call
                  typed methods for PNR status, train info, live tracking,
                  station boards, train search, and seat availability.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/dashboard" className="docs-chip docs-chip-primary">
                    Open Dashboard <ChevronRight size={14} />
                  </Link>
                  <a
                    href="https://www.npmjs.com/package/irctc-connect"
                    target="_blank"
                    rel="noreferrer"
                    className="docs-chip"
                  >
                    View NPM Package
                  </a>
                  <button type="button" onClick={copyAIDocsMarkdown} className="docs-chip">
                    {copiedAIMarkdown ? "Markdown Copied" : "Copy AI Markdown"}
                  </button>
                  <Link href="/dashboard" className="docs-chip">
                    Try Playground <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Endpoints", value: "6" },
                  { label: "Runtime", value: "Node 14+" },
                  { label: "Auth", value: "API Key" },
                  { label: "SDK", value: "irctc-connect" },
                ].map((stat) => (
                  <div key={stat.label} className="docs-card docs-card-hover p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 font-mono text-lg font-semibold text-slate-950">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section id="installation" className={sectionClass}>
              <SectionHeader title="Installation" icon={Package} />
              <div className="docs-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
                  <span className="font-mono text-xs text-slate-400">Terminal</span>
                  <button
                    type="button"
                    onClick={copyInstall}
                    className="rounded-md border border-slate-700 px-2 py-1 font-mono text-xs text-slate-300 transition hover:bg-slate-900"
                  >
                    {copiedInstall ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="bg-slate-950 p-4">
                  <code className="font-mono text-sm text-emerald-300">
                    {installSnippet}
                  </code>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoPanel
                  title="Requirements"
                  items={[
                    "Node.js 14+",
                    "Active internet connection",
                    "Valid API key in environment variables",
                  ]}
                />
                <InfoPanel
                  title="Supported Platforms"
                  items={[
                    "Node.js apps and scripts",
                    "Express servers",
                    "Next.js App Router projects",
                    "React Native environments",
                  ]}
                />
              </div>
            </section>

            <section id="quickstart" className={sectionClass}>
              <SectionHeader title="Quick Start" icon={Rocket} />
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                Call <code className="font-mono">configure(apiKey)</code> once at app startup before any
                request method.
              </div>
              <CodePanel language="javascript" code={quickStartSnippet} />
            </section>

            <div className="grid gap-7">
              {endpointSections.map((endpoint) => (
                <section key={endpoint.id} id={endpoint.id} className={sectionClass}>
                  <SectionHeader title={endpoint.title} icon={endpoint.icon} />
                  <div className="docs-card p-4 sm:p-5">
                    <p className="mb-4 text-sm leading-7 text-slate-600">
                      {endpoint.description}
                    </p>
                    <code className="mb-4 block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-emerald-700">
                      {endpoint.signature}
                    </code>

                    <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {endpoint.params.map((param) => (
                        <div
                          key={param.name}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="break-words font-mono text-sm font-semibold text-slate-950">
                            {param.name}
                          </p>
                          <p className="mt-1 font-mono text-xs text-emerald-700">
                            {param.type}
                          </p>
                          <p className="mt-2 break-words text-xs leading-5 text-slate-600">
                            {param.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                    <CodePanel language="javascript" code={endpoint.example} />
                  </div>
                </section>
              ))}
            </div>

            <section id="playground" className={sectionClass}>
              <SectionHeader title="Playground" icon={Gamepad2} />
              <div className="docs-card p-5">
                <p className="mb-4 max-w-3xl text-sm leading-7 text-slate-600">
                  The live playground is available inside your user panel. Use it
                  to run real API calls with your account key and inspect latency
                  plus JSON responses in the same dashboard workspace.
                </p>
                <Link href="/dashboard" className="docs-chip docs-chip-primary">
                  Open Playground Tab <ChevronRight size={14} />
                </Link>
              </div>
            </section>

            <section id="validation" className={sectionClass}>
              <SectionHeader title="Input Validation" icon={CheckCircle} />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <InfoPanel title="PNR" items={["Exactly 10 digits", "Numeric input only", "Reject malformed values early"]} />
                <InfoPanel title="Train Number" items={["Exactly 5 digits", "Treat as string to preserve zeros", "No spaces or symbols"]} />
                <InfoPanel title="Date" items={["DD-MM-YYYY format", "Validate real calendar date", "Use same format across APIs"]} />
                <InfoPanel title="Station Code" items={["Uppercase station code", "Examples: NDLS, BCT, HWH", "Trim extra whitespace"]} />
              </div>
            </section>

            <section id="status-codes" className={sectionClass}>
              <SectionHeader title="Status Codes" icon={BarChart3} />
              <div className="docs-card overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {["Code", "Full Form", "Description"].map((head) => (
                        <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["CNF", "Confirmed", "Seat or berth is confirmed"],
                      ["WL", "Waiting List", "Seat not confirmed yet"],
                      ["RAC", "Reservation Against Cancellation", "Partial seat allocation"],
                      ["CAN", "Cancelled", "Ticket is cancelled"],
                      ["PQWL", "Pooled Quota WL", "Pooled quota waiting"],
                      ["TQWL", "Tatkal Quota WL", "Tatkal waiting"],
                      ["GNWL", "General WL", "General waiting list"],
                    ].map(([code, full, desc]) => (
                      <tr key={code} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-4 py-3">
                          <code className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-xs text-emerald-800">
                            {code}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{full}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="errors" className="docs-section mb-14">
              <SectionHeader title="Error Handling" icon={AlertTriangle} />
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <ResponsePanel
                  tone="success"
                  title="Success Response"
                  code={`{
  success: true,
  data: { ... }
}`}
                />
                <ResponsePanel
                  tone="error"
                  title="Error Response"
                  code={`{
  success: false,
  message: "Error message"
}`}
                />
              </div>
              <InfoPanel
                title="Common Error Scenarios"
                items={[
                  "Missing configure(apiKey) call",
                  "Invalid or expired API key (401)",
                  "Inactive API key (403)",
                  "Rate limit exceeded (429)",
                  "Invalid train/PNR/date inputs",
                  "Temporary upstream timeout or API outage",
                ]}
              />
            </section>
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-10 cursor-pointer border-0 bg-slate-950/40 lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}
    </div>
  );
}

function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
        <Icon size={17} />
      </div>
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
    </div>
  );
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="docs-card docs-card-hover p-4">
      <p className="mb-3 text-sm font-semibold text-slate-950">{title}</p>
      <div className="grid gap-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-slate-600">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function ResponsePanel({
  title,
  code,
  tone,
}: {
  title: string;
  code: string;
  tone: "success" | "error";
}) {
  const isSuccess = tone === "success";
  return (
    <div
      className={`rounded-lg border p-4 ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <p className={`mb-3 text-sm font-semibold ${isSuccess ? "text-emerald-800" : "text-red-800"}`}>
        {title}
      </p>
      <pre className={`m-0 font-mono text-xs leading-6 ${isSuccess ? "text-emerald-900" : "text-red-900"}`}>
        {code}
      </pre>
    </div>
  );
}

function CodePanel({ language, code }: { language: string; code: string }) {
  return (
    <div className="docs-card docs-code-wrap overflow-hidden border-slate-800 bg-slate-950">
      <div className="flex items-center gap-1.5 border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-amber-300" />
        <div className="h-2 w-2 rounded-full bg-emerald-300" />
        <span className="ml-2 font-mono text-xs text-slate-500">{language}</span>
      </div>
      <div className="max-w-full overflow-x-auto bg-slate-950 px-3 py-2">
        <SyntaxHighlighter
          language={language}
          style={nightOwl}
          customStyle={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.72,
            background: "transparent",
            fontFamily: "var(--font-geist-mono), monospace",
            minWidth: "max-content",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
