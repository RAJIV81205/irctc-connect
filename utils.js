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