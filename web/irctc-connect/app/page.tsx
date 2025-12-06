'use client';
import { useState } from 'react';

const IRCTCConnectDocs = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', label: 'Introduction', icon: '🏠' },
    { id: 'features', label: 'Features', icon: '✨' },
    { id: 'installation', label: 'Installation', icon: '📦' },
    { id: 'quickstart', label: 'Quick Start', icon: '🚀' },
    { id: 'pnr', label: 'PNR Status', icon: '🎫' },
    { id: 'train', label: 'Train Info', icon: '🚂' },
    { id: 'tracking', label: 'Live Tracking', icon: '📍' },
    { id: 'station', label: 'Station Live', icon: '🚉' },
    { id: 'status', label: 'Status Codes', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚂</span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">IRCTC Connect</h1>
              <p className="text-xs text-slate-500">Node.js SDK for Indian Railways</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/RAJIV81205/irctc-connect" 
              className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://www.npmjs.com/package/irctc-connect" 
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              npm
            </a>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Left Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 overflow-y-auto">
          <nav className="p-4 space-y-1">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Documentation
            </div>
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                type="button"
              >
                <span className="text-lg">{section.icon}</span>
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8 max-w-4xl">
          {/* Introduction */}
          {activeSection === 'introduction' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">IRCTC Connect</h1>
                <p className="text-xl text-slate-600">
                  Comprehensive Node.js SDK for Indian Railways with real-time PNR status, 
                  live train tracking, station updates, and complete route information.
                </p>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-xl font-mono text-sm">
                npm install irctc-connect
              </div>

              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">251</div>
                  <div className="text-sm text-slate-600">Downloads/month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">MIT</div>
                  <div className="text-sm text-slate-600">License</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">14+</div>
                  <div className="text-sm text-slate-600">Node.js</div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                <p className="text-blue-900">
                  <strong>Quick Tip:</strong> All API methods return a standardized response with 
                  <code className="bg-blue-100 px-2 py-1 rounded mx-1">success</code> and either 
                  <code className="bg-blue-100 px-2 py-1 rounded mx-1">data</code> or 
                  <code className="bg-blue-100 px-2 py-1 rounded mx-1">error</code> fields.
                </p>
              </div>
            </div>
          )}

          {/* Features */}
          {activeSection === 'features' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Core Features</h1>
                <p className="text-lg text-slate-600">
                  Everything you need to integrate Indian Railways data into your application.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: '🎫', title: 'PNR Status', desc: 'Real-time PNR status with passenger details and confirmation status' },
                  { icon: '🚂', title: 'Train Information', desc: 'Complete train details with route, schedule, and station coordinates' },
                  { icon: '📍', title: 'Live Tracking', desc: 'Real-time train location, delays, and station-wise status updates' },
                  { icon: '🚉', title: 'Station Live', desc: 'Upcoming trains at any station with expected arrival times' },
                  { icon: '🔍', title: 'Train Search', desc: 'Find trains between stations with classes and availability info' },
                  { icon: '⚡', title: 'Fast & Reliable', desc: 'Built-in validation, timeout handling, and error management' }
                ].map((feature, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{feature.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                        <p className="text-slate-600">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Installation */}
          {activeSection === 'installation' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Installation</h1>
                <p className="text-lg text-slate-600">
                  Get started with IRCTC Connect in seconds.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Using npm</h2>
                <div className="bg-slate-900 text-white p-4 rounded-lg font-mono text-sm">
                  npm install irctc-connect
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Using yarn</h2>
                <div className="bg-slate-900 text-white p-4 rounded-lg font-mono text-sm">
                  yarn add irctc-connect
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Requirements</h2>
                <ul className="space-y-2 text-slate-600">
                  <li>• Node.js 14 or higher</li>
                  <li>• Active internet connection</li>
                  <li>• Valid PNR numbers or train numbers for testing</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Supported Platforms</h2>
                <ul className="space-y-2 text-slate-600">
                  <li>• Node.js applications</li>
                  <li>• Express.js servers</li>
                  <li>• Next.js (App Router & Pages Router)</li>
                  <li>• React Native</li>
                </ul>
              </div>
            </div>
          )}

          {/* Quick Start */}
          {activeSection === 'quickstart' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Quick Start</h1>
                <p className="text-lg text-slate-600">
                  Start using IRCTC Connect in your project with these simple examples.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Usage</h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div className="text-slate-600">{`// Import the functions you need`}</div>
                  <div>{`import { checkPNRStatus, getTrainInfo } from 'irctc-connect';`}</div>
                  <div className="h-2"></div>
                  <div className="text-slate-600">{`// Check PNR status`}</div>
                  <div>{`const pnrResult = await checkPNRStatus('1234567890');`}</div>
                  <div className="h-2"></div>
                  <div className="text-slate-600">{`// Always check success first`}</div>
                  <div>{`if (pnrResult.success) {`}</div>
                  <div className="pl-4">{`  console.log(pnrResult.data);`}</div>
                  <div>{`} else {`}</div>
                  <div className="pl-4">{`  console.error(pnrResult.error);`}</div>
                  <div>{`}`}</div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                <p className="text-blue-900 font-semibold mb-2">Important</p>
                <p className="text-blue-800">
                  Always check the <code className="bg-blue-100 px-2 py-1 rounded">success</code> field 
                  before accessing the data to handle errors gracefully.
                </p>
              </div>
            </div>
          )}

          {/* PNR Status */}
          {activeSection === 'pnr' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">PNR Status</h1>
                <p className="text-lg text-slate-600">
                  Check real-time PNR status with passenger details and booking information.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Function Signature</h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                  {`checkPNRStatus(pnr: string): Promise<Result>`}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Example</h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>{`import { checkPNRStatus } from 'irctc-connect';`}</div>
                  <div className="h-2"></div>
                  <div>{`const result = await checkPNRStatus('1234567890');`}</div>
                  <div className="h-2"></div>
                  <div>{`if (result.success) {`}</div>
                  <div className="pl-4">{`  console.log('Status:', result.data.status);`}</div>
                  <div className="pl-4">{`  console.log('Train:', result.data.trainName);`}</div>
                  <div className="pl-4">{`  console.log('Passengers:', result.data.passengers);`}</div>
                  <div>{`}`}</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Response Fields</h2>
                <div className="space-y-3">
                  <div>
                    <code className="bg-slate-100 px-2 py-1 rounded text-sm">status</code>
                    <span className="text-slate-600 ml-2">- Booking status (CNF, WL, RAC, etc.)</span>
                  </div>
                  <div>
                    <code className="bg-slate-100 px-2 py-1 rounded text-sm">trainName</code>
                    <span className="text-slate-600 ml-2">- Name of the train</span>
                  </div>
                  <div>
                    <code className="bg-slate-100 px-2 py-1 rounded text-sm">trainNo</code>
                    <span className="text-slate-600 ml-2">- Train number</span>
                  </div>
                  <div>
                    <code className="bg-slate-100 px-2 py-1 rounded text-sm">passengers</code>
                    <span className="text-slate-600 ml-2">- Array of passenger details</span>
                  </div>
                  <div>
                    <code className="bg-slate-100 px-2 py-1 rounded text-sm">boardingPoint</code>
                    <span className="text-slate-600 ml-2">- Boarding station</span>
                  </div>
                  <div>
                    <code className="bg-slate-100 px-2 py-1 rounded text-sm">destination</code>
                    <span className="text-slate-600 ml-2">- Destination station</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Train Info */}
          {activeSection === 'train' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Train Information</h1>
                <p className="text-lg text-slate-600">
                  Get complete train details including route, schedule, and station coordinates.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Function Signature</h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                  {`getTrainInfo(trainNo: string): Promise<Result>`}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Example</h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>{`import { getTrainInfo } from 'irctc-connect';`}</div>
                  <div className="h-2"></div>
                  <div>{`const result = await getTrainInfo('12345');`}</div>
                  <div className="h-2"></div>
                  <div>{`if (result.success) {`}</div>
                  <div className="pl-4">{`  console.log('Train:', result.data.trainName);`}</div>
                  <div className="pl-4">{`  console.log('Route:', result.data.route);`}</div>
                  <div className="pl-4">{`  console.log('Classes:', result.data.classes);`}</div>
                  <div>{`}`}</div>
                </div>
              </div>
            </div>
          )}

          {/* Live Tracking */}
          {activeSection === 'tracking' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Live Train Tracking</h1>
                <p className="text-lg text-slate-600">
                  Track trains in real-time with current location, delays, and station updates.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Function Signature</h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                  {`trackTrain(trainNo: string, date: string): Promise<Result>`}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Example</h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>{`import { trackTrain } from 'irctc-connect';`}</div>
                  <div className="h-2"></div>
                  <div className="text-slate-600">{`// Date format: DD-MM-YYYY`}</div>
                  <div>{`const result = await trackTrain('12345', '06-12-2025');`}</div>
                  <div className="h-2"></div>
                  <div>{`if (result.success) {`}</div>
                  <div className="pl-4">{`  console.log('Status:', result.data.statusNote);`}</div>
                  <div className="pl-4">{`  console.log('Current Station:', result.data.currentStation);`}</div>
                  <div className="pl-4">{`  console.log('Delay:', result.data.delay);`}</div>
                  <div>{`}`}</div>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-r-lg">
                <p className="text-amber-900 font-semibold mb-2">Date Format</p>
                <p className="text-amber-800">
                  The date parameter must be in <code className="bg-amber-100 px-2 py-1 rounded">DD-MM-YYYY</code> format.
                </p>
              </div>
            </div>
          )}

          {/* Station Live */}
          {activeSection === 'station' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Station Live</h1>
                <p className="text-lg text-slate-600">
                  Get upcoming trains at any station with expected arrival times.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Function Signature</h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                  {`liveAtStation(stationCode: string): Promise<Result>`}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Example</h2>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>{`import { liveAtStation } from 'irctc-connect';`}</div>
                  <div className="h-2"></div>
                  <div className="text-slate-600">{`// Use station code (e.g., NDLS for New Delhi)`}</div>
                  <div>{`const result = await liveAtStation('NDLS');`}</div>
                  <div className="h-2"></div>
                  <div>{`if (result.success) {`}</div>
                  <div className="pl-4">{`  result.data.trains.forEach(train => {`}</div>
                  <div className="pl-8">{`    console.log(train.trainName, train.expectedTime);`}</div>
                  <div className="pl-4">{`  });`}</div>
                  <div>{`}`}</div>
                </div>
              </div>
            </div>
          )}

          {/* Status Codes */}
          {activeSection === 'status' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Status Codes</h1>
                <p className="text-lg text-slate-600">
                  Understanding PNR status codes and response formats.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Code</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { code: 'CNF', desc: 'Confirmed - Seat/Berth allocated' },
                      { code: 'WL', desc: 'Waiting List - Not confirmed' },
                      { code: 'RAC', desc: 'Reservation Against Cancellation' },
                      { code: 'CAN', desc: 'Cancelled' },
                      { code: 'PQWL', desc: 'Pooled Quota Waiting List' },
                      { code: 'TQWL', desc: 'Tatkal Quota Waiting List' },
                      { code: 'RLWL', desc: 'Remote Location Waiting List' },
                      { code: 'GNWL', desc: 'General Waiting List' }
                    ].map((status, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <code className="bg-blue-50 text-blue-600 px-3 py-1 rounded font-mono font-bold">
                            {status.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{status.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">✅ Success Response</h2>
                  <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-1">
                    <div>{`{`}</div>
                    <div className="pl-4">{`  success: true,`}</div>
                    <div className="pl-4">{`  data: {`}</div>
                    <div className="pl-8">{`    // Response data`}</div>
                    <div className="pl-4">{`  }`}</div>
                    <div>{`}`}</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">❌ Error Response</h2>
                  <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-1">
                    <div>{`{`}</div>
                    <div className="pl-4">{`  success: false,`}</div>
                    <div className="pl-4">{`  error: "Error message"`}</div>
                    <div>{`}`}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default IRCTCConnectDocs;
