"use client";
import { useState } from "react";
import { sections } from "./docsData";
import Playground from "../components/Playground";
import { useTheme } from "./ThemeProvider";
import SearchCommand from "../components/SearchCommand";
import SyntaxHighlighter from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  BookOpen,
  Package,
  Rocket,
  Ticket,
  Train,
  MapPin,
  Building2,
  Search,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

const IRCTCConnectDocs = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 antialiased font-inter transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-[80%] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors lg:hidden"
            >
              <svg
                className="w-5 h-5 text-slate-900 dark:text-slate-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2" title="logo">
              <span className="inline-flex items-center text-2xl">
                {/* Light logo shown when not dark */}
                <img
                  src="/icon.png"
                  alt="irctc-connect logo (light)"
                  className="block dark:hidden h-[1.5em] w-auto"
                />
                {/* Dark logo shown when dark */}
                <img
                  src="/icon-dark.png"
                  alt="irctc-connect logo (dark)"
                  className="hidden dark:block h-[1.5em] w-auto"
                />
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-jetbrains">
                irctc-connect
              </span>
            </div>
            <div className="flex flex-row justify-center items-center gap-3 flex-wrap">
              {/* NPM Version */}
              <img
                src="https://img.shields.io/npm/v/irctc-connect.svg"
                alt="npm version"
              />

              {/* Total Downloads */}
              <img
                src="https://img.shields.io/npm/dt/irctc-connect.svg"
                alt="total downloads"
              />

              {/* License */}
              <img
                src="https://img.shields.io/npm/l/irctc-connect.svg"
                alt="license"
              />
            </div>
          </div>

          <div className="flex items-center gap-4" title="Search Box">
            {/* Search Command */}
            <SearchCommand onNavigate={scrollToSection} />

            <div className="flex items-center gap-3">
              {/* NPM Button */}
              {/* NPM Button */}
              <a
                href="https://www.npmjs.com/package/irctc-connect"
                target="_blank"
                rel="noopener noreferrer"
                title="npm"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium
    bg-[#CC0000] text-white border border-[#CC0000]
    dark:bg-white dark:text-[#CC0000] dark:border-white
    rounded-lg hover:opacity-90 transition-all"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 2500 2500"
                  xmlns="http://www.w3.org/2000/svg"
                  className="rounded-sm"
                >
                  {/* Background (red in light mode, white in dark mode) */}
                  <rect
                    width="2500"
                    height="2500"
                    className="fill-[#CC0000] dark:fill-white"
                  />

                  {/* NPM logo foreground */}
                  <path
                    d="M1241.5 268.5h-973v1962.9h972.9V763.5h495v1467.9h495V268.5z"
                    className="fill-white dark:fill-[#CC0000]"
                  />
                </svg>
                NPM
              </a>

              {/* GitHub Button */}
              <a
                href="https://github.com/RAJIV81205/irctc-connect"
                target="_blank"
                rel="noopener noreferrer"
                title="github"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium 
    bg-slate-900 text-white dark:bg-white dark:text-black
    rounded-lg border border-slate-900  
    hover:opacity-90 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="pt-16 max-w-[80%] mx-auto flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-20 left-0 h-fit w-64 bg-white dark:bg-gray-800 border rounded-lg border-slate-200 dark:border-slate-700 overflow-y-auto transition-transform duration-300 z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    title={section.label}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-2 py-2.5 text-base font-medium rounded-lg transition-all duration-200 relative
    ${
      activeSection === section.id
        ? "text-blue-600 dark:text-blue-400 font-semibold relative before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:w-0 before:h-0 before:border-t-[6px] before:border-b-[6px] before:border-l-8 before:border-t-transparent before:border-b-transparent before:border-l-blue-600 dark:before:border-l-blue-400"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1 min-h-screen lg:pl-8 py-8 px-4 lg:px-0">
          <div className="max-w-4xl">
            {/* Introduction */}
            <section id="introduction" className="mb-16 scroll-mt-24">
              <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-8 text-white mb-8">
                <h1 className="text-3xl font-bold mb-3">IRCTC Connect</h1>
                <p className="text-blue-100 dark:text-blue-200 text-lg leading-relaxed">
                  A comprehensive Node.js package for Indian Railways services.
                  Get real-time PNR status, detailed train information, live
                  train tracking, station updates, and search trains between
                  stations.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: "🎫",
                    title: "PNR Status",
                    desc: "Real-time booking status",
                  },
                  {
                    icon: "🚂",
                    title: "Train Info",
                    desc: "Complete route details",
                  },
                  {
                    icon: "📍",
                    title: "Live Tracking",
                    desc: "Real-time location",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Installation */}
            <section id="installation" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <BookOpen /> Installation
              </h2>
              <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 font-mono text-sm border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs">Terminal</span>
                  <button className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors">
                    Copy
                  </button>
                </div>
                <code className="text-green-400">
                  npm install irctc-connect
                </code>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Requirements
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Node.js 14+
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Internet
                      connection
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Valid
                      credentials
                    </li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Supported Platforms
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">→</span> Node.js apps
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">→</span> Express.js
                      servers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">→</span> Next.js
                      applications
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">→</span> React Native
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quickstart" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <Rocket /> Quick Start
              </h2>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    index.js
                  </span>
                </div>
                <div className="p-2 font-jetbrains text-sm overflow-x-auto bg-slate-900">
                  <SyntaxHighlighter language="javascript" style={nightOwl}>
                    {`import { 
  checkPNRStatus, getTrainInfo, trackTrain, liveAtStation, searchTrainBetweenStations 
  } from 'irctc-connect';

// Check PNR status
const pnrResult = await checkPNRStatus('1234567890');

// Get train information
const trainResult = await getTrainInfo('12345');

// Track live train status
const trackResult = await trackTrain('12345', '06-12-2025');

// Get live trains at station
const stationResult = await liveAtStation('NDLS');

// Search trains between stations
const searchResult = await searchTrainBetweenStations('NDLS', 'BCT');`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>

            {/* PNR Status */}
            <section id="pnr-status" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <Ticket /> checkPNRStatus(pnr)
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Get comprehensive PNR status with passenger details and journey
                information.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Parameters
                </h4>
                <div className="flex items-center gap-3">
                  <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-sm font-mono">
                    pnr
                  </code>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    (string) — 10-digit PNR number
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Example Usage
                  </span>
                </div>
                <div className="p-2 font-jetbrains text-sm overflow-x-auto bg-slate-900">
                  <SyntaxHighlighter language="javascript" style={nightOwl}>
                    {`const result = await checkPNRStatus('1234567890');

if (result.success) {
  console.log('PNR:', result.data.pnr);
  console.log('Status:', result.data.status);
  console.log('Train:', result.data.train.name);
  console.log('Journey:', result.data.journey.from.name, '→', result.data.journey.to.name);
  
  result.data.passengers.forEach(passenger => {
    console.log(\`\${passenger.name}: \${passenger.status} - \${passenger.seat}\`);
  });
}`}
                  </SyntaxHighlighter>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Response Structure
                  </span>
                </div>
                <div className="p-2 font-jetbrains text-sm overflow-x-auto bg-slate-900">
                  <SyntaxHighlighter language="javascript" style={nightOwl}>
                    {`{
  success: true,
  data: {
    pnr: "1234567890",
    status: "CNF",
    train: { number: "12345", name: "Rajdhani Express", class: "3A" },
    journey: {
      from: { name: "New Delhi", code: "NDLS", platform: "16" },
      to: { name: "Mumbai Central", code: "BCT", platform: "3" },
      departure: "20:05",
      arrival: "08:35",
      duration: "12h 30m"
    },
    passengers: [
      { name: "JOHN DOE", status: "CNF", seat: "B1-45", berthType: "SL" }
    ]
  }
}`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>

            {/* Train Info */}
            <section id="train-info" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <Train /> getTrainInfo(trainNumber)
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Get detailed train information including complete route with
                station coordinates.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Parameters
                </h4>
                <div className="flex items-center gap-3">
                  <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-sm font-mono">
                    trainNumber
                  </code>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    (string) — 5-digit train number
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Example Usage
                  </span>
                </div>
                <div className="p-2 font-jetbrains text-sm overflow-x-auto bg-slate-900">
                  <SyntaxHighlighter language="javascript" style={nightOwl}>
                    {`const result = await getTrainInfo('12345');

if (result.success) {
  const { trainInfo, route } = result.data;
  
  console.log(\`🚂 \${trainInfo.train_name} (\${trainInfo.train_no})\`);
  console.log(\`📍 \${trainInfo.from_stn_name} → \${trainInfo.to_stn_name}\`);
  console.log(\`⏱️ \${trainInfo.from_time} - \${trainInfo.to_time}\`);
  console.log(\`📅 Running Days: \${trainInfo.running_days}\`);
  
  route.forEach(station => {
    console.log(\`  \${station.stnName} - \${station.departure}\`);
  });
}`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>

            {/* Live Tracking */}
            <section id="live-tracking" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <MapPin /> trackTrain(trainNumber, date)
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Get real-time train status and tracking for a specific date with
                detailed station-wise information including delays and coach
                positions.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  Parameters
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-sm font-mono">
                      trainNumber
                    </code>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      (string) — 5-digit train number
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-sm font-mono">
                      date
                    </code>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      (string) — Date in dd-mm-yyyy format
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Example Usage
                  </span>
                </div>
                <div className="p-2 font-jetbrains text-sm overflow-x-auto bg-slate-900">
                  <SyntaxHighlighter language="javascript" style={nightOwl}>
                    {`const result = await trackTrain('12342', '06-12-2025');

if (result.success) {
  const { trainNo, trainName, statusNote, stations } = result.data;
  
  console.log(\`🚂 \${trainName} (\${trainNo})\`);
  console.log(\`📍 Status: \${statusNote}\`);
  
  stations.forEach(station => {
    console.log(\`🚉 \${station.stationName} (\${station.stationCode})\`);
    console.log(\`   Arrival: \${station.arrival.scheduled} → \${station.arrival.actual}\`);
    if (station.arrival.delay) {
      console.log(\`   ⚠️ Delay: \${station.arrival.delay}\`);
    }
  });
}`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>

            {/* Live at Station */}
            <section id="station-live" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <Building2 /> liveAtStation(stationCode)
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Get list of upcoming trains at any station with real-time
                information.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Parameters
                </h4>
                <div className="flex items-center gap-3">
                  <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-sm font-mono">
                    stationCode
                  </code>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    (string) — Station code (e.g., 'NDLS', 'BCT', 'HWH')
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Example Usage
                  </span>
                </div>
                <div className="p-2 font-jetbrains text-sm overflow-x-auto bg-slate-900">
                  <SyntaxHighlighter language="javascript" style={nightOwl}>
                    {`const result = await liveAtStation('NDLS');

if (result.success) {
  console.log(\`🚉 Live trains at \${result.data.stationName}:\`);
  
  result.data.trains.forEach(train => {
    console.log(\`🚂 \${train.trainName} (\${train.trainNumber})\`);
    console.log(\`   📍 \${train.source} → \${train.destination}\`);
    console.log(\`   ⏰ Expected: \${train.expectedTime}\`);
    console.log(\`   📊 Status: \${train.status}\`);
  });
}`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>

            {/* Train Search */}
            <section id="train-search" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <Search /> searchTrainBetweenStations(from, to)
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Find all trains running between two stations with timing and
                availability.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  Parameters
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-sm font-mono">
                      fromStationCode
                    </code>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      (string) — Origin station code
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-sm font-mono">
                      toStationCode
                    </code>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      (string) — Destination station code
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Example Usage
                  </span>
                </div>
                <div className="p-2 font-jetbrains text-sm overflow-x-auto bg-slate-900">
                  <SyntaxHighlighter language="javascript" style={nightOwl}>
                    {`const result = await searchTrainBetweenStations('NDLS', 'BCT');

if (result.success) {
  console.log(\`🔍 Trains from \${result.data.from} to \${result.data.to}:\`);
  
  result.data.trains.forEach(train => {
    console.log(\`🚂 \${train.trainName} (\${train.trainNumber})\`);
    console.log(\`   ⏰ \${train.departure} → \${train.arrival}\`);
    console.log(\`   ⏱️ Duration: \${train.duration}\`);
    console.log(\`   📅 Days: \${train.runningDays}\`);
  });
}`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>

            {/* Validation */}
            <section id="validation" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <CheckCircle /> Input Validation
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    PNR Number
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li>• Must be exactly 10 digits</li>
                    <li>• Only numeric characters</li>
                    <li>• Auto-cleans non-numeric input</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Train Number
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li>• Must be exactly 5 characters</li>
                    <li>• Valid train number string</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Date Format
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li>• Format: dd-mm-yyyy</li>
                    <li>• Validates actual dates</li>
                    <li>• No invalid dates like 32-01-2025</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Station Codes
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li>• Valid station code strings</li>
                    <li>• Examples: NDLS, BCT, HWH</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Status Codes */}
            <section id="status-codes" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <BarChart3 /> Status Codes
              </h2>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-100">
                        Code
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-100">
                        Full Form
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-100">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {[
                      {
                        code: "CNF",
                        full: "Confirmed",
                        desc: "Seat is confirmed",
                      },
                      {
                        code: "WL",
                        full: "Waiting List",
                        desc: "Not confirmed yet",
                      },
                      {
                        code: "RAC",
                        full: "Reservation Against Cancellation",
                        desc: "Partially confirmed",
                      },
                      {
                        code: "CAN",
                        full: "Cancelled",
                        desc: "Ticket cancelled",
                      },
                      {
                        code: "PQWL",
                        full: "Pooled Quota Waiting List",
                        desc: "On pooled quota",
                      },
                      {
                        code: "TQWL",
                        full: "Tatkal Quota Waiting List",
                        desc: "On tatkal quota",
                      },
                      {
                        code: "GNWL",
                        full: "General Waiting List",
                        desc: "On general quota",
                      },
                    ].map((status, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded font-mono text-xs font-semibold">
                            {status.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {status.full}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {status.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Error Handling */}
            <section id="errors" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <AlertTriangle /> Error Handling
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                All functions return a consistent response structure. Always
                check the{" "}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded text-sm">
                  success
                </code>{" "}
                field before accessing data.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                    <span className="text-lg">✅</span> Success Response
                  </h4>
                  <pre className="text-sm text-green-900 dark:text-green-200 font-mono">
                    {`{
  success: true,
  data: { ... }
}`}
                  </pre>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                    <span className="text-lg">❌</span> Error Response
                  </h4>
                  <pre className="text-sm text-red-900 dark:text-red-200 font-mono">
                    {`{
  success: false,
  error: "Error message"
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">
                  Common Error Scenarios
                </h4>
                <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-200">
                  <li>• Invalid input parameters</li>
                  <li>• Network timeouts (10-second timeout)</li>
                  <li>• API service unavailable</li>
                  <li>• Invalid PNR/train numbers</li>
                  <li>• Invalid date formats</li>
                </ul>
              </div>
            </section>
          </div>
          <Playground />
        </main>
      </div>
    </div>
  );
};

export default IRCTCConnectDocs;
