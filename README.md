# IRCTC Connect
[![npm version](https://badge.fury.io/js/irctc-connect.svg)](https://www.npmjs.com/package/irctc-connect)
[![Downloads](https://img.shields.io/npm/dm/irctc-connect.svg)](https://www.npmjs.com/package/irctc-connect)
[![License](https://img.shields.io/npm/l/irctc-connect.svg)](https://github.com/RAJIV81205/irctc-connect/blob/main/LICENSE)

A comprehensive Node.js package for Indian Railways services. Get real-time PNR status and detailed train information with complete route details.

## Features

- ✅ **PNR Status Checking** - Real-time PNR status with passenger details
- 🚂 **Train Information** - Complete train details with route information
- 🗺️ **Route Details** - Station-wise route with timings and coordinates
- ⚡ **Fast & Reliable** - Built-in timeout handling and validation

## Installation

```bash
npm install irctc-connect
```

## Quick Start

```javascript
import { checkPNRStatus, getTrainInfo } from 'irctc-connect';

// Check PNR status
const pnrResult = await checkPNRStatus('1234567890');
console.log(pnrResult);

// Get train information
const trainResult = await getTrainInfo('12345');
console.log(trainResult);
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
            },
            // ... more stations
        ]
    }
}
```

## Usage Examples

### Complete PNR Journey Tracker

```javascript
import { checkPNRStatus } from 'irctc-connect';

async function trackJourney(pnr) {
    const result = await checkPNRStatus(pnr);
    
    if (result.success) {
        const { data } = result;
        
        console.log(`🚂 ${data.train.name} (${data.train.number})`);
        console.log(`📍 ${data.journey.from.name} → ${data.journey.to.name}`);
        console.log(`🕐 ${data.journey.departure} - ${data.journey.arrival}`);
        console.log(`⏱️  Duration: ${data.journey.duration}`);
        console.log(`📊 Status: ${data.status}`);
        
        console.log('\n👥 Passengers:');
        data.passengers.forEach((passenger, i) => {
            console.log(`${i + 1}. ${passenger.name} - ${passenger.status} (${passenger.seat})`);
        });
    }
}
```

### Train Route Explorer

```javascript
import { getTrainInfo } from 'irctc-connect';

async function exploreRoute(trainNumber) {
    const result = await getTrainInfo(trainNumber);
    
    if (result.success) {
        const { trainInfo, route } = result.data;
        
        console.log(`🚂 ${trainInfo.train_name} (${trainInfo.train_no})`);
        console.log(`🗓️  Running Days: ${trainInfo.running_days}`);
        console.log(`⏱️  Total Journey: ${trainInfo.travel_time}\n`);
        
        console.log('🛤️  Route Details:');
        route.forEach((station, index) => {
            const isSource = index === 0;
            const isDestination = index === route.length - 1;
            
            let symbol = '├─';
            if (isSource) symbol = '┌─';
            if (isDestination) symbol = '└─';
            
            console.log(`${symbol} ${station.stnName} (${station.stnCode})`);
            console.log(`   📍 ${station.arrival} → ${station.departure} | Halt: ${station.halt}`);
            console.log(`   📏 Distance: ${station.distance}km | Day: ${station.day}`);
            
            if (station.coordinates) {
                console.log(`   🌍 ${station.coordinates.latitude}, ${station.coordinates.longitude}`);
            }
            console.log('');
        });
    }
}
```

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

## Requirements

- Node.js 14+ (for fetch support)
- Internet connection for API calls

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for Indian Railways enthusiasts**