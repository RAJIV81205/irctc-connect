import { checkTrain  , getRoute , parseTrainData } from "./utils.js";


/// 1. Check PNR Status
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







/// 2. Get Train Info
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







/// 3. Get Train Status
async function trackTrain(trainNumber, date) {
    if (!trainNumber || typeof trainNumber !== 'string' || trainNumber.length !== 5) {
        return {
            success: false,
            error: 'Invalid train number. It must be a 5-character string.'
        };
    }

    // Validate date format: dd-mm-yyyy using RegExp
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!date || !dateRegex.test(date)) {
        return {
            success: false,
            error: 'Invalid date format. Please use dd-mm-yyyy format.'
        };
    }

    // Parse the date
    const [day, month, year] = date.split('-').map(Number);
    const parsedDate = new Date(`${year}-${month}-${day}`);

    // Check if the constructed date is valid
    if (isNaN(parsedDate.getTime()) || parsedDate.getDate() !== day || parsedDate.getMonth() + 1 !== month || parsedDate.getFullYear() !== year) {
        return {
            success: false,
            error: 'Invalid date. Please check the day, month, and year values.'
        };
    }

    try {
        const response = await fetch(`https://easy-rail.onrender.com/fetch-train-status` , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                trainNumber: trainNumber,
                dates: date
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data ) {
            return {
                success: false,
                error: data.error || 'Failed to fetch train status'
            };
        }
        return {
            success: true,
            data: data || {}
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to track train'
        };
        
    }

    
}






/// 4. Get Current list of upcoming trains at a station 
async function liveAtStation(stnCode){
    if (!stnCode || typeof stnCode !== 'string'){

        return{
            success:false,
            error:'Station code is required and must be a string'
        }
    }


    try {
        const response = await fetch("https://easy-rail.onrender.com/at-station",{
            method:'POST',
            headers:{
                'Content-Type':"application/json"
            },
            body:JSON.stringify({stnCode})
        })

        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if(!data){
            return{
                success:false,
                error :'Failed to fetch data '
            }
        }


        return{
            success:true,
            data: data 
        }



    } catch (error) {
        console.error(error.message)
        return { 
            success:false ,
            error : error.message || 'Failed to fetch data'
        }
    }
}





/// 5. Search train between stations 
async function searchTrainBetweenStations(fromStnCode , toStnCode){
    if (!fromStnCode || typeof fromStnCode !== 'string' || !toStnCode || typeof toStnCode !== 'string'){
        return{
            success:false,
            error:'Both from and to station codes are required and must be strings'
        }
    }

    try {
        const response = await fetch(`https://erail.in/rail/getTrains.aspx?Station_From=${fromStnCode}&Station_To=${toStnCode}&DataSource=0&Language=0&Cache=true`)

        if (!response.ok){
            throw new Error('HTTP Error! status:'+ response.status) 
        }

        const result = await response.text()
        const trainData = await parseTrainData(result)

        return{
            success: trainData.success,
            data : trainData.data
        }


        
    } catch (error) {
        return{
            success:false,
            error: error.message || 'Failed to fetch train data'
        }
        
    }

    
}






export {
    checkPNRStatus,
    getTrainInfo,
    trackTrain,
    liveAtStation,
    searchTrainBetweenStations
}
