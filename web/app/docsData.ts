import {
  BookOpen,
  Package,
  Rocket,
  Ticket,
  Train,
  MapPin,
  Building2,
  Search,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  Gamepad2,
  type LucideIcon,
  Armchair
} from "lucide-react";

export const packageInfo = {
  name: 'IRCTC Connect',
  tagline: 'Node.js SDK for Indian Railways',
  description: 'Comprehensive Node.js SDK for Indian Railways with real-time PNR status, live train tracking, station updates, and complete route information.',
  stats: {
    downloads: '251',
    license: 'MIT',
    nodeVersion: '14+'
  },
  links: {
    github: 'https://github.com/RAJIV81205/irctc-connect',
    npm: 'https://www.npmjs.com/package/irctc-connect',
    issues: 'https://github.com/RAJIV81205/irctc-connect/issues'
  }
};

export type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type SidebarGroup = {
  title: string;
  items: SidebarItem[];
};

export const sidebarGroups: SidebarGroup[] = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction", icon: BookOpen },
      { id: "installation", label: "Installation", icon: Package },
      { id: "quickstart", label: "Quick Start", icon: Rocket },
    ],
  },
  {
    title: "Core Features",
    items: [
      { id: "pnr-status", label: "PNR Status", icon: Ticket },
      { id: "train-info", label: "Train Information", icon: Train },
      { id: "live-tracking", label: "Live Tracking", icon: MapPin },
      { id: "station-live", label: "Live at Station", icon: Building2 },
      { id: "train-search", label: "Train Search", icon: Search },
      { id: "seat-availability", label: "Seat Availability", icon: Armchair },
    ],
  },
  {
    title: "Tools",
    items: [
      { id: "playground", label: "Playground", icon: Gamepad2 },
    ],
  },
  {
    title: "Reference",
    items: [
      { id: "validation", label: "Input Validation", icon: CheckCircle },
      { id: "status-codes", label: "Status Codes", icon: BarChart3 },
      { id: "errors", label: "Error Handling", icon: AlertTriangle },
    ],
  },

];


export const sections: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: "introduction", label: "Introduction", icon: BookOpen },
  { id: "installation", label: "Installation", icon: Package },
  { id: "quickstart", label: "Quick Start", icon: Rocket },
  { id: "pnr-status", label: "PNR Status", icon: Ticket },
  { id: "train-info", label: "Train Information", icon: Train },
  { id: "live-tracking", label: "Live Tracking", icon: MapPin },
  { id: "station-live", label: "Live at Station", icon: Building2 },
  { id: "train-search", label: "Train Search", icon: Search },
  { id: "seat-availability", label: "Seat Availability", icon: Armchair },
  { id: "playground", label: "Playground", icon: Gamepad2 },
  { id: "validation", label: "Input Validation", icon: CheckCircle },
  { id: "status-codes", label: "Status Codes", icon: BarChart3 },
  { id: "errors", label: "Error Handling", icon: AlertTriangle },

];

export const features = [
  {
    icon: '🎫',
    title: 'PNR Status',
    desc: 'Real-time PNR status with passenger details and confirmation status'
  },
  {
    icon: '🚂',
    title: 'Train Information',
    desc: 'Complete train details with route, schedule, and station coordinates'
  },
  {
    icon: '📍',
    title: 'Live Tracking',
    desc: 'Real-time train location, delays, and station-wise status updates'
  },
  {
    icon: '🚉',
    title: 'Station Live',
    desc: 'Upcoming trains at any station with expected arrival times'
  },
  {
    icon: '🔍',
    title: 'Train Search',
    desc: 'Find trains between stations with classes and availability info'
  },
  {
    icon: '⚡',
    title: 'Fast & Reliable',
    desc: 'Built-in validation, timeout handling, and error management'
  }
];

export const installation = {
  requirements: [
    'Node.js 14 or higher',
    'Active internet connection',
    'Valid PNR numbers or train numbers for testing'
  ],
  platforms: [
    'Node.js applications',
    'Express.js servers',
    'Next.js (App Router & Pages Router)',
    'React Native'
  ]
};

export const quickStartCode = {
  basic: `// Import the functions you need
import { checkPNRStatus, getTrainInfo } from 'irctc-connect';

// Check PNR status
const pnrResult = await checkPNRStatus('1234567890');

// Always check success first
if (pnrResult.success) {
  console.log(pnrResult.data);
} else {
  console.error(pnrResult.error);
}`
};

export const apiDocs = {
  pnr: {
    title: 'PNR Status',
    description: 'Check real-time PNR status with passenger details and booking information.',
    signature: 'checkPNRStatus(pnr: string): Promise<Result>',
    example: `import { checkPNRStatus } from 'irctc-connect';

const result = await checkPNRStatus('1234567890');

if (result.success) {
  console.log('Status:', result.data.status);
  console.log('Train:', result.data.trainName);
  console.log('Passengers:', result.data.passengers);
}`,
    responseFields: [
      { field: 'status', description: 'Booking status (CNF, WL, RAC, etc.)' },
      { field: 'trainName', description: 'Name of the train' },
      { field: 'trainNo', description: 'Train number' },
      { field: 'passengers', description: 'Array of passenger details' },
      { field: 'boardingPoint', description: 'Boarding station' },
      { field: 'destination', description: 'Destination station' }
    ]
  },
  train: {
    title: 'Train Information',
    description: 'Get complete train details including route, schedule, and station coordinates.',
    signature: 'getTrainInfo(trainNo: string): Promise<Result>',
    example: `import { getTrainInfo } from 'irctc-connect';

const result = await getTrainInfo('12345');

if (result.success) {
  console.log('Train:', result.data.trainName);
  console.log('Route:', result.data.route);
  console.log('Classes:', result.data.classes);
}`
  },
  tracking: {
    title: 'Live Train Tracking',
    description: 'Track trains in real-time with current location, delays, and station updates.',
    signature: 'trackTrain(trainNo: string, date: string): Promise<Result>',
    example: `import { trackTrain } from 'irctc-connect';

// Date format: DD-MM-YYYY
const result = await trackTrain('12345', '06-12-2025');

if (result.success) {
  console.log('Status:', result.data.statusNote);
  console.log('Current Station:', result.data.currentStation);
  console.log('Delay:', result.data.delay);
}`,
    note: 'The date parameter must be in DD-MM-YYYY format.'
  },
  station: {
    title: 'Station Live',
    description: 'Get upcoming trains at any station with expected arrival times.',
    signature: 'liveAtStation(stationCode: string): Promise<Result>',
    example: `import { liveAtStation } from 'irctc-connect';

// Use station code (e.g., NDLS for New Delhi)
const result = await liveAtStation('NDLS');

if (result.success) {
  result.data.trains.forEach(train => {
    console.log(train.trainName, train.expectedTime);
  });
}`
  }
};

export const statusCodes = [
  { code: 'CNF', desc: 'Confirmed - Seat/Berth allocated' },
  { code: 'WL', desc: 'Waiting List - Not confirmed' },
  { code: 'RAC', desc: 'Reservation Against Cancellation' },
  { code: 'CAN', desc: 'Cancelled' },
  { code: 'PQWL', desc: 'Pooled Quota Waiting List' },
  { code: 'TQWL', desc: 'Tatkal Quota Waiting List' },
  { code: 'RLWL', desc: 'Remote Location Waiting List' },
  { code: 'GNWL', desc: 'General Waiting List' }
];

export const responseFormats = {
  success: `{
  success: true,
  data: {
    // Response data
  }
}`,
  error: `{
  success: false,
  error: "Error message"
}`
};
