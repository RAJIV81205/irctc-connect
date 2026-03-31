"use client";
import { useState } from "react";
import { sidebarGroups } from "./docsData";
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
  Armchair,
} from "lucide-react";

const IRCTCConnectDocs = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black font-inter text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300">
      {/* Main Layout */}
      <div className="pt-16 max-w-full lg:max-w-7xl mx-auto flex px-4 lg:px-8">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-white/10 overflow-y-auto transition-transform duration-300 z-40 lg:border-r lg:bg-transparent dark:lg:bg-transparent ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4">
            <nav className="space-y-6">
              {sidebarGroups.map((group) => (
                <div key={group.title}>
                  {/* Section Header */}
                  <div className="px-3 mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {group.title}
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {group.items.map((section) => {
                      const IconComponent = section.icon;
                      const isActive = activeSection === section.id;

                      return (
                        <button
                          key={section.id}
                          title={section.label}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                ${
                  isActive
                    ? "bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-slate-300"
                }`}
                        >
                          <IconComponent className="w-5 h-5 shrink-0" />
                          <span className="text-sm">{section.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] lg:pl-12 py-8 lg:py-12 px-4 lg:px-0">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <section id="introduction" className="mb-12 lg:mb-20 scroll-mt-32">
              <div className="mb-10 text-left">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Get setup</p>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                  Introducing the new IRCTC Connect documentation
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Find all the guides and resources you need to develop with IRCTC Connect. API key is required now, and you must add it in your environment variables for requests to work.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                {[
                  {
                    icon: <Rocket className="w-5 h-5 stroke-[1.5]" />,
                    title: "Quickstarts",
                    desc: "Explore our end-to-end tutorials and get started.",
                  },
                  {
                    icon: <Package className="w-5 h-5 stroke-[1.5]" />,
                    title: "Core Features",
                    desc: "Pre-built components and APIs for PNR and Trains.",
                  },
                  {
                    icon: <AlertTriangle className="w-5 h-5 stroke-[1.5]" />,
                    title: "Reliability",
                    desc: "Input validations and strict error handling guidelines.",
                  },
                  {
                    icon: <Gamepad2 className="w-5 h-5 stroke-[1.5]" />,
                    title: "API Reference",
                    desc: "Dig into our API reference documentation and SDKs.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-zinc-900/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all shadow-sm"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 mb-4 shadow-sm">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Frameworks */}
              <div className="mb-10 text-left">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                  Explore by frontend framework
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Find all the guides and resources you need to develop with IRCTC Connect.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 pb-8">
                {[
                  {
                    title: "Next.js",
                    desc: "Easily add fast train scheduling and PNR tracking to Next.js.",
                    letter: "N"
                  },
                  {
                    title: "React",
                    desc: "Get started installing and initializing IRCTC Connect in a React App.",
                    letter: "R"
                  },
                  {
                    title: "Express",
                    desc: "Learn about installing and initializing APIs in an Express server.",
                    letter: "E"
                  },
                  {
                    title: "Vanilla Node",
                    desc: "Use IRCTC Connect cleanly with pure Javascript to query data.",
                    letter: "V"
                  }
                ].map((fw, idx) => (
                  <div key={idx} className="flex gap-4 p-4 -ml-4 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900/30 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg shrink-0 shadow-sm transition-transform">
                      {fw.letter}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{fw.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{fw.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Installation */}
            <section id="installation" className="mb-8 lg:mb-16 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
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
                      <span className="text-green-500">✓</span> Valid API key
                      added in `.env` (for example `IRCTC_API_KEY`)
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
            <section id="quickstart" className="mb-8 lg:mb-16 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
                <Rocket /> Quick Start
              </h2>
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200">
                API key is required now. Add your key in environment variables first, then run your code.
              </div>
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
                    {`// .env
// IRCTC_API_KEY=your_api_key_here

if (!process.env.IRCTC_API_KEY) {
  throw new Error('IRCTC_API_KEY is required in environment variables');
}

import {   
  checkPNRStatus, getTrainInfo, trackTrain, liveAtStation, searchTrainBetweenStations, getAvailability 
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
const searchResult = await searchTrainBetweenStations('NDLS', 'BCT');

// Get seat availability with fare
const availabilityResult = await getAvailability('12496', 'ASN', 'DDU', '27-12-2025', '2A', 'GN');`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>

            {/* PNR Status */}
            <section id="pnr-status" className="mb-8 lg:mb-16 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
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
            <section id="train-info" className="mb-8 lg:mb-16 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
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
            <section id="live-tracking" className="mb-8 lg:mb-16 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
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
            <section id="station-live" className="mb-8 lg:mb-16 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
                <Building2 /> liveAtStation(stnCode)
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
                    stnCode
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
            <section id="train-search" className="mb-8 lg:mb-16 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
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

            {/* Seat Availability */}
            <section
              id="seat-availability"
              className="mb-8 lg:mb-16 scroll-mt-24"
            >
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
                <Armchair className="w-6 h-6" />
                getAvailability( trainNo, fromStnCode, toStnCode, date, coach,
                quota )
              </h2>

              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Check seat availability with complete fare breakdown for a
                specific train journey.
              </p>

              {/* Parameters */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  Parameters
                </h4>

                <div className="space-y-3 text-sm">
                  {[
                    ["trainNo", "string", "5-digit train number"],
                    [
                      "fromStnCode",
                      "string",
                      "Origin station code (e.g. ASN, NDLS)",
                    ],
                    [
                      "toStnCode",
                      "string",
                      "Destination station code (e.g. DDU, BCT)",
                    ],
                    ["date", "string", "Journey date in DD-MM-YYYY format"],
                    [
                      "coach",
                      "string",
                      "Class: 2S, SL, 3A, 3E, 2A, 1A, CC, EC",
                    ],
                    ["quota", "string", "Quota: GN, LD, SS, TQ"],
                  ].map(([name, type, desc]) => (
                    <div
                      key={name}
                      className="flex flex-wrap items-center gap-3"
                    >
                      <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded font-mono">
                        {name}
                      </code>
                      <span className="text-slate-600 dark:text-slate-300">
                        ({type}) — {desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Example */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Example Usage
                  </span>
                </div>

                <div className="p-2 font-jetbrains text-sm overflow-x-auto bg-slate-900">
                  <SyntaxHighlighter language="javascript" style={nightOwl}>
                    {`const result = await getAvailability(
  '12496',
  'ASN',
  'DDU',
  '27-12-2025',
  '2A',
  'GN'
);

if (result.success) {
  const { train, fare, availability } = result.data;

  console.log(\`🚂 \${train.trainName} (\${train.trainNo})\`);
  console.log(
    \`📍 \${train.fromStationName} → \${train.toStationName}\`
  );

  console.log('\\n💰 Fare Breakdown:');
  console.log('Base Fare:', fare.baseFare);
  console.log('Reservation:', fare.reservationCharge);
  console.log('Superfast:', fare.superfastCharge);
  console.log('Total:', fare.totalFare);

  console.log('\\n📅 Availability:');
  availability.forEach(day => {
    console.log(
      \`\${day.date}: \${day.availabilityText} (\${day.prediction})\`
    );
  });
}`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>

            <Playground />

            {/* Validation */}
            <section id="validation" className="mb-8 lg:mb-16 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
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
            <section id="status-codes" className="mb-8 lg:mb-16 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
                <BarChart3 /> Status Codes
              </h2>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-3 lg:px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-100">
                        Code
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-100 hidden sm:table-cell">
                        Full Form
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-100">
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
                        <td className="px-3 lg:px-6 py-4">
                          <code className="px-2 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded font-mono text-xs font-semibold">
                            {status.code}
                          </code>
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                          {status.full}
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-slate-500 dark:text-slate-400">
                          {status.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Error Handling */}
            <section id="errors" className="mb-8 lg:mb-16 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 flex items-center gap-3">
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
        </main>
      </div>
    </div>
  );
};

export default IRCTCConnectDocs;
