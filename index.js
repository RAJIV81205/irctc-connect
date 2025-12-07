import {
  checkTrain,
  getRoute,
  parseTrainData,
  normalizeDate,
} from "./utils.js";

/// 1. Check PNR Status
async function checkPNRStatus(pnr) {
  // Input validation
  if (!pnr || typeof pnr !== "string") {
    return {
      success: false,
      error: "PNR number is required and must be a string",
    };
  }

  // Clean and validate PNR format (10 digits)
  const cleanPNR = pnr.trim().replace(/\D/g, "");
  if (cleanPNR.length !== 10) {
    return {
      success: false,
      error: "PNR number must be exactly 10 digits",
    };
  }

  try {
    const response = await fetch (`https://bookmytrain.vercel.app/api/pnr/${cleanPNR}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data) {
      return {
        success: false,
        error: data.error || "Failed to fetch PNR status",
      };
    }
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch PNR status",
    };
    
  }
}

/// 2. Get Train Info
async function getTrainInfo(trainNumber) {
  if (
    !trainNumber ||
    typeof trainNumber !== "string" ||
    trainNumber.length !== 5
  ) {
    return {
      success: false,
      error: "Invalid train number. It must be a 5-character string.",
    };
  }

  try {
    const response = await fetch(
      `https://erail.in/rail/getTrains.aspx?TrainNo=${trainNumber}&DataSource=0&Language=0&Cache=true`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.text();
    const trainInfo = await checkTrain(rawData);

    if (!trainInfo.success) {
      return trainInfo;
    }

    let routeData = null;
    if (trainInfo.data.train_id) {
      routeData = await getRoute(trainInfo.data.train_id);
    }

    return {
      success: true,
      data: {
        trainInfo: trainInfo.data,
        route: routeData?.success ? routeData.data : [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch train data",
    };
  }
}

/// 3. Get Train Status
async function trackTrain(trainNumber, date) {
  if (
    !trainNumber ||
    typeof trainNumber !== "string" ||
    trainNumber.length !== 5
  ) {
    return {
      success: false,
      error: "Invalid train number. It must be a 5-character string.",
    };
  }

  const parsedDate = await normalizeDate(date);

  if (!parsedDate.success) {
    return {
      success: false,
      error: parsedDate.error || "Invalid date format ",
    };
  }
  
  try {
    const response = await fetch(
      `https://bookmytrain.vercel.app/api/livestatus?trainNumber=${trainNumber}&trainDate=${parsedDate.formatted}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data) {
      return {
        success: false, 
        error: data.error || "Failed to fetch train status",
      };
    }
    return {
      success: true,
      data: data || {},
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to track train",
    };
  }
}

/// 4. Get Current list of upcoming trains at a station
async function liveAtStation(stnCode) {
  if (!stnCode || typeof stnCode !== "string") {
    return {
      success: false,
      error: "Station code is required and must be a string",
    };
  }

  try {
    const response = await fetch("https://easy-rail.onrender.com/at-station", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stnCode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data) {
      return {
        success: false,
        error: "Failed to fetch data ",
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error(error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch data",
    };
  }
}

/// 5. Search train between stations
async function searchTrainBetweenStations(fromStnCode, toStnCode) {
  if (
    !fromStnCode ||
    typeof fromStnCode !== "string" ||
    !toStnCode ||
    typeof toStnCode !== "string"
  ) {
    return {
      success: false,
      error: "Both from and to station codes are required and must be strings",
    };
  }

  try {
    const response = await fetch(
      `https://erail.in/rail/getTrains.aspx?Station_From=${fromStnCode}&Station_To=${toStnCode}&DataSource=0&Language=0&Cache=true`
    );

    if (!response.ok) {
      throw new Error("HTTP Error! status:" + response.status);
    }

    const result = await response.text();
    const trainData = await parseTrainData(result);

    return {
      success: trainData.success,
      data: trainData.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to fetch train data",
    };
  }
}

export {
  checkPNRStatus,
  getTrainInfo,
  trackTrain,
  liveAtStation,
  searchTrainBetweenStations,
};
