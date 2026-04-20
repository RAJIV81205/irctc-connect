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
  console.log(result.data.stations[0]);
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

  const sectionStyle = { marginBottom: 28, scrollMarginTop: 104 } as const;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070910",
        color: "#e2e8f0",
        paddingTop: 64,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap');
        .docs-shell { max-width: 1320px; margin: 0 auto; padding: 28px 24px 56px; position: relative; z-index: 2; }
        .docs-card { background: #0f1117; border: 1px solid #1e2330; border-radius: 12px; min-width: 0; max-width: 100%; }
        .docs-muted { color: #64748b; font-family: 'JetBrains Mono', monospace; }
        .docs-title { font-family: 'Syne', sans-serif; letter-spacing: -0.02em; }
        .docs-code-wrap pre { background: transparent !important; margin: 0 !important; }
        .docs-endpoint-signature {
          display: block;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .docs-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .docs-scroll::-webkit-scrollbar-thumb { background: #2d3548; border-radius: 4px; }
        .docs-endpoint-stack { display: grid; gap: 26px; }
        @media (max-width: 1024px) {
          .docs-shell { padding: 20px 14px 40px; }
          .docs-endpoint-stack { gap: 20px; }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "4%",
            left: "8%",
            width: 580,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, transparent 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "8%",
            top: "18%",
            width: 520,
            height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(96,165,250,0.07) 0%, transparent 72%)",
          }}
        />
      </div>

      <div className="docs-shell">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "280px 1fr" : "1fr",
            gap: 24,
          }}
        >
          <aside
            className="docs-scroll"
            style={{
              position: isDesktop ? "sticky" : "fixed",
              top: isDesktop ? 84 : 74,
              left: isDesktop ? "auto" : 12,
              width: isDesktop ? "auto" : "calc(100vw - 24px)",
              alignSelf: "start",
              maxHeight: isDesktop ? "calc(100vh - 100px)" : "calc(100vh - 88px)",
              overflowY: "auto",
              padding: 14,
              background: "#0f1117",
              border: "1px solid #1e2330",
              borderRadius: 12,
              zIndex: 20,
              transform: sidebarOpen || isDesktop ? "translateX(0)" : "translateX(-120%)",
              transition: "transform 0.22s ease",
            }}
          >
            {/* <p
              style={{
                color: "#94a3b8",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 10,
              }}
            >
              Documentation
            </p> */}
            {sidebarGroups.map((group) => (
              <div key={group.title} style={{ marginBottom: 16 }}>
                <p
                  style={{
                    color: "#475569",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "'JetBrains Mono', monospace",
                    margin: "8px 6px",
                  }}
                >
                  {group.title}
                </p>
                <div style={{ display: "grid", gap: 4 }}>
                  {group.items.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: isActive
                            ? "1px solid #2d4060"
                            : "1px solid transparent",
                          background: isActive ? "#1e2a3a" : "transparent",
                          color: isActive ? "#60a5fa" : "#64748b",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          textAlign: "left",
                          transition: "all 0.15s",
                        }}
                      >
                        <Icon size={14} />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>

          <main style={{ minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>
            <section id="introduction" style={sectionStyle}>
              <div className="docs-card" style={{ padding: isDesktop ? 30 : 20, marginBottom: 16 }}>
                <p className="docs-muted" style={{ fontSize: 11, marginBottom: 8 }}>
                  IRCTC CONNECT SDK
                </p>
                <h1
                  className="docs-title"
                  style={{
                    fontSize: "clamp(30px, 5vw, 52px)",
                    lineHeight: 1.05,
                    marginBottom: 14,
                  }}
                >
                  Irctc Connect SDK Documentation
                </h1>
                <p
                  style={{
                    color: "#94a3b8",
                    maxWidth: 820,
                    lineHeight: 1.75,
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Get installation, quick start,
                  endpoint references, validation rules, and live playground flow in
                  one place.
                </p>

                <div
                  style={{
                    marginTop: 18,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href="/dashboard"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 13px",
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #059669, #047857)",
                      border: "1px solid #047857",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Open Dashboard <ChevronRight size={13} />
                  </Link>
                  <a
                    href="https://www.npmjs.com/package/irctc-connect"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 13px",
                      borderRadius: 8,
                      background: "#1a1f2e",
                      border: "1px solid #2d3548",
                      color: "#94a3b8",
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    View NPM Package
                  </a>
                  <button
                    onClick={copyAIDocsMarkdown}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 13px",
                      borderRadius: 8,
                      background: copiedAIMarkdown ? "#0f2a1d" : "#1a1f2e",
                      border: copiedAIMarkdown
                        ? "1px solid #1a4731"
                        : "1px solid #2d3548",
                      color: copiedAIMarkdown ? "#6ee7b7" : "#94a3b8",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: "pointer",
                    }}
                  >
                    {copiedAIMarkdown ? "Markdown Copied" : "Copy AI Markdown"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 14,
                }}
              >
                {[
                  { label: "Endpoints", value: "6", color: "#60a5fa" },
                  { label: "Runtime", value: "Node 14+", color: "#6ee7b7" },
                  { label: "Auth", value: "API Key", color: "#fbbf24" },
                  { label: "SDK", value: "irctc-connect", color: "#a78bfa" },
                ].map((stat) => (
                  <div key={stat.label} className="docs-card" style={{ padding: 14 }}>
                    <p className="docs-muted" style={{ fontSize: 10, marginBottom: 8 }}>
                      {stat.label}
                    </p>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: stat.color,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section id="installation" style={sectionStyle}>
              <SectionHeader title="Installation" icon={Package} />
              <div className="docs-card" style={{ overflow: "hidden" }}>
                <div
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #1e2330",
                    background: "#0a0d13",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="docs-muted" style={{ fontSize: 11 }}>
                    Terminal
                  </span>
                  <button
                    onClick={copyInstall}
                    style={{
                      borderRadius: 6,
                      border: "1px solid #2d3548",
                      background: copiedInstall ? "#0f2a1d" : "#1a1f2e",
                      color: copiedInstall ? "#6ee7b7" : "#94a3b8",
                      cursor: "pointer",
                      padding: "4px 8px",
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {copiedInstall ? "Copied" : "Copy"}
                  </button>
                </div>
                <div style={{ padding: 14, background: "#0a0d13" }}>
                  <code
                    style={{
                      color: "#6ee7b7",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                    }}
                  >
                    {installSnippet}
                  </code>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 14,
                }}
              >
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

            <section id="quickstart" style={sectionStyle}>
              <SectionHeader title="Quick Start" icon={Rocket} />
              <div
                style={{
                  background: "#1a1060",
                  border: "1px solid #2d1f8a",
                  color: "#c4b5fd",
                  borderRadius: 10,
                  padding: "11px 13px",
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 12,
                  lineHeight: 1.6,
                }}
              >
                Call <code>configure(apiKey)</code> once at app startup before any
                request method.
              </div>
              <CodePanel language="javascript" code={quickStartSnippet} />
            </section>

            <div className="docs-endpoint-stack">
              {endpointSections.map((endpoint) => (
                <section key={endpoint.id} id={endpoint.id} style={sectionStyle}>
                  <SectionHeader title={endpoint.title} icon={endpoint.icon} />
                  <div className="docs-card" style={{ padding: isDesktop ? 20 : 14 }}>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: 13,
                        lineHeight: 1.78,
                        fontFamily: "'JetBrains Mono', monospace",
                        marginBottom: 14,
                      }}
                    >
                      {endpoint.description}
                    </p>
                    <code
                      className="docs-endpoint-signature"
                      style={{
                        padding: "6px 10px",
                        background: "#0a0d13",
                        border: "1px solid #2d3548",
                        borderRadius: 7,
                        color: "#93c5fd",
                        fontSize: 12,
                        fontFamily: "'JetBrains Mono', monospace",
                        marginBottom: 16,
                      }}
                    >
                      {endpoint.signature}
                    </code>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 10,
                        marginBottom: 16,
                      }}
                    >
                      {endpoint.params.map((param) => (
                        <div
                          key={param.name}
                          style={{
                            background: "#0a0d13",
                            border: "1px solid #1e2330",
                            borderRadius: 9,
                            padding: 11,
                          }}
                        >
                          <p
                            style={{
                              color: "#e2e8f0",
                              fontSize: 12,
                              fontWeight: 700,
                              marginBottom: 6,
                              fontFamily: "'JetBrains Mono', monospace",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {param.name}
                          </p>
                          <p
                            style={{
                              color: "#60a5fa",
                              fontSize: 11,
                              fontFamily: "'JetBrains Mono', monospace",
                              marginBottom: 4,
                            }}
                          >
                            {param.type}
                          </p>
                          <p
                            style={{
                              color: "#64748b",
                              fontSize: 11,
                              lineHeight: 1.6,
                              fontFamily: "'JetBrains Mono', monospace",
                              overflowWrap: "anywhere",
                            }}
                          >
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

            <section id="playground" style={sectionStyle}>
              <SectionHeader title="Playground" icon={Gamepad2} />
              <div className="docs-card" style={{ padding: 16 }}>
                <p
                  style={{
                    color: "#94a3b8",
                    lineHeight: 1.7,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    marginBottom: 14,
                  }}
                >
                  The live playground is now available directly inside your user
                  panel. Use it to run real API calls with your account key and see
                  latency + JSON responses in the same dashboard workspace.
                </p>
                <Link
                  href="/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    textDecoration: "none",
                    color: "#fff",
                    background: "linear-gradient(135deg, #059669, #047857)",
                    border: "1px solid #047857",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Open Playground Tab <ChevronRight size={13} />
                </Link>
              </div>
            </section>

            <section id="validation" style={sectionStyle}>
              <SectionHeader title="Input Validation" icon={CheckCircle} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <InfoPanel
                  title="PNR"
                  items={[
                    "Exactly 10 digits",
                    "Numeric input only",
                    "Reject malformed values early",
                  ]}
                />
                <InfoPanel
                  title="Train Number"
                  items={[
                    "Exactly 5 digits",
                    "Treat as string to preserve zeros",
                    "No spaces or symbols",
                  ]}
                />
                <InfoPanel
                  title="Date"
                  items={[
                    "DD-MM-YYYY format",
                    "Validate real calendar date",
                    "Use same format across APIs",
                  ]}
                />
                <InfoPanel
                  title="Station Code"
                  items={[
                    "Uppercase station code",
                    "Examples: NDLS, BCT, HWH",
                    "Trim extra whitespace",
                  ]}
                />
              </div>
            </section>

            <section id="status-codes" style={sectionStyle}>
              <SectionHeader title="Status Codes" icon={BarChart3} />
              <div className="docs-card" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#0a0d13", borderBottom: "1px solid #1e2330" }}>
                      {["Code", "Full Form", "Description"].map((head) => (
                        <th
                          key={head}
                          style={{
                            color: "#475569",
                            fontSize: 10,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            textAlign: "left",
                            padding: "11px 12px",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
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
                      <tr key={code} style={{ borderBottom: "1px solid #141820" }}>
                        <td style={{ padding: "11px 12px" }}>
                          <code
                            style={{
                              background: "#0b1a2c",
                              border: "1px solid #1e3a5f",
                              borderRadius: 6,
                              color: "#93c5fd",
                              padding: "2px 6px",
                              fontSize: 11,
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {code}
                          </code>
                        </td>
                        <td
                          style={{
                            color: "#cbd5e1",
                            fontSize: 12,
                            padding: "11px 12px",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {full}
                        </td>
                        <td
                          style={{
                            color: "#94a3b8",
                            fontSize: 12,
                            padding: "11px 12px",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="errors" style={{ marginBottom: 52, scrollMarginTop: 104 }}>
              <SectionHeader title="Error Handling" icon={AlertTriangle} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background: "#0f2a1d",
                    border: "1px solid #1a4731",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <p
                    style={{
                      color: "#6ee7b7",
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      marginBottom: 8,
                    }}
                  >
                    Success Response
                  </p>
                  <pre
                    style={{
                      color: "#d1fae5",
                      margin: 0,
                      fontSize: 11,
                      lineHeight: 1.6,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >{`{
  success: true,
  data: { ... }
}`}</pre>
                </div>
                <div
                  style={{
                    background: "#2a0f0f",
                    border: "1px solid #4a1f1f",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <p
                    style={{
                      color: "#fda4af",
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      marginBottom: 8,
                    }}
                  >
                    Error Response
                  </p>
                  <pre
                    style={{
                      color: "#fecdd3",
                      margin: 0,
                      fontSize: 11,
                      lineHeight: 1.6,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >{`{
  success: false,
  message: "Error message"
}`}</pre>
                </div>
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
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10,
            background: "rgba(0, 0, 0, 0.5)",
            border: "none",
            cursor: "pointer",
            display: isDesktop ? "none" : "block",
          }}
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "#1a1f2e",
          border: "1px solid #2d3548",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#93c5fd",
        }}
      >
        <Icon size={15} />
      </div>
      <h2
        style={{
          color: "#f1f5f9",
          fontSize: 20,
          lineHeight: 1.2,
          fontFamily: "'Syne', sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="docs-card" style={{ padding: 13 }}>
      <p
        style={{
          color: "#cbd5e1",
          fontSize: 12,
          marginBottom: 8,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {title}
      </p>
      <div style={{ display: "grid", gap: 7 }}>
        {items.map((item) => (
          <p
            key={item}
            style={{
              color: "#94a3b8",
              fontSize: 12,
              lineHeight: 1.55,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function CodePanel({ language, code }: { language: string; code: string }) {
  return (
    <div
      className="docs-card docs-code-wrap"
      style={{
        overflow: "hidden",
        borderColor: "#1f2937",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 12px",
          borderBottom: "1px solid #1e2330",
          background: "#0a0d13",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#f87171",
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#fbbf24",
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#34d399",
          }}
        />
        <span
          style={{
            marginLeft: 8,
            color: "#64748b",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {language}
        </span>
      </div>
      <div
        style={{
          background: "#0a0d13",
          padding: "8px 10px",
          overflowX: "auto",
          maxWidth: "100%",
        }}
      >
        <SyntaxHighlighter
          language={language}
          style={nightOwl}
          customStyle={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.72,
            background: "transparent",
            fontFamily: "'JetBrains Mono', monospace",
            minWidth: "max-content",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
