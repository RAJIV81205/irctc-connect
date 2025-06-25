declare module 'irctc-connect' {
    export function checkPNRStatus(pnr: string): Promise<any>;
    export function getTrainInfo(trainNumber: string): Promise<any>;
    export function trackTrain(trainNumber: string, date: string): Promise<any>;
  }