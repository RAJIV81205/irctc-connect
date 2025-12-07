"use client";
import React, { useState } from "react";
import { sections } from "./docsData";
import Playground  from "../components/Playground";

const IRCTCConnectDocs = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  

    

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 antialiased font-inter">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[80%] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              <svg
                className="w-5 h-5"
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
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚂</span>
              <span className="text-xl font-bold text-slate-900">
                irctc-connect
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              v2.0.1
              
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.npmjs.com/package/irctc-connect"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="48"
                height="48"
                viewBox="0 0 48 48"
              >
                <path fill="#d50000" d="M0,15h48v17H24v3H13v-3H0V15z"></path>
                <path
                  fill="#fff"
                  d="M3 29L8 29 8 21 11 21 11 29 13 29 13 18 3 18zM16 18v14h5v-3h5V18H16zM24 26h-3v-5h3V26zM29 18L29 29 34 29 34 21 37 21 37 29 40 29 40 21 43 21 43 29 45 29 45 18z"
                ></path>
              </svg>
              
            </a>
            <a
              href="https://github.com/RAJIV81205/irctc-connect"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="pt-16 max-w-[80%] mx-auto flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 overflow-y-auto transition-transform duration-300 z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Documentation
            </p>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-linear-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-800 mb-2">
                Monthly Downloads
              </p>
              <p className="text-2xl font-bold text-blue-600">251</p>
              <p className="text-xs text-slate-500 mt-1">MIT License</p>
            </div>
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
              <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
                <h1 className="text-3xl font-bold mb-3">IRCTC Connect</h1>
                <p className="text-blue-100 text-lg leading-relaxed">
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
                    className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Installation */}
            <section id="installation" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-xl">📦</span> Installation
              </h2>
              <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm">
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
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Requirements
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
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
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Supported Platforms
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-xl">🚀</span> Quick Start
              </h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-2 text-xs text-slate-500">index.js</span>
                </div>
                <pre className="p-6 font-jetbrains text-sm overflow-x-auto bg-slate-900 text-slate-300">
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
                </pre>
              </div>
            </section>

            {/* PNR Status */}
            <section id="pnr-status" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-xl">🎫</span> checkPNRStatus(pnr)
              </h2>
              <p className="text-slate-600 mb-6">
                Get comprehensive PNR status with passenger details and journey
                information.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Parameters</h4>
                <div className="flex items-center gap-3">
                  <code className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">
                    pnr
                  </code>
                  <span className="text-sm text-slate-600">
                    (string) — 10-digit PNR number
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-700">
                    Example Usage
                  </span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto bg-slate-900 text-slate-300">
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
                </pre>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-700">
                    Response Structure
                  </span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto bg-slate-900 text-slate-300">
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
                </pre>
              </div>
            </section>

            {/* Train Info */}
            <section id="train-info" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-xl">🚂</span> getTrainInfo(trainNumber)
              </h2>
              <p className="text-slate-600 mb-6">
                Get detailed train information including complete route with
                station coordinates.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Parameters</h4>
                <div className="flex items-center gap-3">
                  <code className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">
                    trainNumber
                  </code>
                  <span className="text-sm text-slate-600">
                    (string) — 5-digit train number
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-700">
                    Example Usage
                  </span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto bg-slate-900 text-slate-300">
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
                </pre>
              </div>
            </section>

            {/* Live Tracking */}
            <section id="live-tracking" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-xl">📍</span> trackTrain(trainNumber,
                date)
              </h2>
              <p className="text-slate-600 mb-6">
                Get real-time train status and tracking for a specific date with
                detailed station-wise information including delays and coach
                positions.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3">Parameters</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">
                      trainNumber
                    </code>
                    <span className="text-sm text-slate-600">
                      (string) — 5-digit train number
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">
                      date
                    </code>
                    <span className="text-sm text-slate-600">
                      (string) — Date in dd-mm-yyyy format
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-700">
                    Example Usage
                  </span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto bg-slate-900 text-slate-300">
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
                </pre>
              </div>
            </section>

            {/* Live at Station */}
            <section id="station-live" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-xl">🚉</span> liveAtStation(stationCode)
              </h2>
              <p className="text-slate-600 mb-6">
                Get list of upcoming trains at any station with real-time
                information.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Parameters</h4>
                <div className="flex items-center gap-3">
                  <code className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">
                    stationCode
                  </code>
                  <span className="text-sm text-slate-600">
                    (string) — Station code (e.g., 'NDLS', 'BCT', 'HWH')
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-700">
                    Example Usage
                  </span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto bg-slate-900 text-slate-300">
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
                </pre>
              </div>
            </section>

            {/* Train Search */}
            <section id="train-search" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-xl">🔍</span>{" "}
                searchTrainBetweenStations(from, to)
              </h2>
              <p className="text-slate-600 mb-6">
                Find all trains running between two stations with timing and
                availability.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3">Parameters</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">
                      fromStationCode
                    </code>
                    <span className="text-sm text-slate-600">
                      (string) — Origin station code
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">
                      toStationCode
                    </code>
                    <span className="text-sm text-slate-600">
                      (string) — Destination station code
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-700">
                    Example Usage
                  </span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto bg-slate-900 text-slate-300">
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
                </pre>
              </div>
            </section>

            {/* Validation */}
            <section id="validation" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-xl">✅</span> Input Validation
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    PNR Number
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Must be exactly 10 digits</li>
                    <li>• Only numeric characters</li>
                    <li>• Auto-cleans non-numeric input</li>
                  </ul>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Train Number
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Must be exactly 5 characters</li>
                    <li>• Valid train number string</li>
                  </ul>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Date Format
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Format: dd-mm-yyyy</li>
                    <li>• Validates actual dates</li>
                    <li>• No invalid dates like 32-01-2025</li>
                  </ul>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Station Codes
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Valid station code strings</li>
                    <li>• Examples: NDLS, BCT, HWH</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Status Codes */}
            <section id="status-codes" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-xl">📊</span> Status Codes
              </h2>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left font-semibold text-slate-900">
                        Code
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-900">
                        Full Form
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
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
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-mono text-xs font-semibold">
                            {status.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {status.full}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-xl">⚠️</span> Error Handling
              </h2>
              <p className="text-slate-600 mb-6">
                All functions return a consistent response structure. Always
                check the{" "}
                <code className="px-1.5 py-0.5 bg-slate-100 rounded text-sm">
                  success
                </code>{" "}
                field before accessing data.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">✅</span> Success Response
                  </h4>
                  <pre className="text-sm text-green-900 font-mono">
                    {`{
  success: true,
  data: { ... }
}`}
                  </pre>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">❌</span> Error Response
                  </h4>
                  <pre className="text-sm text-red-900 font-mono">
                    {`{
  success: false,
  error: "Error message"
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h4 className="font-semibold text-amber-800 mb-3">
                  Common Error Scenarios
                </h4>
                <ul className="space-y-2 text-sm text-amber-900">
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
