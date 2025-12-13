# IRCTC Connect
[![npm version](https://badge.fury.io/js/irctc-connect.svg)](https://www.npmjs.com/package/irctc-connect)
[![Downloads](https://img.shields.io/npm/dm/irctc-connect.svg)](https://www.npmjs.com/package/irctc-connect)
[![License](https://img.shields.io/npm/l/irctc-connect.svg)](https://github.com/RAJIV81205/irctc-connect/blob/main/LICENSE)

<img width="1536" height="657" alt="ChatGPT Image Jul 15, 2025, 11_30_02 AM" src="https://github.com/user-attachments/assets/39c770a2-639c-443c-93b6-4e78889e78b0" />



A comprehensive Node.js package for Indian Railways services. Get real-time PNR status, detailed train information, live train tracking, station updates, search trains between stations, and check seat availability with fare information.

## ✨ Features

- 🎫 **PNR Status Checking** - Real-time PNR status with passenger details
- 🚂 **Train Information** - Complete train details with route information  
- 📍 **Live Train Tracking** - Real-time train status and location tracking
- 🚉 **Live Station Updates** - Current trains at any station
- 🔍 **Train Search** - Find trains between any two stations
- 💺 **Seat Availability** - Check availability with fare breakdown for multiple dates
- 🗺️ **Route Details** - Station-wise route with timings and coordinates
- ⚡ **Fast & Reliable** - Built-in timeout handling and validation

## 📦 Installation

```bash
npm install irctc-connect
```

## 🚀 Quick Start

```javascript
import { 
    checkPNRStatus, 
    getTrainInfo, 
    trackTrain, 
    liveAtStation, 
    searchTrainBetweenStations,
    getAvailability
} from 'irctc-connect';

// Check PNR status
const pnrResult = await checkPNRStatus('1234567890');

// Get train information
const trainResult = await getTrainInfo('12345');

// Track live train status
const trackResult = await trackTrain('12345', '03-12-2025');

// Get live trains at station
const stationResult = await liveAtStation('NDLS');

// Search trains between stations
const searchResult = await searchTrainBetweenStations('NDLS', 'BCT');

// Get seat availability with fare
const availabilityResult = await getAvailability('12496', 'ASN', 'DDU', '27-12-2025', '2A', 'GN');
```

## 📖 API Reference

### 1. `checkPNRStatus(pnr)`

Get comprehensive PNR status with passenger details and journey information.

**Parameters:**
- `pnr` (string): 10-digit PNR number

**Example:**
```javascript
const result = await checkPNRStatus('1234567890');

if (result.success) {
    console.log('PNR:', result.data.pnr);
    console.log('Status:', result.data.status);
    console.log('Train:', result.data.train.name);
    console.log('Journey:', `${result.data.journey.from.name} → ${result.data.journey.to.name}`);
    
    // Show all passengers
    result.data.passengers.forEach(passenger => {
        console.log(`${passenger.name}: ${passenger.status} - ${passenger.seat}`);
    });
}
```

---

### 2. `getTrainInfo(trainNumber)`

Get detailed train information including complete route with station coordinates.

**Parameters:**
- `trainNumber` (string): 5-digit train number

**Example:**
```javascript
const result = await getTrainInfo('12345');

if (result.success) {
    const { trainInfo, route } = result.data;
    
    console.log(`🚂 ${trainInfo.train_name} (${trainInfo.train_no})`);
    console.log(`📍 ${trainInfo.from_stn_name} → ${trainInfo.to_stn_name}`);
    console.log(`⏱️ ${trainInfo.from_time} - ${trainInfo.to_time} (${trainInfo.travel_time})`);
    console.log(`📅 Running Days: ${trainInfo.running_days}`);
    
    // Show route (first 5 stations)
    console.log('\n🛤️ Route:');
    route.slice(0, 5).forEach(station => {
        console.log(`  ${station.stnName} (${station.stnCode}) - ${station.departure}`);
    });
}
```

---

### 3. `trackTrain(trainNumber, date)`

Get real-time train status and tracking for a specific date with detailed station-wise information including delays and coach positions.

**Parameters:**
- `trainNumber` (string): 5-digit train number
- `date` (string): Date in dd-mm-yyyy format

**Example:**
```javascript
const result = await trackTrain('12342', '03-12-2025');

if (result.success) {
    const { trainNo, trainName, date, statusNote, lastUpdate, totalStations, stations } = result.data;
    
    console.log(`🚂 ${trainName} (${trainNo})`);
    console.log(`📅 Date: ${date}`);
    console.log(`📍 Status: ${statusNote}`);
    console.log(`🕐 Last Update: ${lastUpdate}`);
    console.log(`🛤️ Total Stations: ${totalStations}`);
    
    // Show station details with delays
    console.log('\n📋 Station Details:');
    stations.forEach(station => {
        console.log(`\n  🚉 ${station.stationName} (${station.stationCode})`);
        console.log(`     Platform: ${station.platform} | Distance: ${station.distanceKm} km`);
        console.log(`     Arrival: ${station.arrival.scheduled} → ${station.arrival.actual}`);
        if (station.arrival.delay) {
            console.log(`     ⚠️ Arrival Delay: ${station.arrival.delay}`);
        }
        console.log(`     Departure: ${station.departure.scheduled} → ${station.departure.actual}`);
        if (station.departure.delay) {
            console.log(`     ⚠️ Departure Delay: ${station.departure.delay}`);
        }
        
        // Show coach composition
        if (station.coachPosition && station.coachPosition.length > 0) {
            const coaches = station.coachPosition.map(c => c.type).join(' - ');
            console.log(`     🚃 Coaches: ${coaches}`);
        }
    });
}
```

**Response Structure:**
```javascript
{
    success: true,
    data: {
        trainNo: "12342",
        trainName: "AGNIVEENA EXP",
        date: "03-Dec-2025",
        statusNote: "Arrived at HOWRAH JN(HWH) at 09:06 03-Dec (Delay: 00:06)",
        lastUpdate: "03-Dec-2025 09:11",
        totalStations: 8,
        stations: [
            {
                stationCode: "ASN",
                stationName: "ASANSOL JN.",
                platform: "5",
                distanceKm: "",
                arrival: {
                    scheduled: "SRC",
                    actual: "SRC",
                    delay: ""
                },
                departure: {
                    scheduled: "05:30 03-Dec",
                    actual: "05:30 03-Dec",
                    delay: "On Time"
                },
                coachPosition: [
                    { type: "ENG", number: "ENG", position: "0" },
                    { type: "LPR", number: "LPR", position: "1" },
                    { type: "GEN", number: "GEN", position: "2" },
                    { type: "2S", number: "D5", position: "4" },
                    { type: "CC", number: "C2", position: "9" }
                    // ... more coaches
                ]
            },
            {
                stationCode: "RNG",
                stationName: "RANIGANJ",
                platform: "4",
                distanceKm: "18",
                arrival: {
                    scheduled: "05:41 03-Dec",
                    actual: "05:50 03-Dec",
                    delay: "9 Min"
                },
                departure: {
                    scheduled: "05:43 03-Dec",
                    actual: "05:52 03-Dec",
                    delay: "9 Min"
                },
                coachPosition: [
                    // ... coach details
                ]
            }
            // ... more stations
        ]
    }
}
```

---

### 4. `liveAtStation(stationCode)` 🆕

Get list of upcoming trains at any station with real-time information.

**Parameters:**
- `stationCode` (string): Station code (e.g., 'NDLS', 'BCT', 'HWH')

**Example:**
```javascript
const result = await liveAtStation('NDLS');

if (result.success) {
    console.log(`🚉 Live trains at ${result.data.stationName}:`);
    
    result.data.trains.forEach(train => {
        console.log(`🚂 ${train.trainName} (${train.trainNumber})`);
        console.log(`   📍 ${train.source} → ${train.destination}`);
        console.log(`   ⏰ Expected: ${train.expectedTime}`);
        console.log(`   📊 Status: ${train.status}`);
        if (train.delay) {
            console.log(`   ⚠️ Delay: ${train.delay}`);
        }
        console.log('   ---');
    });
}
```

**Response Structure:**
```javascript
{
    success: true,
    data: {
        stationName: "New Delhi",
        stationCode: "NDLS",
        lastUpdated: "2025-06-28 14:30:00",
        trains: [
            {
                trainNumber: "12345",
                trainName: "Rajdhani Express",
                source: "New Delhi",
                destination: "Mumbai Central",
                expectedTime: "20:05",
                actualTime: "20:10",
                status: "On Time",
                delay: "5 min",
                platform: "16"
            }
            // ... more trains
        ]
    }
}
```

---

### 5. `searchTrainBetweenStations(fromStationCode, toStationCode)` 🆕

Find all trains running between two stations with timing and availability.

**Parameters:**
- `fromStationCode` (string): Origin station code
- `toStationCode` (string): Destination station code

**Example:**
```javascript
const result = await searchTrainBetweenStations('NDLS', 'BCT');

if (result.success) {
    console.log(`🔍 Trains from ${result.data.from} to ${result.data.to}:`);
    console.log(`📊 Found ${result.data.trains.length} trains\n`);
    
    result.data.trains.forEach(train => {
        console.log(`🚂 ${train.trainName} (${train.trainNumber})`);
        console.log(`   ⏰ Departure: ${train.departure} | Arrival: ${train.arrival}`);
        console.log(`   ⏱️ Duration: ${train.duration}`);
        console.log(`   📅 Days: ${train.runningDays}`);
        console.log(`   💺 Classes: ${train.availableClasses.join(', ')}`);
        console.log('   ---');
    });
}
```

**Response Structure:**
```javascript
{
    success: true,
    data: {
        from: "New Delhi (NDLS)",
        to: "Mumbai Central (BCT)", 
        totalTrains: 15,
        trains: [
            {
                trainNumber: "12345",
                trainName: "Rajdhani Express",
                departure: "20:05",
                arrival: "08:35",
                duration: "12h 30m",
                runningDays: "Daily",
                availableClasses: ["1A", "2A", "3A"],
                trainType: "Superfast"
            }
            // ... more trains
        ]
    }
}
```

---

### 6. `getAvailability(trainNo, fromStnCode, toStnCode, date, coach, quota)` 🆕

Get seat availability with fare information for a train journey. Returns availability status for multiple dates along with detailed fare breakdown.

**Parameters:**
- `trainNo` (string): 5-digit train number
- `fromStnCode` (string): Origin station code (e.g., 'ASN', 'NDLS')
- `toStnCode` (string): Destination station code (e.g., 'DDU', 'BCT')
- `date` (string): Date in DD-MM-YYYY format (e.g., "27-12-2025")
- `coach` (string): Travel class - one of: "2S", "SL", "3A", "3E", "2A", "1A", "CC", "EC"
- `quota` (string): Booking quota - one of: "GN" (General), "LD" (Ladies), "SS" (Senior Citizen), "TQ" (Tatkal)

**Example:**
```javascript
const result = await getAvailability('12496', 'ASN', 'DDU', '27-12-2025', '2A', 'GN');

if (result.success) {
    const { train, fare, availability } = result.data;
    
    console.log(`🚂 ${train.trainName} (${train.trainNo})`);
    console.log(`📍 ${train.fromStationName} (${train.from}) → ${train.toStationName} (${train.to})`);
    console.log(`📏 Distance: ${train.distance} km`);
    console.log(`💺 Class: ${train.travelClass} | Quota: ${train.quota}`);
    
    // Fare breakdown
    console.log('\n💰 Fare Breakdown:');
    console.log(`   Base Fare: ₹${fare.baseFare}`);
    console.log(`   Reservation Charge: ₹${fare.reservationCharge}`);
    console.log(`   Superfast Charge: ₹${fare.superfastCharge}`);
    console.log(`   Service Tax: ₹${fare.serviceTax}`);
    console.log(`   Total Fare: ₹${fare.totalFare}`);
    
    // Availability for multiple dates
    console.log('\n📅 Availability:');
    availability.forEach(avail => {
        console.log(`\n   📆 ${avail.date}`);
        console.log(`      Status: ${avail.status}`);
        console.log(`      Availability: ${avail.availabilityText}`);
        console.log(`      Prediction: ${avail.prediction} (${avail.predictionPercentage}%)`);
        console.log(`      Can Book: ${avail.canBook ? '✅ Yes' : '❌ No'}`);
    });
}
```

**Response Structure:**
```javascript
{
    success: true,
    data: {
        train: {
            trainNo: "12496",
            trainName: "PRATAP EXPRESS",
            from: "ASN",
            to: "DDU",
            fromStationName: "Asansol Junction",
            toStationName: "Pt. Deen Dayal Upadhyaya Junction",
            distance: 461,
            travelClass: "2A",
            quota: "GN"
        },
        fare: {
            baseFare: 981,
            reservationCharge: 50,
            superfastCharge: 45,
            serviceTax: 54,
            totalFare: 1130
        },
        availability: [
            {
                date: "27-12-2025",
                status: "WAITLIST",
                availabilityText: "Regret",
                rawStatus: "REGRET",
                prediction: "No More Booking",
                predictionPercentage: 0,
                canBook: false
            },
            {
                date: "17-1-2026",
                status: "WAITLIST",
                availabilityText: "WL 2",
                rawStatus: "PQWL9/WL2",
                prediction: "90% Chance",
                predictionPercentage: 90,
                canBook: true
            }
            // ... more dates
        ]
    }
}
```

**Coach Types:**
- `2S` - Second Seating
- `SL` - Sleeper Class
- `3A` - Third AC
- `3E` - Third AC Economy
- `2A` - Second AC
- `1A` - First AC
- `CC` - Chair Car
- `EC` - Executive Chair Car

**Quota Types:**
- `GN` - General Quota
- `LD` - Ladies Quota
- `SS` - Senior Citizen Quota
- `TQ` - Tatkal Quota

---

## 🛡️ Input Validation

### PNR Number
- ✅ Must be exactly 10 digits
- ✅ Automatically removes non-numeric characters
- ✅ Validates format before API call

### Train Number  
- ✅ Must be exactly 5 characters
- ✅ Should be valid train number string

### Date Format
- ✅ Must be dd-mm-yyyy format (e.g., "28-06-2025")
- ✅ Validates actual date values
- ✅ No invalid dates like 32-01-2025

### Station Codes
- ✅ Must be valid station code strings
- ✅ Common codes: NDLS, BCT, HWH, CSTM, SBC, etc.

## 📊 Common Status Codes

| PNR Status | Description |
|------------|-------------|
| **CNF** | Confirmed - Seat confirmed |
| **WL** | Waiting List - Not confirmed yet |
| **RAC** | Reservation Against Cancellation |
| **CAN** | Cancelled |
| **PQWL** | Pooled Quota Waiting List |
| **TQWL** | Tatkal Quota Waiting List |

| Train Status | Description |
|-------------|-------------|
| **On Time** | Running as scheduled |
| **Delayed** | Running behind schedule |
| **Cancelled** | Train service cancelled |
| **Diverted** | Route changed |

## ⚠️ Error Handling

All functions return consistent response structure:

```javascript
// ✅ Success
{
    success: true,
    data: { /* response data */ }
}

// ❌ Error  
{
    success: false,
    error: "Description of what went wrong"
}
```

**Always check the `success` field before accessing `data`!**

## 🔧 Requirements

- **Node.js 14+** (for native fetch support)
- **Internet connection** for API calls
- **Valid inputs** (PNR numbers, train numbers, station codes)

## 📱 Platform Support

- ✅ Node.js applications
- ✅ Express.js servers  
- ✅ Next.js applications
- ✅ React Native (with polyfills)
- ✅ Electron apps

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌟 Create a feature branch
3. 💻 Make your changes
4. ✅ Add tests if applicable
5. 📝 Update documentation
6. 🚀 Submit a pull request

## 📄 License

MIT License - feel free to use in your projects!

## 🙋‍♂️ Support

- 📧 **Issues**: [GitHub Issues](https://github.com/RAJIV81205/irctc-connect/issues)
- 📚 **Documentation**: This README
- 💬 **Discussions**: [GitHub Discussions](https://github.com/RAJIV81205/irctc-connect/discussions)

## 🌟 Star History

If this package helped you, please give it a ⭐ on GitHub!

---

**Built with ❤️ for Indian Railways enthusiasts**

*Happy Journey! 🚂*
