# IRCTC Connect
[![npm version](https://badge.fury.io/js/irctc-connect.svg)](https://www.npmjs.com/package/irctc-connect)
[![Downloads](https://img.shields.io/npm/dm/irctc-connect.svg)](https://www.npmjs.com/package/irctc-connect)
[![License](https://img.shields.io/npm/l/irctc-connect.svg)](https://github.com/RAJIV81205/irctc-connect/blob/main/LICENSE)
![Tests](https://github.com/RAJIV81205/irctc-connect/workflows/Test/badge.svg)

A comprehensive, promise-based Node.js package for Indian Railways services. Currently supports PNR status checking with more features coming soon including train schedules, seat availability, live train status, and booking management.

## Current Features

- ✅ **PNR Status Checking** - Real-time PNR status with comprehensive details
- 🚂 **Train Information** - Complete train and journey details
- 👥 **Passenger Details** - Individual passenger status and seat information
- ⏱️ **Reliable Performance** - Built-in timeout handling and error management

## Coming Soon

- 🕐 **Train Schedules** - Get detailed train timetables and schedules
- 💺 **Seat Availability** - Check available seats for any train and date
- 📍 **Live Train Status** - Real-time train running status and delays  
- 🎫 **Booking Management** - Advanced booking and cancellation features
- 🔍 **Station Information** - Comprehensive station codes and details
- 📊 **Route Planning** - Find optimal routes between stations

## Installation

```bash
npm install irctc-connect
```

## Quick Start

```javascript
import { checkPNRStatus } from 'irctc-connect';

// Check PNR status
const result = await checkPNRStatus('1234567890');

if (result.success) {
    console.log('PNR Status:', result.data.status);
    console.log('Train:', result.data.train.name);
    console.log('From:', result.data.journey.from.name);
    console.log('To:', result.data.journey.to.name);
} else {
    console.error('Error:', result.error);
}
```

## API Reference

### Current Methods

### `checkPNRStatus(pnr)`

Checks the status of an Indian Railways PNR number.

#### Parameters

- `pnr` (string): 10-digit PNR number

#### Returns

Returns a Promise that resolves to an object with the following structure:

**Success Response:**
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
            from: {
                name: "New Delhi",
                code: "NDLS",
                platform: "16"
            },
            to: {
                name: "Mumbai Central",
                code: "BCT",
                platform: "3"
            },
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

**Error Response:**
```javascript
{
    success: false,
    error: "Error message describing what went wrong"
}
```

## Usage Examples

### Basic PNR Check

```javascript
import { checkPNRStatus } from 'irctc-connect';

async function main() {
    try {
        const result = await checkPNRStatus('1234567890');
        
        if (result.success) {
            const { data } = result;
            
            console.log(`PNR: ${data.pnr}`);
            console.log(`Status: ${data.status}`);
            console.log(`Train: ${data.train.number} - ${data.train.name}`);
            console.log(`Journey: ${data.journey.from.name} → ${data.journey.to.name}`);
            console.log(`Departure: ${data.journey.departure} | Arrival: ${data.journey.arrival}`);
            
            // Display passenger information
            data.passengers.forEach((passenger, index) => {
                console.log(`Passenger ${index + 1}: ${passenger.name} - ${passenger.status} (${passenger.seat})`);
            });
        } else {
            console.error('Failed to fetch PNR status:', result.error);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

main();
```

### Handle Different PNR Statuses

```javascript
import { checkPNRStatus } from 'irctc-connect';

async function interpretPNRStatus(pnr) {
    const result = await checkPNRStatus(pnr);
    
    if (!result.success) {
        return `Error: ${result.error}`;
    }
    
    const status = result.data.status;
    
    switch (status) {
        case 'CNF':
            return 'Your ticket is confirmed! 🎉';
        case 'WL':
            return 'Your ticket is on waiting list 📋';
        case 'RAC':
            return 'Your ticket is under RAC (Reservation Against Cancellation) 🔄';
        case 'CAN':
            return 'Your ticket has been cancelled ❌';
        default:
            return `Status: ${status}`;
    }
}

// Usage
console.log(await interpretPNRStatus('1234567890'));
```

### Error Handling

```javascript
import { checkPNRStatus } from 'irctc-connect';

async function safePNRCheck(pnr) {
    const result = await checkPNRStatus(pnr);
    
    if (!result.success) {
        switch (result.error) {
            case 'PNR number is required and must be a string':
                console.log('Please provide a valid PNR number');
                break;
            case 'PNR number must be exactly 10 digits':
                console.log('PNR should be 10 digits long');
                break;
            case 'Request timed out after 10 seconds':
                console.log('Request took too long, please try again');
                break;
            case 'No PNR data found or invalid PNR number':
                console.log('PNR not found, please check the number');
                break;
            default:
                console.log('Something went wrong:', result.error);
        }
        return null;
    }
    
    return result.data;
}
```

## PNR Status Codes

Common PNR status codes you might encounter:

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

The package includes comprehensive error handling for:

- Invalid PNR format (non-10 digit numbers)
- Network timeouts (10-second limit)
- API failures
- Invalid responses
- Missing or malformed data

## Package Features

- 🛡️ **Input Validation** - Comprehensive input validation and error handling
- 📱 **Cross-Platform** - Works in both Node.js and modern browsers
- 🎯 **Zero Dependencies** - Lightweight with no external dependencies
- ⚡ **Fast & Reliable** - Optimized for performance with timeout handling
- 🔄 **Promise-Based** - Modern async/await support

## Limitations

- This package relies on external APIs and their availability
- Rate limiting may apply based on the underlying service
- PNR data accuracy depends on the source API
- Some PNR numbers might not be available immediately after booking

## Roadmap

IRCTC Connect is actively developed with new features being added regularly. Here's what's planned:

**Phase 1 (Current):**
- ✅ PNR Status Checking

**Phase 2 (Coming Soon):**
- 🚂 Train Schedules & Timetables
- 💺 Seat Availability Checker
- 📍 Live Train Running Status

**Phase 3 (Future):**
- 🎫 Booking Management
- 🔍 Station Information & Codes
- 📊 Route Planning & Optimization
- 📱 Advanced Search & Filters

Stay tuned for updates!

## Requirements

- Node.js 14+ (for fetch support) or modern browser
- Internet connection for API calls

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This package is for educational and personal use only. Please respect the terms of service of Indian Railways and related services. The authors are not responsible for any misuse of this package.

---

**Note:** This package is actively maintained and new features are being added regularly. Check back for updates!
