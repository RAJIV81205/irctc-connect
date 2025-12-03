export async function checkTrain(rawString) {
    try {
        const sections = rawString.split("~~~~~~~~");

        const errorMessages = [
            "~~~~~Please try again after some time.",
            "~~~~~Train not found"
        ];

        if (errorMessages.includes(sections[0])) {
            return {
                success: false,
                data: sections[0].replaceAll("~", "")
            };
        }

        let trainData = sections[0].split("~").filter(el => el !== "");
        if (trainData[1].length > 6) trainData.shift();

        const routeData = sections[1].split("~").filter(el => el !== "");

        const trainInfo = {
            train_no: trainData[1].replace("^", ""),
            train_name: trainData[2],
            from_stn_name: trainData[3],
            from_stn_code: trainData[4],
            to_stn_name: trainData[5],
            to_stn_code: trainData[6],
            from_time: trainData[11].replace(".", ":"),
            to_time: trainData[12].replace(".", ":"),
            travel_time: trainData[13].replace(".", ":") + " hrs",
            running_days: trainData[14],
            type: routeData[11],
            train_id: routeData[12]
        };

        return {
            success: true,
            data: trainInfo
        };
    } catch (err) {
        return {
            success: false,
            error: "Failed to parse train data"
        };
    }
}

export function parseTrainRoute(rawString, options = {}) {
  const enforceIndiaBounds = options.enforceIndia !== false; // default true

  const INDIA = {
    latMin: 6.0,
    latMax: 38.0,
    lonMin: 66.0,
    lonMax: 98.0
  };

  function looksLikeLatLonPairStr(s1, s2, enforceIndia) {
    if (!s1 || !s2) return false;
    const n1 = parseFloat(s1);
    const n2 = parseFloat(s2);
    if (isNaN(n1) || isNaN(n2)) return false;
    if (Math.abs(n1) > 90 || Math.abs(n2) > 180) return false;

    if (enforceIndia) {
      if (n1 < INDIA.latMin || n1 > INDIA.latMax) return false;
      if (n2 < INDIA.lonMin || n2 > INDIA.lonMax) return false;
    }

    // require at least one value to look like a decimal coordinate (avoid integer elevations)
    const hasDecimal = (String(s1).includes('.') || String(s2).includes('.')
                        || (n1 % 1 !== 0) || (n2 % 1 !== 0));
    return hasDecimal;
  }

  function normalizeTime(t) {
    if (!t) return "";
    if (t === "First" || t === "first") return "--";
    if (t === "Last"  || t === "last")  return "--";
    return t.replace(".", ":");
  }

  try {
    // station chunks start after the first '^' in your raw string -> slice(1)
    const chunks = String(rawString).split("^").slice(1).filter(Boolean);

    const parsed = chunks.map((chunk) => {
      const details = chunk.split("~"); // keep empties so indices align with original format

      const stnCode = (details[1] || "").trim();
      const stnName = (details[2] || "").trim();
      const arrivalRaw = (details[3] || "").trim();
      const departureRaw = (details[4] || "").trim();

      const haltRaw = (details[5] || "").trim();
      const haltMinutes = haltRaw === "" ? 0 : (isNaN(Number(haltRaw)) ? 0 : Number(haltRaw));
      const halt = `${haltMinutes} min`;

      const distance = (details[6] || "").trim();
      const day = (details[7] || "").trim();
      const platform = !isNaN(Number(details[8])) && details[8] !== "" ? Number(details[8]) : (details[8] || "");

      // ---- 1) Try strict India-based search from right -> left ----
      let lat = null, lon = null;
      for (let i = details.length - 2; i >= 0; i--) {
        if (looksLikeLatLonPairStr(details[i], details[i + 1], enforceIndiaBounds)) {
          lat = parseFloat(details[i]);
          lon = parseFloat(details[i + 1]);
          break;
        }
      }

      // ---- 2) Fallback: if none found and we enforced India, try global lat/lon (still prefer decimals) ----
      if (lat === null && enforceIndiaBounds) {
        for (let i = details.length - 2; i >= 0; i--) {
          const s1 = (details[i] || "").trim();
          const s2 = (details[i + 1] || "").trim();
          const n1 = parseFloat(s1);
          const n2 = parseFloat(s2);
          if (!isNaN(n1) && !isNaN(n2) && Math.abs(n1) <= 90 && Math.abs(n2) <= 180) {
            // require decimals or fractional part
            if (s1.includes('.') || s2.includes('.') || (n1 % 1 !== 0) || (n2 % 1 !== 0)) {
              lat = n1; lon = n2; break;
            }
          }
        }
      }

      // ---- 3) Final fallback: last numeric pair within the last 8 fields ----
      if (lat === null) {
        const start = Math.max(0, details.length - 8);
        for (let i = details.length - 2; i >= start; i--) {
          const n1 = parseFloat(details[i]);
          const n2 = parseFloat(details[i + 1]);
          if (!isNaN(n1) && !isNaN(n2)) {
            lat = n1; lon = n2; break;
          }
        }
      }

      const coordinates = (lat !== null && lon !== null) ? { latitude: lat, longitude: lon } : null;

      return {
        stnCode,
        stnName,
        arrival: normalizeTime(arrivalRaw),
        departure: normalizeTime(departureRaw),
        halt,                 // "5 min"
        haltMinutes,          // 5 (number)
        distance,
        day,
        platform,
        coordinates
      };
    });

    return { success: true, data: parsed };
  } catch (err) {
    return { success: false, error: err?.message || "parsing failed" };
  }
}



export async function getRoute(train_id) {
    try {
        const response = await fetch(`https://erail.in/data.aspx?Action=TRAINROUTE&Password=2012&Data1=${train_id}&Data2=0&Cache=true`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.text();
        return parseTrainRoute(rawData);
    } catch (error) {
        return {
            success: false,
            error: "Failed to fetch route data"
        };
    }
}

export async function parseTrainData(data) {
    try {
        const arr = [];
        const rawData = data.split("~~~~~~~~").filter((el) => el.trim() !== ""); // Filter valid data

        // Check for error messages
        if (rawData[0].includes("No direct trains found")) {
            return {
                success: false,
                time_stamp: Date.now(),
                data: "No direct trains found between the selected stations.",
            };
        }

        if (
            rawData[0].includes("Please try again after some time.") ||
            rawData[0].includes("From station not found") ||
            rawData[0].includes("To station not found")
        ) {
            return {
                success: false,
                time_stamp: Date.now(),
                data: rawData[0].replace(/~/g, ""),
            };
        }

        // Parse each train's details
        for (let i = 0; i < rawData.length; i++) {
            const trainData = rawData[i].split("~^");
            const nextData = rawData[i + 1] || ""; // Ensure next data exists or use an empty string
            const trainData2 = nextData.split("~^");

            if (trainData.length === 2) {
                const details = trainData[1].split("~").filter((el) => el.trim() !== "");
                const details2 = trainData2[0]
                    ? trainData2[0].split("~").filter((el) => el.trim() !== "")
                    : []; // Handle empty trainData2 safely

                if (details.length >= 14) {
                    arr.push({
                        train_no: details[0],
                        train_name: details[1],
                        source_stn_name: details[2],
                        source_stn_code: details[3],
                        dstn_stn_name: details[4],
                        dstn_stn_code: details[5],
                        from_stn_name: details[6],
                        from_stn_code: details[7],
                        to_stn_name: details[8],
                        to_stn_code: details[9],
                        from_time: details[10].replace(".", ":"),
                        to_time: details[11].replace(".", ":"),
                        travel_time: details[12].replace(".", ":") + " hrs",
                        running_days: details[13],
                        distance: details2[18] || "N/A", // Use "N/A" if distance is unavailable
                        halts: details2[7] - details2[4] - 1
                    });
                }
            }
        }
        arr.sort((a, b) => {
            const timeA = a.from_time.split(":").map(Number);
            const timeB = b.from_time.split(":").map(Number);
            const minutesA = timeA[0] * 60 + timeA[1];
            const minutesB = timeB[0] * 60 + timeB[1];
            return minutesA - minutesB;
        });

        return {
            success: true,
            time_stamp: Date.now(),
            data: arr,
        };
    } catch (err) {
        console.error("Parsing error:", err);
        return {
            success: false,
            time_stamp: Date.now(),
            data: "An error occurred while processing train data.",
        };
    }
}

export async function normalizeDate(date) {
    // Split by "-" and clean spacing
    let parts = date.split("-").map(p => p.trim());

    if (parts.length !== 3) {
        return { success: false, error: "Invalid date format." };
    }

    let [day, month, year] = parts;

    // Pad day if single digit
    if (day.length === 1) day = "0" + day;

    // Pad month if single digit
    if (month.length === 1) month = "0" + month;

    // Convert year from 2-digit → 4-digit
    if (year.length === 2) year = "20" + year;

    // Validate after formatting: dd-mm-yyyy
    const validRegex = /^\d{2}-\d{2}-\d{4}$/;
    const finalRaw = `${day}-${month}-${year}`;

    if (!validRegex.test(finalRaw)) {
        return { success: false, error: "Date still invalid after normalization." };
    }

    // Convert MM → Jan/Feb/... format
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(month, 10) - 1;

    if (monthIndex < 0 || monthIndex > 11) {
        return { success: false, error: "Invalid month." };
    }

    const formatted = `${day}-${months[monthIndex]}-${year}`;

    return {
        success: true,
        formatted
    };
}

