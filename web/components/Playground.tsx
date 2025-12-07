import { useState } from "react";

const Playground = () => {
  // Playground state
  const [playgroundTab, setPlaygroundTab] = useState<
    "pnr" | "train" | "track" | "station" | "search"
  >("pnr");
  const [pnrInput, setPnrInput] = useState("");
  const [trainInput, setTrainInput] = useState("");
  const [trackTrainInput, setTrackTrainInput] = useState("");
  const [trackDateInput, setTrackDateInput] = useState("");
  const [stationInput, setStationInput] = useState("");
  const [fromStationInput, setFromStationInput] = useState("");
  const [toStationInput, setToStationInput] = useState("");
  const [playgroundResult, setPlaygroundResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePlaygroundSubmit = async () => {
    setIsLoading(true);
    setPlaygroundResult("");
    
    // Simulate API call
    setTimeout(() => {
      setPlaygroundResult("// Example code will be generated here");
      setIsLoading(false);
    }, 800);
  };

  return (
      <section id="playground" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <span className="text-xl">🎮</span> Live Playground
        </h2>
        <p className="text-slate-600 mb-6">
          Test the API functions with your own data. Enter values below and see
          the expected code and response.
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          {/* Playground Tabs */}
          <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
            {[
              { id: "pnr" as const, label: "PNR Status", icon: "🎫" },
              { id: "train" as const, label: "Train Info", icon: "🚂" },
              { id: "track" as const, label: "Live Track", icon: "📍" },
              {
                id: "station" as const,
                label: "Station Live",
                icon: "🚉",
              },
              { id: "search" as const, label: "Search", icon: "🔍" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setPlaygroundTab(tab.id);
                  setPlaygroundResult("");
                }}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all ${
                  playgroundTab === tab.id
                    ? "bg-white text-blue-600 border-b-2 border-blue-600 -mb-px"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Input Section */}
          <div className="p-6 border-b border-slate-200">
            {playgroundTab === "pnr" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PNR Number (10 digits)
                </label>
                <input
                  type="text"
                  value={pnrInput}
                  onChange={(e) =>
                    setPnrInput(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="Enter 10-digit PNR number"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  maxLength={10}
                />
                <p className="mt-2 text-xs text-slate-500">
                  Example: 1234567890
                </p>
              </div>
            )}

            {playgroundTab === "train" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Train Number (5 digits)
                </label>
                <input
                  type="text"
                  value={trainInput}
                  onChange={(e) =>
                    setTrainInput(e.target.value.replace(/\D/g, "").slice(0, 5))
                  }
                  placeholder="Enter 5-digit train number"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  maxLength={5}
                />
                <p className="mt-2 text-xs text-slate-500">Example: 12345</p>
              </div>
            )}

            {playgroundTab === "track" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Train Number (5 digits)
                  </label>
                  <input
                    type="text"
                    value={trackTrainInput}
                    onChange={(e) =>
                      setTrackTrainInput(
                        e.target.value.replace(/\D/g, "").slice(0, 5)
                      )
                    }
                    placeholder="Enter train number"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date (dd-mm-yyyy)
                  </label>
                  <input
                    type="text"
                    value={trackDateInput}
                    onChange={(e) => setTrackDateInput(e.target.value)}
                    placeholder="06-12-2025"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    maxLength={10}
                  />
                </div>
              </div>
            )}

            {playgroundTab === "station" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Station Code
                </label>
                <input
                  type="text"
                  value={stationInput}
                  onChange={(e) =>
                    setStationInput(e.target.value.toUpperCase())
                  }
                  placeholder="Enter station code"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  maxLength={6}
                />
                <p className="mt-2 text-xs text-slate-500">
                  Examples: NDLS, BCT, HWH, CSTM
                </p>
              </div>
            )}

            {playgroundTab === "search" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    From Station Code
                  </label>
                  <input
                    type="text"
                    value={fromStationInput}
                    onChange={(e) =>
                      setFromStationInput(e.target.value.toUpperCase())
                    }
                    placeholder="e.g., NDLS"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    To Station Code
                  </label>
                  <input
                    type="text"
                    value={toStationInput}
                    onChange={(e) =>
                      setToStationInput(e.target.value.toUpperCase())
                    }
                    placeholder="e.g., BCT"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handlePlaygroundSubmit}
              disabled={isLoading}
              className="mt-6 w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <span>▶</span> Generate Code
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          {playgroundResult && (
            <div className="bg-slate-900">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <span className="text-sm text-slate-400">Output</span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(playgroundResult)
                  }
                  className="text-slate-400 hover:text-white text-xs px-3 py-1 rounded hover:bg-slate-800 transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="p-6 text-sm overflow-x-auto text-slate-300 max-h-96">
                {playgroundResult}
              </pre>
            </div>
          )}
        </div>
      </section>
    );
};

export default Playground;
