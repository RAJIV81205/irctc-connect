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

export function parseTrainRoute(string) {
    try {
        let data = string.split("~^");

        let arr = data.map((item) => {
            let details = item.split("~").filter((el) => el !== "");
            return {
                stnName: details[2],
                stnCode: details[1],
                arrival: details[3].replace(".", ":"),
                departure: details[4].replace(".", ":"),
                halt: details[5] ? details[5] + " min" : "0 min",
                distance: details[6],
                day: details[7],
                platform: !isNaN(Number(details[8])) ? details[8] : '',
                coordinates:
                    !isNaN(parseFloat(details[12])) && !isNaN(parseFloat(details[13]))
                        ? {
                            latitude: parseFloat(details[12]),
                            longitude: parseFloat(details[13])
                        }
                        : null
            };
        });

        return {
            success: true,
            data: arr,
        };
    } catch (err) {
        return {
            success: false,
            error: "Failed to parse route data",
        };
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
