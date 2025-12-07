"use client"

import { useState } from "react";
import ReactJson from "react-json-view";
import {
  checkPNRStatus,
  getTrainInfo,
  trackTrain,
  liveAtStation,
  searchTrainBetweenStations,
} from "irctc-connect";

const Playground = () => {
  const [playgroundTab, setPlaygroundTab] = useState<
    "pnr" | "train" | "track" | "station" | "search"
  >("pnr");
  const [pnrInput, setPnrInput] = useState("");
  const [trainInput, setTrainInput] = useState("");
  const [trackTrainInput, setTrackTrainInput] = useState("");
  const [trackDateInput, setTrackDateInput] = useState(""); // dd-mm-yyyy
  const [stationInput, setStationInput] = useState("");
  const [fromStationInput, setFromStationInput] = useState("");
  const [toStationInput, setToStationInput] = useState("");

  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [rawJSON, setRawJSON] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const formatToBrowserDate = (ddmmyyyy: string) => {
    if (!ddmmyyyy || !ddmmyyyy.includes("-")) return "";
    const [dd, mm, yyyy] = ddmmyyyy.split("-");
    return `${yyyy}-${mm}-${dd}`; // yyyy-mm-dd for <input type="date">
  };

  const handlePlaygroundSubmit = async () => {
    setIsLoading(true);
    setPlaygroundResult(null);
    setRawJSON("");
    setStatusCode(null);
    setResponseTime(null);

    const start = performance.now();

    try {
      let result: any;

      switch (playgroundTab) {
        case "pnr":
          if (pnrInput.length !== 10) {
            throw new Error("PNR must be exactly 10 digits");
          }
          result = await checkPNRStatus(pnrInput);
          break;

        case "train":
          if (trainInput.length !== 5) {
            throw new Error("Train number must be 5 digits");
          }
          result = await getTrainInfo(trainInput);
          break;

        case "track":
          if (trackTrainInput.length !== 5) {
            throw new Error("Train number must be 5 digits");
          }
          if (!/^\d{2}-\d{2}-\d{4}$/.test(trackDateInput)) {
            throw new Error("Date must be in dd-mm-yyyy format");
          }
          result = await trackTrain(trackTrainInput, trackDateInput);
          break;

        case "station":
          if (!stationInput) {
            throw new Error("Enter a valid station code");
          }
          result = await liveAtStation(stationInput.toUpperCase());
          break;

        case "search":
          if (!fromStationInput || !toStationInput) {
            throw new Error("Both station codes required");
          }
          result = await searchTrainBetweenStations(
            fromStationInput.toUpperCase(),
            toStationInput.toUpperCase()
          );
          break;
      }

      const end = performance.now();
      setResponseTime(Math.round(end - start));

      // Try to derive a status code:
      let code: number | null = null;
      if (result && typeof result === "object") {
        if (typeof result.statusCode === "number") {
          code = result.statusCode;
        } else if (typeof result.status === "number") {
          code = result.status;
        } else if (typeof result.success === "boolean") {
          // Fallback: map success => 200, failure => 400
          code = result.success ? 200 : 400;
        }
      }
      setStatusCode(code);

      setPlaygroundResult(result);
      setRawJSON(JSON.stringify(result, null, 2));
    } catch (error: any) {
      const end = performance.now();
      setResponseTime(Math.round(end - start));

      const codeFromError =
        error?.status || error?.response?.status || 500;
      setStatusCode(codeFromError);

      const errorObj = {
        success: false,
        message: error?.message || "Something went wrong",
        statusCode: codeFromError,
      };

      setPlaygroundResult(errorObj);
      setRawJSON(JSON.stringify(errorObj, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="playground" className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <span className="text-xl">🎮</span> Live Playground
      </h2>
      <p className="text-slate-600 mb-6">
        Test the API functions with your own data. See live JSON response,
        status code, and response time.
      </p>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
        {/* Tabs */}
        <div className="flex flex-wrap border-b bg-slate-50">
          {[
            { id: "pnr", label: "PNR Status", icon: "🎫" },
            { id: "train", label: "Train Info", icon: "🚂" },
            { id: "track", label: "Live Track", icon: "📍" },
            { id: "station", label: "Station Live", icon: "🚉" },
            { id: "search", label: "Search", icon: "🔍" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setPlaygroundTab(tab.id as any);
                setPlaygroundResult(null);
                setRawJSON("");
                setStatusCode(null);
                setResponseTime(null);
              }}
              className={`px-5 py-4 flex items-center gap-2 text-sm font-medium transition-all ${
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

        {/* Inputs */}
        <div className="p-6 border-b border-slate-200 space-y-4">
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
                placeholder="Enter 10-digit PNR"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={10}
              />
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={5}
              />
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date (dd-mm-yyyy)
                </label>
                <input
                  type="date"
                  value={trackDateInput ? formatToBrowserDate(trackDateInput) : ""}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setTrackDateInput("");
                      return;
                    }
                    const [yyyy, mm, dd] = e.target.value.split("-");
                    setTrackDateInput(`${dd}-${mm}-${yyyy}`); // store as dd-mm-yyyy
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                onChange={(e) => setStationInput(e.target.value.toUpperCase())}
                placeholder="e.g., NDLS"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={6}
              />
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          <button
            onClick={handlePlaygroundSubmit}
            disabled={isLoading}
            className="mt-4 w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <span>▶</span> Run with real API
              </>
            )}
          </button>
        </div>

        {/* Response Viewer */}
        {playgroundResult && (
          <div className="bg-slate-900 max-h-96 overflow-auto p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-slate-200">
                <span className="text-sm font-medium">Response</span>

                {statusCode !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      statusCode >= 200 && statusCode < 300
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
                        : "bg-red-500/10 text-red-300 border-red-500/40"
                    }`}
                  >
                    Status: {statusCode}
                  </span>
                )}

                {responseTime !== null && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-slate-600 bg-slate-800 text-slate-200">
                    Time: {responseTime} ms
                  </span>
                )}
              </div>

              <button
                onClick={() => navigator.clipboard.writeText(rawJSON)}
                className="text-xs text-slate-300 border border-slate-600 px-2 py-1 rounded hover:bg-slate-800"
              >
                Copy JSON
              </button>
            </div>

            <ReactJson
              src={playgroundResult}
              theme="isotope"
              collapsed={1}
              enableClipboard={false}
              displayObjectSize={false}
              displayDataTypes={false}
              style={{ background: "transparent", fontSize: "0.85rem" }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Playground;
