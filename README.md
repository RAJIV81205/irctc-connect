# IRCTC Connect
[![npm version](https://badge.fury.io/js/irctc-connect.svg)](https://www.npmjs.com/package/irctc-connect)
[![Downloads](https://img.shields.io/npm/dm/irctc-connect.svg)](https://www.npmjs.com/package/irctc-connect)
[![License](https://img.shields.io/npm/l/irctc-connect.svg)](https://github.com/RAJIV81205/irctc-connect/blob/main/LICENSE)

A comprehensive Node.js package for Indian Railways services. Get real-time PNR status, detailed train information, and live train tracking with complete route details.

## Features

- ✅ **PNR Status Checking** - Real-time PNR status with passenger details
- 🚂 **Train Information** - Complete train details with route information
- 📍 **Live Train Tracking** - Real-time train status and location tracking
- 🗺️ **Route Details** - Station-wise route with timings and coordinates
- ⚡ **Fast & Reliable** - Built-in timeout handling and validation

## Installation

```bash
npm install irctc-connect
```

## Quick Start

```javascript
import { checkPNRStatus, getTrainInfo, trackTrain } from 'irctc-connect';

// Check PNR status
const pnrResult = await checkPNRStatus('1234567890');
console.log(pnrResult);

// Get train information
const trainResult = await getTrainInfo('12345');
console.log(trainResult);

// Track live train status
const trackResult = await trackTrain('12345', '25-06-2024');
console.log(trackResult);

// Get live upcoming Trains at any station
const atStationResult = await liveAtStation("BBS")
console.log(atStationResult)

// Get all Trains between Station
const betweenResult = await searchTrainBetweenStations('ASN','DDU')
console.log(betweenResult)

```

## API Reference

### `checkPNRStatus(pnr)`

Get comprehensive PNR status information.

**Parameters:**
- `pnr` (string): 10-digit PNR number

**Example:**
```javascript
import { checkPNRStatus } from 'irctc-connect';

const result = await checkPNRStatus('1234567890');

if (result.success) {
    console.log('PNR:', result.data.pnr);
    console.log('Status:', result.data.status);
    console.log('Train:', result.data.train.name);
    console.log('From:', result.data.journey.from.name);
    console.log('To:', result.data.journey.to.name);
    console.log('Departure:', result.data.journey.departure);
    
    // Passenger details
    result.data.passengers.forEach(passenger => {
        console.log(`${passenger.name}: ${passenger.status} - ${passenger.seat}`);
    });
} else {
    console.log('Error:', result.error);
}
```

**Response Structure:**
```javascript
{
    success: true,
    data: {
        pnr: "1234567890",
        status: "CNF",
        train: {
            number: "12345",
            name: "Rajdhani Express",
            class: "3A"
        },
        journey: {
            from: { name: "New Delhi", code: "NDLS", platform: "16" },
            to: { name: "Mumbai Central", code: "BCT", platform: "3" },
            departure: "20:05",
            arrival: "08:35",
            duration: "12h 30m"
        },
        chart: {
            status: "Chart Prepared",
            message: "Chart prepared"
        },
        passengers: [
            {
                name: "JOHN DOE",
                status: "CNF",
                seat: "B1-45",
                berthType: "SL",
                confirmationProbability: null
            }
        ],
        lastUpdated: "2024-01-15 10:30:00"
    }
}
```

### `getTrainInfo(trainNumber)`

Get detailed train information including complete route.

**Parameters:**
- `trainNumber` (string): 5-digit train number

**Example:**
```javascript
import { getTrainInfo } from 'irctc-connect';

const result = await getTrainInfo('12345');

if (result.success) {
    const { trainInfo, route } = result.data;
    
    // Train basic information
    console.log('Train:', trainInfo.train_name);
    console.log('Number:', trainInfo.train_no);
    console.log('From:', trainInfo.from_stn_name);
    console.log('To:', trainInfo.to_stn_name);
    console.log('Departure:', trainInfo.from_time);
    console.log('Arrival:', trainInfo.to_time);
    console.log('Duration:', trainInfo.travel_time);
    console.log('Running Days:', trainInfo.running_days);
    
    // Route information
    console.log('\nRoute Details:');
    route.forEach(station => {
        console.log(`${station.stnName} (${station.stnCode})`);
        console.log(`  Arrival: ${station.arrival} | Departure: ${station.departure}`);
        console.log(`  Halt: ${station.halt} | Distance: ${station.distance}km`);
        if (station.coordinates) {
            console.log(`  Location: ${station.coordinates.latitude}, ${station.coordinates.longitude}`);
        }
    });
} else {
    console.log('Error:', result.error);
}
```

**Response Structure:**
```javascript
{
    success: true,
    data: {
        trainInfo: {
            train_no: "12345",
            train_name: "Rajdhani Express",
            from_stn_name: "New Delhi",
            from_stn_code: "NDLS",
            to_stn_name: "Mumbai Central", 
            to_stn_code: "BCT",
            from_time: "20:05",
            to_time: "08:35",
            travel_time: "12:30 hrs",
            running_days: "1234567",
            type: "Express",
            train_id: "12345"
        },
        route: [
            {
                stnName: "New Delhi",
                stnCode: "NDLS",
                arrival: "00:00",
                departure: "20:05",
                halt: "0 min",
                distance: "0",
                day: "1",
                platform: "16",
                coordinates: {
                    latitude: 28.6431,
                    longitude: 77.2197
                }
            }
            // ... more stations
        ]
    }
}
```

### `trackTrain(trainNumber, date)`

Get real-time train status and tracking information for a specific date.

**Parameters:**
- `trainNumber` (string): 5-digit train number
- `date` (string): Date in dd-mm-yyyy format

**Example:**
```javascript
import { trackTrain } from 'irctc-connect';

const result = await trackTrain('12345', '25-06-2024');

if (result.success) {
    console.log('📍 Live Train Status:');
    
    // Find current station
    const currentStation = result.data.find(station => station.current === "true");
    if (currentStation) {
        console.log(`🚂 Currently at: ${currentStation.station}`);
        console.log(`⏰ Departed at: ${currentStation.dep}`);
    }
    
    // Show upcoming stations
    const upcomingStations = result.data.filter(station => station.status === "upcoming");
    console.log('\n📋 Upcoming Stations:');
    upcomingStations.slice(0, 3).forEach(station => {
        console.log(`  • ${station.station} - Arr: ${station.arr}, Dep: ${station.dep}`);
        if (station.delay) {
            console.log(`    ⚠️ Delay: ${station.delay}`);
        }
    });
    
    // Show crossed stations
    const crossedStations = result.data.filter(station => station.status === "crossed");
    console.log(`\n✅ Crossed ${crossedStations.length} stations`);
    
} else {
    console.log('Error:', result.error);
}
```

**Response Structure:**
```javascript
{
    success: true,
    data: [
        {
            index: 0,
            station: "Jammu Tawi",
            arr: "",
            dep: "13:45",
            delay: "",
            status: "crossed",
            current: "true"
        },
        {
            index: 1,
            station: "Kathua",
            arr: "14:46",
            dep: "14:48",
            delay: "",
            status: "upcoming",
            current: "false"
        }
        // ... more stations
    ]
}
```

**Response Fields:**
- `index`: Station sequence number in the route
- `station`: Station name
- `arr`: Scheduled arrival time (empty for origin station)
- `dep`: Scheduled departure time
- `delay`: Delay information (if any)
- `status`: Current status - "crossed", "upcoming", "running", etc.
- `current`: "true" if this is the current/last crossed station



## Input Validation

### PNR Number
- Must be exactly 10 digits
- Only numeric characters allowed
- Automatically cleans input (removes non-numeric characters)

### Train Number
- Must be exactly 5 characters
- Should be a valid train number string

### Date Format
- Must be in dd-mm-yyyy format (e.g., "25-06-2024")
- Validates actual date values (no invalid dates like 32-01-2024)
- Checks for proper day, month, and year values

## Common Status Codes

| Code | Full Form | Description |
|------|-----------|-------------|
| CNF | Confirmed | Ticket is confirmed |
| WL | Waiting List | Ticket is on waiting list |
| RAC | Reservation Against Cancellation | Partially confirmed |
| CAN | Cancelled | Ticket has been cancelled |
| PQWL | Pooled Quota Waiting List | On pooled quota waiting list |
| TQWL | Tatkal Quota Waiting List | On tatkal quota waiting list |
| GNWL | General Waiting List | On general waiting list |

## Error Handling

All functions return a consistent response structure:

```javascript
// Success response
{
    success: true,
    data: { /* response data */ }
}

// Error response
{
    success: false,
    error: "Error message describing what went wrong"
}
```

Common error scenarios:
- Invalid input parameters
- Network timeouts (10-second timeout for requests)
- API service unavailable
- Invalid PNR/train numbers
- Invalid date formats

## Requirements

- Node.js 14+ (for fetch support)
- Internet connection for API calls

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for Indian Railways enthusiasts**
