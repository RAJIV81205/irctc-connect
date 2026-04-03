# IRCTC Connect

[![npm version](https://badge.fury.io/js/irctc-connect.svg)](https://www.npmjs.com/package/irctc-connect)
[![Downloads](https://img.shields.io/npm/dm/irctc-connect.svg)](https://www.npmjs.com/package/irctc-connect)
[![License](https://img.shields.io/npm/l/irctc-connect.svg)](https://github.com/RAJIV81205/irctc-connect/blob/main/LICENSE)

<img width="1536" height="657" alt="IRCTC Connect Banner" src="https://github.com/user-attachments/assets/39c770a2-639c-443c-93b6-4e78889e78b0" />

A comprehensive Node.js SDK for Indian Railways. Get real-time PNR status, train information, live tracking, station updates, train search, and seat availability — all through a single, clean API.

> **v3.0.2** — The SDK now routes all requests through the hosted IRCTC Connect backend. An API key is required.

---

## ✨ Features

- 🎫 **PNR Status** — Real-time PNR status with full passenger details
- 🚂 **Train Information** — Complete train details with station-by-station route
- 📍 **Live Train Tracking** — Real-time position and delay info for any train
- 🚉 **Live Station Board** — Upcoming trains at any station right now
- 🔍 **Train Search** — Find all direct trains between two stations
- 💺 **Seat Availability** — Check availability and fare for any class and quota
- ⚡ **Fast & Reliable** — Built-in timeout handling, input validation, and caching

---

## 📦 Installation

```bash
npm install irctc-connect
```

---

## 🔑 Getting an API Key

1. Visit **[irctc.rajivdubey.tech](https://irctc.rajivdubey.tech)**
2. Sign up and navigate to your Dashboard
3. Generate an API key from the **API Keys** section
4. Copy the key — you'll use it in the next step

---

## 🚀 Quick Start

### Step 1 — Add your API key to `.env`

```bash
# .env
IRCTC_API_KEY=your_api_key_here
```

> ⚠️ Never commit your API key to version control. Add `.env` to `.gitignore`.

### Step 2 — Configure the SDK once at startup

```javascript
import { configure } from 'irctc-connect';

configure(process.env.IRCTC_API_KEY);
```

Call `configure()` **once** at the top of your app before using any other function. It stores your key globally for all subsequent calls.

### Step 3 — Use any function

```javascript
import {
  configure,
  checkPNRStatus,
  getTrainInfo,
  trackTrain,
  liveAtStation,
  searchTrainBetweenStations,
  getAvailability,
} from 'irctc-connect';

// Configure once
configure(process.env.IRCTC_API_KEY);

// Check PNR status
const pnrResult = await checkPNRStatus('1234567890');

// Get train information
const trainResult = await getTrainInfo('12301');

// Track live train status (date optional, defaults to today)
const trackResult = await trackTrain('12301', '31-03-2026');

// Get live trains at a station
const stationResult = await liveAtStation('NDLS');

// Search trains between stations
const searchResult = await searchTrainBetweenStations('NDLS', 'BCT');

// Get seat availability with fare breakdown
const availResult = await getAvailability('12496', 'ASN', 'DDU', '27-12-2025', '2A', 'GN');
```

---

## 📖 API Reference

### `configure(apiKey)`

Configure the SDK with your API key. **Must be called once before any other function.**

| Parameter | Type | Description |
|-----------|------|-------------|
| `apiKey` | string | Your API key from the dashboard |

```javascript
import { configure } from 'irctc-connect';

configure(process.env.IRCTC_API_KEY);
```

---

### 1. `checkPNRStatus(pnr)`

Get comprehensive PNR status with passenger details and journey information.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `pnr` | string | 10-digit PNR number |

**Example:**
```javascript
const result = await checkPNRStatus('1234567890');

if (result.success) {
  console.log('PNR:', result.data.pnr);
  console.log('Status:', result.data.status);
  console.log('Train:', result.data.train.name);
  console.log('Journey:', `${result.data.journey.from.name} → ${result.data.journey.to.name}`);

  result.data.passengers.forEach(p => {
    console.log(`${p.name}: ${p.status} — ${p.seat} (${p.berthType})`);
  });
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    pnr: "1234567890",
    status: "CNF",
    train: { number: "12301", name: "Howrah Rajdhani", class: "3A" },
    journey: {
      from: { name: "New Delhi", code: "NDLS", platform: "16" },
      to:   { name: "Howrah Junction", code: "HWH", platform: "9" },
      departure: "16/08/25 5:00 PM",
      arrival:   "17/08/25 9:55 AM",
      duration:  "16h 55m"
    },
    chart: { status: "Prepared", message: "Chart prepared" },
    passengers: [
      { name: "JOHN DOE", status: "CNF", seat: "B2-34", berthType: "SL", confirmationProbability: 99 }
    ],
    lastUpdated: "2025-08-16T12:00:00Z"
  }
}
```

---

### 2. `getTrainInfo(trainNumber)`

Get detailed train information including complete route with station coordinates.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `trainNumber` | string | 5-digit train number |

**Example:**
```javascript
const result = await getTrainInfo('12301');

if (result.success) {
  const { trainInfo, route } = result.data;

  console.log(`🚂 ${trainInfo.train_name} (${trainInfo.train_no})`);
  console.log(`📍 ${trainInfo.from_stn_name} → ${trainInfo.to_stn_name}`);
  console.log(`⏱️ ${trainInfo.from_time} → ${trainInfo.to_time} (${trainInfo.travel_time})`);
  console.log(`📅 Running days: ${trainInfo.running_days}`);

  route.slice(0, 5).forEach(stn => {
    console.log(`  ${stn.stnName} (${stn.stnCode}) — dep: ${stn.departure}`);
  });
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    trainInfo: {
      train_no: "12301",
      train_name: "HOWRAH RAJDHANI",
      from_stn_name: "NEW DELHI",
      from_stn_code: "NDLS",
      to_stn_name: "HOWRAH JN",
      to_stn_code: "HWH",
      from_time: "17:00",
      to_time: "09:55",
      travel_time: "16:55 hrs",
      running_days: "1111111",
      type: "RAJDHANI"
    },
    route: [
      {
        stnCode: "NDLS", stnName: "NEW DELHI",
        arrival: "--", departure: "17:00",
        halt: "0 min", distance: "0", day: "1",
        coordinates: { latitude: 28.6431, longitude: 77.2201 }
      }
      // ... more stations
    ]
  }
}
```

---

### 3. `trackTrain(trainNumber, date?)`

Get real-time live status of a train on a given date, including station-wise delays and coach positions.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `trainNumber` | string | 5-digit train number |
| `date` | string *(optional)* | Date in `DD-MM-YYYY` format. Defaults to today if omitted. |

**Example:**
```javascript
const result = await trackTrain('12301', '31-03-2026');

if (result.success) {
  const { trainNo, trainName, statusNote, stations } = result.data;

  console.log(`🚂 ${trainName} (${trainNo})`);
  console.log(`📍 Status: ${statusNote}`);

  stations.forEach(stn => {
    console.log(`\n🚉 ${stn.stationName} (${stn.stationCode}) — PF ${stn.platform}`);
    console.log(`   Arr: ${stn.arrival.scheduled} → ${stn.arrival.actual} ${stn.arrival.delay}`);
    console.log(`   Dep: ${stn.departure.scheduled} → ${stn.departure.actual} ${stn.departure.delay}`);
  });
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    trainNo: "12301",
    trainName: "HOWRAH RAJDHANI",
    date: "31-Mar-2026",
    statusNote: "Arrived at HOWRAH JN(HWH) — On Time",
    lastUpdate: "31-Mar-2026 10:01",
    totalStations: 8,
    stations: [
      {
        stationCode: "NDLS", stationName: "NEW DELHI",
        platform: "16", distanceKm: "0",
        arrival:   { scheduled: "SRC", actual: "SRC",        delay: ""        },
        departure: { scheduled: "17:00", actual: "17:00",    delay: "On Time" },
        coachPosition: [
          { type: "ENG", number: "ENG", position: "0" },
          { type: "3A",  number: "B1",  position: "5" }
          // ...
        ]
      }
      // ... more stations
    ]
  }
}
```

---

### 4. `liveAtStation(stnCode)`

Get the list of upcoming trains at a station right now.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `stnCode` | string | Station code (e.g., `'NDLS'`, `'BCT'`, `'HWH'`) |

**Example:**
```javascript
const result = await liveAtStation('NDLS');

if (result.success) {
  result.data.forEach(train => {
    console.log(`🚂 ${train.trainno} — ${train.trainname}`);
    console.log(`   📍 ${train.source} → ${train.dest}`);
    console.log(`   ⏰ At station: ${train.timeat}`);
  });
}
```

**Response:**
```javascript
{
  success: true,
  data: [
    {
      i: 0,
      trainno: "12301",
      trainname: "HOWRAH RAJDHANI",
      source: "NEW DELHI",
      dest: "HOWRAH JN",
      timeat: "17:00"
    }
    // ... more trains
  ]
}
```

---

### 5. `searchTrainBetweenStations(fromStnCode, toStnCode)`

Find all direct trains running between two stations.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `fromStnCode` | string | Origin station code |
| `toStnCode` | string | Destination station code |

**Example:**
```javascript
const result = await searchTrainBetweenStations('NDLS', 'BCT');

if (result.success) {
  console.log(`Found ${result.data.length} trains\n`);

  result.data.forEach(train => {
    console.log(`🚂 ${train.train_name} (${train.train_no})`);
    console.log(`   📍 ${train.from_stn_name} → ${train.to_stn_name}`);
    console.log(`   ⏰ ${train.from_time} → ${train.to_time} (${train.travel_time})`);
    console.log(`   📏 Distance: ${train.distance} km`);
    console.log(`   📅 Days: ${train.running_days}`);
  });
}
```

**Response:**
```javascript
{
  success: true,
  data: [
    {
      train_no: "12951",
      train_name: "MUMBAI RAJDHANI",
      source_stn_name: "NEW DELHI",
      source_stn_code: "NDLS",
      dstn_stn_name: "MUMBAI CENTRAL",
      dstn_stn_code: "BCT",
      from_stn_name: "NEW DELHI",
      from_stn_code: "NDLS",
      to_stn_name: "MUMBAI CENTRAL",
      to_stn_code: "BCT",
      from_time: "16:55",
      to_time: "08:35",
      travel_time: "15:40 hrs",
      running_days: "1111111",
      distance: "1384",
      halts: 8
    }
    // ... more trains (sorted by departure time)
  ]
}
```

---

### 6. `getAvailability(trainNo, fromStnCode, toStnCode, date, coach, quota)`

Check seat availability and fare breakdown for a specific train, class, and date.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `trainNo` | string | 5-digit train number |
| `fromStnCode` | string | Origin station code (e.g., `'NDLS'`) |
| `toStnCode` | string | Destination station code (e.g., `'BCT'`) |
| `date` | string | Journey date in `DD-MM-YYYY` format |
| `coach` | string | `2S` \| `SL` \| `3A` \| `3E` \| `2A` \| `1A` \| `CC` \| `EC` |
| `quota` | string | `GN` \| `LD` \| `SS` \| `TQ` |

**Coach Types:**

| Code | Class |
|------|-------|
| `2S` | Second Seating |
| `SL` | Sleeper Class |
| `3A` | Third AC |
| `3E` | Third AC Economy |
| `2A` | Second AC |
| `1A` | First AC |
| `CC` | Chair Car |
| `EC` | Executive Chair Car |

**Quota Types:**

| Code | Quota |
|------|-------|
| `GN` | General |
| `LD` | Ladies |
| `SS` | Senior Citizen |
| `TQ` | Tatkal |

**Example:**
```javascript
const result = await getAvailability('12301', 'NDLS', 'HWH', '27-12-2025', '3A', 'GN');

if (result.success) {
  const { train, fare, availability } = result.data;

  console.log(`🚂 ${train.trainName} (${train.trainNo})`);
  console.log(`📍 ${train.fromStationName} → ${train.toStationName}`);

  console.log('\n💰 Fare Breakdown:');
  console.log(`   Base Fare:    ₹${fare.baseFare}`);
  console.log(`   Reservation:  ₹${fare.reservationCharge}`);
  console.log(`   Superfast:    ₹${fare.superfastCharge}`);
  console.log(`   Total:        ₹${fare.totalFare}`);

  console.log('\n📅 Availability:');
  availability.forEach(day => {
    console.log(`   ${day.date}: ${day.availabilityText} — ${day.prediction}`);
  });
}
```

---

## ⚠️ Error Handling

All functions return a consistent response structure. Always check `success` before accessing `data`.

```javascript
// ✅ Success
{ success: true, data: { /* ... */ } }

// ❌ Failure
{ success: false, error: "Description of what went wrong" }
```

**Common error scenarios:**

| Error | Cause |
|-------|-------|
| `irctc-connect is not configured` | `configure()` was not called |
| `Invalid API key` (401) | Key doesn't exist in the system |
| `API key is inactive` (403) | Key has been deactivated |
| `Usage limit exceeded` (429) | Monthly request quota reached |
| `PNR number must be exactly 10 digits` | Bad input |
| `Invalid train number` | Train number not 5 digits |
| `Invalid date format. Use DD-MM-YYYY.` | Wrong date format |
| `Request timed out` | Upstream service too slow |

---

## 🛡️ Input Validation

The SDK validates inputs locally before making any network call:

- **PNR** — must be exactly 10 digits (non-numerics auto-stripped)
- **Train number** — must be exactly 5 characters
- **Station codes** — must be uppercase alphabetic, 1–5 chars
- **Date** — must be `DD-MM-YYYY`, validated for real calendar dates
- **Coach** — must be one of: `2S`, `SL`, `3A`, `3E`, `2A`, `1A`, `CC`, `EC`
- **Quota** — must be one of: `GN`, `LD`, `SS`, `TQ`

---

## 📊 PNR Status Codes

| Code | Meaning |
|------|---------|
| `CNF` | Confirmed |
| `WL` | Waiting List |
| `RAC` | Reservation Against Cancellation |
| `CAN` | Cancelled |
| `PQWL` | Pooled Quota Waiting List |
| `TQWL` | Tatkal Quota Waiting List |
| `GNWL` | General Waiting List |

---

## 🔧 Requirements

- Node.js 18+ (native `fetch` required)
- Internet connection for API calls
- A valid IRCTC Connect API key

---

## 📱 Platform Support

| Platform | Supported |
|----------|-----------|
| Node.js | ✅ |
| Express.js | ✅ |
| Next.js (server-side) | ✅ |
| Fastify / Hono | ✅ |
| React Native | ⚠️ Needs fetch polyfill |

---

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. 💻 Make your changes
4. 📝 Update documentation
5. 🚀 Submit a pull request

---

## 📄 License

ISC License — free to use in personal and commercial projects.

## 🙋 Support

- **Issues:** [GitHub Issues](https://github.com/RAJIV81205/irctc-connect/issues)
- **Docs:** [irctc.rajivdubey.tech/docs](https://irctc.rajivdubey.tech/docs)
- **Discussions:** [GitHub Discussions](https://github.com/RAJIV81205/irctc-connect/discussions)

---

*Built with ❤️ for Indian Railways enthusiasts. Happy journey! 🚂*
