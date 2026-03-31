/**
 * irctc-connect — Client SDK
 *
 * All API calls are proxied to the irctc-connect backend.
 * Configure with your API key before use:
 *
 *   import { configure, checkPNRStatus } from 'irctc-connect';
 *
 *   configure('your-api-key-here');
 *
 *   const result = await checkPNRStatus('1234567890');
 */

const _baseUrl = 'https://irctc-connect-api.rajivdubey.tech';
let _apiKey = '';

/**
 * Configure the SDK with your API key.
 * Must be called once before using any other function.
 *
 * @param {string} apiKey - Your API key
 */
function configure(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('[irctc-connect] configure() requires a valid API key string.');
  }

  _apiKey = apiKey.trim();
}

/**
 * Internal helper — performs a GET request to the backend.
 * Automatically attaches the API key header.
 *
 * @param {string} path - Endpoint path (must start with '/')
 * @returns {Promise<any>} Parsed JSON response
 */
async function _get(path) {
  if (!_apiKey) {
    return {
      success: false,
      error: 'irctc-connect is not configured. Call configure(apiKey) first.',
    };
  }

  try {
    const response = await fetch(`${_baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'x-api-key': _apiKey,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: `Request failed: ${error.message}`,
    };
  }
}

// ─── 1. Check PNR Status ─────────────────────────────────────────────────────

/**
 * Check the PNR status for a given 10-digit PNR number.
 *
 * @param {string} pnr - 10-digit PNR number
 * @returns {Promise<object>} { success, data } or { success, error }
 *
 * @example
 * const result = await checkPNRStatus('1234567890');
 */
async function checkPNRStatus(pnr) {
  if (!pnr || typeof pnr !== 'string') {
    return { success: false, error: 'PNR number is required and must be a string.' };
  }

  const cleanPNR = pnr.trim().replace(/\D/g, '');
  if (cleanPNR.length !== 10) {
    return { success: false, error: 'PNR number must be exactly 10 digits.' };
  }

  return _get(`/api/checkPNRStatus/${cleanPNR}`);
}

// ─── 2. Get Train Info ────────────────────────────────────────────────────────

/**
 * Get detailed information and route for a given train number.
 *
 * @param {string} trainNumber - 5-digit train number (e.g. '12301')
 * @returns {Promise<object>} { success, data: { trainInfo, route } } or { success, error }
 *
 * @example
 * const result = await getTrainInfo('12301');
 */
async function getTrainInfo(trainNumber) {
  if (!trainNumber || typeof trainNumber !== 'string' || trainNumber.trim().length !== 5) {
    return { success: false, error: 'Invalid train number. It must be a 5-character string.' };
  }

  return _get(`/api/getTrainInfo/${trainNumber.trim()}`);
}

// ─── 3. Track Train (Live Status) ────────────────────────────────────────────

/**
 * Get the live running status of a train.
 *
 * @param {string} trainNumber - 5-digit train number
 * @param {string} [date]      - Journey date in DD-MM-YYYY format (defaults to today)
 * @returns {Promise<object>} { success, data } or { success, error }
 *
 * @example
 * const result = await trackTrain('12301', '15-04-2025');
 */
async function trackTrain(trainNumber, date) {
  if (!trainNumber || typeof trainNumber !== 'string' || trainNumber.trim().length !== 5) {
    return { success: false, error: 'Invalid train number. It must be a 5-character string.' };
  }

  const path = date
    ? `/api/trackTrain/${trainNumber.trim()}/${encodeURIComponent(date.trim())}`
    : `/api/trackTrain/${trainNumber.trim()}/today`;

  return _get(path);
}

// ─── 4. Live At Station ───────────────────────────────────────────────────────

/**
 * Get the list of upcoming trains currently running at a station.
 *
 * @param {string} stnCode - Station code (e.g. 'NDLS', 'BCT')
 * @returns {Promise<object>} { success, data } or { success, error }
 *
 * @example
 * const result = await liveAtStation('NDLS');
 */
async function liveAtStation(stnCode) {
  if (!stnCode || typeof stnCode !== 'string') {
    return { success: false, error: 'Station code is required and must be a string.' };
  }

  return _get(`/api/liveAtStation/${stnCode.trim().toUpperCase()}`);
}

// ─── 5. Search Trains Between Stations ───────────────────────────────────────

/**
 * Search for all direct trains running between two stations.
 *
 * @param {string} fromStnCode - Source station code (e.g. 'NDLS')
 * @param {string} toStnCode   - Destination station code (e.g. 'BCT')
 * @returns {Promise<object>} { success, data } or { success, error }
 *
 * @example
 * const result = await searchTrainBetweenStations('NDLS', 'BCT');
 */
async function searchTrainBetweenStations(fromStnCode, toStnCode) {
  if (!fromStnCode || typeof fromStnCode !== 'string' ||
      !toStnCode   || typeof toStnCode   !== 'string') {
    return { success: false, error: 'Both from and to station codes are required and must be strings.' };
  }

  return _get(`/api/searchTrainBetweenStations/${fromStnCode.trim().toUpperCase()}/${toStnCode.trim().toUpperCase()}`);
}

// ─── 6. Get Seat Availability ────────────────────────────────────────────────

/**
 * Check seat availability for a specific train, class, and date.
 *
 * @param {string} trainNo     - 5-digit train number
 * @param {string} fromStnCode - Source station code (uppercase, e.g. 'NDLS')
 * @param {string} toStnCode   - Destination station code (uppercase, e.g. 'BCT')
 * @param {string} date        - Journey date in DD-MM-YYYY format
 * @param {string} coach       - Coach class: '2S' | 'SL' | '3A' | '3E' | '2A' | '1A' | 'CC' | 'EC'
 * @param {string} quota       - Quota: 'GN' | 'LD' | 'SS' | 'TQ'
 * @returns {Promise<object>} { success, data } or { success, error }
 *
 * @example
 * const result = await getAvailability('12301', 'NDLS', 'HWH', '15-04-2025', '3A', 'GN');
 */
async function getAvailability(trainNo, fromStnCode, toStnCode, date, coach, quota) {
  if (!trainNo || !fromStnCode || !toStnCode || !date || !coach || !quota) {
    return { success: false, error: 'Incomplete data. Please provide all required fields.' };
  }

  const from  = fromStnCode.trim().toUpperCase();
  const to    = toStnCode.trim().toUpperCase();
  const cls   = coach.trim().toUpperCase();
  const qt    = quota.trim().toUpperCase();
  const train = trainNo.trim();

  return _get(`/api/getAvailability/${train}/${from}/${to}/${encodeURIComponent(date.trim())}/${cls}/${qt}`);
}

export {
  configure,
  checkPNRStatus,
  getTrainInfo,
  trackTrain,
  liveAtStation,
  searchTrainBetweenStations,
  getAvailability,
};
