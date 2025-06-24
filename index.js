async function checkPNRStatus(pnr) {
    // Input validation
    if (!pnr || typeof pnr !== 'string') {
        return {
            success: false,
            error: 'PNR number is required and must be a string'
        };
    }

    // Clean and validate PNR format (10 digits)
    const cleanPNR = pnr.trim().replace(/\D/g, '');
    if (cleanPNR.length !== 10) {
        return {
            success: false,
            error: 'PNR number must be exactly 10 digits'
        };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch('https://www.redbus.in/rails/api/getPnrToolKitData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Origin': 'https://www.redbus.in',
                'Referer': 'https://www.redbus.in/pnr-status'
            },
            body: JSON.stringify({ pnr: cleanPNR }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return {
                success: false,
                error: `API request failed with status: ${response.status}`
            };
        }

        const data = await response.json();

        if (!data || !data.pnrNo) {
            return {
                success: false,
                error: 'No PNR data found or invalid PNR number'
            };
        }

        // Return structured data
        return {
            success: true,
            data: {
                pnr: data.pnrNo,
                status: data.overallStatus,
                train: {
                    number: data.trainNumber,
                    name: data.trainName,
                    class: data.journeyClassName
                },
                journey: {
                    from: {
                        name: data.srcName,
                        code: data.srcCode,
                        platform: data.srcPfNo
                    },
                    to: {
                        name: data.dstName,
                        code: data.dstCode,
                        platform: data.dstPfNo
                    },
                    departure: data.departureTime,
                    arrival: data.arrivalTime,
                    duration: data.duration ? `${Math.floor(data.duration / 60)}h ${data.duration % 60}m` : null
                },
                chart: {
                    status: data.chartStatus,
                    message: data.chartPrepMsg
                },
                passengers: data.passengers ? data.passengers.map(p => ({
                    name: p.name,
                    status: p.currentStatus,
                    seat: p.currentSeatDetails,
                    berthType: p.berthType,
                    confirmationProbability: p.confirmProb
                })) : [],
                lastUpdated: data.pnrLastUpdated
            }
        };

    } catch (error) {
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request timed out after 10 seconds'
            };
        }

        return {
            success: false,
            error: `Request failed: ${error.message}`
        };
    }
}

function checkTrain(rawString) {
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

function parseTrainRoute(string) {
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

async function getRoute(train_id) {
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

async function getTrainInfo(trainNumber) {
    if (!trainNumber || typeof trainNumber !== 'string' || trainNumber.length !== 5) {
        return {
            success: false,
            error: 'Invalid train number. It must be a 5-character string.'
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
        const trainInfo = checkTrain(rawData);

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
                route: routeData?.success ? routeData.data : []
            }
        };

    } catch (error) {
        return {
            success: false,
            error: 'Failed to fetch train data'
        };
    }
}

console.log(await getTrainInfo("12237"))



export {
    checkPNRStatus,
    getTrainInfo,
}
