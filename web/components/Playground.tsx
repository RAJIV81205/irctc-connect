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
  const [trackDateInput, setTrackDateInput] = useState(""); // stored as dd-mm-yyyy
  const [stationInput, setStationInput] = useState("");
  const [fromStationInput, setFromStationInput] = useState("");
  const [toStationInput, setToStationInput] = useState("");

  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [rawJSON, setRawJSON] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const formatToBrowserDate = (ddmmyyyy: string) => {
    if (!ddmmyyyy.includes("-")) return "";
    const [dd, mm, yyyy] = ddmmyyyy.split("-");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handlePlaygroundSubmit = async () => {
    setIsLoading(true);
    setPlaygroundResult(null);

    try {
      let result;

      switch (playgroundTab) {
        case "pnr":
          if (pnrInput.length !== 10)
            throw new Error("PNR must be exactly 10 digits");
          result = await checkPNRStatus(pnrInput);
          break;

        case "train":
          if (trainInput.length !== 5)
            throw new Error("Train number must be 5 digits");
          result = await getTrainInfo(trainInput);
          break;

        case "track":
          if (trackTrainInput.length !== 5)
            throw new Error("Train number must be 5 digits");
          if (!/^\d{2}-\d{2}-\d{4}$/.test(trackDateInput))
            throw new Error("Date must be in dd-mm-yyyy format");
          result = await trackTrain(trackTrainInput, trackDateInput);
          break;

        case "station":
          if (!stationInput) throw new Error("Enter a valid station code");
          result = await liveAtStation(stationInput.toUpperCase());
          break;

        case "search":
          if (!fromStationInput || !toStationInput)
            throw new Error("Both station codes required");
          result = await searchTrainBetweenStations(
            fromStationInput.toUpperCase(),
            toStationInput.toUpperCase()
          );
          break;
      }

      setPlaygroundResult(result);
      setRawJSON(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setPlaygroundResult({ error: error.message });
      setRawJSON(JSON.stringify({ error: error.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="playground" className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <span className="text-xl">🎮</span> Live Playground
      </h2>

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
              onClick={() => setPlaygroundTab(tab.id as any)}
              className={`px-5 py-4 flex items-center gap-2 text-sm font-medium ${
                playgroundTab === tab.id
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="p-6">
          {playgroundTab === "pnr" && (
            <input
              type="text"
              value={pnrInput}
              onChange={(e) =>
                setPnrInput(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="Enter 10-digit PNR"
              className="w-full px-4 py-3 border rounded-lg text-black"
            />
          )}

          {playgroundTab === "train" && (
            <input
              type="text"
              value={trainInput}
              onChange={(e) =>
                setTrainInput(e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              placeholder="Train Number (5 digits)"
              className="w-full px-4 py-3 border rounded-lg text-black"
            />
          )}

          {playgroundTab === "track" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={trackTrainInput}
                onChange={(e) =>
                  setTrackTrainInput(
                    e.target.value.replace(/\D/g, "").slice(0, 5)
                  )
                }
                placeholder="Train Number"
                className="px-4 py-3 border rounded-lg text-black"
              />

              <input
                type="date"
                value={trackDateInput ? formatToBrowserDate(trackDateInput) : ""}
                onChange={(e) => {
                  const [yyyy, mm, dd] = e.target.value.split("-");
                  setTrackDateInput(`${dd}-${mm}-${yyyy}`);
                }}
                className="px-4 py-3 border rounded-lg text-black"
              />
            </div>
          )}

          {playgroundTab === "station" && (
            <input
              type="text"
              value={stationInput}
              onChange={(e) => setStationInput(e.target.value.toUpperCase())}
              placeholder="NDLS / BCT / CSTM"
              className="w-full px-4 py-3 border rounded-lg text-black"
            />
          )}

          {playgroundTab === "search" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={fromStationInput}
                onChange={(e) =>
                  setFromStationInput(e.target.value.toUpperCase())
                }
                placeholder="FROM"
                className="px-4 py-3 border rounded-lg text-black"
              />
              <input
                type="text"
                value={toStationInput}
                onChange={(e) => setToStationInput(e.target.value.toUpperCase())}
                placeholder="TO"
                className="px-4 py-3 border rounded-lg text-black"
              />
            </div>
          )}

          <button
            onClick={handlePlaygroundSubmit}
            disabled={isLoading}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isLoading ? "Processing..." : "Run API"}
          </button>
        </div>

        {/* Response Viewer */}
        {playgroundResult && (
          <div className="bg-slate-900 h-96 overflow-auto p-4">
            <div className="flex justify-between text-slate-300 mb-2">
              <span>Response</span>
              <button
                onClick={() => navigator.clipboard.writeText(rawJSON)}
                className="text-xs border px-2 py-1 rounded"
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
              style={{ background: "transparent" }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Playground;
