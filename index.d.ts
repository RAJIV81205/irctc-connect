declare module 'irctc-connect' {
    export function checkPNRStatus(pnr: string): Promise<any>;
    export function getTrainInfo(trainNumber: string): Promise<any>;
    export function trackTrain(trainNumber: string, date: string): Promise<any>;
    export function liveAtStation(stationCode: string): Promise<any>;
    export function searchTrainBetweenStations(fromStnCode: string, toStnCode: string): Promise<any>;
  }