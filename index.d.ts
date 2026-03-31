declare module 'irctc-connect' {
  /**
   * Configure the SDK with your API key before using any other function.
   * The backend URL is managed by the package — you only need your API key.
   *
   * @example
   * configure('your-api-key-here');
   */
  export function configure(apiKey: string): void;

  /** Check the PNR status for a given 10-digit PNR number. */
  export function checkPNRStatus(pnr: string): Promise<any>;

  /** Get detailed information and route for a given 5-digit train number. */
  export function getTrainInfo(trainNumber: string): Promise<any>;

  /**
   * Get the live running status of a train.
   * @param date - Journey date in DD-MM-YYYY format (optional, defaults to today)
   */
  export function trackTrain(trainNumber: string, date?: string): Promise<any>;

  /** Get the list of upcoming trains at a station. */
  export function liveAtStation(stationCode: string): Promise<any>;

  /** Search for all direct trains between two stations. */
  export function searchTrainBetweenStations(fromStnCode: string, toStnCode: string): Promise<any>;

  /**
   * Check seat availability for a specific train, class, and date.
   * @param coach - '2S' | 'SL' | '3A' | '3E' | '2A' | '1A' | 'CC' | 'EC'
   * @param quota - 'GN' | 'LD' | 'SS' | 'TQ'
   */
  export function getAvailability(
    trainNo: string,
    fromStnCode: string,
    toStnCode: string,
    date: string,
    coach: string,
    quota: string
  ): Promise<any>;
}