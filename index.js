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











export {
    checkPNRStatus
}
